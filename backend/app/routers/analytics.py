from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import Document, Flashcard, Quiz, QuizAttempt

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def overview(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    documents = await db.scalar(
        select(func.count()).select_from(Document).where(Document.user_id == user["sub"])
    )
    flashcards = await db.scalar(
        select(func.count()).select_from(Flashcard).where(Flashcard.user_id == user["sub"])
    )
    flashcards_due = await db.scalar(
        select(func.count()).select_from(Flashcard)
        .where(Flashcard.user_id == user["sub"], Flashcard.next_review <= now)
    )
    quizzes_taken = await db.scalar(
        select(func.count()).select_from(QuizAttempt).where(QuizAttempt.user_id == user["sub"])
    )
    avg_accuracy = await db.scalar(
        select(func.avg((QuizAttempt.score / func.nullif(QuizAttempt.total, 0)) * 100))
        .where(QuizAttempt.user_id == user["sub"])
    )

    return {
        "documents": int(documents or 0),
        "flashcards": int(flashcards or 0),
        "flashcards_due": int(flashcards_due or 0),
        "quizzes_taken": int(quizzes_taken or 0),
        "avg_accuracy": round(float(avg_accuracy), 1) if avg_accuracy is not None else None,
    }


@router.get("/quiz-history")
async def quiz_history(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(QuizAttempt, Quiz)
        .join(Quiz)
        .where(QuizAttempt.user_id == user["sub"])
        .order_by(QuizAttempt.created_at.desc())
        .limit(20)
    )

    return [
        {
            "date": attempt.created_at.isoformat(),
            "accuracy": round((attempt.score / attempt.total) * 100, 1) if attempt.total else 0,
            "quiz_title": quiz.title,
            "score": attempt.score,
            "total": attempt.total,
        }
        for attempt, quiz in result.all()
    ]


@router.get("/topic-breakdown")
async def topic_breakdown(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Flashcard.topic, func.count(), func.avg(Flashcard.ease_factor))
        .where(Flashcard.user_id == user["sub"])
        .group_by(Flashcard.topic)
        .order_by(func.count().desc())
    )

    return [
        {
            "topic": topic or "General",
            "card_count": int(count or 0),
            "confidence": round(float(avg_ease or 0) * 20, 1),
        }
        for topic, count, avg_ease in result.all()
    ]


@router.get("/study-streak")
async def study_streak(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(func.date(QuizAttempt.created_at), func.count())
        .where(QuizAttempt.user_id == user["sub"])
        .group_by(func.date(QuizAttempt.created_at))
        .order_by(func.date(QuizAttempt.created_at).desc())
    )

    rows = result.all()
    dates = [row[0] for row in rows if row[0] is not None]
    total_days = len(dates)

    current_streak = 0
    if dates:
        today = datetime.now(timezone.utc).date()
        streak_day = today
        date_set = {d for d in dates}
        while streak_day in date_set:
            current_streak += 1
            streak_day -= timedelta(days=1)

    return {
        "current_streak": current_streak,
        "total_study_days": total_days,
    }
