import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Layers,
  Brain,
  BarChart3,
  FileText,
  BookOpen,
  Loader2,
} from "lucide-react";
import type { Document } from "../types";
import api from "../lib/api";

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<Record<string, string>>({});

  const fetchDocuments = () => {
    api
      .get("/documents")
      .then((res) => setDocuments(res.data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const generate = async (
    docId: string,
    type: "study-guide" | "flashcards" | "quiz"
  ) => {
    setGenerating((prev) => ({ ...prev, [docId + type]: "loading" }));
    try {
      await api.post(`/generate/${type}/${docId}`);
      setGenerating((prev) => ({ ...prev, [docId + type]: "done" }));
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ?? "Generation failed. Check backend logs.";
      alert(msg);
      setGenerating((prev) => ({ ...prev, [docId + type]: "" }));
    }
  };

  const stats = [
    {
      label: "Documents",
      value: documents.length,
      icon: FileText,
      color: "text-primary",
    },
    { label: "Flashcards", value: "—", icon: Layers, color: "text-accent" },
    { label: "Quizzes Taken", value: "—", icon: Brain, color: "text-success" },
    {
      label: "Avg. Accuracy",
      value: "—",
      icon: BarChart3,
      color: "text-warning",
    },
  ];

  const btnClass = (key: string) => {
    const state = generating[key];
    if (state === "done") return "bg-success/20 text-success cursor-default";
    if (state === "loading")
      return "bg-surface-lighter text-text-muted cursor-wait";
    return "bg-surface-lighter hover:bg-primary/20 hover:text-primary text-text-muted";
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface-light rounded-xl p-5 border border-surface-lighter"
          >
            <div className="flex items-center gap-3 mb-2">
              <s.icon size={20} className={s.color} />
              <span className="text-sm text-text-muted">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent documents */}
      <div className="bg-surface-light rounded-xl border border-surface-lighter p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Documents</h3>
          <Link
            to="/upload"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={16} />
            Upload New
          </Link>
        </div>

        {loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>No documents yet.</p>
            <p className="text-sm mt-1">
              Upload your first lecture PDF to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface rounded-lg px-5 py-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-sm text-text-muted">
                      {doc.subject ?? "No subject"} · {doc.chunk_count} chunks
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === "ready"
                        ? "bg-success/20 text-success"
                        : doc.status === "processing"
                        ? "bg-warning/20 text-warning"
                        : "bg-danger/20 text-danger"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {doc.status === "ready" && (
                  <div className="flex gap-2">
                    {(
                      [
                        ["study-guide", BookOpen, "Study Guide"],
                        ["flashcards", Layers, "Flashcards"],
                        ["quiz", Brain, "Quiz"],
                      ] as const
                    ).map(([type, Icon, label]) => {
                      const key = doc.id + type;
                      const state = generating[key];
                      return (
                        <button
                          key={type}
                          onClick={() =>
                            state !== "loading" &&
                            state !== "done" &&
                            generate(doc.id, type)
                          }
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${btnClass(key)}`}
                        >
                          {state === "loading" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Icon size={14} />
                          )}
                          {state === "done"
                            ? `${label} ✓`
                            : state === "loading"
                            ? "Generating..."
                            : `Generate ${label}`}
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
    </div>
  );
}
