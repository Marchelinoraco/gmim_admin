import { describe, it, expect } from "vitest"
import { validasiBendahara } from "./validasiBendahara.js"

describe("validasiBendahara", () => {
  const validData = {
    namaLengkap: "Yohanes W.",
    email: "yohanes@sion-manado.id",
    password: "password123",
    gerejaId: "c-001",
    telepon: "0812-9000-1111",
    role: "Bendahara"
  }

  it("returns valid:true for valid complete data (create mode)", () => {
    const result = validasiBendahara(validData, true)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it("returns valid:true for valid data without password (edit mode)", () => {
    const { password, ...dataWithoutPassword } = validData
    const result = validasiBendahara(dataWithoutPassword, false)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  describe("namaLengkap validation", () => {
    it("returns error when namaLengkap is missing", () => {
      const data = { ...validData, namaLengkap: "" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.namaLengkap).toBe("Nama lengkap minimal 2 karakter")
    })

    it("returns error when namaLengkap is less than 2 characters", () => {
      const data = { ...validData, namaLengkap: "A" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.namaLengkap).toBe("Nama lengkap minimal 2 karakter")
    })

    it("returns error when namaLengkap exceeds 100 characters", () => {
      const data = { ...validData, namaLengkap: "A".repeat(101) }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.namaLengkap).toBe("Nama lengkap maksimal 100 karakter")
    })

    it("trims whitespace when checking length", () => {
      const data = { ...validData, namaLengkap: "  A  " }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.namaLengkap).toBe("Nama lengkap minimal 2 karakter")
    })
  })

  describe("email validation", () => {
    it("returns error when email is missing", () => {
      const data = { ...validData, email: "" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.email).toBe("Format email tidak valid")
    })

    it("returns error for invalid email format", () => {
      const data = { ...validData, email: "invalid-email" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.email).toBe("Format email tidak valid")
    })

    it("accepts valid email format", () => {
      const data = { ...validData, email: "user@domain.com" }
      const result = validasiBendahara(data)
      expect(result.errors.email).toBeUndefined()
    })
  })

  describe("password validation (create mode)", () => {
    it("returns error when password is missing in create mode", () => {
      const data = { ...validData, password: "" }
      const result = validasiBendahara(data, true)
      expect(result.valid).toBe(false)
      expect(result.errors.password).toBe("Password minimal 8 karakter")
    })

    it("returns error when password is less than 8 characters", () => {
      const data = { ...validData, password: "1234567" }
      const result = validasiBendahara(data, true)
      expect(result.valid).toBe(false)
      expect(result.errors.password).toBe("Password minimal 8 karakter")
    })

    it("returns error when password exceeds 128 characters", () => {
      const data = { ...validData, password: "A".repeat(129) }
      const result = validasiBendahara(data, true)
      expect(result.valid).toBe(false)
      expect(result.errors.password).toBe("Password maksimal 128 karakter")
    })

    it("does not validate password in edit mode", () => {
      const data = { ...validData, password: "" }
      const result = validasiBendahara(data, false)
      expect(result.errors.password).toBeUndefined()
    })
  })

  describe("gerejaId validation", () => {
    it("returns error when gerejaId is missing", () => {
      const data = { ...validData, gerejaId: "" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.gerejaId).toBe("Gereja wajib dipilih")
    })
  })

  describe("telepon validation", () => {
    it("returns error when telepon is missing", () => {
      const data = { ...validData, telepon: "" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.telepon).toBe("Nomor telepon wajib diisi")
    })

    it("returns error when telepon is only whitespace", () => {
      const data = { ...validData, telepon: "   " }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.telepon).toBe("Nomor telepon wajib diisi")
    })
  })

  describe("role validation", () => {
    it("returns error when role is missing", () => {
      const data = { ...validData, role: "" }
      const result = validasiBendahara(data)
      expect(result.valid).toBe(false)
      expect(result.errors.role).toBe("Role wajib dipilih")
    })
  })

  describe("multiple errors", () => {
    it("returns all errors for completely invalid data", () => {
      const data = {}
      const result = validasiBendahara(data, true)
      expect(result.valid).toBe(false)
      expect(Object.keys(result.errors)).toHaveLength(6)
      expect(result.errors.namaLengkap).toBeDefined()
      expect(result.errors.email).toBeDefined()
      expect(result.errors.password).toBeDefined()
      expect(result.errors.gerejaId).toBeDefined()
      expect(result.errors.telepon).toBeDefined()
      expect(result.errors.role).toBeDefined()
    })
  })
})
