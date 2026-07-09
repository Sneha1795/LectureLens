# Implementation Plan - Enhancing LectureLens Features

This plan introduces 5 key features to enhance the user experience of LectureLens without adding unnecessary library dependencies or architectural bloat:

1. **Active Transcript Highlighting & Auto-Scroll** (synchronized with the video/audio player).
2. **Search Result Term Highlighting** (using `<mark>` tags in filtered results).
3. **Copy to Clipboard Actions** (for summary notes, chat messages, and key terms).
4. **PDF Export Support** (using the existing `fpdf2` backend dependency).
5. **Summary Markdown Parsing & Custom Rendering** (custom parser inside summary panel).

---

## Proposed Changes

---

### Backend Components

#### [MODIFY] [export_service.py](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/backend/services/export_service.py)
* Add `generate_pdf(filename, full_text, keywords, summary, transcript)` using the `fpdf2` library.
* Design the document structure in memory utilizing Helvetica font formatting, generating structured paragraphs for summaries, bold headings for sections, bullet points for terms/topics, and timestamped multi-cells for transcripts.
* Return a `BytesIO` buffer to prevent disk writes.

#### [MODIFY] [export.py](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/backend/routes/export.py)
* Add a new endpoint `POST /api/export/pdf` receiving the same `ExportInput` schema.
* Invoke `generate_pdf(...)` and return a `StreamingResponse` with appropriate media-type (`application/pdf`) and sanitized filename headers.

---

### Frontend Components

#### [MODIFY] [MediaPlayer.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/components/MediaPlayer.js)
* Support an `onTimeUpdate` prop and attach it to both the `<video>` and `<audio>` DOM elements to expose current playtime to parents.

#### [MODIFY] [ResultsView.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/components/ResultsView.js)
* Track `currentTime` state, updated via `onTimeUpdate` callback from the player.
* Add a **Download PDF** button next to the **Download Notes** action.
* Pass the tracked `currentTime` down to `TranscriptPanel`.

#### [MODIFY] [useExport.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/hooks/useExport.js)
* Implement `handleDownloadPdf(filename, fullText, keywords, summary, transcript)` fetching from `/api/export/pdf`.
* Trigger the browser file download stream in-memory.

#### [MODIFY] [App.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/App.js)
* Map the new `handleDownloadPdf` hook outcome and propagate down through `ResultsView`.

#### [MODIFY] [TranscriptPanel.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/components/TranscriptPanel.js)
* Track active segment index by matching `currentTime` with `seg.start` and `seg.end`.
* Add custom DOM reference binding to the active segment element. Use a `useEffect` to trigger a smooth scroll into view (`scrollIntoView({ behavior: 'smooth', block: 'nearest' })`) when the active index updates.
* Implement `highlightText` regex splitting to surround matched query search words in `<mark>` elements dynamically.

#### [MODIFY] [SummaryPanel.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/components/SummaryPanel.js)
* Implement a robust `renderFormattedSummary` function to parse sections (`SUMMARY:`, `KEY TAKEAWAYS:`, `KEY TERMS:`), consecutive bullets, bolded key concept terms (e.g. `term: definition`), and standard text paragraphs declaratively.
* Add a copy-to-clipboard button with transition timing state (`Copy Summary` / `Copied!`).

#### [MODIFY] [ChatPanel.js](file:///c:/Users/Sneha/OneDrive/Desktop/Gitdemo/LectureLens/frontend/src/components/ChatPanel.js)
* Embed copy-to-clipboard buttons next to assistant response messages, allowing quick clipboard exports.

---

## Verification Plan

### Automated Tests
* We will verify backend builds:
  ```powershell
  python -m py_compile backend/routes/export.py backend/services/export_service.py
  ```

### Manual Verification
* **Highlight & Scroll**: Play an audio/video file and verify the transcript panel automatically highlights and scrolls matching segments into view as they speak.
* **Search Highlight**: Search a word (e.g., "lecture") and verify the matching segment text turns yellow under `<mark>` highlighting.
* **Clipboard Actions**: Click copy buttons on the Summary Panel and Chat messages and paste them elsewhere to verify correctness.
* **PDF Export**: Click the "Download PDF" button and review the generated document format, ensuring Helvetica font spacing is styled correctly and timestamp mappings align.
