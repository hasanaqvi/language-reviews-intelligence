import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const api = axios.create({ baseURL: BASE_URL })

export const getThemeSummary = () => api.get("/themes/summary")
export const getThemeReviews = (theme, limit=20, offset=0) => api.get("/themes/" + theme + "/reviews?limit=" + limit + "&offset=" + offset)
export const getThemeInsight = (theme) => api.get("/themes/" + theme + "/summary")
export const getStats = () => api.get("/reviews/stats")
export const getRatingsOverTime = () => api.get("/snapshots/ratings-over-time")
