from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

def generate_docx(filename: str, full_text: str, keywords: list, summary: str, transcript: list):
    doc = Document()

    # Title
    title = doc.add_heading("LectureLens Notes", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Filename
    doc.add_paragraph(f"Lecture: {filename}")
    doc.add_paragraph("")

    # Summary Section
    if summary:
        doc.add_heading("Summary & Notes", level=1)
        doc.add_paragraph(summary)
        doc.add_paragraph("")

    # Keywords Section
    if keywords:
        doc.add_heading("Key Topics", level=1)
        for kw in keywords:
            minutes = int(kw["timestamp"] // 60)
            seconds = int(kw["timestamp"] % 60)
            time_str = f"{minutes:02d}:{seconds:02d}"
            doc.add_paragraph(f"• {kw['keyword']}  [{time_str}]")
        doc.add_paragraph("")

    # Transcript Section
    doc.add_heading("Full Transcript", level=1)
    for seg in transcript:
        minutes = int(seg["start"] // 60)
        seconds = int(seg["start"] % 60)
        time_str = f"{minutes:02d}:{seconds:02d}"
        p = doc.add_paragraph()
        run1 = p.add_run(f"[{time_str}] ")
        run1.bold = True
        run1.font.color.rgb = RGBColor(99, 102, 241)
        p.add_run(seg["text"])

    # Save file
    output_path = f"backend/uploads/{filename}_notes.docx"
    doc.save(output_path)
    return output_path