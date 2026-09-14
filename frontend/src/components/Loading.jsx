import { useState, useEffect } from "react"

// Staged loading indicator: after a few seconds the message explains that the
// free-tier server is waking up, so a cold start doesn't look like a bug.
export default function Loading({ label = "Loading…" }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div className="lri-spinner" />
      <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
        {slow ? "Waking up the server — it naps when idle. This can take up to a minute…" : label}
      </p>
    </div>
  )
}

export function LoadError({ onRetry }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
        Couldn't reach the server. It may still be waking up.
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 20px",
          borderRadius: "8px",
          border: "1px solid var(--border-input)",
          background: "var(--bg-card)",
          color: "var(--accent-text)",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Try again
      </button>
    </div>
  )
}
