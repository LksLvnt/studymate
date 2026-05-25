import { useEffect, useState } from "react";
import { Brain, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import api from "../lib/api";

interface QuizQuestion { question: string; options: string[]; correct_index: number; explanation: string; topic: string | null; }
interface Quiz { id: string; title: string; questions: QuizQuestion[]; created_at: string; }

const card: React.CSSProperties = { background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 };

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => { api.get("/quizzes").then((r) => setQuizzes(r.data)).catch(() => setQuizzes([])).finally(() => setLoading(false)); }, []);

  const startQuiz = (q: Quiz) => { setActiveQuiz(q); setCurrentQ(0); setSelectedAnswer(null); setConfirmed(false); setScore(0); setFinished(false); };

  const confirm = () => {
    if (selectedAnswer === null || !activeQuiz) return;
    setConfirmed(true);
    if (selectedAnswer === activeQuiz.questions[currentQ].correct_index) setScore((s) => s + 1);
  };

  const next = () => {
    if (!activeQuiz) return;
    if (currentQ < activeQuiz.questions.length - 1) { setCurrentQ((q) => q + 1); setSelectedAnswer(null); setConfirmed(false); }
    else {
      setFinished(true);
      api.post(`/quizzes/${activeQuiz.id}/attempt`, {
        answers: [], score: score + (selectedAnswer === activeQuiz.questions[currentQ].correct_index ? 1 : 0), total: activeQuiz.questions.length,
      }).catch(() => {});
    }
  };

  const heading = (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Practice</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
        Practice <span style={{ fontStyle: "italic", color: "#c9a96e" }}>Quiz</span>
      </h2>
    </div>
  );

  const goldBtn: React.CSSProperties = {
    background: "#c9a96e", color: "#131313", fontWeight: 600, fontSize: 13,
    padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer",
    fontFamily: "'Geist', sans-serif", letterSpacing: "0.03em",
  };

  // List view
  if (!activeQuiz) {
    if (loading) return <div>{heading}<p style={{ color: "#5c4037" }}>Loading...</p></div>;
    if (quizzes.length === 0) return (
      <div>{heading}
        <div style={{ ...card, padding: "80px 0", textAlign: "center" }}>
          <Brain size={40} color="#353534" strokeWidth={1} style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#8a8280", fontSize: 15 }}>No quizzes yet</p>
          <p style={{ color: "#5c4037", fontSize: 13, marginTop: 6 }}>Generate them from the Dashboard</p>
        </div>
      </div>
    );
    return (
      <div>{heading}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quizzes.map((q) => (
            <div key={q.id} style={{ ...card, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
              <div>
                <p style={{ fontSize: 15, color: "#e5e2e1" }}>{q.title}</p>
                <p style={{ fontSize: 13, color: "#5c4037", marginTop: 4 }}>{q.questions.length} questions</p>
              </div>
              <button onClick={() => startQuiz(q)} style={{ ...goldBtn, padding: "8px 20px" }}>Start</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Finished
  if (finished) {
    const total = activeQuiz.questions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
        <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>Complete</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 72, fontWeight: 400, color: "#c9a96e" }}>{pct}%</p>
        <p style={{ color: "#5c4037", fontSize: 15, marginTop: 8 }}>{score} out of {total} correct</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 36 }}>
          <button onClick={() => startQuiz(activeQuiz)} style={goldBtn}>Retry</button>
          <button onClick={() => setActiveQuiz(null)} style={{ ...goldBtn, background: "#1c1b1b", color: "#8a8280" }}>Back</button>
        </div>
      </div>
    );
  }

  // Active quiz
  const question = activeQuiz.questions[currentQ];
  const progress = ((currentQ + 1) / activeQuiz.questions.length) * 100;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#8a8280" }}>{activeQuiz.title}</h3>
        <span style={{ fontSize: 12, color: "#5c4037" }}>{currentQ + 1} / {activeQuiz.questions.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", height: 2, background: "#201f1f", borderRadius: 1, marginBottom: 36 }}>
        <div style={{ width: `${progress}%`, height: 2, background: "#c9a96e", borderRadius: 1, transition: "width 0.5s" }} />
      </div>

      {/* Question */}
      <div style={{ marginBottom: 24 }}>
        {question.topic && <p style={{ fontSize: 11, color: "#a68b55", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{question.topic}</p>}
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e5e2e1", lineHeight: 1.5 }}>{question.question}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {question.options.map((opt, i) => {
          let bg = "#121212", border = "rgba(255,255,255,0.05)";
          if (confirmed) {
            if (i === question.correct_index) { bg = "rgba(127,186,106,0.08)"; border = "rgba(127,186,106,0.25)"; }
            else if (i === selectedAnswer) { bg = "rgba(255,180,171,0.08)"; border = "rgba(255,180,171,0.25)"; }
            else { bg = "#121212"; border = "rgba(255,255,255,0.03)"; }
          } else if (i === selectedAnswer) { bg = "rgba(201,169,110,0.08)"; border = "rgba(201,169,110,0.25)"; }

          return (
            <button key={i} onClick={() => !confirmed && setSelectedAnswer(i)} style={{
              width: "100%", textAlign: "left", padding: "14px 20px", borderRadius: 10,
              background: bg, border: `1px solid ${border}`, cursor: confirmed ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
              opacity: confirmed && i !== question.correct_index && i !== selectedAnswer ? 0.4 : 1,
            }}>
              <span style={{ fontSize: 12, color: "#5c4037", fontFamily: "monospace" }}>{String.fromCharCode(65 + i)}</span>
              <span style={{ fontSize: 15, color: "#e5e2e1", flex: 1 }}>{opt}</span>
              {confirmed && i === question.correct_index && <CheckCircle size={16} color="#7fba6a" strokeWidth={1.5} />}
              {confirmed && i === selectedAnswer && i !== question.correct_index && <XCircle size={16} color="#ffb4ab" strokeWidth={1.5} />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {confirmed && question.explanation && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: 24, fontSize: 14, color: "#8a8280" }}>
          <span style={{ color: "#e5e2e1" }}>Explanation: </span>{question.explanation}
        </div>
      )}

      {/* Action */}
      {!confirmed ? (
        <button onClick={confirm} disabled={selectedAnswer === null} style={{ ...goldBtn, width: "100%", padding: "14px 0", opacity: selectedAnswer === null ? 0.3 : 1 }}>
          Check Answer
        </button>
      ) : (
        <button onClick={next} style={{ ...goldBtn, width: "100%", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {currentQ < activeQuiz.questions.length - 1 ? "Next Question" : "See Results"}
          <ArrowRight size={15} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}