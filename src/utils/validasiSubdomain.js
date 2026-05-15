const SUBDOMAIN_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MIN_LENGTH = 3
const MAX_LENGTH = 30

/**
 * Validasi format subdomain
 * @param {string} subdomain
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiSubdomain(subdomain) {
  if (!subdomain || subdomain.trim() === "") {
    return { valid: false, pesan: "Subdomain wajib diisi" }
  }

  if (subdomain.length < MIN_LENGTH || subdomain.length > MAX_LENGTH) {
    return { valid: false, pesan: "Subdomain harus antara 3-30 karakter" }
  }

  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return { valid: false, pesan: "Format subdomain tidak valid" }
  }

  return { valid: true, pesan: "" }
}

/**
 * Cek keunikan subdomain terhadap daftar gereja
 * @param {string} subdomain
 * @param {Array} gerejaList
 * @param {string|null} excludeId - ID gereja yang dikecualikan (untuk edit)
 * @returns {boolean}
 */
export function isSubdomainUnik(subdomain, gerejaList, excludeId = null) {
  return !gerejaList.some((g) => g.subdomain === subdomain && g.id !== excludeId)
}
