from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.groq_service import generate_summary

router = APIRouter()

class SummaryInput(BaseModel):
    text: str
    summary_size: str = "medium"  # short, medium, long

@router.post("/summary")
def get_summary(input: SummaryInput):
    if not input.text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    summary = generate_summary(input.text, input.summary_size)
    return {"summary": summary}