# LectureLens

LectureLens is an interactive web-based study tool that transforms lecture audio and video recordings into searchable transcripts, custom formatted AI summaries, keyword indexes, and grounded Q&A study assistance.

---

## Key Features

* **AI Transcription**: Converts lecture audio/video into timestamped segment transcripts utilizing the fast Groq Whisper API.
* **Active Segment Auto-Scroll**: Synchronizes play progress with the transcript, automatically highlighting the active paragraph and scrolling it smoothly into view.
* **Keyword Navigation**: Automatically extracts key topics from the transcript (via YAKE). Clicking a keyword instantly seeks the player to that timestamp.
* **RegExp-Safe Search**: Instantly filter transcript records by keywords, highlighting occurrences in yellow with regex input sanitization.
* **Formatted AI Summaries**: Generates summaries of configurable lengths (short, medium, long) with custom formatting for key concepts and takeaways.
* **Grounded Chat Assistant**: Ask questions directly about the lecture context, backed by context history limits to keep conversation tokens minimal.
* **Multi-Format Exports**: Securely downloads study notes as formatted Microsoft Word (`.docx`) or Unicode-safe Adobe PDF (`.pdf`) documents generated in-memory.
* **Copy to Clipboard Actions**: Fast copy-to-clipboard buttons next to generated summaries and assistant chat answers.

---

## Tech Stack

### Backend
* **FastAPI**: Lightweight, asynchronous web framework in Python.
* **Pydub**: Audio file conversion and segment processing.
* **YAKE (Yet Another Keyword Extractor)**: Unsupervised local keyword extraction.
* **FPDF2 / Python-Docx**: In-memory byte-stream document creation.
* **Groq Cloud SDK**: Integration with Whisper-Large-v3-Turbo and Llama instruction models.

### Frontend
* **React.js**: JavaScript UI library bootstrapped via Create React App (Webpack).
* **CSS & Tailwind**: Responsive interface styling with transition animations.

---

## Project Structure

```text
LectureLens/
├── backend/
│   ├── routes/          # API endpoint routers (upload, summary, chat, export, keywords)
│   ├── services/        # Service connectors (whisper, yake, groq, export)
│   ├── tests/           # Backend unit test suites
│   └── main.py          # Entry point and CORS/Env configurations
├── frontend/
│   ├── src/
│   │   ├── api/         # Centralized HTTP request client
│   │   ├── components/  # Modular UI panels (chat, transcript, summary, media player)
│   │   ├── hooks/       # State management hooks (upload, chat, export)
│   │   └── utils/       # Utility units (search, regex, summaryParser)
│   └── package.json     # Frontend dependencies and scripts
└── requirements.txt     # Python backend dependencies
```

---

## Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js v18+
* A Groq Cloud API Key

### Backend Setup
1. Navigate to the root directory and create a virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   * **Windows (PowerShell)**: `.\.venv\Scripts\Activate.ps1`
   * **macOS/Linux**: `source .venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory and add your API key:
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   ALLOWED_ORIGINS=http://localhost:3000
   ```
5. Run the FastAPI development server:
   ```bash
   python -m uvicorn backend.main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the React development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Verification Tests

### Backend Unit Tests
Execute unit tests verifying PDF generation with full Unicode support:
```bash
python -m unittest backend/tests/test_pdf.py
```

### Frontend Unit Tests
Execute Jest suites verifying RegExp search escaping, binary search segment mapping, and summary parsers:
```bash
cd frontend
npm test -- --watchAll=false
```