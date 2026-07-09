import os
import math
import logging
from groq import Groq
from dotenv import load_dotenv
from pydub import AudioSegment

logger = logging.getLogger(__name__)

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
WHISPER_MODEL= os.getenv("WHISPER_MODEL", "whisper-large-v3-turbo")
MAX_FILE_SIZE = 24 * 1024 * 1024  # 24MB (under Groq's 25MB limit)

def compress_audio(audio_path: str) -> str:
    audio = AudioSegment.from_file(audio_path)
    audio = audio.set_channels(1)        # mono
    audio = audio.set_frame_rate(16000)  # 16kHz
    compressed_path = audio_path.replace(".wav", "_compressed.wav")
    audio.export(compressed_path, format="wav")
    return compressed_path

def split_audio(audio_path: str, chunk_minutes: int = 10):
    audio = AudioSegment.from_file(audio_path)
    chunk_ms = chunk_minutes * 60 * 1000
    chunks = []
    for i in range(0, len(audio), chunk_ms):
        chunk = audio[i:i + chunk_ms]
        chunk_path = audio_path.replace(".wav", f"_chunk{i}.wav")
        chunk.export(chunk_path, format="wav")
        chunks.append((chunk_path, i / 1000))  # path + start time in seconds
    return chunks

def transcribe_chunk(audio_path: str, time_offset: float = 0.0):
    with open(audio_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            file=f,
            model=WHISPER_MODEL,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    transcript = []
    full_text = ""

    for segment in transcription.segments:
        transcript.append({
            "start": round(segment["start"] + time_offset, 2),
            "end": round(segment["end"] + time_offset, 2),
            "text": segment["text"].strip()
        })
        full_text += segment["text"].strip() + " "

    return transcript, full_text.strip()

def transcribe_audio(audio_path: str):
    # Compress first
    compressed_path = compress_audio(audio_path)

    file_size = os.path.getsize(compressed_path)

    if file_size <= MAX_FILE_SIZE:
        # Small enough — transcribe in one shot
        transcript, full_text = transcribe_chunk(compressed_path)
    else:
        # Too large — split into chunks
        chunks = split_audio(compressed_path)
        transcript = []
        full_text = ""

        for chunk_path, time_offset in chunks:
            chunk_transcript, chunk_text = transcribe_chunk(chunk_path, time_offset)
            transcript.extend(chunk_transcript)
            full_text += chunk_text + " "

            # Clean up chunk file
            try:
                os.remove(chunk_path)
            except OSError as e:
                logger.warning(f"Failed to remove chunk file {chunk_path}: {e}")

    # Clean up compressed file
    try:
        os.remove(compressed_path)
    except OSError as e:
        logger.warning(f"Failed to remove compressed file {compressed_path}: {e}")

    return {
        "transcript": transcript,
        "full_text": full_text.strip()
    }