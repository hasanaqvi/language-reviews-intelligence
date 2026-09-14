from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from database import get_db
from models import Review, ReviewTheme
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

nltk.download("vader_lexicon", quiet=True)
sia = SentimentIntensityAnalyzer()

router = APIRouter(prefix="/themes", tags=["themes"])

@router.get("/summary")
def get_theme_summary(db: Session = Depends(get_db)):
    # Single aggregate query. Sentiment comes from the label the analyser
    # already stored on Review.language (en_positive / en_negative / en_neutral),
    # averaged as +1 / -1 / 0 — no per-request VADER over all texts.
    sentiment_value = case(
        (Review.language == "en_positive", 1.0),
        (Review.language == "en_negative", -1.0),
        else_=0.0,
    )
    rows = db.query(
        ReviewTheme.theme,
        func.count(ReviewTheme.id).label("count"),
        func.avg(Review.rating).label("avg_rating"),
        func.avg(sentiment_value).label("avg_sentiment"),
    ).join(Review, Review.id == ReviewTheme.review_id).group_by(
        ReviewTheme.theme
    ).order_by(func.count(ReviewTheme.id).desc()).all()

    return [
        {
            "theme": theme,
            "count": count,
            "avg_rating": round(float(avg_rating or 0), 2),
            "avg_sentiment": round(float(avg_sentiment or 0), 3),
            "sentiment_label": "positive" if (avg_sentiment or 0) > 0.05 else "negative" if (avg_sentiment or 0) < -0.05 else "neutral",
        }
        for theme, count, avg_rating, avg_sentiment in rows
    ]


def parse_iso_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


@router.get("/{theme}/reviews")
def get_theme_reviews(
    theme: str,
    limit: int = 20,
    offset: int = 0,
    sort: str = "newest",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # theme "all" browses every review, no theme join.
    query = db.query(Review)
    if theme != "all":
        query = query.join(ReviewTheme).filter(ReviewTheme.theme == theme)

    # Date range filters drop rows without a review_date (NULL never matches).
    parsed_from = parse_iso_date(date_from)
    parsed_to = parse_iso_date(date_to)
    if parsed_from:
        query = query.filter(Review.review_date >= parsed_from)
    if parsed_to:
        query = query.filter(Review.review_date < parsed_to + timedelta(days=1))

    total = query.count()

    if sort == "oldest":
        order = Review.review_date.asc().nullslast()
    else:
        order = Review.review_date.desc().nullslast()

    reviews = query.order_by(order, Review.id.desc()).offset(offset).limit(limit).all()

    return {
        "theme": theme,
        "total": total,
        "reviews": [
            {
                "id": r.id,
                "text": r.text,
                "rating": r.rating,
                "store": r.store,
                "country": r.country,
                "author": r.author,
                "date": str(r.review_date) if r.review_date else None,
            }
            for r in reviews
        ]
    }


@router.get("/{theme}/summary")
def get_theme_insight(theme: str, db: Session = Depends(get_db)):
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from collections import Counter
    import re
    nltk.download("stopwords", quiet=True)
    nltk.download("punkt", quiet=True)
    nltk.download("punkt_tab", quiet=True)

    reviews = db.query(Review).join(ReviewTheme).filter(
        ReviewTheme.theme == theme
    ).all()

    if not reviews:
        return {"summary": "No reviews found for this theme.", "keywords": []}

    stop_words = set(stopwords.words("english"))
    all_words = []
    for r in reviews:
        text = re.sub(r"[^a-zA-Z\s]", "", r.text.lower())
        tokens = word_tokenize(text)
        filtered = [w for w in tokens if w not in stop_words and len(w) > 3]
        all_words.extend(filtered)

    top_keywords = Counter(all_words).most_common(10)

    ratings = [r.rating for r in reviews]
    avg_rating = sum(ratings) / len(ratings)
    one_star = sum(1 for r in ratings if r == 1)
    five_star = sum(1 for r in ratings if r == 5)

    representative = sorted(reviews, key=lambda r: abs(sia.polarity_scores(r.text)["compound"]), reverse=True)[:3]

    return {
        "theme": theme,
        "total_reviews": len(reviews),
        "avg_rating": round(avg_rating, 2),
        "one_star_pct": round(one_star / len(reviews) * 100),
        "five_star_pct": round(five_star / len(reviews) * 100),
        "top_keywords": [{"word": w, "count": c} for w, c in top_keywords],
        "representative_reviews": [
            {"text": r.text, "rating": r.rating, "store": r.store}
            for r in representative
        ],
    }
