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
    e.preventDefault(); setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") { setFile(dropped); setStatus("idle"); }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading"); setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);
    if (subject.trim()) formData.append("subject", subject.trim());
    try {
      await api.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus("success"); setFile(null); setSubject("");
    } catch { setStatus("error"); setErrorMsg("Upload failed."); }
  };

  const input: React.CSSProperties = {
    width: "100%", background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "12px 16px", color: "#e5e2e1", fontSize: 14,
    fontFamily: "'Geist', sans-serif", outline: "none",
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Materials</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
          Upload <span style={{ fontStyle: "italic", color: "#c9a96e" }}>Materials</span>
        </h2>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
        style={{
          border: `1px dashed ${dragActive ? "#c9a96e" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12, padding: "64px 20px", textAlign: "center", cursor: "pointer",
          background: dragActive ? "rgba(201,169,110,0.05)" : "transparent",
          transition: "all 0.2s",
        }}>
        <input id="file-input" type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setStatus("idle"); }}} style={{ display: "none" }} />
        {file ? (
          <>
            <FileUp size={32} color="#c9a96e" strokeWidth={1.5} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#e5e2e1" }}>{file.name}</p>
            <p style={{ fontSize: 13, color: "#5c4037", marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </>
        ) : (
          <>
            <UploadIcon size={32} color="#5c4037" strokeWidth={1} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#8a8280" }}>Drop your PDF here</p>
            <p style={{ fontSize: 13, color: "#5c4037", marginTop: 4 }}>or click to browse</p>
          </>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <label style={{ display: "block", fontSize: 12, color: "#8a8280", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 8 }}>
          Subject (optional)
        </label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Operating Systems..." style={input}
          onFocus={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
          onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
      </div>

      <button onClick={handleUpload} disabled={!file || status === "uploading"} style={{
        marginTop: 24, width: "100%", background: "#c9a96e", color: "#131313", fontWeight: 600,
        fontSize: 14, padding: "14px 0", borderRadius: 8, border: "none", cursor: "pointer",
        opacity: !file || status === "uploading" ? 0.4 : 1,
        fontFamily: "'Geist', sans-serif",
      }}>
        {status === "uploading" ? "Processing..." : "Upload & Process"}
      </button>

      {status === "success" && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, color: "#7fba6a", fontSize: 14 }}>
          <CheckCircle size={16} strokeWidth={1.5} /> Upload successful
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, color: "#ffb4ab", fontSize: 14 }}>
          <AlertCircle size={16} strokeWidth={1.5} /> {errorMsg}
        </div>
      )}
    </div>
  );
}
