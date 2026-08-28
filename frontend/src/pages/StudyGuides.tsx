import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft, FileText } from "lucide-react";
import api from "../lib/api";
import DOMPurify from "dompurify";
import { useDataCache } from "../context/DataCacheContext";

interface StudyGuideListItem { id: string; title: string; document_filename: string; subject: string | null; created_at: string; }
interface StudyGuideFull extends StudyGuideListItem { content_markdown: string; }

const card: React.CSSProperties = { background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };

function MarkdownRenderer({ content }: { content: string }) {
  const render = (md: string): string => {
    const html = md
      .replace(/^### (.+)$/gm, '<h3 style="font-family:Playfair Display,serif;font-size:18px;font-weight:600;margin:28px 0 10px;color:#e5e2e1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-family:Playfair Display,serif;font-size:22px;font-weight:600;margin:36px 0 14px;color:#e5e2e1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-family:Playfair Display,serif;font-size:28px;font-weight:700;margin:36px 0 16px;color:#e5e2e1">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e5e2e1">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#c9a96e">$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#1c1b1b;padding:2px 7px;border-radius:4px;font-size:13px;color:#a68b55">$1</code>')
      .replace(/^[*-] (.+)$/gm, '<li style="margin-left:16px;margin-bottom:6px;color:#8a8280;list-style-type:disc;font-size:15px;line-height:1.7">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:16px;margin-bottom:6px;color:#8a8280;list-style-type:decimal;font-size:15px;line-height:1.7">$1</li>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:28px 0" />')
      .replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, '<p style="color:#8a8280;line-height:1.75;margin-bottom:14px;font-size:15px">$1</p>');
    return html;
  };
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(render(content)) }} />;
}


export default function StudyGuidesPage() {
  const [guides, setGuides] = useState<StudyGuideListItem[]>([]);
  const [activeGuide, setActiveGuide] = useState<StudyGuideFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGuide, setLoadingGuide] = useState(false);

const { get } = useDataCache();

useEffect(() => {
  get<StudyGuideListItem[]>("guides", "/study-guides")
    .then((data) => setGuides(data))
    .catch(() => setGuides([]))
    .finally(() => setLoading(false));
}, [get]);

  const openGuide = async (id: string) => {
    setLoadingGuide(true);
    try { const r = await api.get(`/study-guides/${id}`); setActiveGuide(r.data); } catch {}
    finally { setLoadingGuide(false); }
  };

  if (activeGuide) {
    return (
      <div style={{ maxWidth: 780 }}>
        <button onClick={() => setActiveGuide(null)} style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5c4037",
          background: "none", border: "none", cursor: "pointer", marginBottom: 36,
          fontFamily: "'Geist', sans-serif", letterSpacing: "0.03em",
        }}>
          <ArrowLeft size={15} strokeWidth={1.5} /> Back to guides
        </button>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#e5e2e1" }}>{activeGuide.title}</h2>
          <p style={{ fontSize: 13, color: "#5c4037", marginTop: 8 }}>
            {activeGuide.subject && <span style={{ color: "#a68b55" }}>{activeGuide.subject} · </span>}
            {activeGuide.document_filename}
          </p>
        </div>
        <div style={{ ...card, padding: "36px 40px" }}>
          <MarkdownRenderer content={activeGuide.content_markdown} />
        </div>
      </div>
    );
  }

  const heading = (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Materials</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
        Study <span style={{ fontStyle: "italic", color: "#c9a96e" }}>Guides</span>
      </h2>
    </div>
  );

  if (loading) return <div>{heading}<p style={{ color: "#5c4037" }}>Loading...</p></div>;
  if (guides.length === 0) return (
    <div>{heading}
      <div style={{ ...card, padding: "80px 0", textAlign: "center" }}>
        <BookOpen size={40} color="#353534" strokeWidth={1} style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#8a8280", fontSize: 15 }}>No study guides yet</p>
        <p style={{ color: "#5c4037", fontSize: 13, marginTop: 6 }}>Generate them from the Dashboard</p>
      </div>
    </div>
  );

  return (
    <div>{heading}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {guides.map((g) => (
          <div key={g.id} onClick={() => !loadingGuide && openGuide(g.id)} style={{ ...card, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <FileText size={17} color="#a68b55" strokeWidth={1.5} />
              <div>
                <p style={{ fontSize: 15, color: "#e5e2e1" }}>{g.title}</p>
                <p style={{ fontSize: 13, color: "#5c4037", marginTop: 4 }}>
                  {g.subject && <span style={{ color: "#a68b55" }}>{g.subject} · </span>}
                  {g.document_filename}
                </p>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#5c4037" }}>{new Date(g.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}