import { useState, useEffect, useRef } from "react";
import { fetchApi } from "../api/client";

export function useLectureUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [fullText, setFullText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [uploadDate, setUploadDate] = useState("");
  const [filename, setFilename] = useState("");
  const pollIntervalRef = useRef(null);

  // Revoke object URL on change or on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [mediaUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setFilename(selected.name.replace(/\.[^/.]+$/, ""));
    setMediaUrl(URL.createObjectURL(selected));
    setMediaType(selected.type);
    setTranscript([]);
    setFullText("");
    setKeywords([]);
    setError("");
    setUploadDate(new Date().toLocaleDateString());
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    try {
      const uploadRes = await fetchApi("/api/upload", {
        method: "POST",
        body: formData,
      });

      const jobId = uploadRes.job_id;
      if (!jobId) {
        throw new Error("Failed to start processing job: no job ID returned.");
      }

      await new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            const statusRes = await fetchApi(`/api/upload/status/${jobId}`);
            if (statusRes.status === "done") {
              const result = statusRes.result;
              setTranscript(result.transcript);
              setFullText(result.full_text);
              setKeywords(result.keywords || []);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              resolve();
            } else if (statusRes.status === "failed") {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              reject(new Error(statusRes.error || "Background processing failed."));
            }
          } catch (pollErr) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            reject(pollErr);
          }
        };

        poll();
        pollIntervalRef.current = setInterval(poll, 2000);
      });

    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploading(false);
    setError("");
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaUrl(null);
    setMediaType("");
    setTranscript([]);
    setFullText("");
    setKeywords([]);
    setUploadDate("");
    setFilename("");
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  return {
    file,
    uploading,
    error,
    setError,
    mediaUrl,
    mediaType,
    transcript,
    fullText,
    keywords,
    uploadDate,
    filename,
    handleFileChange,
    handleUpload,
    resetUpload,
  };
}
