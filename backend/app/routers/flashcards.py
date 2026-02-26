from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Flashcard
from app.services.spaced_repetition import sm2

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


class ReviewRequest(BaseModel):
    quality: int  # 0-5


@router.get("")
async def list_flashcards(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all flashcards for the current user."""
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.user_id == user["sub"])
        .order_by(Flashcard.next_review.asc())
    )
    cards = result.scalars().all()
    return [
        {
            "id": c.id,
            "front": c.front,
            "back": c.back,
            "topic": c.topic,
            "ease_factor": c.ease_factor,
            "interval_days": c.interval_days,
            "next_review": c.next_review.isoformat(),
        }
        for c in cards
    ]


@router.post("/{flashcard_id}/review")
async def review_flashcard(
    flashcard_id: str,
    body: ReviewRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Review a flashcard and update SM-2 scheduling."""
    card = await db.get(Flashcard, flashcard_id)
    if not card or card.user_id != user["sub"]:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    if not 0 <= body.quality <= 5:
        raise HTTPException(status_code=400, detail="Quality must be 0-5")

    result = sm2(
        quality=body.quality,
        repetitions=card.repetitions,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
    )

    card.ease_factor = result.ease_factor
    card.interval_days = result.interval_days
    card.repetitions = result.repetitions
    card.next_review = result.next_review

    await db.commit()

    return {
        "id": card.id,
        "ease_factor": card.ease_factor,
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "next_review": card.next_review.isoformat(),
    }
