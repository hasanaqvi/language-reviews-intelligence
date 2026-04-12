import { useState, useEffect } from "react"
import { getThemeReviews } from "../api"

const THEME_LABELS = {
  bugs_technical: "Bugs & Technical Issues",
  lesson_structure: "Lesson Structure",
  languages_available: "Languages Available",
  paywall_pricing: "Paywall & Pricing",
  ui_ux_engagement: "UI/UX & Engagement",
  difficulty: "Difficulty Progression",
  onboarding: "Onboarding Experience",
  navigation: "Navigation",
  progress_tracking: "Progress Tracking",
  personalization: "Personalization",
  other: "Other",
}

const THEMES = Object.keys(THEME_LABELS)

export default function Reviews({ initialTheme }) {
  const [theme, setTheme] = useState(initialTheme || "bugs_technical")
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    if (initialTheme) setTheme(initialTheme)
  }, [initialTheme])

  useEffect(() => {
    setLoading(true)
    setOffset(0)
    getThemeReviews(theme, limit, 0).then(r => {
      setReviews(r.data.reviews)
      setTotal(r.data.total)
      setLoading(false)
    })
  }, [theme])

  function loadMore() {
    const newOffset = offset + limit
    getThemeReviews(theme, limit, newOffset).then(r => {
      setReviews(prev => [...prev, ...r.data.reviews])
      setOffset(newOffset)
    })
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>Browse Reviews</h1>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: theme === t ? "1px solid var(--accent)" : "1px solid var(--border-input)",
              background: theme === t ? "var(--accent-bg)" : "var(--bg-card)",
              color: theme === t ? "var(--accent-text)" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: theme === t ? "600" : "400",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
          >
            {THEME_LABELS[t]}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
        {total.toLocaleString()} reviews in <strong style={{ color: "var(--text-primary)" }}>{THEME_LABELS[theme] || theme}</strong>
      </p>

      {loading && <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading reviews…</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reviews.map(r => (
          <div key={r.id} style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            padding: "16px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "3px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "var(--star-empty)", fontSize: "14px" }}>★</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>{r.store === "app_store" ? "App Store" : "Google Play"}</span>
                <span>{r.country.toUpperCase()}</span>
                {r.author && <span>{r.author}</span>}
                {r.date && <span>{new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: "1.6" }}>{r.text}</p>
          </div>
        ))}
      </div>

      {reviews.length < total && (
        <button
          onClick={loadMore}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid var(--border-input)",
            background: "var(--bg-card)",
            color: "var(--accent-text)",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Load more ({(total - reviews.length).toLocaleString()} remaining)
        </button>
      )}
    </div>
  )
}
