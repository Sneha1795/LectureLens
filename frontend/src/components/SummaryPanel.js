import React, { useState } from "react";
import { parseSummaryToReact } from "../utils/summaryParser";

export default function SummaryPanel({ summary, summarySize, setSummarySize, handleSummary, loadingSummary, fullText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600 }}>Summary & Notes</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["short", "medium", "long"].map((size) => (
            <button key={size} onClick={() => setSummarySize(size)}
              style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #e0e0e0", cursor: "pointer", fontSize: 12, fontWeight: 500, textTransform: "capitalize", background: summarySize === size ? "#111" : "#fff", color: summarySize === size ? "#fff" : "#555" }}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleSummary(fullText)} disabled={loadingSummary}
          style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          {loadingSummary ? "Generating..." : "Generate Summary"}
        </button>

        {summary && (
          <button onClick={handleCopy}
            style={{ background: copied ? "#16a34a" : "#fff", color: copied ? "#fff" : "#111", border: "1px solid #ccc", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "background-color 0.2s" }}>
            <svg style={{ width: 13, height: 13, fill: copied ? "#fff" : "#444" }} viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            {copied ? "Copied!" : "Copy Notes"}
          </button>
        )}
      </div>

      {summary && (
        <div style={{ background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 10, padding: 20, fontSize: 13, color: "#333", lineHeight: 1.8 }}>
          {parseSummaryToReact(summary)}
        </div>
      )}
    </div>
  );
}
