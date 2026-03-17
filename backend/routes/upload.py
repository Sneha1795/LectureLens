import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydub import AudioSegment
from backend.services.whisper_service import transcribe_audio
from backend.services.yake_service import extract_keywords

router = APIRouter()

UPLOAD_DIR = "backend/uploads"
ALLOWED_EXTENSIONS = {".mp4", ".mp3", ".wav", ".m4a", ".webm", ".ogg"}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    audio_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")
    if ext != ".wav":
        audio = AudioSegment.from_file(file_path)
        audio.export(audio_path, format="wav")
    else:
        audio_path = file_path

    result = transcribe_audio(audio_path)
    keywords = extract_keywords(result["full_text"])

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

    return {
        "file_id": file_id,
        "filename": file.filename,
        "transcript": result["transcript"],
        "full_text": result["full_text"],
        "keywords": keywords_with_timestamps
    }