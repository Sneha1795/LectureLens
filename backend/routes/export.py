import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.export_service import generate_docx, generate_pdf

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
        # Sanitize filename to avoid path traversal / header injection
        safe_filename = os.path.basename(input.filename)
        safe_filename = "".join(c for c in safe_filename if c.isprintable() and c not in '\r\n')
        if not safe_filename:
            safe_filename = "notes"

        buffer = generate_docx(
            safe_filename,
            input.full_text,
            input.keywords,
            input.summary,
            input.transcript
        )

        headers = {
            "Content-Disposition": f'attachment; filename="{safe_filename}_notes.docx"'
        }

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/pdf")
def export_pdf(input: ExportInput):
    try:
        # Sanitize filename to avoid path traversal / header injection
        safe_filename = os.path.basename(input.filename)
        safe_filename = "".join(c for c in safe_filename if c.isprintable() and c not in '\r\n')
        if not safe_filename:
            safe_filename = "notes"

        buffer = generate_pdf(
            safe_filename,
            input.full_text,
            input.keywords,
            input.summary,
            input.transcript
        )

        headers = {
            "Content-Disposition": f'attachment; filename="{safe_filename}_notes.pdf"'
        }

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))