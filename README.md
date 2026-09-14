# Language Reviews Intelligence

A full stack dashboard that scrapes, analyses and visualises App Store reviews
for any mobile app. Built to surface product insights from user feedback at scale.

Currently configured for Babbel — the language learning app.

**Live at [language-reviews-intelligence.vercel.app](https://language-reviews-intelligence.vercel.app/)**
— data refreshes automatically every Monday.

## What it does

- Scrapes reviews from the Apple App Store across 8 markets, with review dates
- Classifies reviews into 14 product themes automatically
- Scores sentiment per theme using VADER analysis
- Extracts top keywords per theme
- Displays everything in a live React dashboard
- Browse all reviews or filter by theme, sort newest/oldest, and narrow to a custom date range

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
- AI features
- Learning path
- Review and practice
- Speech and pronunciation

## Tech stack

- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL
- Scraping: iTunes RSS API, google-play-scraper
- Analysis: NLTK, TextBlob, VADER sentiment
- Frontend: React, Vite, Recharts, Axios
- Infrastructure: Docker (local), Neon (database), Render (backend), Vercel (frontend), GitHub Actions (weekly data refresh)

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
            ├── App.jsx             # Navigation and page routing
            └── pages/
                ├── Dashboard.jsx   # Theme clusters and overview stats
                ├── Reviews.jsx     # Browse, sort and date-filter reviews
                └── About.jsx       # How it works and limitations

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

## Deployment

Runs entirely on free tiers:

- **Neon** hosts the PostgreSQL database.
- **Render** runs the FastAPI backend (root directory `backend`, start command
  `uvicorn main:app --host 0.0.0.0 --port $PORT`, env var `DATABASE_URL`).
  The free instance spins down when idle, so the first request after a quiet
  period takes up to a minute.
- **Vercel** serves the frontend. `VITE_API_URL` points at the Render URL and
  is baked in at build time — changing it requires a redeploy.
- **GitHub Actions** runs the weekly scrape + analysis every Monday
  (`.github/workflows/weekly-refresh.yml`, using a `DATABASE_URL` repo secret).
  It can also be triggered manually from the Actions tab.

Both Render and Vercel auto-deploy on every push to `main`.

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
