import unittest
import os
from io import BytesIO
from backend.services.export_service import generate_pdf, REGULAR_FONT_PATH, ensure_fonts

class TestPdfGeneration(unittest.TestCase):

    def setUp(self):
        # Ensure fonts are downloaded before tests run
        ensure_fonts()

    def test_font_downloaded(self):
        # Assert font file exists and is populated
        self.assertTrue(os.path.exists(REGULAR_FONT_PATH))
        self.assertGreater(os.path.getsize(REGULAR_FONT_PATH), 0)

    def test_unicode_pdf_generation(self):
        # Generate PDF containing diacritics and euro symbol
        filename = "unicode_test"
        full_text = "This is a lecture transcript about résumé writing and café culture in the Eurozone (€)."
        keywords = [{"keyword": "résumé", "timestamp": 12.5}, {"keyword": "café", "timestamp": 45.0}]
        summary = "Summary of French loanwords and financial symbols like €."
        transcript = [{"start": 0.0, "end": 10.0, "text": "Welcome to the café."}]

        try:
            pdf_buffer = generate_pdf(filename, full_text, keywords, summary, transcript)
            self.assertIsInstance(pdf_buffer, BytesIO)
            pdf_bytes = pdf_buffer.getvalue()
            # Assert starting PDF magic signature
            self.assertTrue(pdf_bytes.startswith(b"%PDF"))
        except UnicodeEncodeError as uee:
            self.fail(f"Unicode encoding failed during PDF generation: {uee}")

    def test_empty_fields_pdf_generation(self):
        # Generate PDF with empty optional fields
        filename = "empty_test"
        full_text = "Minimal text contents."
        keywords = []
        summary = ""
        transcript = []

        pdf_buffer = generate_pdf(filename, full_text, keywords, summary, transcript)
        self.assertIsInstance(pdf_buffer, BytesIO)
        pdf_bytes = pdf_buffer.getvalue()
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))

if __name__ == "__main__":
    unittest.main()
