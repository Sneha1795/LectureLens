import { useState, useEffect, useRef } from "react";
import { fetchApi, BASE_URL } from "../api/client";

export function useLectureUpload() {
  const [jobId, setJobId] = useState("");
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
      if (mediaUrl && mediaUrl.startsWith("blob:")) {
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
    setJobId("");
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

      const returnedJobId = uploadRes.job_id;
      if (!returnedJobId) {
        throw new Error("Failed to start processing job: no job ID returned.");
      }
      setJobId(returnedJobId);

      await new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            const statusRes = await fetchApi(`/api/upload/status/${returnedJobId}`);
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
    if (mediaUrl && mediaUrl.startsWith("blob:")) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaUrl(null);
    setMediaType("");
    setTranscript([]);
    setFullText("");
    setKeywords([]);
    setUploadDate("");
    setFilename("");
    setJobId("");
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const loadJobById = async (id) => {
    setUploading(true);
    setError("");
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    try {
      const statusRes = await fetchApi(`/api/upload/status/${id}`);
      setJobId(id);
      if (statusRes.status === "done") {
        const result = statusRes.result;
        setTranscript(result.transcript);
        setFullText(result.full_text);
        setKeywords(result.keywords || []);
        const name = result.filename ? result.filename.replace(/\.[^/.]+$/, "") : `Lecture ${id.substring(0, 8)}`;
        setFilename(name);
        setUploadDate(new Date().toLocaleDateString());
        
        let type = "video/mp4";
        if (result.filename) {
          const ext = result.filename.split(".").pop().toLowerCase();
          if (["mp3", "wav", "m4a", "ogg"].includes(ext)) {
            type = `audio/${ext === "mp3" ? "mpeg" : ext}`;
          } else if (["mp4", "webm"].includes(ext)) {
            type = `video/${ext}`;
          }
        }
        setMediaType(type);
        setMediaUrl(`${BASE_URL}/api/media/${id}`);
        return "done";
      } else if (statusRes.status === "processing") {
        setFilename(`Lecture ${id.substring(0, 8)}`);
        setUploadDate(new Date().toLocaleDateString());
        setMediaType("video/mp4");
        setMediaUrl(`${BASE_URL}/api/media/${id}`);
        
        return new Promise((resolve, reject) => {
          const poll = async () => {
            try {
              const res = await fetchApi(`/api/upload/status/${id}`);
              if (res.status === "done") {
                const result = res.result;
                setTranscript(result.transcript);
                setFullText(result.full_text);
                setKeywords(result.keywords || []);
                const name = result.filename ? result.filename.replace(/\.[^/.]+$/, "") : `Lecture ${id.substring(0, 8)}`;
                setFilename(name);
                
                let type = "video/mp4";
                if (result.filename) {
                  const ext = result.filename.split(".").pop().toLowerCase();
                  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) {
                    type = `audio/${ext === "mp3" ? "mpeg" : ext}`;
                  } else if (["mp4", "webm"].includes(ext)) {
                    type = `video/${ext}`;
                  }
                }
                setMediaType(type);
                
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                resolve("done");
              } else if (res.status === "failed") {
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                reject(new Error(res.error || "Background processing failed."));
              }
            } catch (err) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              reject(err);
            }
          };
          poll();
          pollIntervalRef.current = setInterval(poll, 2000);
        });
      } else {
        throw new Error(statusRes.error || "Job failed or is in invalid state.");
      }
    } catch (err) {
      setError(err.message || "Failed to load job details.");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    jobId,
    setJobId,
    file,
    uploading,
    error,
    setError,
    mediaUrl,
    setMediaUrl,
    mediaType,
    setMediaType,
    transcript,
    fullText,
    keywords,
    uploadDate,
    filename,
    handleFileChange,
    handleUpload,
    resetUpload,
    loadJobById,
  };
}

