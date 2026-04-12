import { useState, useEffect } from "react"
import Dashboard from "./pages/Dashboard"
import Reviews from "./pages/Reviews"
import EasterEgg from "./components/EasterEgg"
import "./index.css"

export default function App() {
  const [page, setPage] = useState("dashboard")
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light")
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  function openTheme(theme) {
    setSelectedTheme(theme)
    setPage("reviews")
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <nav style={{
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", flex: "0 0 auto" }}>
          Language Reviews Intelligence
        </span>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "32px" }}>
          {["dashboard", "reviews"].map(p => (
            <span
              key={p}
              onClick={() => setPage(p)}
              style={{
                fontSize: "14px",
                fontWeight: page === p ? "600" : "400",
                color: page === p ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                borderBottom: page === p ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: "4px",
                textTransform: "capitalize",
              }}
            >
              {p}
            </span>
          ))}
        </div>

        <button
          onClick={() => setDarkMode(d => !d)}
          style={{
            flex: "0 0 auto",
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-input)",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {darkMode ? "☀ Light" : "☾ Dark"}
        </button>
      </nav>

      {page === "dashboard" && <Dashboard onThemeClick={openTheme} darkMode={darkMode} />}
      {page === "reviews" && <Reviews initialTheme={selectedTheme} darkMode={darkMode} />}

      <EasterEgg />
    </div>
  )
}
