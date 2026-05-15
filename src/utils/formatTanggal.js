// src/utils/formatTanggal.js

const BULAN_INDONESIA = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/**
 * Format tanggal ke format DD/MM/YYYY
 * @param {string} dateString
 * @returns {string}
 */
export function formatTanggal(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format tanggal ke format DD MMM YYYY HH:mm (e.g., "12 Mei 2026 09:15")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatLoginTerakhir(dateInput) {
  if (!dateInput) return "-"
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return "-"
  const day = String(date.getDate()).padStart(2, "0")
  const bulan = BULAN_INDONESIA[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day} ${bulan} ${year} ${hours}:${minutes}`
}

/**
 * Format timestamp lengkap DD/MM/YYYY HH:mm:ss
 * @param {Date} date
 * @returns {string}
 */
export function formatTimestamp(date = new Date()) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  if (isNaN(date.getTime())) return ""
  const d = formatTanggal(date.toISOString())
  const h = String(date.getHours()).padStart(2, "0")
  const m = String(date.getMinutes()).padStart(2, "0")
  const s = String(date.getSeconds()).padStart(2, "0")
  return `${d} ${h}:${m}:${s}`
}
