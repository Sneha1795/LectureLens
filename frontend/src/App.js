import { useRef, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import ResultsView from "./components/ResultsView";
import UploadView from "./components/UploadView";
import { useLectureUpload } from "./hooks/useLectureUpload";
import { useSummary } from "./hooks/useSummary";
import { useChat } from "./hooks/useChat";
import { useExport } from "./hooks/useExport";

// A wrapper to handle loading by ID from the route params
function ResultsRouteWrapper({
  loadJobById,
  transcript,
  jobId,
  setJobId,
  ...props
}) {
  const { jobId: urlJobId } = useParams();

  useEffect(() => {
    if (urlJobId && urlJobId !== jobId) {
      loadJobById(urlJobId).catch((err) => {
        console.error("Failed to load job:", err);
      });
    }
  }, [urlJobId, jobId, loadJobById]);

  return (
    <ResultsView
      {...props}
      transcript={transcript}
    />
  );
}

export default function App() {
  const navigate = useNavigate();

  const {
    jobId,
    setJobId,
    file,
    uploading,
    error: uploadError,
    setError: setUploadError,
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
    loadJobById,
  } = useLectureUpload();

  const {
    summary,
    summarySize,
    setSummarySize,
    loadingSummary,
    error: summaryError,
    setError: setSummaryError,
    handleSummary,
  } = useSummary();

  const {
    chatHistory,
    question,
    setQuestion,
    loadingChat,
    error: chatError,
    setError: setChatError,
    handleChat,
  } = useChat(fullText);

  const {
    handleDownloadDocx,
    handleDownloadPdf,
    error: exportError,
    setError: setExportError,
  } = useExport();

  const mediaRef = useRef(null);

  // Combine error displays
  const activeError = uploadError || summaryError || chatError || exportError;

  // Navigate to results page when jobId is updated from a successful upload
  useEffect(() => {
    if (jobId) {
      navigate(`/results/${jobId}`);
    }
  }, [jobId, navigate]);

  const jumpTo = (seconds) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = seconds;
      mediaRef.current.play();
    }
  };

  const handleBack = () => {
    resetUpload();
    setUploadError("");
    setSummaryError("");
    setChatError("");
    setExportError("");
    navigate("/");
  };

  const onDownloadNotes = () => {
    handleDownloadDocx(filename, fullText, keywords, summary, transcript);
  };

  const onDownloadPdf = () => {
    handleDownloadPdf(filename, fullText, keywords, summary, transcript);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <UploadView
            file={file}
            uploading={uploading}
            error={activeError}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
          />
        }
      />
      <Route
        path="/results/:jobId"
        element={
          <ResultsRouteWrapper
            loadJobById={loadJobById}
            jobId={jobId}
            setJobId={setJobId}
            filename={filename}
            uploadDate={uploadDate}
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            mediaRef={mediaRef}
            keywords={keywords}
            transcript={transcript}
            fullText={fullText}
            jumpTo={jumpTo}
            summary={summary}
            summarySize={summarySize}
            setSummarySize={setSummarySize}
            handleSummary={handleSummary}
            loadingSummary={loadingSummary}
            chatHistory={chatHistory}
            question={question}
            setQuestion={setQuestion}
            loadingChat={loadingChat}
            handleChat={handleChat}
            handleDownloadDocx={onDownloadNotes}
            handleDownloadPdf={onDownloadPdf}
            onBack={handleBack}
            file={file}
            uploading={uploading}
            error={activeError}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
          />
        }
      />
    </Routes>
  );
}