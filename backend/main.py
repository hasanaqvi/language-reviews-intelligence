from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import reviews, themes, snapshots

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Language Reviews Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reviews.router)
app.include_router(themes.router)
app.include_router(snapshots.router)

@app.get("/")
def root():
    return {"message": "Language Reviews Intelligence API is running"}
