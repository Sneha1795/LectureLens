from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.services.export_service import generate_docx
import os

router = APIRouter()

class ExportInput(BaseModel):
    filename: str
    full_text: str
    keywords: list = []
    summary: str = ""
    transcript: list = []

@router.post("/export/docx")
def export_docx(input: ExportInput):
    try:
        path = generate_docx(
            input.filename,
            input.full_text,
            input.keywords,
            input.summary,
            input.transcript
        )
        return FileResponse(
            path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{input.filename}_notes.docx"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))