from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routers import analytics, documents, generation, flashcards, quizzes, study_guides

app = FastAPI(
    title="StudyMate API",
    description="AI Study Companion — backend API",
    version="0.1.0",
)

origins = ["https://studymate.lokoslevente.com"]
if os.getenv("ENV") != "production":
    origins.append("http://localhost:5173")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(documents.router, prefix="/api")
app.include_router(generation.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(study_guides.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "studymate"}
