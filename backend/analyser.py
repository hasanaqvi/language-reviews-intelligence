from database import SessionLocal, engine, Base
from models import Review, ReviewTheme
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import re
from collections import Counter

AI_PATTERN = re.compile(r'\bai\b', re.IGNORECASE)

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)
nltk.download("vader_lexicon", quiet=True)

Base.metadata.create_all(bind=engine)

THEMES = {
    "onboarding": [
        "onboarding", "sign up", "first time", "getting started", "setup",
        "registration", "account", "welcome", "new user", "tutorial",
        "introduction", "start", "begin", "initial", "first lesson",
    ],
    "lesson_structure": [
        "lesson", "exercise", "repetitive", "boring", "same", "repeat",
        "structure", "format", "content", "activity", "module", "unit",
        "course", "curriculum", "material", "class", "session",
    ],
    "difficulty": [
        "too hard", "too easy", "difficult", "easy", "challenge", "level",
        "advanced", "beginner", "intermediate", "progress", "skill",
        "complexity", "simple", "tough", "struggle", "overwhelming",
    ],
    "paywall_pricing": [
        "price", "expensive", "cheap", "cost", "subscription", "pay",
        "free", "premium", "trial", "money", "refund", "cancel", "billing",
        "charge", "payment", "worth", "value", "afford", "discount",
    ],
    "ui_ux_engagement": [
        "design", "interface", "ui", "boring", "fun", "enjoyable", "ugly",
        "beautiful", "clean", "modern", "outdated", "look", "feel",
        "visual", "aesthetic", "layout", "color", "font", "button",
    ],
    "personalization": [
        "personalize", "customize", "personal", "adapt", "tailor",
        "recommendation", "suggest", "preference", "goal", "target",
        "individual", "specific", "custom", "flexible", "adjust",
    ],
    "navigation": [
        "navigate", "navigation", "menu", "find", "confusing", "lost",
        "complicated", "simple", "easy to use", "hard to find", "button",
        "screen", "flow", "ux", "experience", "intuitive", "interface",
    ],
    "languages_available": [
        "language", "spanish", "french", "german", "italian", "portuguese",
        "japanese", "chinese", "korean", "arabic", "russian", "dutch",
        "more languages", "add language", "missing language", "dialect",
    ],
    "bugs_technical": [
        "bug", "crash", "error", "glitch", "freeze", "slow", "broken",
        "fix", "issue", "problem", "not working", "fail", "loading",
        "connection", "sync", "update", "version", "technical", "app",
    ],
    "progress_tracking": [
        "progress", "streak", "track", "achievement", "badge", "score",
        "statistics", "history", "record", "milestone", "goal", "reward",
        "points", "level up", "improvement", "feedback",
    ],
    "ai_features": [
        "artificial intelligence", "ai-powered", "ai powered", "ai tutor",
        "ai coach", "ai feature", "ai assistant", "ai chat",
        "generative ai", "genai", "llm", "large language model",
        "machine learning", "neural network", "deep learning",
        "chatgpt", "gpt-4", "gpt4", "gpt-3", "gpt3", "openai",
        "claude", "gemini", "copilot", "bard",
        "chatbot", "conversational ai", "virtual assistant",
        "voice recognition", "speech recognition",
        "natural language processing", "nlp",
    ],
}

sia = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words("english"))


def get_sentiment(text):
    scores = sia.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        return "positive", compound
    elif compound <= -0.05:
        return "negative", compound
    return "neutral", compound


def classify_themes(text):
    text_lower = text.lower()
    matched = []
    for theme, keywords in THEMES.items():
        for keyword in keywords:
            if keyword in text_lower:
                matched.append(theme)
                break
        # ai_features also matches standalone "ai" via word-boundary regex
        if theme == "ai_features" and theme not in matched:
            if AI_PATTERN.search(text):
                matched.append(theme)
    return matched if matched else ["other"]


def extract_keywords(texts, top_n=20):
    all_words = []
    for text in texts:
        text = re.sub(r"[^a-zA-Z\s]", "", text.lower())
        tokens = word_tokenize(text)
        filtered = [w for w in tokens if w not in stop_words and len(w) > 3]
        all_words.extend(filtered)
    return Counter(all_words).most_common(top_n)


def analyse_reviews():
    db = SessionLocal()
    print("Starting analysis...")

    reviews = db.query(Review).filter(Review.language == "en").all()
    print(f"Analysing {len(reviews)} English reviews...")

    for i, review in enumerate(reviews):
        if i % 100 == 0:
            print(f"Processing review {i}/{len(reviews)}...")

        db.query(ReviewTheme).filter(
            ReviewTheme.review_id == review.id
        ).delete()

        sentiment, score = get_sentiment(review.text)
        review.language = f"en_{sentiment}"

        themes = classify_themes(review.text)
        for theme in themes:
            rt = ReviewTheme(
                review_id=review.id,
                theme=theme,
                confidence=1.0,
            )
            db.add(rt)

    db.commit()
    print("Analysis complete.")

    theme_counts = {}
    for theme in list(THEMES.keys()) + ["other"]:
        count = db.query(ReviewTheme).filter(
            ReviewTheme.theme == theme
        ).count()
        theme_counts[theme] = count

    print("\nTheme breakdown:")
    for theme, count in sorted(theme_counts.items(), key=lambda x: -x[1]):
        print(f"  {theme}: {count} reviews")

    db.close()


if __name__ == "__main__":
    analyse_reviews()
