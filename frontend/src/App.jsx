import { useState } from "react"
import Dashboard from "./pages/Dashboard"
import Reviews from "./pages/Reviews"
import "./index.css"

const nav = { background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "16px 32px", display: "flex", alignItems: "center", gap: "32px" }
const link = (active) => ({ fontSize: "14px", fontWeight: active ? "600" : "400", color: active ? "#4f46e5" : "#6b7280", cursor: "pointer", borderBottom: active ? "2px solid #4f46e5" : "none", paddingBottom: "4px" })

export default function App() {
  const [page, setPage] = useState("dashboard")
  const [selectedTheme, setSelectedTheme] = useState(null)

  function openTheme(theme) {
    setSelectedTheme(theme)
    setPage("reviews")
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav style={nav}>
        <span style={{ fontWeight: "700", fontSize: "16px", color: "#111827", marginRight: "16px" }}>Language Reviews Intelligence</span>
        <span style={link(page === "dashboard")} onClick={() => setPage("dashboard")}>Dashboard</span>
        <span style={link(page === "reviews")} onClick={() => setPage("reviews")}>Reviews</span>
      </nav>
      {page === "dashboard" && <Dashboard onThemeClick={openTheme} />}
      {page === "reviews" && <Reviews initialTheme={selectedTheme} />}
    </div>
  )
}
