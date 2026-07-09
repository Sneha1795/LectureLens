import { useState } from "react";
import { fetchApi } from "../api/client";

export function useExport() {
  const [error, setError] = useState("");

  const handleDownloadDocx = async (filename, fullText, keywords, summary, transcript) => {
    setError("");
    try {
      const blob = await fetchApi("/api/export/docx", {
        method: "POST",
        body: JSON.stringify({ filename, full_text: fullText, keywords, summary, transcript }),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_notes.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download document.");
    }
  };

  const handleDownloadPdf = async (filename, fullText, keywords, summary, transcript) => {
    setError("");
    try {
      const blob = await fetchApi("/api/export/pdf", {
        method: "POST",
        body: JSON.stringify({ filename, full_text: fullText, keywords, summary, transcript }),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_notes.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download PDF.");
    }
  };

  return {
    handleDownloadDocx,
    handleDownloadPdf,
    error,
    setError,
  };
}
