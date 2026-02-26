"""
SM-2 Spaced Repetition Algorithm

Quality ratings:
  0 — Complete blackout, no recall
  1 — Incorrect, but upon seeing the answer, remembered
  2 — Incorrect, but the answer seemed easy to recall
  3 — Correct with serious difficulty
  4 — Correct after hesitation
  5 — Perfect response
"""

from datetime import datetime, timedelta, timezone
from dataclasses import dataclass


@dataclass
class SM2Result:
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: datetime


def sm2(
    quality: int,
    repetitions: int,
    ease_factor: float,
    interval_days: int,
) -> SM2Result:
    """
    Apply the SM-2 algorithm and return updated scheduling parameters.
    """
    assert 0 <= quality <= 5, "Quality must be between 0 and 5"

    if quality < 3:
        # Failed — reset
        repetitions = 0
        interval_days = 0
    else:
        # Successful recall
        if repetitions == 0:
            interval_days = 1
        elif repetitions == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * ease_factor)

        repetitions += 1

    # Update ease factor (minimum 1.3)
    ease_factor = max(
        1.3,
        ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    )

    next_review = datetime.now(timezone.utc) + timedelta(days=max(interval_days, 1))

    return SM2Result(
        ease_factor=ease_factor,
        interval_days=interval_days,
        repetitions=repetitions,
        next_review=next_review,
    )
