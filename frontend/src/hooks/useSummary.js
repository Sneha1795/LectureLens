import { useState, useRef, useEffect } from "react";
import { fetchApi } from "../api/client";

export function useSummary() {
  const [summary, setSummary] = useState("");
  const [summarySize, setSummarySize] = useState("medium");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Clean up ongoing request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSummary = async (fullText) => {
    if (!fullText) return;

    // Abort previous active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingSummary(true);
    setError("");

    try {
      const data = await fetchApi("/api/summary", {
        method: "POST",
        body: JSON.stringify({ text: fullText, summary_size: summarySize }),
        signal: controller.signal,
      });
      setSummary(data.summary);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Could not generate summary.");
    } finally {
      if (abortControllerRef.current === controller) {
        setLoadingSummary(false);
      }
    }
  };

  return {
    summary,
    setSummary,
    summarySize,
    setSummarySize,
    loadingSummary,
    error,
    setError,
    handleSummary,
  };
}
