from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.groq_service import chat_with_transcript

router = APIRouter()

class ChatInput(BaseModel):
    transcript: str
    question: str
    chat_history: list = []

@router.post("/chat")
def chat(input: ChatInput):
    if not input.transcript:
        raise HTTPException(status_code=400, detail="No transcript provided")
    if not input.question:
        raise HTTPException(status_code=400, detail="No question provided")
    
    answer = chat_with_transcript(
        input.transcript,
        input.question,
        input.chat_history
    )

    return {"answer": answer}