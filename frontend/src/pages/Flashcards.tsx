import { useEffect, useState } from "react";
import { Layers, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get("/flashcards")
      .then((res) => setCards(res.data))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const currentCard = cards[currentIndex];

  const handleReview = async (quality: number) => {
    if (!currentCard) return;
    try {
      await api.post(`/flashcards/${currentCard.id}/review`, { quality });
      setReviewed((prev) => new Set(prev).add(currentCard.id));
    } catch {
      // silently fail for now
    }
    // Move to next card
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const qualityButtons = [
    { quality: 0, label: "Blackout", color: "bg-danger/20 text-danger hover:bg-danger/30" },
    { quality: 2, label: "Hard", color: "bg-warning/20 text-warning hover:bg-warning/30" },
    { quality: 3, label: "OK", color: "bg-primary/20 text-primary hover:bg-primary/30" },
    { quality: 5, label: "Easy", color: "bg-success/20 text-success hover:bg-success/30" },
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Flashcards</h2>
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Flashcards</h2>
        <div className="bg-surface-light rounded-xl border border-surface-lighter p-12 text-center">
          <Layers size={48} className="mx-auto mb-3 text-text-muted opacity-50" />
          <p className="text-text-muted">No flashcards yet.</p>
          <p className="text-sm text-text-muted mt-2">
            Go to the Dashboard and click "Generate Flashcards" on a document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Flashcards</h2>
        <span className="text-sm text-text-muted">
          {currentIndex + 1} / {cards.length} · {reviewed.size} reviewed
        </span>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto">
        {currentCard && (
          <>
            {/* Topic label */}
            {currentCard.topic && (
              <p className="text-sm text-accent mb-2 text-center">
                {currentCard.topic}
              </p>
            )}

            {/* Flashcard */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="bg-surface-light rounded-xl border border-surface-lighter p-8 min-h-[250px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative"
            >
              <div className="text-center">
                <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">
                  {flipped ? "Answer" : "Question"}
                </p>
                <p className="text-lg leading-relaxed">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {!flipped && (
                <div className="absolute bottom-4 text-xs text-text-muted flex items-center gap-1">
                  <RotateCcw size={12} />
                  Click to reveal answer
                </div>
              )}
            </div>

            {/* Review buttons — only show when flipped */}
            {flipped && (
              <div className="mt-4 flex justify-center gap-3">
                {qualityButtons.map((btn) => (
                  <button
                    key={btn.quality}
                    onClick={() => handleReview(btn.quality)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => {
                  setFlipped(false);
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                }}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={() => {
                  setFlipped(false);
                  setCurrentIndex(
                    Math.min(cards.length - 1, currentIndex + 1)
                  );
                }}
                disabled={currentIndex === cards.length - 1}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text disabled:opacity-30 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
