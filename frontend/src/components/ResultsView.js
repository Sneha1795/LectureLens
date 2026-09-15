import React, { useState, useEffect } from "react";
import MediaPlayer from "./MediaPlayer";
import KeywordList from "./KeywordList";
import TranscriptPanel from "./TranscriptPanel";
import SummaryPanel from "./SummaryPanel";
import ChatPanel from "./ChatPanel";
import UploadZone from "./UploadZone";
import { SparkleIcon, ChatIcon, TagIcon, SearchIcon, DownloadIcon } from "./TabIcons";

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
  file,
  uploading,
  error,
  handleFileChange,
  handleUpload,
}) {
  const [activeTab, setActiveTab] = useState("summary");
  const [leftWidth, setLeftWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 260 && newWidth <= 500) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const hasData = transcript && transcript.length > 0;

  const tabConfig = [
    {
      id: "summary",
      title: "AI Summary & Notes",
      description: "Extract key points and generate comprehensive summaries with key terms.",
      icon: <SparkleIcon size={20} />,
      badgeBg: "#f1f5f9",
      badgeColor: "#0f172a"
    },
    {
      id: "chat",
      title: "Interactive Chat",
      description: "Ask questions and get instant answers grounded in the lecture content.",
      icon: <ChatIcon size={20} />,
      badgeBg: "#f1f5f9",
      badgeColor: "#0f172a"
    },
    {
      id: "keywords",
      title: "Keyword Extraction",
      description: "Key topics auto-detected. Click any keyword to jump to that moment.",
      icon: <TagIcon size={20} />,
      badgeBg: "#f1f5f9",
      badgeColor: "#0f172a"
    },
    {
      id: "search",
      title: "Transcript Search",
      description: "Search any word and instantly filter transcript segments.",
      icon: <SearchIcon size={20} />,
      badgeBg: "#f1f5f9",
      badgeColor: "#0f172a"
    },
    {
      id: "download",
      title: "Download Notes",
      description: "Export structured notes as a formatted Word document.",
      icon: <DownloadIcon size={20} />,
      badgeBg: "#f1f5f9",
      badgeColor: "#0f172a"
    }
  ];

  const currentTabInfo = tabConfig.find((t) => t.id === activeTab) || tabConfig[0];

  // Render content based on active tab and if data is available
  const renderTabContent = () => {
    if (!hasData) {
      return (
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", height: "100%" }}>
          <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>Content will appear here</span>
        </div>
      );
    }

    switch (activeTab) {
      case "summary":
        return (
          <SummaryPanel
            summary={summary}
            summarySize={summarySize}
            setSummarySize={setSummarySize}
            handleSummary={handleSummary}
            loadingSummary={loadingSummary}
            fullText={fullText}
          />
        );
      case "chat":
        return (
          <ChatPanel
            chatHistory={chatHistory}
            question={question}
            setQuestion={setQuestion}
            loadingChat={loadingChat}
            handleChat={handleChat}
          />
        );
      case "keywords":
        return (
          <div style={{ overflowY: "auto", height: "100%" }}>
            {keywords && keywords.length > 0 ? (
              <KeywordList keywords={keywords} jumpTo={jumpTo} />
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No keywords detected.</p>
            )}
          </div>
        );
      case "search":
        return (
          <TranscriptPanel
            transcript={transcript}
            jumpTo={jumpTo}
            mediaRef={mediaRef}
          />
        );
      case "download":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420, width: "100%", margin: "40px auto" }}>
            <button onClick={handleDownloadDocx}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 24px",
                fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)", color: "#1e293b"
              }}
              className="download-btn-hover"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg style={{ width: 22, height: 22, fill: "#2b579a" }} viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 11H9v-2h6v2zm0-4H9V8h6v2z" />
                </svg>
                Microsoft Word (.docx)
              </span>
              <svg style={{ width: 18, height: 18, fill: "#64748b" }} viewBox="0 0 24 24">
                <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
              </svg>
            </button>
            <button onClick={handleDownloadPdf}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 24px",
                fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)", color: "#1e293b"
              }}
              className="download-btn-hover"
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg style={{ width: 22, height: 22, fill: "#b31412" }} viewBox="0 0 24 24">
                  <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V8H10c.83 0 1.5.67 1.5 1.5v0zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V8H15c.83 0 1.5.67 1.5 1.5v2.5zm4.5-3H20v1.5h1.5V11H20v2h-1.5V8H21v1.5zm-11 0H9V9.5h1v1zm6.5 2H15V9.5h1.5v2.5z" />
                </svg>
                PDF Document (.pdf)
              </span>
              <svg style={{ width: 18, height: 18, fill: "#64748b" }} viewBox="0 0 24 24">
                <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
              </svg>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", background: "#fff", overflow: "hidden" }}>
      {/* Dynamic Style Block for custom hovers */}
      <style>{`
        .tab-btn {
          transition: all 0.2s ease-in-out;
        }
        .tab-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .download-btn-hover {
          transition: all 0.2s ease-in-out;
        }
        .download-btn-hover:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
        }
        .resize-handle {
          transition: background-color 0.15s ease;
        }
        .resize-handle:hover {
          background-color: #cbd5e1 !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Left Panel: Persistent File Status / Upload */}
      <div style={{
        width: leftWidth,
        minWidth: 260,
        maxWidth: 500,
        overflowY: "auto",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: "#fff",
        userSelect: isResizing ? "none" : "auto"
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 24px 0", letterSpacing: "-0.5px" }}>LectureLens</h1>
        {!hasData ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            {uploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, border: "3px solid #f1f5f9", borderTop: "3px solid #0f172a",
                  borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16
                }} />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>Loading Lecture</h3>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
                  Retrieving transcription, keywords, and media...
                </p>
              </div>
            ) : (
              <>
                <UploadZone
                  file={file}
                  uploading={uploading}
                  handleFileChange={handleFileChange}
                  handleUpload={handleUpload}
                />
                {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>}
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Back Button */}
            <button onClick={onBack}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b",
                background: "none", border: "none", cursor: "pointer", marginBottom: 24, padding: 0,
                fontWeight: 500
              }}>
              <svg style={{ width: 14, height: 14, fill: "#64748b" }} viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Upload Another
            </button>

            {/* Title Row */}
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a", wordBreak: "break-all" }}>{filename}</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px 0" }}>Uploaded on {uploadDate}</p>

            {/* Video or Audio Player */}
            <MediaPlayer mediaUrl={mediaUrl} mediaType={mediaType} mediaRef={mediaRef} />

            {/* Processing Complete Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                {transcript.length} segments
              </span>
              <span style={{ background: "#0f172a", color: "#fff", fontSize: 11, borderRadius: 20, padding: "4px 12px", fontWeight: 500 }}>
                Processing Complete
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Vertical Resizer Handle */}
      <div
        onMouseDown={startResizing}
        style={{
          width: "4px",
          minWidth: "4px",
          cursor: "col-resize",
          background: isResizing ? "#3b82f6" : "transparent",
          borderLeft: "1px solid #e2e8f0",
          zIndex: 10
        }}
        className="resize-handle"
      />

      {/* Main Content Area (Center) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 56px", overflow: "hidden", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 12,
              background: currentTabInfo.badgeBg,
              color: currentTabInfo.badgeColor
            }}>
              {currentTabInfo.icon}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>{currentTabInfo.title}</h2>
          </div>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{currentTabInfo.description}</p>
        </div>

        {/* Tab Content Box */}
        <div style={{
          flex: 1,
          background: "#f8fafc",
          borderRadius: 16,
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          padding: 28,
          boxSizing: "border-box",
          minHeight: 0, // CRITICAL: allows inner containers to expand and scroll properly
          overflow: "hidden"
        }}>
          {renderTabContent()}
        </div>
      </div>

      {/* Right Sidebar (80px wide) */}
      <div style={{ width: 80, minWidth: 80, borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: "#fff" }}>
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="tab-btn"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: isActive ? "#0f172a" : "#f1f5f9",
                color: isActive ? "#fff" : "#475569",
                boxShadow: isActive ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none"
              }}
              title={tab.title}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
