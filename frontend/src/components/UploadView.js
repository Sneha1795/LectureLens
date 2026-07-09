import React from "react";
import Header from "./Header";
import UploadZone from "./UploadZone";
import FeatureCard from "./FeatureCard";

export default function UploadView({ file, uploading, error, handleFileChange, handleUpload }) {
  const features = [
    { title: "Transcription", desc: "Get accurate, timestamped transcripts of your lectures automatically." },
    { title: "AI Summary & Notes", desc: "Extract key points and generate comprehensive summaries with key terms." },
    { title: "Interactive Chat", desc: "Ask questions and get instant answers grounded in the lecture content." },
    { title: "Keyword Extraction", desc: "Key topics auto-detected. Click any keyword to jump to that moment." },
    { title: "Transcript Search", desc: "Search any word and instantly filter transcript segments." },
    { title: "Download Notes", desc: "Export structured notes as a formatted Word document." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI', sans-serif", color: "#111" }}>
      <Header />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "52px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>LectureLens</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 40 }}>
          Transform your lecture audio and video into transcripts, summaries, keywords, and interactive chat
        </p>

        <UploadZone
          file={file}
          uploading={uploading}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
        />

        {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, textAlign: "left" }}>
          {features.map((f, i) => (
            <FeatureCard key={i} title={f.title} desc={f.desc} />
          ))}
        </div>
      </div>
    </div>
  );
}
