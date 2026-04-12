from google_play_scraper import reviews as gplay_reviews, Sort
from database import SessionLocal, engine, Base
from models import Review
from datetime import datetime
import requests
import time

Base.metadata.create_all(bind=engine)

APPS = [
    {
        "name": "Babbel",
        "google_play_id": "com.babbel.mobile.android.languages",
        "app_store_id": "829587759",
    }
]

COUNTRIES = ["us", "gb", "de", "fr", "es", "it", "au", "ca"]


def detect_language(text):
    try:
        from langdetect import detect
        return detect(text)
    except:
        return "unknown"


def scrape_google_play(app):
    print(f"Scraping Google Play for {app['name']}...")
    db = SessionLocal()
    saved = 0

    try:
        result, _ = gplay_reviews(
            app["google_play_id"],
            lang="en",
            country="us",
            sort=Sort.NEWEST,
            count=200,
        )

        for r in result:
            if not r.get("content"):
                continue

            existing = db.query(Review).filter(
                Review.review_id == str(r["reviewId"])
            ).first()
            if existing:
                continue

            review = Review(
                store="google_play",
                app_id=app["google_play_id"],
                app_name=app["name"],
                review_id=str(r["reviewId"]),
                rating=r["score"],
                text=r["content"],
                author=r.get("userName", ""),
                review_date=r.get("at"),
                language=detect_language(r["content"]),
                country="us",
            )
            db.add(review)
            saved += 1

        db.commit()
        print(f"Google Play: saved {saved} new reviews")

    except Exception as e:
        print(f"Google Play error: {e}")
        db.rollback()
    finally:
        db.close()

    return saved


def scrape_app_store_rss(app):
    print(f"Scraping App Store RSS for {app['name']}...")
    db = SessionLocal()
    saved = 0

    for country in COUNTRIES:
        for page in range(1, 6):
            try:
                url = f"https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app['app_store_id']}/sortby=mostrecent/json"
                headers = {"User-Agent": "Mozilla/5.0"}
                res = requests.get(url, headers=headers, timeout=10)

                if res.status_code != 200:
                    break

                data = res.json()
                entries = data.get("feed", {}).get("entry", [])

                if not entries:
                    break

                for entry in entries:
                    if isinstance(entry, dict) and "author" in entry:
                        review_id = f"appstore_{country}_{entry.get('id', {}).get('label', '')}"
                        text = entry.get("content", {}).get("label", "")
                        rating_str = entry.get("im:rating", {}).get("label", "0")

                        if not text:
                            continue

                        existing = db.query(Review).filter(
                            Review.review_id == review_id
                        ).first()
                        if existing:
                            continue

                        review = Review(
                            store="app_store",
                            app_id=app["app_store_id"],
                            app_name=app["name"],
                            review_id=review_id,
                            rating=int(rating_str),
                            text=text,
                            author=entry.get("author", {}).get("name", {}).get("label", ""),
                            review_date=None,
                            language=detect_language(text),
                            country=country,
                        )
                        db.add(review)
                        saved += 1

                db.commit()
                time.sleep(0.5)

            except Exception as e:
                print(f"App Store RSS error ({country} page {page}): {e}")
                db.rollback()
                break

    print(f"App Store: saved {saved} new reviews")
    db.close()
    return saved


def run_scraper():
    print(f"Starting scrape at {datetime.now()}")
    for app in APPS:
        scrape_google_play(app)
        scrape_app_store_rss(app)
    print(f"Scrape complete at {datetime.now()}")


if __name__ == "__main__":
    run_scraper()
