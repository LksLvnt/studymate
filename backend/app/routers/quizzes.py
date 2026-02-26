from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Quiz, QuizAttempt

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


class AttemptRequest(BaseModel):
    answers: list
    score: int
    total: int


@router.get("")
async def list_quizzes(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all quizzes for the current user."""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.user_id == user["sub"])
        .order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "questions": q.questions,
            "created_at": q.created_at.isoformat(),
        }
        for q in quizzes
    ]


@router.post("/{quiz_id}/attempt")
async def submit_attempt(
    quiz_id: str,
    body: AttemptRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a quiz attempt."""
    quiz = await db.get(Quiz, quiz_id)
    if not quiz or quiz.user_id != user["sub"]:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=user["sub"],
        answers=body.answers,
        score=body.score,
        total=body.total,
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    return {
        "id": attempt.id,
        "score": attempt.score,
        "total": attempt.total,
    }
