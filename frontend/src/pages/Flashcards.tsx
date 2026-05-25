import { useEffect, useState } from "react";
import { Layers, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/api";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string | null;
  ease_factor: number;
  interval_days: number;
  next_review: string;
}

const card: React.CSSProperties = {
  background: "#121212", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12,
};

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get("/flashcards").then((r) => setCards(r.data)).catch(() => setCards([])).finally(() => setLoading(false));
  }, []);

  const currentCard = cards[currentIndex];

  const handleReview = async (quality: number) => {
    if (!currentCard) return;
    try { await api.post(`/flashcards/${currentCard.id}/review`, { quality }); setReviewed((p) => new Set(p).add(currentCard.id)); } catch {}
    setFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.code === "ArrowRight" && currentIndex < cards.length - 1) { setFlipped(false); setCurrentIndex((i) => i + 1); }
      if (e.code === "ArrowLeft" && currentIndex > 0) { setFlipped(false); setCurrentIndex((i) => i - 1); }
      if (flipped) {
        if (e.code === "Digit1") handleReview(0);
        if (e.code === "Digit2") handleReview(2);
        if (e.code === "Digit3") handleReview(3);
        if (e.code === "Digit4") handleReview(5);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, cards.length, flipped, currentCard]);

  const qualityButtons = [
    { quality: 0, label: "Again", key: "1", bg: "rgba(255,180,171,0.1)", color: "#ffb4ab" },
    { quality: 2, label: "Hard", key: "2", bg: "rgba(255,192,128,0.1)", color: "#ffc080" },
    { quality: 3, label: "Good", key: "3", bg: "rgba(201,169,110,0.1)", color: "#c9a96e" },
    { quality: 5, label: "Easy", key: "4", bg: "rgba(127,186,106,0.1)", color: "#7fba6a" },
  ];

  const heading = (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Study</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
        Flash<span style={{ fontStyle: "italic", color: "#c9a96e" }}>cards</span>
      </h2>
    </div>
  );

  if (loading) return <div>{heading}<p style={{ color: "#5c4037" }}>Loading...</p></div>;

  if (cards.length === 0) return (
    <div>
      {heading}
      <div style={{ ...card, padding: "80px 0", textAlign: "center" }}>
        <Layers size={40} color="#353534" strokeWidth={1} style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#8a8280", fontSize: 15 }}>No flashcards yet</p>
        <p style={{ color: "#5c4037", fontSize: 13, marginTop: 6 }}>Generate them from the Dashboard</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
        <div>
          <p style={{ fontSize: 12, color: "#8a8280", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Study</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e5e2e1" }}>
            Flash<span style={{ fontStyle: "italic", color: "#c9a96e" }}>cards</span>
          </h2>
        </div>
        <span style={{ fontSize: 13, color: "#5c4037" }}>{currentIndex + 1} / {cards.length} · {reviewed.size} reviewed</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {currentCard && (
          <>
            {currentCard.topic && (
              <p style={{ fontSize: 11, color: "#a68b55", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 16, fontWeight: 600 }}>
                {currentCard.topic}
              </p>
            )}

            <div onClick={() => setFlipped(!flipped)} style={{
              ...card, padding: "56px 40px", minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", transition: "all 0.3s",
              background: flipped ? "linear-gradient(135deg, #121212 0%, rgba(201,169,110,0.04) 100%)" : "#121212",
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
              <div style={{ textAlign: "center", maxWidth: 560 }}>
                <p style={{ fontSize: 10, color: "#5c4037", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>
                  {flipped ? "Answer" : "Question"}
                </p>
                <p style={{ fontSize: 20, lineHeight: 1.6, color: "#e5e2e1", fontFamily: flipped ? "'Geist', sans-serif" : "'Playfair Display', serif" }}>
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </div>
              {!flipped && (
                <p style={{ position: "absolute", bottom: 16, fontSize: 10, color: "#353534", letterSpacing: "0.1em" }}>
                  SPACE to reveal · ← → to navigate
                </p>
              )}
            </div>

            {flipped && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10 }}>
                {qualityButtons.map((btn) => (
                  <button key={btn.quality} onClick={() => handleReview(btn.quality)} style={{
                    padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, background: btn.bg, color: btn.color, transition: "all 0.2s",
                  }}>
                    {btn.label} <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 4 }}>{btn.key}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 32 }}>
              <button onClick={() => { setFlipped(false); setCurrentIndex(Math.max(0, currentIndex - 1)); }} disabled={currentIndex === 0}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: currentIndex === 0 ? "#201f1f" : "#5c4037", background: "none", border: "none", cursor: "pointer" }}>
                <ChevronLeft size={15} strokeWidth={1.5} /> Prev
              </button>
              <button onClick={() => { setFlipped(false); setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); }} disabled={currentIndex === cards.length - 1}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: currentIndex === cards.length - 1 ? "#201f1f" : "#5c4037", background: "none", border: "none", cursor: "pointer" }}>
                Next <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}