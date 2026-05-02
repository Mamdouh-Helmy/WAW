const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Core Fetchers ────────────────────────────────────────────────────────────

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("waw_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
};

const requestForm = async (endpoint, formData, method = "POST") => {
  const token = localStorage.getItem("waw_token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (formData) => requestForm("/auth/register", formData),
  getMe: () => request("/auth/me"),

  // Articles — Public
  getArticles: (category = "", page = 1, lang = "ar", limit = 9) =>
    request(`/articles?category=${category}&page=${page}&limit=${limit}&lang=${lang}`),
  getArticle: (id, lang = "ar") => request(`/articles/${id}?lang=${lang}`),
  getMostRead: (lang = "ar") => request(`/articles/most-read?lang=${lang}`),
  getHeroSlides: (lang = "ar") => request(`/articles?limit=3&lang=${lang}`),
  searchArticles: (q = "", lang = "ar") =>
    request(`/articles/search?q=${encodeURIComponent(q)}&lang=${lang}`),

  // Tags
  getTags: (lang = "ar") => request(`/articles/tags?lang=${lang}`),
  getArticlesByTag: (tag, page = 1, lang = "ar") =>
    request(`/articles?tag=${encodeURIComponent(tag)}&page=${page}&limit=9&lang=${lang}`),

  // Articles — Admin
  getAdminArticles: (page = 1) => request(`/articles/admin/all?page=${page}`),
  getAdminArticle: (id) => request(`/articles/admin/single/${id}`),
  createArticle: (formData) => requestForm("/articles", formData),
  updateArticle: (id, formData) => requestForm(`/articles/${id}`, formData, "PUT"),
  deleteArticle: (id) => request(`/articles/${id}`, { method: "DELETE" }),

  // Podcasts — Public
  getPodcasts: (lang = "ar") => request(`/podcasts?lang=${lang}`),
  getPodcast: (id, lang = "ar") => request(`/podcasts/${id}?lang=${lang}`),

  // Podcasts — Admin
  createPodcast: (formData) => requestForm("/podcasts", formData),
  updatePodcast: (id, formData) => requestForm(`/podcasts/${id}`, formData, "PUT"),
  deletePodcast: (id) => request(`/podcasts/${id}`, { method: "DELETE" }),
  getAdminPodcasts: () => request("/podcasts/admin/all"),

  // Users — Admin
  getUsers: (params = {}) => request(`/users?${new URLSearchParams(params)}`),
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  // Footer
  getFooterSettings: () => request("/footer"),
  updateFooterSettings: (data) => request("/footer", { method: "PUT", body: JSON.stringify(data) }),

  // Reels — Public
  getReels: (lang = "ar", page = 1) => request(`/reels?lang=${lang}&page=${page}&limit=12`),
  getReel: (id, lang = "ar") => request(`/reels/${id}?lang=${lang}`),

  // Reels — Admin
  getAdminReels: (page = 1) => request(`/reels/admin/all?page=${page}`),
  getAdminReel: (id) => request(`/reels/admin/single/${id}`),
  createReel: (formData) => requestForm("/reels", formData),
  updateReel: (id, formData) => requestForm(`/reels/${id}`, formData, "PUT"),
  deleteReel: (id) => request(`/reels/${id}`, { method: "DELETE" }),
};