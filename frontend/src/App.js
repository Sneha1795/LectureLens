import { useState, useRef } from "react";

const colors = {
  bg: "#F4EEEA",        
  card: "#E5D9C2",      
  subtle: "#ddd0b8",    
  accent: "#c8b99a",    
  primary: "#1F2818",   
  text: "#202020",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [fullText, setFullText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [summary, setSummary] = useState("");
  const [summarySize, setSummarySize] = useState("medium");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [filename, setFilename] = useState("");
  const [activeTab, setActiveTab] = useState("transcript");
  const [chatOpen, setChatOpen] = useState(false);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setFilename(selected.name.replace(/\.[^/.]+$/, ""));
    setAudioUrl(URL.createObjectURL(selected));
    setTranscript([]);
    setFullText("");
    setKeywords([]);
    setSummary("");
    setChatHistory([]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setTranscript(data.transcript);
        setFullText(data.full_text);
        setKeywords(data.keywords || []);
      } else {
        setError(data.detail || "Something went wrong.");
      }
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setUploading(false);
    }
  };

  const handleSummary = async () => {
    if (!fullText) return;
    setLoadingSummary(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, summary_size: summarySize }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError("Could not generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChat = async () => {
    if (!question.trim() || !fullText) return;
    const userMsg = { role: "user", content: question };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setQuestion("");
    setLoadingChat(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullText, question, chat_history: chatHistory }),
      });
      const data = await res.json();
      setChatHistory([...updatedHistory, { role: "assistant", content: data.answer }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not get answer.");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, full_text: fullText, keywords, summary, transcript }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_notes.docx`;
      a.click();
    } catch {
      setError("Could not download document.");
    }
  };

  const jumpTo = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const filtered = transcript.filter((seg) =>
    seg.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100vh", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <header style={{ backgroundColor: colors.primary, padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 36, height: 36, backgroundColor: colors.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: colors.primary, fontSize: 16 }}>L</div>
        <h1 style={{ color: colors.bg, fontSize: 22, fontWeight: "bold", margin: 0, letterSpacing: 1 }}>LectureLens</h1>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Upload Card */}
        <div style={{ backgroundColor: colors.card, borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(178,150,125,0.15)" }}>
          <h2 style={{ color: colors.primary, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Upload Lecture</h2>
          <p style={{ color: "#9a7e6f", fontSize: 13, marginBottom: 20 }}>Supports MP3, MP4, WAV, M4A, WEBM</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 200, border: `2px dashed ${colors.accent}`, borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", backgroundColor: colors.bg }}>
              <input type="file" accept=".mp3,.mp4,.wav,.m4a,.webm" onChange={handleFileChange} style={{ display: "none" }} />
              <span style={{ color: file ? colors.primary : "#b8a090", fontSize: 14 }}>
                {file ? file.name : "Click to choose a file"}
              </span>
            </label>

            <button onClick={handleUpload} disabled={!file || uploading}
              style={{ padding: "12px 24px", backgroundColor: uploading || !file ? colors.accent : colors.primary, color: colors.bg, border: "none", borderRadius: 12, fontWeight: "bold", cursor: file && !uploading ? "pointer" : "not-allowed", fontSize: 14 }}>
              {uploading ? "Transcribing..." : "Transcribe"}
            </button>
          </div>

          {uploading && (
            <div style={{ marginTop: 16 }}>
              <div style={{ height: 6, backgroundColor: colors.subtle, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "75%", backgroundColor: colors.primary, borderRadius: 4, animation: "pulse 1.5s infinite" }} />
              </div>
              <p style={{ color: "#9a7e6f", fontSize: 12, marginTop: 6 }}>This may take a few minutes for long lectures...</p>
            </div>
          )}
          {error && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div style={{ backgroundColor: colors.card, borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(178,150,125,0.15)" }}>
            <h2 style={{ color: colors.primary, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>Audio Player</h2>
            <audio ref={audioRef} controls src={audioUrl} style={{ width: "100%" }} />
          </div>
        )}

        {/* Tabs */}
        {transcript.length > 0 && (
          <div>
            {/* Tab Buttons */}
            <div style={{ display: "flex", borderBottom: `2px solid ${colors.accent}` }}>
              {["transcript", "summary"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 24px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: "bold",
                    backgroundColor: "transparent",
                    color: activeTab === tab ? colors.primary : "#b8a090",
                    borderBottom: activeTab === tab ? `3px solid ${colors.primary}` : "3px solid transparent",
                    marginBottom: -2
                  }}>
                  {tab === "transcript" ? "📝 Transcript" : "📄 Summary & Notes"}
                </button>
              ))}
            </div>

            {/* Transcript Tab */}
            {activeTab === "transcript" && (
              <div style={{ backgroundColor: colors.card, borderRadius: "0 0 16px 16px", padding: 24, boxShadow: "0 2px 12px rgba(178,150,125,0.15)" }}>

                {/* Keywords */}
                {keywords.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ color: "#9a7e6f", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Key Topics</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {keywords.map((kw, i) => (
                        <button key={i} onClick={() => jumpTo(kw.timestamp)}
                          style={{ padding: "6px 14px", backgroundColor: colors.subtle, border: `1px solid ${colors.accent}`, borderRadius: 20, fontSize: 13, color: colors.primary, cursor: "pointer", fontWeight: "500" }}>
                          {kw.keyword} <span style={{ color: colors.accent, fontSize: 11 }}>{formatTime(kw.timestamp)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search */}
                <input type="text" placeholder="Search transcript..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.accent}`, backgroundColor: colors.bg, color: "#5a4a3a", fontSize: 13, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />

                {/* Segments */}
                <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {filtered.length === 0 ? (
                    <p style={{ color: "#b8a090", fontSize: 13 }}>No results found.</p>
                  ) : (
                    filtered.map((seg, i) => (
                      <div key={i} onClick={() => jumpTo(seg.start)}
                        style={{ display: "flex", gap: 16, padding: "10px 12px", borderRadius: 10, cursor: "pointer", backgroundColor: "transparent" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.subtle}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <span style={{ color: colors.primary, fontSize: 11, fontFamily: "monospace", minWidth: 40, paddingTop: 2 }}>{formatTime(seg.start)}</span>
                        <p style={{ color: "#5a4a3a", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{seg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div style={{ backgroundColor: colors.card, borderRadius: "0 0 16px 16px", padding: 24, boxShadow: "0 2px 12px rgba(178,150,125,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                  <p style={{ color: "#9a7e6f", fontSize: 13, margin: 0 }}>Choose summary length</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["short", "medium", "long"].map((size) => (
                      <button key={size} onClick={() => setSummarySize(size)}
                        style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: "bold",
                          backgroundColor: summarySize === size ? colors.primary : colors.subtle,
                          color: summarySize === size ? colors.bg : colors.primary }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSummary} disabled={loadingSummary}
                  style={{ padding: "10px 24px", backgroundColor: loadingSummary ? colors.accent : colors.primary, color: colors.bg, border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>
                  {loadingSummary ? "Generating..." : "Generate Summary"}
                </button>

                {summary && (
                  <div>
                    <div style={{ backgroundColor: colors.bg, borderRadius: 12, padding: 20, fontSize: 13, color: "#5a4a3a", lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 12 }}>
                      {summary}
                    </div>
                    <button onClick={handleDownloadDocx}
                      style={{ padding: "10px 20px", backgroundColor: "#7a9e7e", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 13 }}>
                      ⬇ Download Notes as Word Doc
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Chatbot */}
      {fullText && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>

          {/* Chat Popup */}
          {chatOpen && (
            <div style={{ width: 320, backgroundColor: colors.card, borderRadius: 20, boxShadow: "0 8px 32px rgba(178,150,125,0.3)", overflow: "hidden", border: `1px solid ${colors.accent}` }}>

              {/* Header */}
              <div style={{ backgroundColor: colors.primary, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, backgroundColor: "#7a9e7e", borderRadius: "50%" }} />
                  <span style={{ color: colors.bg, fontSize: 13, fontWeight: "bold" }}>Ask About This Lecture</span>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: colors.bg, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>

              {/* Messages */}
              <div style={{ padding: 16, maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {chatHistory.length === 0 && (
                  <p style={{ color: "#b8a090", fontSize: 12, textAlign: "center", marginTop: 16 }}>Ask any question about the lecture...</p>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "80%", padding: "8px 12px", borderRadius: 16, fontSize: 12, lineHeight: 1.5,
                      backgroundColor: msg.role === "user" ? colors.primary : colors.subtle,
                      color: msg.role === "user" ? colors.bg : "#5a4a3a",
                      borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                      borderBottomLeftRadius: msg.role === "user" ? 16 : 4,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loadingChat && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ padding: "8px 12px", borderRadius: 16, backgroundColor: colors.subtle, color: "#9a7e6f", fontSize: 12 }}>Thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: 12, borderTop: `1px solid ${colors.accent}`, display: "flex", gap: 8 }}>
                <input type="text" placeholder="Ask a question..." value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${colors.accent}`, backgroundColor: colors.bg, color: "#5a4a3a", fontSize: 12, outline: "none" }} />
                <button onClick={handleChat} disabled={loadingChat || !question.trim()}
                  style={{ padding: "8px 14px", backgroundColor: colors.primary, color: colors.bg, border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer", fontSize: 12 }}>
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Floating Button */}
          <button onClick={() => setChatOpen(!chatOpen)}
            style={{ width: 56, height: 56, backgroundColor: colors.primary, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 24, boxShadow: "0 4px 16px rgba(178,150,125,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {chatOpen ? "✕" : "💬"}
          </button>
        </div>
      )}
    </div>
  );
}