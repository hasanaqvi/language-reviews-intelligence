# Language Reviews Intelligence

A full stack dashboard that scrapes, analyses and visualises App Store reviews
for any mobile app. Built to surface product insights from user feedback at scale.

Currently configured for Babbel — the language learning app.

## What it does

- Scrapes reviews from the Apple App Store across 8 markets
- Classifies reviews into 10 product themes automatically
- Scores sentiment per theme using VADER analysis
- Extracts top keywords per theme
- Displays everything in a live React dashboard

## Theme categories

- Bugs and technical issues
- Lesson structure and repetition
- Languages available
- Paywall and pricing
- UI/UX and engagement
- Difficulty progression
- Onboarding experience
- Navigation
- Progress tracking
- Personalization

## Tech stack

- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL
- Scraping: iTunes RSS API, google-play-scraper
- Analysis: NLTK, TextBlob, VADER sentiment
- ontend: React, Vite, Recharts, Axios
- Infrastructure: Docker (local), Railway (backend), Vercel (frontend)

## Project structure

    language-reviews-intelligence/
    ├── backend/
    │   ├── main.py           # FastAPI entry point
    │   ├── scraper.py        # Pulls reviews from App Store and Google Play
    │   ├── analyser.py       # Theme classification and sentiment scoring
    │   ├── scheduler.py      # Weekly auto-refresh
    │   ├── database.py       # PostgreSQL connection
    │   ├── models.py         # SQLAlchemy table definitions
    │   ├── schemas.py        # Pydantic schemas
    │   └── routers/          # API route handlers
    │       ├── reviews.py
    │       ├── themes.py
    │       └── snapshots.py
    └── frontend/
        └── src/
            ├── pages/
            │   ├── Dashboard.jsx   # Theme clusters and overview stats
            │   └── Reviews.       # Navigation and routing

## Local setup

1. Clone the repository:

    git clone https://github.com/hasanaqvi/language-reviews-intelligence.git
    cd language-reviews-intelligence

2. Start the database:

    docker run --name lri-db \
      -e POSTGRES_USER=lri \
      -e POSTGRES_PASSWORD=lri123 \
      -e POSTGRES_DB=lri \
      -p 5433:5432 \
      -d postgres:15

3. Set up the backend:

    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt

4. Create backend/.env:

    DATABASE_URL=postgresql://lri:lri123@localhost:5433/lri

5. Scrape and analyse reviews:

    cd backend
    python3 scraper.py
    python3 analyser.py

6. Start the backend:

    uvicorn main:app --reload

7. Start the frontend:

    cd frontend
    npm install
    npm run dev

## Switching to a different app

To analyse a different app update the APPS list in backend/scraper.py
with the new Google Play ID and App Store ID, then re-run the scraper
and analyser.

## Secrets

Keep an eye on the bottom of the screen. Something may or may not be chasing something else across it. No spoilers.

## Why I built this

Tools like AppFollow and Sensor Tower charge thousands per month to surface
insights from app store reviews. This project replicates the core functionality
for free using public data — built as a portfolio project demonstrating
full stack development and product thinking.
