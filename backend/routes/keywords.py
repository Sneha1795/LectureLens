from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.yake_service import extract_keywords

router = APIRouter()

class TextInput(BaseModel):
    text: str
    max_keywords: int = 15

@router.post("/keywords")
def get_keywords(input: TextInput):
    if not input.text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    keywords = extract_keywords(input.text, input.max_keywords)
    return {"keywords": keywords}