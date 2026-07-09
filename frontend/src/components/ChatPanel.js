import React, { useRef, useEffect, useState } from "react";

export default function ChatPanel({ chatHistory, question, setQuestion, loadingChat, handleChat }) {
  const chatEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 1500);
  };

  useEffect(() => {
    // Scroll chat window to bottom smoothly on message history update or loading transition
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingChat]);

  return (
    <div style={{ width: 300, display: "flex", flexDirection: "column", padding: "24px 20px", borderLeft: "1px solid #e8e8e8" }}>
      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Chat Assistant</p>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {chatHistory.map((msg, i) => {
          const isUser = msg.role === "user";
          const isGreeting = msg.isGreeting;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "85%", padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                background: isUser ? "#111" : "#f4f4f4",
                color: isUser ? "#fff" : "#333",
                borderBottomRightRadius: isUser ? 4 : 12,
                borderBottomLeftRadius: isUser ? 12 : 4,
              }}>
                <div>{msg.content}</div>
                {!isUser && !isGreeting && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, borderTop: "1px solid #e8e8e8", paddingTop: 4 }}>
                    <button onClick={() => handleCopyMessage(msg.content, i)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: copiedIndex === i ? "#16a34a" : "#888", outline: "none" }}>
                      <svg style={{ width: 10, height: 10, fill: copiedIndex === i ? "#16a34a" : "#888" }} viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loadingChat && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "#f4f4f4", padding: "10px 14px", borderRadius: 12, fontSize: 13, color: "#888" }}>Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: 8, border: "1px solid #e0e0e0", borderRadius: 10, padding: "8px 12px", alignItems: "center" }}>
        <input type="text" placeholder="Ask a question about the lecture..."
          value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleChat()}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#333", background: "transparent" }} />
        <button onClick={handleChat} disabled={loadingChat || !question.trim()}
          style={{ width: 30, height: 30, background: "#111", borderRadius: 8, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg style={{ width: 14, height: 14, fill: "#fff" }} viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </div>
  );
}
