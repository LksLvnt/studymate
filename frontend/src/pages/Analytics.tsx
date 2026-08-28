import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { BarChart3, FileText, Layers, Brain, Flame, TrendingUp, Target, Clock } from "lucide-react";
import api from "../lib/api";
import { useDataCache } from "../context/DataCacheContext";

interface Overview { documents: number; flashcards: number; flashcards_due: number; flashcards_mastered: number; quizzes_taken: number; avg_accuracy: number | null; }
interface QuizHistoryItem { date: string; accuracy: number; quiz_title: string; score: number; total: number; }
interface TopicItem { topic: string; card_count: number; confidence: number; }
interface Streak { current_streak: number; total_study_days: number; }

const card: React.CSSProperties = { background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };
const labelStyle: React.CSSProperties = { fontSize: 12, color: "#8a8280", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 600 };

function confidenceColor(c: number) { return c >= 70 ? "#7fba6a" : c >= 40 ? "#c9a96e" : "#ffb4ab"; }

const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: QuizHistoryItem }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
      <p style={{ color: "#e5e2e1" }}>{d.quiz_title}</p>
      <p style={{ color: "#5c4037" }}>{d.score}/{d.total} — {d.accuracy}%</p>
    </div>
  );
};

export default function Analytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

const { get } = useDataCache();

useEffect(() => {
  Promise.all([
    get<Overview>("overview", "/analytics/overview").catch(() => null),
    get<QuizHistoryItem[]>("quiz-history", "/analytics/quiz-history").catch(() => []),
    get<TopicItem[]>("topic-breakdown", "/analytics/topic-breakdown").catch(() => []),
    get<Streak>("study-streak", "/analytics/study-streak").catch(() => null),
  ]).then(([o, h, t, s]) => { setOverview(o); setQuizHistory(h); setTopics(t); setStreak(s); })
    .finally(() => setLoading(false));
}, [get]);

  const heading = (
    <div style={{ marginBottom: 48 }}>
      <p style={{ ...labelStyle, letterSpacing: "0.2em", marginBottom: 12 }}>Insights</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
        Performance <span style={{ fontStyle: "italic", color: "#c9a96e" }}>Analytics</span>
      </h2>
    </div>
  );

  if (loading) return <div>{heading}<p style={{ color: "#5c4037" }}>Loading...</p></div>;

  const hasData = overview && (overview.documents > 0 || overview.flashcards > 0 || overview.quizzes_taken > 0);
  if (!hasData) return (
    <div>{heading}
      <div style={{ ...card, padding: "80px 0", textAlign: "center" }}>
        <BarChart3 size={40} color="#353534" strokeWidth={1} style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#8a8280", fontSize: 15 }}>No data yet</p>
        <p style={{ color: "#5c4037", fontSize: 13, marginTop: 6 }}>Study to see your analytics</p>
      </div>
    </div>
  );

  const stats = [
    { icon: FileText, label: "Documents", value: overview?.documents ?? 0 },
    { icon: Layers, label: "Flashcards", value: overview?.flashcards ?? 0, sub: `${overview?.flashcards_due ?? 0} due` },
    { icon: Brain, label: "Quizzes", value: overview?.quizzes_taken ?? 0 },
    { icon: Target, label: "Accuracy", value: overview?.avg_accuracy != null ? `${overview.avg_accuracy}%` : "—" },
  ];

  const bigNum = (val: number | string, color: string) => (
    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400, color }}>{val}</p>
  );

  return (
    <div>
      {heading}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: window.innerWidth < 768 ? 12 : 20, marginBottom: window.innerWidth < 768 ? 32 : 64 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <s.icon size={14} color="#5c4037" strokeWidth={1.5} />
              <span style={labelStyle}>{s.label}</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400, color: "#e5e2e1" }}>{s.value}</p>
            {"sub" in s && s.sub && <p style={{ fontSize: 12, color: "#a68b55", marginTop: 8 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", gap: window.innerWidth < 768 ? 12 : 16, marginBottom: window.innerWidth < 768 ? 16 : 24 }}>
        {/* Quiz accuracy */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <TrendingUp size={14} color="#c9a96e" strokeWidth={1.5} />
            <span style={labelStyle}>Accuracy Over Time</span>
          </div>
          {quizHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={quizHistory}>
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })} stroke="#5c4037" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#5c4037" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="#c9a96e" strokeWidth={2} dot={{ fill: "#c9a96e", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#dfc08a" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#5c4037", fontSize: 13 }}>Complete quizzes to see trends</div>
          )}
        </div>

        {/* Topic confidence */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BarChart3 size={14} color="#c9a96e" strokeWidth={1.5} />
            <span style={labelStyle}>Topic Confidence</span>
          </div>
          {topics.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topics} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#5c4037" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="topic" stroke="#5c4037" fontSize={10} tickLine={false} axisLine={false} width={90} />
                <Tooltip formatter={(value?: number | string) => [`${value ?? 0}%`, "Confidence"]} contentStyle={{ background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={14}>
                  {topics.map((e, i) => <Cell key={i} fill={confidenceColor(e.confidence)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#5c4037", fontSize: 13 }}>Review flashcards to see breakdown</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", gap: window.innerWidth < 768 ? 12 : 16 }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Flame size={14} color="#c9a96e" strokeWidth={1.5} />
            <span style={labelStyle}>Study Streak</span>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              {bigNum(streak?.current_streak ?? 0, "#c9a96e")}
              <p style={{ fontSize: 12, color: "#5c4037", marginTop: 6 }}>Current streak</p>
            </div>
            <div>
              {bigNum(streak?.total_study_days ?? 0, "#5c4037")}
              <p style={{ fontSize: 12, color: "#5c4037", marginTop: 6 }}>Total days</p>
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Clock size={14} color="#c9a96e" strokeWidth={1.5} />
            <span style={labelStyle}>Review Status</span>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              {bigNum(overview?.flashcards_due ?? 0, "#c9a96e")}
              <p style={{ fontSize: 12, color: "#5c4037", marginTop: 6 }}>Due today</p>
            </div>
            <div>
              {bigNum(overview?.flashcards_mastered ?? 0, "#7fba6a")}
              <p style={{ fontSize: 12, color: "#5c4037", marginTop: 6 }}>Mastered</p>
            </div>
            <div>
              {bigNum((overview?.flashcards ?? 0) - (overview?.flashcards_mastered ?? 0), "#5c4037")}
              <p style={{ fontSize: 12, color: "#5c4037", marginTop: 6 }}>Learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}