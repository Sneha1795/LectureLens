import os
import uuid
import logging
import threading
import anyio
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydub import AudioSegment
from backend.services.whisper_service import transcribe_audio
from backend.services.yake_service import extract_keywords

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "backend/uploads"
ALLOWED_EXTENSIONS = {".mp4", ".mp3", ".wav", ".m4a", ".webm", ".ogg"}
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB

# Thread-safe in-memory job store
jobs = {}
jobs_lock = threading.Lock()

def update_job(job_id: str, status: str, result: dict = None, error: str = None):
    with jobs_lock:
        if job_id not in jobs:
            jobs[job_id] = {}
        jobs[job_id]["status"] = status
        if result is not None:
            jobs[job_id]["result"] = result
        if error is not None:
            jobs[job_id]["error"] = error

async def process_upload_task(job_id: str, file_path: str, audio_path: str, ext: str, filename: str):
    # Wrap downstream transcription and processing in try...finally for disk cleanup
    try:
        if ext != ".wav":
            try:
                def convert_audio():
                    audio = AudioSegment.from_file(file_path)
                    audio.export(audio_path, format="wav")
                await anyio.to_thread.run_sync(convert_audio)
            except Exception as e:
                logger.error(f"Audio conversion failed for {filename}: {e}")
                update_job(job_id, "failed", error="Failed to parse audio file format")
                return
        else:
            audio_path = file_path

        result = await anyio.to_thread.run_sync(transcribe_audio, audio_path)
        keywords = await anyio.to_thread.run_sync(extract_keywords, result["full_text"])

        # Find timestamp for each keyword
        keywords_with_timestamps = []
        for kw in keywords:
            for seg in result["transcript"]:
                if kw.lower() in seg["text"].lower():
                    keywords_with_timestamps.append({
                        "keyword": kw,
                        "timestamp": seg["start"]
                    })
                    break

        job_result = {
            "transcript": result["transcript"],
            "full_text": result["full_text"],
            "keywords": keywords_with_timestamps
        }
        update_job(job_id, "done", result=job_result)

    except Exception as e:
        logger.error(f"Processing failed for job {job_id}: {e}")
        update_job(job_id, "failed", error=str(e))

    finally:
        # Guarantee cleanup of physical media files from server storage
        if file_path:
            try:
                if await anyio.to_thread.run_sync(os.path.exists, file_path):
                    await anyio.to_thread.run_sync(os.remove, file_path)
            except OSError as e:
                logger.error(f"Failed to delete original file {file_path}: {e}")
        if audio_path and audio_path != file_path:
            try:
                if await anyio.to_thread.run_sync(os.path.exists, audio_path):
                    await anyio.to_thread.run_sync(os.remove, audio_path)
            except OSError as e:
                logger.error(f"Failed to delete converted WAV file {audio_path}: {e}")

@router.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Validate extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    audio_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")

    # Initialize job in store
    update_job(file_id, "processing")

    await anyio.to_thread.run_sync(lambda: os.makedirs(UPLOAD_DIR, exist_ok=True))

    # Process and write file in chunks to limit file upload size dynamically
    size = 0
    try:
        async with await anyio.open_file(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunk
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE / (1024*1024)}MB"
                    )
                await buffer.write(chunk)
    except Exception as e:
        try:
            if await anyio.to_thread.run_sync(os.path.exists, file_path):
                await anyio.to_thread.run_sync(os.remove, file_path)
        except OSError:
            pass
        update_job(file_id, "failed", error=str(e))
        raise e

    # Enqueue background processing task
    background_tasks.add_task(
        process_upload_task,
        job_id=file_id,
        file_path=file_path,
        audio_path=audio_path,
        ext=ext,
        filename=filename
    )

    return {
        "job_id": file_id,
        "status": "processing"
    }

@router.get("/upload/status/{job_id}")
async def get_upload_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job