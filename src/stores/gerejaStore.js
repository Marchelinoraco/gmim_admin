import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { adminApi } from "@/api/admin"
import { validasiSubdomain } from "@/utils/validasiSubdomain"

export const useGerejaStore = defineStore("gereja", () => {
  // === STATE ===
  const gerejaList = ref([])
  const notifikasi = ref(null) // { type: "success"|"error", message: string }
  const isLoading = ref(false)

  // === GETTERS ===
  const gerejaAktifDanPending = computed(() =>
    gerejaList.value.filter((g) => g.statusDomain !== "nonaktif")
  )

  // === FETCH ===

  async function fetchAll() {
    isLoading.value = true
    try {
      const data = await adminApi.getAllGereja()
      gerejaList.value = (data.data || []).map(normalizeGereja)
    } catch {
      notifikasi.value = { type: "error", message: "Gagal memuat daftar gereja." }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id) {
    try {
      const data = await adminApi.getGereja(id)
      return normalizeGereja(data.data || data)
    } catch {
      return null
    }
  }

  // === HELPERS ===

  // Normalise field dari API (snake_case → camelCase sesuai model dummy lama)
  function normalizeGereja(g) {
    return {
      id:               g.id,
      nama:             g.nama || "",
      alamat:           g.alamat || "",
      namaPendeta:      g.nama_pendeta || g.namaPendeta || "",
      telepon:          g.telepon || "",
      subdomain:        g.subdomain || g.slug || "",
      slug:             g.slug || g.subdomain || "",
      statusLangganan:  g.status_langganan || g.statusLangganan || "trial",
      paketLangganan:   g.paket_langganan  || g.paketLangganan  || "Basic",
      statusDomain:     g.status_domain    || g.statusDomain    || "pending",
      bergabungPada:    g.bergabung_pada   || g.bergabungPada   || "",
      langgananBerakhir: g.langganan_berakhir || g.langgananBerakhir || "",
      createdAt:        g.created_at || g.createdAt || "",
      updatedAt:        g.updated_at || g.updatedAt || "",
    }
  }

  // === GETTERS ===

  function getById(id) {
    return gerejaList.value.find((g) => g.id === id)
  }

  // === ACTIONS ===

  async function tambahGereja(input) {
    const validasi = validasiSubdomain(input.subdomain)
    if (!validasi.valid) {
      notifikasi.value = { type: "error", message: validasi.pesan }
      return false
    }

    // Gereja baru didaftarkan via self-service /register (manage app)
    // Admin platform mengelola via override langganan, bukan buat gereja baru langsung
    notifikasi.value = { type: "error", message: "Gunakan fitur Daftar Gratis di halaman utama untuk mendaftarkan gereja baru." }
    return false
  }

  async function updateGereja(id, patch) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    try {
      const data = await adminApi.updateGereja(id, {
        nama:         patch.nama,
        alamat:       patch.alamat,
        nama_pendeta: patch.namaPendeta,
        telepon:      patch.telepon,
        email:        patch.email,
      })
      const updated = normalizeGereja(data.data || data)
      gerejaList.value[index] = updated
      notifikasi.value = { type: "success", message: "Gereja berhasil diperbarui" }
      return updated
    } catch (err) {
      const msg = err.data?.message || "Gagal memperbarui gereja."
      notifikasi.value = { type: "error", message: msg }
      return false
    }
  }

  async function hapusGereja(id) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    // Penghapusan gereja via admin harus melalui lifecycle resmi (suspend → export → delete)
    notifikasi.value = { type: "error", message: "Penghapusan gereja harus melalui proses offboarding. Hubungi tim teknis." }
    return false
    }
  }

  function isSubdomainTersedia(subdomain, excludeId = null) {
    return !gerejaList.value.some(
      (g) => g.subdomain === subdomain && g.id !== excludeId
    )
  }

  // Status domain masih dikelola lokal sampai endpoint admin tersedia
  function aktifkanDomain(id) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) { notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }; return false }
    gerejaList.value[index].statusDomain = "aktif"
    notifikasi.value = { type: "success", message: "Domain berhasil diaktifkan" }
    return true
  }

  function nonaktifkanDomain(id) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) { notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }; return false }
    gerejaList.value[index].statusDomain = "nonaktif"
    notifikasi.value = { type: "success", message: "Domain berhasil dinonaktifkan" }
    return true
  }

  return {
    gerejaList, notifikasi, isLoading,
    gerejaAktifDanPending,
    fetchAll, fetchById, getById,
    tambahGereja, updateGereja, hapusGereja,
    isSubdomainTersedia, aktifkanDomain, nonaktifkanDomain,
  }
})
