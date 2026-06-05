// API client berbasis fetch native (tanpa axios dependency)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

async function request(path, options = {}) {
  const token = localStorage.getItem("admin_token")
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data = body
    throw err
  }

  return res.json()
}

export const apiClient = {
  get:    (path)         => request(path, { method: "GET" }),
  post:   (path, body)   => request(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: "DELETE" }),
}

export default apiClient
