import { defineStore } from "pinia"
import { ref } from "vue"
import { adminApi } from "@/api/admin"

export const useBendaharaStore = defineStore("bendahara", () => {
  const bendaharaList = ref([])
  const notifikasi    = ref(null)
  const isLoading     = ref(false)

  function normalizePengguna(u) {
    return {
      id:            u.id,
      namaLengkap:   u.nama || u.namaLengkap || "",
      email:         u.email,
      username:      u.username || "",
      gerejaId:      u.gerejaId || u.gereja_id || "",
      gerejaNama:    u.gerejaNama || "",
      telepon:       u.telepon || "",
      role:          u.role,
      status:        u.status,
      loginTerakhir: u.loginTerakhir || u.login_terakhir || null,
      createdAt:     u.createdAt || u.created_at || "",
      updatedAt:     u.updatedAt || u.updated_at || "",
    }
  }

  async function fetchAll(gerejaId = null) {
    isLoading.value = true
    try {
      const data = await adminApi.getAllPengguna(gerejaId)
      bendaharaList.value = (data.data || []).map(normalizePengguna)
    } catch {
      notifikasi.value = { type: "error", message: "Gagal memuat data pengguna." }
    } finally {
      isLoading.value = false
    }
  }

  function getById(id) {
    return bendaharaList.value.find((b) => b.id === id)
  }

  function bendaharaByGereja(gerejaId) {
    return bendaharaList.value.filter((b) => b.gerejaId === gerejaId)
  }

  function filterBendahara(pencarian, filterGereja, filterStatus, gerejaList) {
    return bendaharaList.value.filter((b) => {
      if (pencarian?.trim()) {
        const kw = pencarian.toLowerCase()
        const namaGereja = gerejaList?.find((g) => g.id === b.gerejaId)?.nama || ""
        if (!b.namaLengkap.toLowerCase().includes(kw) &&
            !b.email.toLowerCase().includes(kw) &&
            !namaGereja.toLowerCase().includes(kw)) return false
      }
      if (filterGereja && b.gerejaId !== filterGereja) return false
      if (filterStatus && b.status !== filterStatus) return false
      return true
    })
  }

  // Operasi write masih via API gereja/{id} — stub agar views tidak error
  function tambahBendahara()    { notifikasi.value = { type: "error", message: "Gunakan fitur di halaman detail gereja." }; return false }
  function updateBendahara()    { notifikasi.value = { type: "error", message: "Gunakan fitur di halaman detail gereja." }; return false }
  function hapusBendahara()     { notifikasi.value = { type: "error", message: "Gunakan fitur di halaman detail gereja." }; return false }
  function toggleStatus()       { return null }
  function resetPassword()      { return false }
  function isEmailTerdaftar()   { return false }
  function isUsernameTerdaftar(){ return false }

  return {
    bendaharaList, notifikasi, isLoading,
    fetchAll, getById, bendaharaByGereja, filterBendahara,
    tambahBendahara, updateBendahara, hapusBendahara,
    toggleStatus, resetPassword, isEmailTerdaftar, isUsernameTerdaftar,
  }
})
