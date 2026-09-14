import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const api = axios.create({ baseURL: BASE_URL, timeout: 90000 })

// The free-tier backend can be asleep or mid-redeploy: a request may hang
// until the server wakes, or fail briefly. Retry failed GETs before giving up.
async function get(url, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await api.get(url)
    } catch (err) {
      if (attempt >= attempts) throw err
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

export const getThemeSummary = () => get("/themes/summary")
export const getThemeReviews = (theme, { limit = 20, offset = 0, sort = "newest", dateFrom = "", dateTo = "" } = {}) => {
  const params = new URLSearchParams({ limit, offset, sort })
  if (dateFrom) params.set("date_from", dateFrom)
  if (dateTo) params.set("date_to", dateTo)
  return get("/themes/" + theme + "/reviews?" + params.toString())
}
export const getThemeInsight = (theme) => get("/themes/" + theme + "/summary")
export const getStats = () => get("/reviews/stats")
export const getRatingsOverTime = () => get("/snapshots/ratings-over-time")
