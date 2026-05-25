from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Document, StudyGuide

router = APIRouter(prefix="/study-guides", tags=["study-guides"])


@router.get("")
async def list_study_guides(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all study guides for the current user."""
    result = await db.execute(
        select(StudyGuide, Document)
        .join(Document)
        .where(Document.user_id == user["sub"])
        .order_by(StudyGuide.created_at.desc())
    )
    guides = result.all()
    return [
        {
            "id": guide.id,
            "title": guide.title,
            "document_id": guide.document_id,
            "document_filename": document.filename,
            "subject": document.subject,
            "created_at": guide.created_at.isoformat(),
        }
        for guide, document in guides
    ]


@router.get("/{guide_id}")
async def get_study_guide(
    guide_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Load the study guide content for a specific guide."""
    result = await db.execute(
        select(StudyGuide, Document)
        .join(Document)
        .where(StudyGuide.id == guide_id)
        .where(Document.user_id == user["sub"])
        .limit(1)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Study guide not found")

    guide, document = row
    return {
        "id": guide.id,
        "title": guide.title,
        "content_markdown": guide.content_markdown,
        "document_id": guide.document_id,
        "document_filename": document.filename,
        "subject": document.subject,
        "created_at": guide.created_at.isoformat(),
    }
