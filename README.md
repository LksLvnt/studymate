# StudyMate — AI Study Companion for University Exam Prep

Upload your lecture slides and notes → get AI-generated study guides, flashcards, and quizzes → track your weak spots over time.

## Architecture Overview

```
studymate/
├── frontend/          # React + TypeScript + Vite + Tailwind + Recharts
├── backend/           # FastAPI + SQLAlchemy + pgvector
├── docker-compose.yml # PostgreSQL + pgvector dev database
└── README.md
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, React Router |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic (migrations), Python 3.12 |
| Database | PostgreSQL 16 + pgvector extension |
| Auth | Supabase Auth (frontend SDK + JWT verification on backend) |
| AI | Claude API (via Anthropic SDK) with RAG pipeline |
| Vector Store | pgvector (embedded in PostgreSQL) |
| File Processing | PyMuPDF (PDF text extraction), tiktoken (chunking) |

## Prerequisites

- **Node.js** 20+ and **npm** (for frontend)
- **Python** 3.11+ and **pip** (for backend)
- **Docker** and **Docker Compose** (for the database)
- **Supabase** account (free tier is fine) — for auth
- **Anthropic API key** — for Claude AI features

## Quick Start

### 1. Clone and install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the database

```bash
# From project root
docker-compose up -d
```

This gives you PostgreSQL with pgvector on `localhost:5432`.

### 3. Configure environment variables

```bash
# Backend — copy and fill in
cp backend/.env.example backend/.env

# Frontend — copy and fill in
cp frontend/.env.example frontend/.env
```

### 4. Run database migrations

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### 5. Start development servers

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 6. Open the app

Go to `http://localhost:5173` — you're in!

## Key Features (Planned)

- [ ] PDF/notes upload and text extraction
- [ ] AI-generated study guides from uploaded materials
- [ ] Flashcard generation with spaced repetition (SM-2)
- [ ] Practice quiz generation
- [ ] RAG pipeline — AI answers only from YOUR materials
- [ ] Performance analytics dashboard (Recharts)
- [ ] Export flashcards to Anki format
- [ ] Supabase authentication

## IDE Setup

### WebStorm
Built-in TypeScript/React support. Add the Python plugin for backend work.
For both: open the `studymate/` root folder as your project.
