import { useEffect, useState } from "react";
import { useDataCache } from "../context/DataCacheContext";
import { Link } from "react-router-dom";
import { Upload, Layers, Brain, FileText, BookOpen, Loader2, Trash2, Target } from "lucide-react";
import type { Document } from "../types";
import api from "../lib/api";

interface Overview { documents: number; flashcards: number; flashcards_due: number; quizzes_taken: number; avg_accuracy: number | null; }

const card: React.CSSProperties = {
  background: "#121212", border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 12, transition: "border-color 0.3s",
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "#8a8280", letterSpacing: "0.1em",
  textTransform: "uppercase" as const, fontWeight: 600, fontFamily: "'Geist', sans-serif",
};
const heading = (text: string, accent: string): React.ReactNode => (
  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1", lineHeight: 1.15 }}>
    {text} <span style={{ fontStyle: "italic", color: "#c9a96e" }}>{accent}</span>
  </h2>
);
const sectionLabel = (text: string) => (
  <p style={{ ...labelStyle, marginBottom: 12, letterSpacing: "0.2em" }}>{text}</p>
);

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Record<string, string>>({});

const { get, invalidate } = useDataCache();

useEffect(() => {
  Promise.all([
    get<Document[]>("documents", "/documents").catch(() => []),
    get<Overview>("overview", "/analytics/overview").catch(() => null),
  ]).then(([d, o]) => { setDocuments(d); setOverview(o); }).finally(() => setLoading(false));
}, [get]);

const generate = async (docId: string, type: "study-guide" | "flashcards" | "quiz") => {
  setGenerating((p) => ({ ...p, [docId + type]: "loading" }));
  try {
    await api.post(`/generate/${type}/${docId}`);
    setGenerating((p) => ({ ...p, [docId + type]: "done" }));
    invalidate("overview");
    if (type === "flashcards") invalidate("flashcards");
    if (type === "quiz") invalidate("quizzes");
    if (type === "study-guide") invalidate("guides");
  } catch {
    setGenerating((p) => ({ ...p, [docId + type]: "" }));
  }
};

const deleteDoc = async (docId: string, filename: string) => {
  if (!confirm(`Delete "${filename}" and all its study materials?`)) return;
  try {
    await api.delete(`/documents/${docId}`);
    setDocuments((p) => p.filter((d) => d.id !== docId));
    invalidate("documents");
    invalidate("overview");
  } catch {}
};

  const stats = [
    { label: "Documents", value: overview?.documents ?? documents.length, icon: FileText },
    { label: "Flashcards", value: overview?.flashcards ?? "—", icon: Layers, sub: overview?.flashcards_due ? `${overview.flashcards_due} due today` : undefined },
    { label: "Quizzes", value: overview?.quizzes_taken ?? "—", icon: Brain },
    { label: "Accuracy", value: overview?.avg_accuracy != null ? `${overview.avg_accuracy}%` : "—", icon: Target },
  ];

  const genBtnStyle = (state: string): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "10px 20px",
    borderRadius: 8, border: "none", cursor: state === "loading" ? "wait" : "pointer",
    fontFamily: "'Geist', sans-serif", fontWeight: 500, transition: "all 0.2s",
    background: state === "done" ? "rgba(127,186,106,0.12)" : "#1c1b1b",
    color: state === "done" ? "#7fba6a" : state === "loading" ? "#5c4037" : "#8a8280",
  });

  return (
    <div>
      <div style={{ marginBottom: 56 }}>
        {sectionLabel("Overview")}
        {heading("Your", "Dashboard")}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: window.innerWidth < 768 ? 12 : 20, marginBottom: window.innerWidth < 768 ? 32 : 64 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <s.icon size={15} color="#5c4037" strokeWidth={1.5} />
              <span style={labelStyle}>{s.label}</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 400, color: "#e5e2e1" }}>
              {s.value}
            </p>
            {"sub" in s && s.sub && <p style={{ fontSize: 13, color: "#ad897e", marginTop: 12 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Documents header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          {sectionLabel("Materials")}
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#e5e2e1" }}>
            Your <span style={{ fontStyle: "italic", color: "#c9a96e" }}>Documents</span>
          </h3>
        </div>
        <Link to="/upload" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#c9a96e", color: "#131313", fontSize: 13, fontWeight: 600,
          padding: "12px 24px", borderRadius: 8, textDecoration: "none",
          letterSpacing: "0.03em", fontFamily: "'Geist', sans-serif",
        }}>
          <Upload size={15} strokeWidth={1.5} /> Upload
        </Link>
      </div>

      {/* Documents list */}
      {loading ? (
        <p style={{ color: "#5c4037", padding: "40px 0" }}>Loading...</p>
      ) : documents.length === 0 ? (
        <div style={{ ...card, padding: "80px 0", textAlign: "center" }}>
          <FileText size={44} color="#353534" strokeWidth={1} style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#8a8280", fontSize: 15 }}>No documents yet</p>
          <p style={{ color: "#5c4037", fontSize: 13, marginTop: 6 }}>Upload your first lecture PDF to get started</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {documents.map((doc) => (
            <div key={doc.id} style={{ ...card, padding: "24px 32px" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 16, color: "#e5e2e1" }}>{doc.filename}</p>
                  <p style={{ fontSize: 13, color: "#5c4037", marginTop: 4 }}>
                    {doc.subject && <span style={{ color: "#ad897e" }}>{doc.subject}</span>}
                    {doc.subject && " · "}
                    {doc.chunk_count} chunks
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "4px 10px", borderRadius: 6,
                    background: doc.status === "ready" ? "rgba(127,186,106,0.1)" : doc.status === "processing" ? "rgba(255,192,128,0.1)" : "rgba(255,180,171,0.1)",
                    color: doc.status === "ready" ? "#7fba6a" : doc.status === "processing" ? "#ffc080" : "#ffb4ab",
                  }}>{doc.status}</span>
                  <button onClick={() => deleteDoc(doc.id, doc.filename)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#5c4037", padding: 4 }}>
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              {doc.status === "ready" && (
                <div style={{ display: "flex", gap: 8 }}>
                  {([["study-guide", BookOpen, "Study Guide"], ["flashcards", Layers, "Flashcards"], ["quiz", Brain, "Quiz"]] as const).map(([type, Icon, label]) => {
                    const state = generating[doc.id + type] || "";
                    return (
                      <button key={type} onClick={() => state !== "loading" && state !== "done" && generate(doc.id, type)}
                        style={genBtnStyle(state)}
                        onMouseEnter={(e) => { if (!state) { e.currentTarget.style.color = "#c9a96e"; e.currentTarget.style.background = "rgba(201,169,110,0.08)"; }}}
                        onMouseLeave={(e) => { if (!state) { e.currentTarget.style.color = "#8a8280"; e.currentTarget.style.background = "#1c1b1b"; }}}>
                        {state === "loading" ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} /> : <Icon size={14} strokeWidth={1.5} />}
                        {state === "done" ? `${label} ✓` : state === "loading" ? "Generating..." : label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
