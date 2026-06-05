import apiClient from "./client"

export const gerejaApi = {
  getAll:    ()         => apiClient.get("/gereja"),
  getById:   (id)       => apiClient.get(`/gereja/${id}`),
  create:    (data)     => apiClient.post("/gereja", data),
  update:    (id, data) => apiClient.put(`/gereja/${id}`, data),
  delete:    (id)       => apiClient.delete(`/gereja/${id}`),
}
