const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validasi form bendahara
 * @param {object} data - Data form bendahara
 * @param {boolean} isCreate - true jika mode tambah (password wajib)
 * @returns {{ valid: boolean, errors: object }}
 */
export function validasiBendahara(data, isCreate = true) {
  const errors = {}

  // Nama lengkap: 2-100 karakter
  if (!data.namaLengkap || data.namaLengkap.trim().length < 2) {
    errors.namaLengkap = "Nama lengkap minimal 2 karakter"
  } else if (data.namaLengkap.trim().length > 100) {
    errors.namaLengkap = "Nama lengkap maksimal 100 karakter"
  }

  // Email: format valid
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = "Format email tidak valid"
  }

  // Password: 8-128 karakter (hanya saat create)
  if (isCreate) {
    if (!data.password || data.password.length < 8) {
      errors.password = "Password minimal 8 karakter"
    } else if (data.password.length > 128) {
      errors.password = "Password maksimal 128 karakter"
    }
  }

  // Gereja: wajib dipilih
  if (!data.gerejaId) {
    errors.gerejaId = "Gereja wajib dipilih"
  }

  // Telepon: wajib diisi
  if (!data.telepon || data.telepon.trim() === "") {
    errors.telepon = "Nomor telepon wajib diisi"
  }

  // Role: wajib dipilih
  if (!data.role) {
    errors.role = "Role wajib dipilih"
  }

  const valid = Object.keys(errors).length === 0
  return { valid, errors }
}
