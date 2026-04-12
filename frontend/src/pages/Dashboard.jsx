import { useState, useEffect } from "react"
import { getThemeSummary, getStats, getRatingsOverTime, getThemeInsight } from "../api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

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

const SENTIMENT_COLORS = { negative: "#ef4444", neutral: "#f59e0b", positive: "#10b981" }

const card = { background: "#fff", borderRadius: "16px", border: "1px solid #f1f5f9", padding: "24px" }
const label = { fontSize: "13px", color: "#6b7280", marginBottom: "4px" }
const value = { fontSize: "28px", fontWeight: "700", color: "#111827" }

export default function Dashboard({ onThemeClick }) {
  const [themes, setThemes] = useState([])
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [selected, setSelected] = useState(null)
  const [insight, setInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)

  useEffect(() => {
    getThemeSummary().then(r => setThemes(r.data))
    getStats().then(r => setStats(r.data))
    getRatingsOverTime().then(r => setTrend(r.data))
  }, [])

  async function handleThemeClick(theme) {
    setSelected(theme)
    setLoadingInsight(true)
    const res = await getThemeInsight(theme.theme)
    setInsight(res.data)
    setLoadingInsight(false)
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>Babbel Review Intelligence</h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>App Store reviews — analysed and clustered by theme</p>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Total reviews", value: stats.total.toLocaleString() },
            { label: "Average rating", value: stats.avg_rating + " / 5" },
            { label: "Stores", value: stats.by_store.map(s => s.store === "app_store" ? "App Store" : "Google Play").join(", ") },
            { label: "Countries", value: stats.by_country.length + " markets" },
          ].map((s, i) => (
            <div key={i} style={card}>
              <p style={label}>{s.label}</p>
              <p style={value}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>Theme clusters</h2>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>Click a theme to see detailed insights</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {themes.map(t => (
              <div
                key={t.theme}
                onClick={() => handleThemeClick(t)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: selected && selected.theme === t.theme ? "1px solid #4f46e5" : "1px solid #f1f5f9",
                  background: selected && selected.theme === t.theme ? "#eef2ff" : "#fafafa",
                  cursor: "pointer",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                    {THEME_LABELS[t.theme] || t.theme}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>{t.count} reviews · avg {t.avg_rating} stars</p>
                </div>
                <div style={{ width: "120px", height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{
                   height: "100%",
                    width: (t.count / themes[0].count * 100) + "%",
                    background: SENTIMENT_COLORS[t.sentiment_label],
                    borderRadius: "3px",
                  }} />
                </div>
                <span style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: t.sentiment_label === "negative" ? "#fef2f2" : t.sentiment_label === "positive" ? "#f0fdf4" : "#fffbeb",
                  color: SENTIMENT_COLORS[t.sentiment_label],
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}>
                  {t.sentiment_label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {insight && (
            <div style={card}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>
                {THEME_LABELS[insight.theme] || insight.theme}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "Reviews", value: insight.total_reviews },
                  { label: "Avg rating", value: insight.avg_rating },
                  { label: "1-star %", value: insight.one_star_pct + "%" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "11px", color: "#6b7280" }}>{s.label}</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "8px" }}>TOP KEYWORDS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {insight.top_keywords.map(k => (
                    <span key={k.word} style={{ fontSize: "12px", background: "#eef2ff", color: "#4f46e5", padding: "3px 10px", borderRadius: "12px" }}>
                      {k.word} ({k.count})
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "8px" }}>REPRESENTATIVE REVIEWS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {insight.representative_reviews.map((r, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "12px" }}>★</span>
                        ))}
                        <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "4px" }}>{r.store === "app_store" ? "App Store" : "Google Play"}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>{r.text.slice(0, 200)}{r.text.length > 200 ? "..." : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onThemeClick(insight.theme)}
                style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #4f46e5", background: "#eef2ff", color: "#4f46e5", fontSize: "13px", fontWeight: "500", width: "100%" }}
              >
                See all {insight.total_reviews} reviews
              </button>
            </div>
          )}

          {!insight && (
            <div style={{ ...card, dispy: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Click a theme to see insights</p>
            </div>
          )}

          {stats && (
            <div style={card}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>Rating distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.by_rating} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="rating" tick={{ fontSize: 12 }} tickFormatter={v => v + "★"} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => [v, "Reviews"]} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
    </div>

      {trend.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>Average rating over time</h2>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>Monthly average from App Store reviews</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [v, "Avg rating"]} />
              <Line type="monotone" dataKey="avg_rating" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
