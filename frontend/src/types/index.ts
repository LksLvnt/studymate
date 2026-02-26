// ============================================================
// Domain types — mirrors the backend models
// ============================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
}

// --- Documents ---

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  subject: string | null;
  page_count: number | null;
  chunk_count: number;
  status: "processing" | "ready" | "error";
  created_at: string;
}

// --- Study Guides ---

export interface StudyGuide {
  id: string;
  document_id: string;
  title: string;
  content_markdown: string;
  created_at: string;
}

// --- Flashcards ---

export interface Flashcard {
  id: string;
  document_id: string;
  front: string;
  back: string;
  topic: string | null;
  // SM-2 spaced repetition fields
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  created_at: string;
}

export interface FlashcardReview {
  flashcard_id: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM-2 quality rating
}

// --- Quizzes ---

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string | null;
}

export interface Quiz {
  id: string;
  document_id: string;
  title: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  answers: number[];
  score: number;
  total: number;
  created_at: string;
}

// --- Analytics ---

export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface PerformanceOverTime {
  date: string;
  accuracy: number;
  reviews: number;
}
