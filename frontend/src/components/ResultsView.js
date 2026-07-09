import React, { useState } from "react";
import MediaPlayer from "./MediaPlayer";
import KeywordList from "./KeywordList";
import TranscriptPanel from "./TranscriptPanel";
import SummaryPanel from "./SummaryPanel";
import ChatPanel from "./ChatPanel";

export default function ResultsView({
  filename,
  uploadDate,
  mediaUrl,
  mediaType,
  mediaRef,
  keywords,
  transcript,
  fullText,
  jumpTo,
  summary,
  summarySize,
  setSummarySize,
  handleSummary,
  loadingSummary,
  chatHistory,
  question,
  setQuestion,
  loadingChat,
  handleChat,
  handleDownloadDocx,
  handleDownloadPdf,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState("transcript");
  const transcriptLength = transcript ? transcript.length : 0;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", color: "#111", background: "#fff" }}>
      {/* Left Panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", borderRight: "1px solid #e8e8e8" }}>
        {/* Back */}
        <button onClick={onBack}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0 }}>
          <svg style={{ width: 14, height: 14, fill: "#555" }} viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Home
        </button>

        {/* Title Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{filename}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleDownloadDocx}
              style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg style={{ width: 13, height: 13, fill: "#444" }} viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Download Word
            </button>
            <button onClick={handleDownloadPdf}
              style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg style={{ width: 13, height: 13, fill: "#444" }} viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 18 }}>Uploaded on {uploadDate}</p>

        {/* Video or Audio Player */}
        <MediaPlayer mediaUrl={mediaUrl} mediaType={mediaType} mediaRef={mediaRef} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#666" }}>
            {transcriptLength} segments
          </span>
          <span style={{ background: "#111", color: "#fff", fontSize: 11, borderRadius: 20, padding: "4px 12px" }}>
            Processing Complete
          </span>
        </div>

        {/* Keywords */}
        <KeywordList keywords={keywords} jumpTo={jumpTo} />

        {/* Tabs */}
        <div style={{ display: "flex", border: "1px solid #e8e8e8", borderRadius: 8, marginBottom: 18, overflow: "hidden" }}>
          {["transcript", "summary"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "9px", fontSize: 13, fontWeight: 500, textAlign: "center", cursor: "pointer", border: "none", background: activeTab === tab ? "#fff" : "#f6f6f6", color: activeTab === tab ? "#111" : "#888", textTransform: "capitalize" }}>
              {tab === "transcript" ? "Transcription" : "Summary"}
            </button>
          ))}
        </div>

        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <TranscriptPanel
            transcript={transcript}
            jumpTo={jumpTo}
            mediaRef={mediaRef}
          />
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <SummaryPanel
            summary={summary}
            summarySize={summarySize}
            setSummarySize={setSummarySize}
            handleSummary={handleSummary}
            loadingSummary={loadingSummary}
            fullText={fullText}
          />
        )}
      </div>

      {/* Right Panel — Chat */}
      <ChatPanel
        chatHistory={chatHistory}
        question={question}
        setQuestion={setQuestion}
        loadingChat={loadingChat}
        handleChat={handleChat}
      />
    </div>
  );
}

