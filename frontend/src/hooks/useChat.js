import { useState, useRef, useEffect } from "react";
import { fetchApi } from "../api/client";

export function useChat(fullText) {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef(null);

  // Initialize/reset chat history when fullText becomes available or empty
  useEffect(() => {
    if (fullText) {
      setChatHistory([
        {
          role: "assistant",
          content: "Hi! I'm your lecture assistant. Ask me anything about this lecture!",
          isGreeting: true,
        },
      ]);
    } else {
      setChatHistory([]);
    }
  }, [fullText]);

  // Clean up active abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleChat = async () => {
    if (!question.trim() || !fullText) return;

    // Abort previous active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg = { role: "user", content: question };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setQuestion("");
    setLoadingChat(true);
    setError("");

    // Filter out greeting messages using the isGreeting flag instead of matching strings
    // Limit to the last 10 messages to avoid excessive token consumption or exceeding LLM context windows
    const apiHistory = chatHistory.filter((m) => !m.isGreeting).slice(-10);

    try {
      const data = await fetchApi("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          transcript: fullText,
          question: userMsg.content,
          chat_history: apiHistory,
        }),
        signal: controller.signal,
      });

      setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Could not get answer.");
    } finally {
      if (abortControllerRef.current === controller) {
        setLoadingChat(false);
      }
    }
  };

  return {
    chatHistory,
    setChatHistory,
    question,
    setQuestion,
    loadingChat,
    error,
    setError,
    handleChat,
  };
}
