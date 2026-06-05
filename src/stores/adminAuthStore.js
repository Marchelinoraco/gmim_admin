import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { adminApi } from "@/api/admin"

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const admin          = ref(null)
  const isAuthenticated = ref(false)
  const loading        = ref(false)

  const nama  = computed(() => admin.value?.nama  || "")
  const email = computed(() => admin.value?.email || "")
  const role  = computed(() => admin.value?.role  || "")

  async function login(email, password) {
    loading.value = true
    try {
      const data = await adminApi.login(email, password)
      if (!data.success) return { success: false, message: data.message }

      admin.value          = data.admin
      isAuthenticated.value = true
      localStorage.setItem("admin_token", data.token)
      localStorage.setItem("admin_user",  JSON.stringify(data.admin))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.data?.message || "Gagal terhubung ke server." }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await adminApi.logout() } catch { /* ignore */ }
    _clear()
  }

  async function checkAuth() {
    const token    = localStorage.getItem("admin_token")
    const userData = localStorage.getItem("admin_user")
    if (!token || !userData) { _clear(); return false }

    try {
      admin.value          = JSON.parse(userData)
      isAuthenticated.value = true
    } catch { _clear(); return false }

    // Verifikasi ke server di background
    adminApi.me()
      .then((data) => { if (data.success) { admin.value = data.admin; localStorage.setItem("admin_user", JSON.stringify(data.admin)) } })
      .catch(() => { _clear() })

    return true
  }

  function _clear() {
    admin.value          = null
    isAuthenticated.value = false
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
  }

  return { admin, isAuthenticated, loading, nama, email, role, login, logout, checkAuth }
})
