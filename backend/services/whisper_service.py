import os
from faster_whisper import WhisperModel

# Load tiny model — lightweight, good enough
model = WhisperModel("tiny", device="cpu", compute_type="int8")

def transcribe_audio(audio_path: str):
    segments, info = model.transcribe(audio_path, beam_size=1)
    
    transcript = []
    full_text = ""

    for segment in segments:
        transcript.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
        full_text += segment.text.strip() + " "

    return {
        "transcript": transcript,      # timestamped segments
        "full_text": full_text.strip()  # plain full text
    }