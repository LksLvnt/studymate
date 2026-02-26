from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Document, DocumentChunk, StudyGuide, Flashcard, Quiz
from app.services.ai_service import generate_study_guide, generate_flashcards, generate_quiz

router = APIRouter(prefix="/generate", tags=["generation"])


async def _get_document_chunks(doc_id: str, user_id: str, db: AsyncSession) -> tuple[Document, list[str]]:
    """Fetch a document and its chunks, ensuring ownership."""
    doc = await db.get(Document, doc_id)
    if not doc or doc.user_id != user_id:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status != "ready":
        raise HTTPException(status_code=400, detail="Document is still processing")

    result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == doc_id)
        .order_by(DocumentChunk.chunk_index)
    )
    chunks = [c.content for c in result.scalars().all()]
    if not chunks:
        raise HTTPException(status_code=400, detail="No content found in document")

    return doc, chunks


@router.post("/study-guide/{document_id}")
async def create_study_guide(
    document_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a study guide for a document."""
    doc, chunks = await _get_document_chunks(document_id, user["sub"], db)
    result = await generate_study_guide(chunks, doc.subject)

    guide = StudyGuide(
        document_id=doc.id,
        title=result["title"],
        content_markdown=result["content_markdown"],
    )
    db.add(guide)
    await db.commit()
    await db.refresh(guide)

    return {
        "id": guide.id,
        "title": guide.title,
        "content_markdown": guide.content_markdown,
    }


@router.post("/flashcards/{document_id}")
async def create_flashcards(
    document_id: str,
    count: int = 20,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate flashcards for a document."""
    doc, chunks = await _get_document_chunks(document_id, user["sub"], db)
    cards_data = await generate_flashcards(chunks, count, doc.subject)

    cards = []
    for card in cards_data:
        fc = Flashcard(
            document_id=doc.id,
            user_id=user["sub"],
            front=card["front"],
            back=card["back"],
            topic=card.get("topic"),
        )
        db.add(fc)
        cards.append(fc)

    await db.commit()

    return [
        {
            "id": c.id,
            "front": c.front,
            "back": c.back,
            "topic": c.topic,
            "next_review": c.next_review.isoformat(),
        }
        for c in cards
    ]


@router.post("/quiz/{document_id}")
async def create_quiz(
    document_id: str,
    count: int = 10,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a quiz for a document."""
    doc, chunks = await _get_document_chunks(document_id, user["sub"], db)
    quiz_data = await generate_quiz(chunks, count, doc.subject)

    quiz = Quiz(
        document_id=doc.id,
        user_id=user["sub"],
        title=quiz_data["title"],
        questions=quiz_data["questions"],
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "question_count": len(quiz_data["questions"]),
    }
