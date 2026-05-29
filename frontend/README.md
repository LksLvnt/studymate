# StudyMate - AI Study Companion

Upload your lecture slides and notes → get AI-generated study guides, flashcards, and quizzes → track your weak spots over time with spaced repetition and performance analytics.

**Live:** [studymate.lokoslevente.com](https://studymate.lokoslevente.com)

## Features

- **PDF Upload & Processing** — Upload lecture PDFs, automatically extract text and chunk it for AI processing
- **AI-Generated Study Guides** — Structured markdown study guides generated from your materials using Claude
- **Flashcard Generation** — AI creates flashcards from your documents with spaced repetition (SM-2 algorithm)
- **Practice Quizzes** — Multiple-choice quizzes generated from your materials with explanations
- **Performance Analytics** — Track accuracy over time, topic confidence breakdown, study streaks, and review status
- **Keyboard Shortcuts** — Space to flip cards, arrow keys to navigate, 1-4 for review ratings
- **Google & Email Auth** — Sign in with Google or email/password via Supabase Auth
- **Row Level Security** — Every user can only access their own data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Recharts |
| Backend | FastAPI, SQLAlchemy 2.0 (async), Alembic, SlowAPI |
| Database | PostgreSQL + pgvector (Supabase) |
| Auth | Supabase Auth (Google OAuth + email/password) |
| AI | Claude API (Anthropic) with RAG pipeline |
| Hosting | Cloudflare Pages (frontend), Render (backend) |

## Architecture

```
studymate/
├── frontend/                # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Layout
│   │   ├── context/         # Auth context (Supabase)
│   │   ├── lib/             # API client, Supabase client
│   │   ├── pages/           # Dashboard, Upload, Flashcards, Quiz, Analytics, StudyGuides, Login
│   │   └── types/           # TypeScript interfaces
│   └── public/              # Static assets
├── backend/                 # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── core/            # Config, database, auth
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routers/         # API endpoints
│   │   └── services/        # AI generation, spaced repetition (SM-2)
│   └── alembic/             # Database migrations
└── README.md
```

## How It Works

1. User uploads a PDF → backend extracts text with PyMuPDF → chunks it into ~500 token pieces with tiktoken
2. User clicks "Generate Flashcards/Quiz/Study Guide" → backend sends chunks as context to Claude API
3. Claude returns structured JSON (flashcards, quiz questions) or markdown (study guide)
4. Backend validates and stores the generated content in PostgreSQL
5. User studies flashcards → SM-2 algorithm schedules reviews based on performance
6. Analytics dashboard aggregates quiz scores and flashcard reviews into charts

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.12
- Supabase account (free tier)
- Anthropic API key

### Setup

```bash
# Frontend
cd frontend
npm install
cp .env.example .env   # Fill in Supabase credentials

# Backend
cd ../backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in database URL, Supabase, Anthropic credentials
```

### Environment Variables

**frontend/.env**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

**backend/.env**
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Run

```bash
# Terminal 1 — Backend
cd backend
source venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

## Deployment

- **Frontend** → Cloudflare Pages (root directory: `frontend`, build: `npm run build`, output: `dist`)
- **Backend** → Render Web Service (root directory: `backend`, Python 3.12, start: `PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port $PORT`)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/documents` | List user's documents |
| POST | `/api/documents/upload` | Upload and process a PDF |
| DELETE | `/api/documents/:id` | Delete a document |
| POST | `/api/generate/study-guide/:id` | Generate study guide |
| POST | `/api/generate/flashcards/:id` | Generate flashcards |
| POST | `/api/generate/quiz/:id` | Generate quiz |
| GET | `/api/flashcards` | List user's flashcards |
| POST | `/api/flashcards/:id/review` | Review a flashcard (SM-2) |
| GET | `/api/quizzes` | List user's quizzes |
| POST | `/api/quizzes/:id/attempt` | Submit quiz attempt |
| GET | `/api/study-guides` | List study guides |
| GET | `/api/study-guides/:id` | Get full study guide |
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/quiz-history` | Quiz scores over time |
| GET | `/api/analytics/topic-breakdown` | Flashcard topic confidence |
| GET | `/api/analytics/study-streak` | Study streak data |

## License

MIT

---

Built by [Levente Lokos](https://lokoslevente.com)