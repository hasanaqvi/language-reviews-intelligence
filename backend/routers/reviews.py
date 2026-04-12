from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Review

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Review).count()
    avg_rating = db.query(func.avg(Review.rating)).scalar()
    by_store = db.query(Review.store, func.count(Review.id)).group_by(Review.store).all()
    by_rating = db.query(Review.rating, func.count(Review.id)).group_by(Review.rating).order_by(Review.rating).all()
    by_country = db.query(Review.country, func.count(Review.id)).group_by(Review.country).order_by(func.count(Review.id).desc()).limit(10).all()

    return {
        "total": total,
        "avg_rating": round(float(avg_rating or 0), 2),
        "by_store": [{"store": s, "count": c} for s, c in by_store],
        "by_rating": [{"rating": r, "count": c} for r, c in by_rating],
        "by_country": [{"country": c, "count": n} for c, n in by_country],
    }

@router.get("/recent")
def get_recent(limit: int = 20, db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.scraped_at.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "text": r.text,
            "rating": r.rating,
            "store": r.store,
            "country": r.country,
            "author": r.author,
        }
        for r in reviews
    ]
