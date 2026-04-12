from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    store = Column(String, nullable=False)
    app_id = Column(String, nullable=False)
    app_name = Column(String, nullable=False)
    review_id = Column(String, unique=True, nullable=False)
    rating = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    language = Column(String, default="unknown")
    author = Column(String, default="")
    review_date = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, server_default=func.now())
    country = Column(String, default="")

    themes = relationship("ReviewTheme", back_populates="review")


class ReviewTheme(Base):
    __tablename__ = "review_themes"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    theme = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)

    review = relationship("Review", back_populates="themes")


class WeeklySnapshot(Base):
    __tablename__ = "weekly_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    week_starting = Column(String, nullable=False)
    store = Column(String, nullable=False)
    app_id = Column(String, nullable=False)
    total_reviews = Column(Integer, default=0)
    avg_rating = Column(Float, default=0.0)
    positive_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)