import apiClient from "./client"

export const adminApi = {
  // Auth
  login:   (email, password)  => apiClient.post("/admin/login", { email, password }),
  logout:  ()                 => apiClient.post("/admin/logout"),
  me:      ()                 => apiClient.get("/admin/me"),

  // Stats
  stats:   ()                 => apiClient.get("/admin/stats"),

  // Gereja
  getAllGereja:    ()          => apiClient.get("/admin/gereja"),
  getGereja:      (id)        => apiClient.get(`/admin/gereja/${id}`),
  updateGereja:   (id, data)  => apiClient.put(`/admin/gereja/${id}`, data),

  // Langganan
  getAllLangganan: ()          => apiClient.get("/admin/langganan"),
  overrideLangganan: (id, data) => apiClient.put(`/admin/langganan/${id}`, data),

  // Pengguna
  getAllPengguna:  (gerejaId)  => apiClient.get(`/admin/pengguna${gerejaId ? `?gereja_id=${gerejaId}` : ""}`),

  // Impersonasi
  impersonate:    (userId)    => apiClient.post(`/admin/impersonate/${userId}`),
}
