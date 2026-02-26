from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import fitz  # PyMuPDF
import tiktoken

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Document, DocumentChunk

router = APIRouter(prefix="/documents", tags=["documents"])

# Chunking config
CHUNK_SIZE = 500  # tokens
CHUNK_OVERLAP = 50  # tokens


def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """Extract text from PDF bytes. Returns (text, page_count)."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    page_count = len(doc)
    doc.close()
    return text, page_count


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks by token count."""
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        start += chunk_size - overlap
    return chunks


@router.get("")
async def list_documents(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all documents for the current user."""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user["sub"])
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "subject": d.subject,
            "page_count": d.page_count,
            "chunk_count": d.chunk_count,
            "status": d.status,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF, extract text, chunk it, and store."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > 50 * 1024 * 1024:  # 50 MB limit
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    # Extract text
    try:
        text, page_count = extract_text_from_pdf(pdf_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read PDF")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF contains no extractable text")

    # Create document record
    doc = Document(
        user_id=user["sub"],
        filename=file.filename,
        subject=subject,
        page_count=page_count,
        status="processing",
    )
    db.add(doc)
    await db.flush()

    # Chunk and store
    chunks = chunk_text(text)
    for i, chunk_text_content in enumerate(chunks):
        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=i,
            content=chunk_text_content,
        )
        db.add(chunk)

    doc.chunk_count = len(chunks)
    doc.status = "ready"

    await db.commit()
    await db.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "page_count": page_count,
        "chunk_count": len(chunks),
        "status": doc.status,
    }
