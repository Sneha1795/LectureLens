import React from "react";

export default function MediaPlayer({ mediaUrl, mediaType, mediaRef }) {
  if (!mediaUrl) return null;

  const isVideo = mediaType && mediaType.startsWith("video/");

  return (
    <div style={{ marginBottom: 12 }}>
      {isVideo ? (
        <video ref={mediaRef} controls src={mediaUrl}
          style={{ width: "100%", borderRadius: 10, background: "#111", display: "block" }} />
      ) : (
        <div style={{ background: "#111", borderRadius: 10, padding: "32px 20px" }}>
          <audio ref={mediaRef} controls src={mediaUrl} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}
