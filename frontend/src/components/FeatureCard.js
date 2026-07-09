import React from "react";

export default function FeatureCard({ title, desc }) {
  return (
    <div style={{ border: "1px solid #e8e8e8", borderRadius: 10, padding: 18 }}>
      <div style={{ width: 32, height: 32, background: "#f4f4f4", borderRadius: 8, marginBottom: 12 }} />
      <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{title}</h4>
      <p style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
