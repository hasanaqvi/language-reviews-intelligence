from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)


def run_pipeline():
    logger.info("Weekly pipeline starting...")
    try:
        from scraper import run_scraper
        run_scraper()
        logger.info("Scrape complete. Starting analysis...")
        from analyser import analyse_reviews
        analyse_reviews()
        logger.info("Weekly pipeline complete.")
    except Exception as e:
        logger.error(f"Weekly pipeline failed: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_pipeline,
        CronTrigger(day_of_week="sun", hour=0, minute=0, timezone="UTC"),
        id="weekly_pipeline",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — weekly pipeline runs every Sunday at 00:00 UTC.")
    return scheduler
