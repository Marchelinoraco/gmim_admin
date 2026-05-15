// src/stores/gerejaStore.js
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { dummyGereja } from "@/data/dummyGereja"
import { validasiSubdomain, isSubdomainUnik } from "@/utils/validasiSubdomain"

export const useGerejaStore = defineStore("gereja", () => {
  // === STATE ===
  const gerejaList = ref([...dummyGereja])
  const notifikasi = ref(null) // { type: "success"|"error", message: string }

  // === GETTERS ===
  const gerejaAktifDanPending = computed(() => gerejaList.value.filter((g) => g.statusDomain !== "nonaktif"))

  // === HELPERS ===
  function generateId() {
    const chars = "abcdef0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `c-${result}`
  }

  function formatTimestamp(date = new Date()) {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    if (isNaN(date.getTime())) return ""
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const h = String(date.getHours()).padStart(2, "0")
    const m = String(date.getMinutes()).padStart(2, "0")
    const s = String(date.getSeconds()).padStart(2, "0")
    return `${day}/${month}/${year} ${h}:${m}:${s}`
  }

  // === ACTIONS ===

  /**
   * Mendapatkan gereja berdasarkan ID
   * @param {string} id
   * @returns {object|undefined}
   */
  function getById(id) {
    return gerejaList.value.find((g) => g.id === id)
  }

  /**
   * Menambah gereja baru. statusDomain selalu "pending".
   * @param {object} input - Data gereja (nama, alamat, namaPendeta, telepon, subdomain, paketLangganan, dll)
   * @returns {object|false} Gereja yang dibuat atau false jika validasi gagal
   */
  function tambahGereja(input) {
    const validasi = validasiSubdomain(input.subdomain)
    if (!validasi.valid) {
      notifikasi.value = { type: "error", message: validasi.pesan }
      return false
    }

    if (!isSubdomainUnik(input.subdomain, gerejaList.value)) {
      notifikasi.value = { type: "error", message: "Subdomain sudah digunakan" }
      return false
    }

    const now = formatTimestamp()
    const gerejaBaru = {
      id: generateId(),
      nama: input.nama || "",
      alamat: input.alamat || "",
      namaPendeta: input.namaPendeta || "",
      telepon: input.telepon || "",
      subdomain: input.subdomain,
      statusLangganan: input.statusLangganan || "trial",
      paketLangganan: input.paketLangganan || "Basic",
      statusDomain: "pending",
      bergabungPada: input.bergabungPada || new Date().toISOString().split("T")[0],
      langgananBerakhir: input.langgananBerakhir || "",
      createdAt: now,
      updatedAt: now
    }

    gerejaList.value.push(gerejaBaru)
    notifikasi.value = { type: "success", message: "Gereja berhasil ditambahkan" }
    return gerejaBaru
  }

  /**
   * Mengupdate data gereja berdasarkan ID
   * @param {string} id
   * @param {object} patch - Field yang akan diupdate
   * @returns {object|false} Gereja yang diupdate atau false jika tidak ditemukan
   */
  function updateGereja(id, patch) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    // Jika subdomain diubah, validasi
    if (patch.subdomain && patch.subdomain !== gerejaList.value[index].subdomain) {
      const validasi = validasiSubdomain(patch.subdomain)
      if (!validasi.valid) {
        notifikasi.value = { type: "error", message: validasi.pesan }
        return false
      }

      if (!isSubdomainUnik(patch.subdomain, gerejaList.value, id)) {
        notifikasi.value = { type: "error", message: "Subdomain sudah digunakan" }
        return false
      }

      // Subdomain berubah → statusDomain kembali ke "pending"
      patch.statusDomain = "pending"
    }

    const now = formatTimestamp()
    gerejaList.value[index] = {
      ...gerejaList.value[index],
      ...patch,
      updatedAt: now
    }

    notifikasi.value = { type: "success", message: "Gereja berhasil diperbarui" }
    return gerejaList.value[index]
  }

  /**
   * Menghapus gereja berdasarkan ID
   * @param {string} id
   * @returns {boolean}
   */
  function hapusGereja(id) {
    const index = gerejaList.value.findIndex((g) => g.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    gerejaList.value.splice(index, 1)
    notifikasi.value = { type: "success", message: "Gereja berhasil dihapus" }
    return true
  }

  /**
   * Cek apakah subdomain tersedia (unik)
   * @param {string} subdomain
   * @param {string|null} excludeId - ID gereja yang dikecualikan (untuk edit)
   * @returns {boolean}
   */
  function isSubdomainTersedia(subdomain, excludeId = null) {
    return isSubdomainUnik(subdomain, gerejaList.value, excludeId)
  }

  /**
   * Mengaktifkan domain gereja (set statusDomain ke "aktif")
   * @param {string} id
   * @returns {boolean}
   */
  function aktifkanDomain(id) {
    const gereja = getById(id)
    if (!gereja) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    const index = gerejaList.value.findIndex((g) => g.id === id)
    gerejaList.value[index].statusDomain = "aktif"
    gerejaList.value[index].updatedAt = formatTimestamp()
    notifikasi.value = { type: "success", message: "Domain berhasil diaktifkan" }
    return true
  }

  /**
   * Menonaktifkan domain gereja (set statusDomain ke "nonaktif")
   * @param {string} id
   * @returns {boolean}
   */
  function nonaktifkanDomain(id) {
    const gereja = getById(id)
    if (!gereja) {
      notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
      return false
    }

    const index = gerejaList.value.findIndex((g) => g.id === id)
    gerejaList.value[index].statusDomain = "nonaktif"
    gerejaList.value[index].updatedAt = formatTimestamp()
    notifikasi.value = { type: "success", message: "Domain berhasil dinonaktifkan" }
    return true
  }

  return {
    // State
    gerejaList,
    notifikasi,
    // Getters
    gerejaAktifDanPending,
    // Actions
    getById,
    tambahGereja,
    updateGereja,
    hapusGereja,
    isSubdomainTersedia,
    aktifkanDomain,
    nonaktifkanDomain
  }
})
