from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import documents, generation, flashcards, quizzes

app = FastAPI(
    title="StudyMate API",
    description="AI Study Companion — backend API",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(documents.router, prefix="/api")
app.include_router(generation.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "studymate"}
