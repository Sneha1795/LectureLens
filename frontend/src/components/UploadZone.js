import React from "react";

export default function UploadZone({ file, uploading, handleFileChange, handleUpload }) {
  return (
    <>
      {/* Drop Zone */}
      <label className="hover-border-zone" style={{ display: "block", borderStyle: "dashed", borderWidth: "2px", borderRadius: 12, padding: "52px 24px", marginBottom: 36, cursor: "pointer", transition: "border-color 0.2s" }}>
        <input type="file" accept=".mp3,.mp4,.wav,.m4a,.webm" onChange={handleFileChange} style={{ display: "none" }} />
        <svg style={{ width: 40, height: 40, fill: "#444", display: "block", margin: "0 auto 16px" }} viewBox="0 0 24 24">
          <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
          {file ? file.name : "Upload Your Lecture"}
        </h3>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
          {file ? "Ready to transcribe" : "Drag and drop your file here, or click to browse"}
        </p>
        {file && (
          <button
            onClick={(e) => { e.preventDefault(); handleUpload(); }}
            disabled={uploading}
            style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            {uploading ? "Processing..." : "Transcribe Lecture"}
          </button>
        )}
        {!file && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", color: "#fff", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 500 }}>
            Choose File
          </span>
        )}
      </label>

      {uploading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 4, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: "70%", background: "#111", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
          </div>
          <p style={{ fontSize: 12, color: "#888" }}>Transcribing your lecture, this may take a few minutes...</p>
        </div>
      )}
    </>
  );
}
