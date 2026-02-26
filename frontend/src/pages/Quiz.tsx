import { useEffect, useState } from "react";
import { Brain, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import api from "../lib/api";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string | null;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  created_at: string;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    api
      .get("/quizzes")
      .then((res) => setQuizzes(res.data))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setConfirmed(false);
    setScore(0);
    setFinished(false);
  };

  const confirm = () => {
    if (selectedAnswer === null || !activeQuiz) return;
    setConfirmed(true);
    if (selectedAnswer === activeQuiz.questions[currentQ].correct_index) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (!activeQuiz) return;
    if (currentQ < activeQuiz.questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setConfirmed(false);
    } else {
      setFinished(true);
      // Submit attempt
      api
        .post(`/quizzes/${activeQuiz.id}/attempt`, {
          answers: [],
          score: score + (selectedAnswer === activeQuiz.questions[currentQ].correct_index ? 1 : 0),
          total: activeQuiz.questions.length,
        })
        .catch(() => {});
    }
  };

  // Quiz list view
  if (!activeQuiz) {
    if (loading) {
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6">Practice Quiz</h2>
          <p className="text-text-muted">Loading...</p>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6">Practice Quiz</h2>
          <div className="bg-surface-light rounded-xl border border-surface-lighter p-12 text-center">
            <Brain size={48} className="mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-text-muted">No quizzes yet.</p>
            <p className="text-sm text-text-muted mt-2">
              Go to the Dashboard and click "Generate Quiz" on a document.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Practice Quiz</h2>
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-surface-light rounded-xl border border-surface-lighter p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{quiz.title}</p>
                <p className="text-sm text-text-muted">
                  {quiz.questions.length} questions
                </p>
              </div>
              <button
                onClick={() => startQuiz(quiz)}
                className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Finished view
  if (finished) {
    const total = activeQuiz.questions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <div className="bg-surface-light rounded-xl border border-surface-lighter p-8">
          <p className="text-5xl font-bold mb-2">{pct}%</p>
          <p className="text-text-muted mb-6">
            {score} out of {total} correct
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => startQuiz(activeQuiz)}
              className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => setActiveQuiz(null)}
              className="bg-surface-lighter hover:bg-surface text-text-muted text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz view
  const question = activeQuiz.questions[currentQ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
        <span className="text-sm text-text-muted">
          {currentQ + 1} / {activeQuiz.questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-lighter rounded-full h-1.5 mb-6">
        <div
          className="bg-primary rounded-full h-1.5 transition-all"
          style={{
            width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="bg-surface-light rounded-xl border border-surface-lighter p-6 mb-4">
        {question.topic && (
          <p className="text-xs text-accent mb-2">{question.topic}</p>
        )}
        <p className="text-lg font-medium">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, i) => {
          let style =
            "bg-surface-light border border-surface-lighter hover:border-primary/50";
          if (confirmed) {
            if (i === question.correct_index)
              style = "bg-success/10 border border-success";
            else if (i === selectedAnswer)
              style = "bg-danger/10 border border-danger";
            else style = "bg-surface-light border border-surface-lighter opacity-50";
          } else if (i === selectedAnswer) {
            style = "bg-primary/10 border border-primary";
          }

          return (
            <button
              key={i}
              onClick={() => !confirmed && setSelectedAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${style}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted font-mono">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {confirmed && i === question.correct_index && (
                  <CheckCircle size={16} className="ml-auto text-success" />
                )}
                {confirmed &&
                  i === selectedAnswer &&
                  i !== question.correct_index && (
                    <XCircle size={16} className="ml-auto text-danger" />
                  )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {confirmed && question.explanation && (
        <div className="bg-surface-light rounded-lg p-4 mb-4 text-sm text-text-muted border border-surface-lighter">
          <span className="font-medium text-text">Explanation:</span>{" "}
          {question.explanation}
        </div>
      )}

      {/* Action button */}
      {!confirmed ? (
        <button
          onClick={confirm}
          disabled={selectedAnswer === null}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {currentQ < activeQuiz.questions.length - 1
            ? "Next Question"
            : "See Results"}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
