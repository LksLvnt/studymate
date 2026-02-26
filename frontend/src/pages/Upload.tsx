import { useState, useCallback } from "react";
import { Upload as UploadIcon, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import api from "../lib/api";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setStatus("idle");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    if (subject.trim()) formData.append("subject", subject.trim());

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("success");
      setFile(null);
      setSubject("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.response?.data?.detail ?? "Upload failed. Is the backend running?");
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-6">Upload Materials</h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-accent bg-accent/10"
            : "border-surface-lighter hover:border-primary"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileUp size={40} className="text-primary" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-text-muted">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadIcon size={40} className="text-text-muted" />
            <p className="font-medium">Drop your PDF here</p>
            <p className="text-sm text-text-muted">or click to browse</p>
          </div>
        )}
      </div>

      {/* Subject input */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Subject (optional)
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Operating Systems, Linear Algebra..."
          className="w-full bg-surface-light border border-surface-lighter rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className="mt-6 w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
      >
        {status === "uploading" ? "Processing..." : "Upload & Generate Study Materials"}
      </button>

      {/* Status messages */}
      {status === "success" && (
        <div className="mt-4 flex items-center gap-2 text-success">
          <CheckCircle size={18} />
          <span>Upload successful! Your study materials are being generated.</span>
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 text-danger">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
