import React, { useState, useEffect, useRef } from "react";
import { formatTime } from "../utils/time";
import { findActiveSegmentIndex } from "../utils/search";
import { escapeRegExp } from "../utils/regex";

export default function TranscriptPanel({ transcript, jumpTo, mediaRef }) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeSegmentRef = useRef(null);

  // Subscribe to media player updates locally to avoid parent page re-renders
  useEffect(() => {
    const media = mediaRef?.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      const index = findActiveSegmentIndex(transcript, media.currentTime);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [mediaRef, transcript, activeIndex]);

  // Scroll active segment into view dynamically when active segment changes
  useEffect(() => {
    if (activeIndex !== -1 && activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [activeIndex]);

  const highlightText = (text, searchVal) => {
    if (!searchVal.trim()) return text;
    try {
      const escaped = escapeRegExp(searchVal);
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} style={{ background: "#fef08a", color: "#111", borderRadius: 2, padding: "0 2px" }}>{part}</mark> : part
      );
    } catch (e) {
      return text;
    }
  };

  const filtered = (transcript || []).filter((seg) =>
    seg.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 600 }}>Full Transcript</p>
        <input type="text" placeholder="Search transcript..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "6px 12px", fontSize: 12, outline: "none", width: 180 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto", paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>No results found.</p>
        ) : (
          filtered.map((seg, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={i} onClick={() => jumpTo(seg.start)}
                ref={isActive ? activeSegmentRef : null}
                className="hover-bg-segment"
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "10px 8px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  alignItems: "flex-start",
                  borderRadius: 6,
                  background: isActive ? "#eff6ff" : "transparent",
                  transition: "background-color 0.2s"
                }}>
                <span style={{ fontSize: 12, color: isActive ? "#1d4ed8" : "#888", fontWeight: isActive ? 600 : 400, minWidth: 36, paddingTop: 1, fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(seg.start)}
                </span>
                <p style={{ fontSize: 13, color: isActive ? "#1e3a8a" : "#333", fontWeight: isActive ? 500 : 400, lineHeight: 1.6, margin: 0 }}>
                  {highlightText(seg.text, search)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
