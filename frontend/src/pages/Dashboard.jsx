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

const card = {
  background: "var(--bg-card)",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  padding: "24px",
}

const statLabel = { fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }
const statValue = { fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }

function ChartTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--chart-tooltip-bg)",
      border: "1px solid var(--chart-tooltip-border)",
      borderRadius: "8px",
      padding: "8px 12px",
      fontSize: "13px",
      color: "var(--text-primary)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontWeight: "600" }}>{payload[0].value} {payload[0].name}</p>
    </div>
  )
}

export default function Dashboard({ onThemeClick, darkMode }) {
  const [themes, setThemes] = useState([])
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [selected, setSelected] = useState(null)
  const [insight, setInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)

  const chartGrid = darkMode ? "#334155" : "#f1f5f9"
  const chartTick = darkMode ? "#94a3b8" : "#6b7280"
  const accentColor = darkMode ? "#818cf8" : "#4f46e5"

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
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>Babbel Review Intelligence</h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>App Store reviews — analysed and clustered by theme</p>
        <p style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "8px",
          padding: "6px 12px",
          background: "var(--bg-muted)",
          borderRadius: "8px",
          display: "inline-block",
          border: "1px solid var(--border)",
        }}>
          This dashboard is a personal project built for learning purposes only and is not intended for commercial use.
        </p>
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
              <p style={statLabel}>{s.label}</p>
              <p style={statValue}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>Theme clusters</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Click a theme to see detailed insights</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {themes.map(t => {
              const isSelected = selected && selected.theme === t.theme
              return (
                <div
                  key={t.theme}
                  onClick={() => handleThemeClick(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: isSelected ? "var(--bg-selected)" : "var(--bg-row)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>
                      {THEME_LABELS[t.theme] || t.theme}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.count} reviews · avg {t.avg_rating} stars</p>
                  </div>
                  <div style={{ width: "120px", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
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
                    background: t.sentiment_label === "negative" ? "var(--sentiment-neg-bg)" : t.sentiment_label === "positive" ? "var(--sentiment-pos-bg)" : "var(--sentiment-neu-bg)",
                    color: SENTIMENT_COLORS[t.sentiment_label],
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}>
                    {t.sentiment_label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {loadingInsight && (
            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading insights…</p>
            </div>
          )}

          {insight && !loadingInsight && (
            <div style={card}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
                {THEME_LABELS[insight.theme] || insight.theme}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "Reviews", value: insight.total_reviews },
                  { label: "Avg rating", value: insight.avg_rating },
                  { label: "1-star %", value: insight.one_star_pct + "%" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "var(--bg-muted)", borderRadius: "10px", padding: "12px", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "2px" }}>{s.label}</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "8px" }}>TOP KEYWORDS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {insight.top_keywords.map(k => (
                    <span key={k.word} style={{ fontSize: "12px", background: "var(--keyword-bg)", color: "var(--keyword-color)", padding: "3px 10px", borderRadius: "12px", fontWeight: "500" }}>
                      {k.word} ({k.count})
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "8px" }}>REPRESENTATIVE REVIEWS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {insight.representative_reviews.map((r, i) => (
                    <div key={i} style={{ background: "var(--bg-muted)", borderRadius: "10px", padding: "12px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "6px", alignItems: "center" }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "var(--star-empty)", fontSize: "12px" }}>★</span>
                        ))}
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>{r.store === "app_store" ? "App Store" : "Google Play"}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-body)", lineHeight: "1.5" }}>{r.text.slice(0, 200)}{r.text.length > 200 ? "…" : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onThemeClick(insight.theme)}
                style={{
                  width: "100%",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--accent)",
                  background: "var(--accent-bg)",
                  color: "var(--accent-text)",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                See all {insight.total_reviews} reviews →
              </button>
            </div>
          )}

          {!insight && !loadingInsight && (
            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Click a theme to see insights</p>
            </div>
          )}

          {stats && (
            <div style={card}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>Rating distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.by_rating} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="rating" tick={{ fontSize: 12, fill: chartTick }} tickFormatter={v => v + "★"} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: chartTick }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip darkMode={darkMode} />} formatter={v => [v, "Reviews"]} />
                  <Bar dataKey="count" name="Reviews" fill={accentColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {trend.length > 0 && (
        <div style={card}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>Average rating over time</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Monthly average from App Store reviews</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTick }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: chartTick }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip darkMode={darkMode} />} formatter={v => [v, "Avg rating"]} />
              <Line type="monotone" dataKey="avg_rating" name="Avg rating" stroke={accentColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
