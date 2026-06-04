import { defineStore } from "pinia"
import { ref } from "vue"
import { dummyBendahara } from "@/data/dummyBendahara"

export const useBendaharaStore = defineStore("bendahara", () => {
  // === STATE ===
  const bendaharaList = ref([...dummyBendahara])
  const notifikasi = ref(null) // { type: "success"|"error", message: string }

  // === GETTERS ===
  /**
   * Mendapatkan daftar bendahara berdasarkan gerejaId
   * @param {string} gerejaId
   * @returns {Array} bendahara yang terhubung ke gereja
   */
  function bendaharaByGereja(gerejaId) {
    return bendaharaList.value.filter((b) => b.gerejaId === gerejaId)
  }

  // === ACTIONS ===

  /**
   * Mendapatkan bendahara berdasarkan ID
   * @param {string} id
   * @returns {object|undefined}
   */
  function getById(id) {
    return bendaharaList.value.find((b) => b.id === id)
  }

  /**
   * Menambah bendahara baru — status selalu "active"
   * @param {object} input - Data bendahara (namaLengkap, email, username, gerejaId, telepon, role)
   * @returns {object} bendahara yang baru dibuat
   */
  function tambahBendahara(input) {
    const now = _formatTimestamp()
    const newBendahara = {
      id: _generateId(),
      namaLengkap: input.namaLengkap,
      email: input.email,
      username: input.username,
      gerejaId: input.gerejaId,
      telepon: input.telepon,
      role: input.role,
      status: "active",
      loginTerakhir: null,
      createdAt: now,
      updatedAt: now
    }
    bendaharaList.value.push(newBendahara)
    notifikasi.value = { type: "success", message: "Bendahara berhasil ditambahkan" }
    return newBendahara
  }

  /**
   * Mengupdate data bendahara
   * @param {string} id
   * @param {object} patch - Field yang diupdate
   * @returns {object|null} bendahara yang diupdate atau null jika tidak ditemukan
   */
  function updateBendahara(id, patch) {
    const index = bendaharaList.value.findIndex((b) => b.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Bendahara tidak ditemukan" }
      return null
    }
    bendaharaList.value[index] = {
      ...bendaharaList.value[index],
      ...patch,
      updatedAt: _formatTimestamp()
    }
    notifikasi.value = { type: "success", message: "Bendahara berhasil diperbarui" }
    return bendaharaList.value[index]
  }

  /**
   * Menghapus bendahara dari daftar
   * @param {string} id
   * @returns {boolean} true jika berhasil dihapus
   */
  function hapusBendahara(id) {
    const index = bendaharaList.value.findIndex((b) => b.id === id)
    if (index === -1) {
      notifikasi.value = { type: "error", message: "Bendahara tidak ditemukan" }
      return false
    }
    bendaharaList.value.splice(index, 1)
    notifikasi.value = { type: "success", message: "Bendahara berhasil dihapus" }
    return true
  }

  /**
   * Toggle status bendahara antara "active" dan "disabled"
   * @param {string} id
   * @returns {object|null} bendahara yang diupdate atau null jika tidak ditemukan
   */
  function toggleStatus(id) {
    const bendahara = bendaharaList.value.find((b) => b.id === id)
    if (!bendahara) {
      notifikasi.value = { type: "error", message: "Data bendahara tidak ditemukan" }
      return null
    }
    bendahara.status = bendahara.status === "active" ? "disabled" : "active"
    bendahara.updatedAt = _formatTimestamp()
    const statusLabel = bendahara.status === "active" ? "diaktifkan" : "dinonaktifkan"
    notifikasi.value = { type: "success", message: `Bendahara berhasil ${statusLabel}` }
    return bendahara
  }

  /**
   * Reset password bendahara (dummy implementation)
   * @param {string} id
   * @param {string} passwordBaru
   * @returns {boolean}
   */
  function resetPassword(id, passwordBaru) {
    const bendahara = bendaharaList.value.find((b) => b.id === id)
    if (!bendahara) {
      notifikasi.value = { type: "error", message: "Bendahara tidak ditemukan" }
      return false
    }
    // Dummy implementation — hanya return true
    bendahara.updatedAt = _formatTimestamp()
    notifikasi.value = { type: "success", message: "Password berhasil direset" }
    return true
  }

  /**
   * Cek apakah email sudah terdaftar pada gereja yang sama
   * @param {string} email
   * @param {string} gerejaId
   * @param {string|null} excludeId - ID bendahara yang dikecualikan (untuk edit)
   * @returns {boolean} true jika email sudah terdaftar
   */
  function isEmailTerdaftar(email, gerejaId, excludeId = null) {
    return bendaharaList.value.some((b) => b.email === email && b.gerejaId === gerejaId && b.id !== excludeId)
  }

  /**
   * Cek apakah username sudah terdaftar secara global.
   * @param {string} username
   * @param {string|null} excludeId
   * @returns {boolean}
   */
  function isUsernameTerdaftar(username, excludeId = null) {
    return bendaharaList.value.some(
      (b) => b.username?.toLowerCase() === username?.toLowerCase() && b.id !== excludeId
    )
  }

  /**
   * Filter bendahara berdasarkan pencarian, gereja, dan status (logika AND)
   * @param {string} pencarian - Kata kunci pencarian (nama, email, atau nama gereja)
   * @param {string} filterGereja - gerejaId untuk filter (kosong = semua)
   * @param {string} filterStatus - status untuk filter (kosong = semua)
   * @param {Array} gerejaList - Daftar gereja untuk resolve nama gereja
   * @returns {Array} bendahara yang memenuhi semua kriteria
   */
  function filterBendahara(pencarian, filterGereja, filterStatus, gerejaList) {
    return bendaharaList.value.filter((b) => {
      // Filter pencarian (case-insensitive): nama, email, atau nama gereja
      if (pencarian && pencarian.trim() !== "") {
        const keyword = pencarian.toLowerCase()
        const namaGereja = _resolveNamaGereja(b.gerejaId, gerejaList)
        const cocokNama = b.namaLengkap.toLowerCase().includes(keyword)
        const cocokEmail = b.email.toLowerCase().includes(keyword)
        const cocokGereja = namaGereja.toLowerCase().includes(keyword)
        if (!cocokNama && !cocokEmail && !cocokGereja) {
          return false
        }
      }

      // Filter gereja
      if (filterGereja && filterGereja !== "") {
        if (b.gerejaId !== filterGereja) {
          return false
        }
      }

      // Filter status
      if (filterStatus && filterStatus !== "") {
        if (b.status !== filterStatus) {
          return false
        }
      }

      return true
    })
  }

  // === PRIVATE HELPERS ===

  /**
   * Generate ID unik format "u-XXXXXX"
   */
  function _generateId() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = "u-"
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Format timestamp saat ini
   */
  function _formatTimestamp() {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, "0")
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    const yyyy = now.getFullYear()
    const hh = String(now.getHours()).padStart(2, "0")
    const min = String(now.getMinutes()).padStart(2, "0")
    const ss = String(now.getSeconds()).padStart(2, "0")
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`
  }

  /**
   * Resolve nama gereja dari gerejaId
   */
  function _resolveNamaGereja(gerejaId, gerejaList) {
    if (!gerejaList || !Array.isArray(gerejaList)) return ""
    const gereja = gerejaList.find((g) => g.id === gerejaId)
    return gereja ? gereja.nama : ""
  }

  return {
    // State
    bendaharaList,
    notifikasi,
    // Getters
    bendaharaByGereja,
    // Actions
    getById,
    tambahBendahara,
    updateBendahara,
    hapusBendahara,
    toggleStatus,
    resetPassword,
    isEmailTerdaftar,
    isUsernameTerdaftar,
    filterBendahara
  }
})
