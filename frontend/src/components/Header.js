import React from "react";

export default function Header() {
  return (
    <div style={{ borderBottom: "1px solid #e8e8e8", padding: "16px 32px", display: "flex", alignItems: "center", gap: 10 }}>
      <svg style={{ width: 22, height: 22, fill: "#111" }} viewBox="0 0 24 24">
        <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
      </svg>
      <span style={{ fontWeight: 600, fontSize: 17 }}>LectureLens</span>
    </div>
  );
}
