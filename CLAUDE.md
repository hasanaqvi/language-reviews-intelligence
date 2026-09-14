# Language Reviews Intelligence — CLAUDE.md

## Project Overview

A full-stack dashboard that scrapes, analyzes, and visualizes app store reviews. Currently configured for **Babbel** (a language learning app), but can be adapted for any mobile app. Replicates premium tools like AppFollow/Sensor Tower for free.

**Live data flow:**
1. `scraper.py` fetches reviews from App Store (8 markets via iTunes RSS) and Google Play
2. `analyser.py` classifies English reviews into 14 product themes + runs VADER sentiment analysis
3. FastAPI serves aggregated stats via REST endpoints
4. React frontend renders an interactive dashboard with charts, filters, and dark mode

---

## Tech Stack

### Backend
- **Python 3** with **FastAPI** (REST API), **Uvicorn** (ASGI server)
- **PostgreSQL** (local via Docker, Railway in prod) with **SQLAlchemy** ORM
- **NLP:** NLTK, VADER sentiment, TextBlob, langdetect
- **Scraping:** iTunes RSS API (App Store), `google-play-scraper` library
- **Task Scheduling:** APScheduler (`scheduler.py` runs the weekly scrape+analyse refresh while the API is up)

### Frontend
- **React 19** with **Vite 8** build tool
- **Recharts** for charts (BarChart, LineChart)
- **Axios** for API calls
- CSS variables for light/dark theming (`data-theme` attribute on `<html>`)

### Deployment
- Backend: **Railway** (`Procfile`: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`)
- Frontend: **Vercel**

---

## Project Structure

```
language-reviews-intelligence/
├── backend/
│   ├── main.py           # FastAPI app, CORS config, router registration
│   ├── database.py       # PostgreSQL connection + SQLAlchemy session
│   ├── models.py         # ORM models: Review, ReviewTheme, WeeklySnapshot
│   ├── schemas.py        # Pydantic schemas (currently empty)
│   ├── scraper.py        # Scraping logic (App Store + Google Play)
│   ├── analyser.py       # Theme classification (keyword-based) + sentiment scoring
│   ├── scheduler.py      # Weekly refresh scheduler (scrape + analyse)
│   ├── requirements.txt
│   ├── .env              # DATABASE_URL (not committed)
│   ├── Procfile          # Railway deployment
│   └── routers/
│       ├── reviews.py    # GET /reviews (stats, recent list)
│       ├── themes.py     # GET /themes (summary, detail, insights)
│       └── snapshots.py  # GET /snapshots (ratings over time)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx         # Layout, page routing, dark mode toggle
│   │   ├── index.css       # CSS variables + light/dark theme definitions
│   │   ├── api.js          # Axios client + all API endpoint functions
│   │   ├── components/
│   │   │   └── EasterEgg.jsx  # Animated Duo Owl chased by Babbel logo
│   │   └── pages/
│   │       ├── Dashboard.jsx  # Theme clusters, stats, sentiment charts
│   │       ├── Reviews.jsx    # Filterable review list by theme
│   │       └── About.jsx      # How it works + limitations
│   ├── public/             # Static assets (images, favicon)
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── easter-egg.html         # Standalone Easter egg demo
└── Procfile                # Root-level Railway config
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `reviews` | Raw reviews: store, app_id, review_id, rating, text, author, language, country, timestamps |
| `review_themes` | Maps review → theme with confidence score |
| `weekly_snapshots` | Aggregated weekly stats for trend charts |

---

## Product Themes (14 categories)

Theme classification is **keyword-based** (not ML). Keywords are defined as dictionaries in `analyser.py`.

1. Bugs and technical issues
2. Lesson structure and repetition
3. Languages available
4. Paywall and pricing
5. UI/UX and engagement
6. Difficulty progression
7. Onboarding experience
8. Navigation
9. Progress tracking
10. Personalization
11. AI features
12. Learning path (SLP)
13. Review and practice (SLP)
14. Speech and pronunciation (SLP)

---

## Key Commands

### Backend
```bash
# Start local PostgreSQL
docker run --name lri-db \
  -e POSTGRES_USER=lri -e POSTGRES_PASSWORD=lri123 -e POSTGRES_DB=lri \
  -p 5433:5432 -d postgres:15

# Setup Python env
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

# Run pipeline
cd backend
python3 scraper.py    # Fetch reviews → PostgreSQL
python3 analyser.py   # Classify + sentiment score reviews

# Start API
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Dev server (reads VITE_API_URL env var)
npm run build     # Production build
npm run lint      # ESLint
```

---

## Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql://lri:lri123@localhost:5433/lri
```

**Frontend** (Vite env):
```
VITE_API_URL=http://127.0.0.1:8000   # defaults to this in dev
```

---

## Scraper Configuration (`backend/scraper.py`)

- `APPS`: list of app configs (`name`, `google_play_id`, `app_store_id`) — currently Babbel
- `COUNTRIES`: App Store markets — `['us', 'gb', 'de', 'fr', 'es', 'it', 'au', 'ca']`
- To use with a different app: update `APPS` and re-run the scraper

---

## Notable Design Decisions

- **No tests** — no test suite exists; manual testing via API client (Postman/browser) and UI
- **Keyword classification, not ML** — simple and fast, but requires manual keyword curation per theme
- **English-only analysis** — `langdetect` filters to English reviews before sentiment scoring
- **Weekly snapshots** — `weekly_snapshots` table stores pre-aggregated trend data to avoid slow aggregate queries at runtime
- **Modular FastAPI routers** — `reviews.py`, `themes.py`, `snapshots.py` each own their domain
- **CSS variables for theming** — `data-theme="dark"` on `<html>` flips all colors via custom properties; preference stored in `localStorage`

---

## Easter Egg

Hidden animation: the Duolingo owl (Duo) is chased across the screen by the Babbel logo. Implemented in `frontend/src/components/EasterEgg.jsx` with CSS keyframe animations. Standalone demo at `easter-egg.html`. README hints: *"Keep an eye on the bottom of the screen."*
