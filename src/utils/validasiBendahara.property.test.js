import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { validasiBendahara } from "./validasiBendahara.js"

/**
 * Feature: domain-dan-bendahara-management, Property 6: Validasi Form Bendahara
 * Validates: Requirements 3.5, 3.6, 3.7, 3.8
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// --- Generators ---

/** Generator for valid namaLengkap (2-100 chars after trim) */
const validNamaLengkap = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((s) => s.trim().length >= 2 && s.trim().length <= 100)

/** Generator for valid email matching the regex */
const validEmail = fc
  .tuple(
    fc.stringMatching(/^[^\s@]+$/, { minLength: 1, maxLength: 20 }),
    fc.stringMatching(/^[^\s@]+$/, { minLength: 1, maxLength: 10 }),
    fc.stringMatching(/^[^\s@]+$/, { minLength: 2, maxLength: 6 })
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

/** Generator for valid password (8-128 chars) */
const validPassword = fc.string({ minLength: 8, maxLength: 128 })

/** Generator for valid gerejaId (non-empty) */
const validGerejaId = fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.length > 0)

/** Generator for valid telepon (non-empty after trim) */
const validTelepon = fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0)

/** Generator for valid role (non-empty) */
const validRole = fc.constantFrom("Admin Gereja", "Bendahara", "Viewer / Majelis")

/** Generator for a fully valid bendahara data object (create mode) */
const validBendaharaData = fc.record({
  namaLengkap: validNamaLengkap,
  email: validEmail,
  password: validPassword,
  gerejaId: validGerejaId,
  telepon: validTelepon,
  role: validRole
})

describe("Feature: domain-dan-bendahara-management, Property 6: Validasi Form Bendahara", () => {
  it("should return valid:true with empty errors when ALL fields are valid (create mode)", () => {
    fc.assert(
      fc.property(validBendaharaData, (data) => {
        const result = validasiBendahara(data, true)
        expect(result.valid).toBe(true)
        expect(Object.keys(result.errors)).toHaveLength(0)
      }),
      { numRuns: 100 }
    )
  })

  it("should return errors.namaLengkap when namaLengkap is less than 2 chars (trimmed)", () => {
    const shortNama = fc.string({ minLength: 0, maxLength: 10 }).filter((s) => s.trim().length < 2)

    fc.assert(
      fc.property(
        shortNama,
        validEmail,
        validPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.namaLengkap).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.namaLengkap when namaLengkap is more than 100 chars (trimmed)", () => {
    const longNama = fc.string({ minLength: 101, maxLength: 200 }).filter((s) => s.trim().length > 100)

    fc.assert(
      fc.property(
        longNama,
        validEmail,
        validPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.namaLengkap).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.email when email does not match regex", () => {
    const invalidEmail = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !EMAIL_REGEX.test(s))

    fc.assert(
      fc.property(
        validNamaLengkap,
        invalidEmail,
        validPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.email).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.password when password is less than 8 chars in create mode", () => {
    const shortPassword = fc.string({ minLength: 1, maxLength: 7 })

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        shortPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.password).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.password when password is more than 128 chars in create mode", () => {
    const longPassword = fc.string({ minLength: 129, maxLength: 200 })

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        longPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.password).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should NOT validate password in edit mode (isCreate=false)", () => {
    const anyPassword = fc.oneof(
      fc.constant(""),
      fc.constant(undefined),
      fc.string({ minLength: 0, maxLength: 5 }),
      fc.string({ minLength: 200, maxLength: 300 })
    )

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        anyPassword,
        validGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, false)
          expect(result.errors.password).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.gerejaId when gerejaId is empty or falsy", () => {
    const emptyGerejaId = fc.constantFrom("", null, undefined, 0, false)

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        validPassword,
        emptyGerejaId,
        validTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.gerejaId).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.telepon when telepon is empty or whitespace only", () => {
    const emptyTelepon = fc.constantFrom("", "   ", "\t", "\n", " \t\n ")

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        validPassword,
        validGerejaId,
        emptyTelepon,
        validRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.telepon).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it("should return errors.role when role is empty or falsy", () => {
    const emptyRole = fc.constantFrom("", null, undefined, 0, false)

    fc.assert(
      fc.property(
        validNamaLengkap,
        validEmail,
        validPassword,
        validGerejaId,
        validTelepon,
        emptyRole,
        (nama, email, password, gerejaId, telepon, role) => {
          const data = { namaLengkap: nama, email, password, gerejaId, telepon, role }
          const result = validasiBendahara(data, true)
          expect(result.errors.role).toBeDefined()
          expect(result.valid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
