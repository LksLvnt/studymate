"""
AI service — uses Claude to generate study materials from document chunks.

This is the core of the RAG pipeline:
1. Retrieve relevant chunks for a document
2. Send them as context to Claude
3. Parse the structured output into flashcards / quiz / study guide
"""

import json
from anthropic import AsyncAnthropic
from app.core.config import get_settings


def get_client() -> AsyncAnthropic:
    return AsyncAnthropic(api_key=get_settings().anthropic_api_key)


async def generate_study_guide(chunks: list[str], subject: str | None = None) -> dict:
    """Generate a structured study guide from document chunks."""
    context = "\n---\n".join(chunks)
    subject_hint = f" on the subject of {subject}" if subject else ""

    client = get_client()
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""Based ONLY on the following lecture material{subject_hint}, create a comprehensive study guide.

Structure it with:
- A clear title
- Key concepts and definitions
- Important relationships between topics
- Summary of main points

Format the output as markdown.

--- LECTURE MATERIAL ---
{context}
--- END MATERIAL ---

Respond with ONLY the study guide in markdown format. Do not add information beyond what's in the material.""",
            }
        ],
    )

    return {
        "title": f"Study Guide{f': {subject}' if subject else ''}",
        "content_markdown": response.content[0].text,
    }


async def generate_flashcards(chunks: list[str], count: int = 20, subject: str | None = None) -> list[dict]:
    """Generate flashcards from document chunks."""
    context = "\n---\n".join(chunks)
    subject_hint = f" on the subject of {subject}" if subject else ""

    client = get_client()
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""Based ONLY on the following lecture material{subject_hint}, generate exactly {count} flashcards for exam preparation.

Each flashcard should test a specific concept, definition, or relationship from the material.

Respond with ONLY a JSON array of objects, each with:
- "front": the question or prompt
- "back": the answer
- "topic": a short topic label (2-4 words)

Example format:
[
  {{"front": "What is X?", "back": "X is ...", "topic": "Core Concepts"}},
  ...
]

--- LECTURE MATERIAL ---
{context}
--- END MATERIAL ---

Respond with ONLY valid JSON. No markdown fences, no explanation.""",
            }
        ],
    )

    text = response.content[0].text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    return json.loads(text.strip())


async def generate_quiz(chunks: list[str], count: int = 10, subject: str | None = None) -> dict:
    """Generate a multiple-choice quiz from document chunks."""
    context = "\n---\n".join(chunks)
    subject_hint = f" on the subject of {subject}" if subject else ""

    client = get_client()
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""Based ONLY on the following lecture material{subject_hint}, generate a multiple-choice quiz with {count} questions.

Each question should have 4 options with exactly one correct answer.

Respond with ONLY a JSON object:
{{
  "title": "Quiz: <topic>",
  "questions": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "Brief explanation of why this is correct",
      "topic": "Short topic label"
    }}
  ]
}}

--- LECTURE MATERIAL ---
{context}
--- END MATERIAL ---

Respond with ONLY valid JSON. No markdown fences, no explanation.""",
            }
        ],
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    return json.loads(text.strip())
