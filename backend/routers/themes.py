from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Review, ReviewTheme
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

nltk.download("vader_lexicon", quiet=True)
sia = SentimentIntensityAnalyzer()

router = APIRouter(prefix="/themes", tags=["themes"])

@router.get("/summary")
def get_theme_summary(db: Session = Depends(get_db)):
    themes = db.query(
        ReviewTheme.theme,
        func.count(ReviewTheme.id).label("count")
    ).group_by(ReviewTheme.theme).order_by(func.count(ReviewTheme.id).desc()).all()

    result = []
    for theme, count in themes:
        theme_reviews = db.query(Review).join(ReviewTheme).filter(
            ReviewTheme.theme == theme
        ).all()

        ratings = [r.rating for r in theme_reviews]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0

        sentiments = []
        for r in theme_reviews:
            score = sia.polarity_scores(r.text)["compound"]
            sentiments.append(score)
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

        result.append({
            "theme": theme,
            "count": count,
            "avg_rating": round(avg_rating, 2),
            "avg_sentiment": round(avg_sentiment, 3),
            "sentiment_label": "positive" if avg_sentiment > 0.05 else "negative" if avg_sentiment < -0.05 else "neutral",
        })

    return result


@router.get("/{theme}/reviews")
def get_theme_reviews(theme: str, limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    reviews = db.query(Review).join(ReviewTheme).filter(
        ReviewTheme.theme == theme
    ).offset(offset).limit(limit).all()

    total = db.query(Review).join(ReviewTheme).filter(
        ReviewTheme.theme == theme
    ).count()

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
