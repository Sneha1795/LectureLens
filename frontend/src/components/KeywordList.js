import React from "react";
import { formatTime } from "../utils/time";

export default function KeywordList({ keywords, jumpTo }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Key Topics
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {keywords.map((kw, i) => (
          <button key={i} onClick={() => jumpTo(kw.timestamp)}
            style={{ border: "1px solid #e0e0e0", background: "#fafafa", borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", color: "#333" }}>
            {kw.keyword}
            <span style={{ color: "#888", marginLeft: 6, fontSize: 11 }}>{formatTime(kw.timestamp)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

