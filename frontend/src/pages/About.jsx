const section = { marginBottom: "28px" }
const heading = { fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }
const body = { fontSize: "14px", lineHeight: "1.7", color: "var(--text-secondary)", margin: 0 }

export default function About() {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 32px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "24px" }}>
        About
      </h1>

      <div style={section}>
        <div style={heading}>How it works</div>
        <p style={body}>
          A scraper pulls the most recent Babbel App Store reviews across 8 markets
          (US, GB, DE, FR, ES, IT, AU, CA) via Apple's public RSS feed and stores them
          in PostgreSQL. An analyser classifies each English review into product themes
          using curated keyword matching and scores its sentiment with VADER. The
          dashboard visualizes the resulting theme clusters, sentiment, and rating trends.
        </p>
      </div>

      <div style={section}>
        <div style={heading}>Limitations</div>
        <p style={body}>
          The RSS feed only exposes the most recent few hundred reviews per market — there
          is no historical backfill, so the dataset grows only as the scraper runs regularly.
          Theme classification is keyword-based, not ML: reviews can be miscategorized or
          land in several themes at once. Sentiment analysis covers English reviews only.
          Some rows scraped before date capture was added carry only their scrape date.
          Google Play scraping is currently non-functional.
        </p>
      </div>
    </div>
  )
}
