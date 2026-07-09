import { useRef } from "react";
import UploadView from "./components/UploadView";
import ResultsView from "./components/ResultsView";
import { useLectureUpload } from "./hooks/useLectureUpload";
import { useSummary } from "./hooks/useSummary";
import { useChat } from "./hooks/useChat";
import { useExport } from "./hooks/useExport";

export default function App() {
  const {
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
  };

  const onDownloadNotes = () => {
    handleDownloadDocx(filename, fullText, keywords, summary, transcript);
  };

  const onDownloadPdf = () => {
    handleDownloadPdf(filename, fullText, keywords, summary, transcript);
  };

  if (!transcript.length) {
    return (
      <UploadView
        file={file}
        uploading={uploading}
        error={activeError}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />
    );
  }

  return (
    <ResultsView
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
    />
  );
}