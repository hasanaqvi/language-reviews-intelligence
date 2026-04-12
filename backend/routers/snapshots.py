from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Review

router = APIRouter(prefix="/snapshots", tags=["snapshots"])

@router.get("/ratings-over-time")
def get_ratings_over_time(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()
    by_month = {}
    for r in reviews:
        if r.review_date:
            key = r.review_date.strftime("%Y-%m")
            if key not in by_month:
                by_month[key] = {"ratings": [], "count": 0}
            by_month[key]["ratings"].append(r.rating)
            by_month[key]["count"] += 1

    result = []
    for month in sorted(by_month.keys()):
        ratings = by_month[month]["ratings"]
        result.append({
            "month": month,
            "avg_rating": round(sum(ratings) / len(ratings), 2),
            "count": len(ratings),
        })

    return result
