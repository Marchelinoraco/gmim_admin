import { describe, it, expect } from "vitest"
import * as fc from "fast-check"
import { validasiSubdomain, isSubdomainUnik } from "./validasiSubdomain.js"

/**
 * Validates: Requirements 1.2, 1.3, 1.7, 1.8
 */

const SUBDOMAIN_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MIN_LENGTH = 3
const MAX_LENGTH = 30

// Generator: valid subdomain segment (lowercase alphanumeric, 1+ chars)
const charArb = fc.mapToConstant(
  { num: 26, build: (v) => String.fromCharCode(97 + v) }, // a-z
  { num: 10, build: (v) => String.fromCharCode(48 + v) } // 0-9
)

// Generator: a single segment of lowercase alphanumeric chars
const segmentArb = fc.array(charArb, { minLength: 1, maxLength: 8 }).map((chars) => chars.join(""))

// Generator: valid subdomain (segments joined by hyphens, length 3-30)
const validSubdomainArb = fc
  .array(segmentArb, { minLength: 1, maxLength: 4 })
  .map((segments) => segments.join("-"))
  .filter((s) => s.length >= MIN_LENGTH && s.length <= MAX_LENGTH)

// Generator: string too short (1-2 alphanumeric chars)
const tooShortArb = fc.array(charArb, { minLength: 1, maxLength: 2 }).map((chars) => chars.join(""))

// Generator: string too long (31+ alphanumeric chars, valid format otherwise)
const tooLongArb = fc.array(charArb, { minLength: 31, maxLength: 50 }).map((chars) => chars.join(""))

// Generator: invalid format strings (within valid length 3-30)
const invalidFormatArb = fc.oneof(
  // Contains uppercase letters
  fc
    .array(charArb, { minLength: 2, maxLength: 28 })
    .map((chars) => chars.join(""))
    .map((s) => s.slice(0, 1) + "A" + s.slice(1))
    .filter((s) => s.length >= 3 && s.length <= 30),
  // Starts with hyphen
  fc
    .array(charArb, { minLength: 3, maxLength: 29 })
    .map((chars) => "-" + chars.join(""))
    .filter((s) => s.length >= 3 && s.length <= 30),
  // Ends with hyphen
  fc
    .array(charArb, { minLength: 3, maxLength: 29 })
    .map((chars) => chars.join("") + "-")
    .filter((s) => s.length >= 3 && s.length <= 30),
  // Contains double hyphen
  fc
    .tuple(segmentArb, segmentArb)
    .map(([a, b]) => a + "--" + b)
    .filter((s) => s.length >= 3 && s.length <= 30),
  // Contains underscore
  fc
    .tuple(segmentArb, segmentArb)
    .map(([a, b]) => a + "_" + b)
    .filter((s) => s.length >= 3 && s.length <= 30)
)

// Generator: gereja object
const gerejaArb = fc.record({
  id: fc.uuid(),
  subdomain: validSubdomainArb
})

// Generator: gereja list (non-empty)
const gerejaListArb = fc.array(gerejaArb, { minLength: 1, maxLength: 10 })

describe("Feature: domain-dan-bendahara-management, Property 1: Validasi Subdomain", () => {
  it("validasiSubdomain mengembalikan valid:true untuk semua string yang memenuhi regex dan panjang 3-30", () => {
    fc.assert(
      fc.property(validSubdomainArb, (subdomain) => {
        const result = validasiSubdomain(subdomain)
        expect(result.valid).toBe(true)
        expect(result.pesan).toBe("")
      }),
      { numRuns: 100 }
    )
  })

  it("validasiSubdomain mengembalikan valid:false untuk string yang terlalu pendek (< 3 karakter)", () => {
    fc.assert(
      fc.property(tooShortArb, (subdomain) => {
        const result = validasiSubdomain(subdomain)
        expect(result.valid).toBe(false)
        expect(result.pesan).toBe("Subdomain harus antara 3-30 karakter")
      }),
      { numRuns: 100 }
    )
  })

  it("validasiSubdomain mengembalikan valid:false untuk string yang terlalu panjang (> 30 karakter)", () => {
    fc.assert(
      fc.property(tooLongArb, (subdomain) => {
        const result = validasiSubdomain(subdomain)
        expect(result.valid).toBe(false)
        expect(result.pesan).toBe("Subdomain harus antara 3-30 karakter")
      }),
      { numRuns: 100 }
    )
  })

  it("validasiSubdomain mengembalikan valid:false untuk string dengan format tidak valid", () => {
    fc.assert(
      fc.property(invalidFormatArb, (subdomain) => {
        const result = validasiSubdomain(subdomain)
        expect(result.valid).toBe(false)
        expect(result.pesan).not.toBe("")
      }),
      { numRuns: 100 }
    )
  })

  it("validasiSubdomain: valid:true jika dan hanya jika memenuhi regex DAN panjang 3-30", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 40 }), (subdomain) => {
        const result = validasiSubdomain(subdomain)
        const matchesRegex = SUBDOMAIN_REGEX.test(subdomain)
        const validLength = subdomain.length >= MIN_LENGTH && subdomain.length <= MAX_LENGTH

        if (matchesRegex && validLength) {
          expect(result.valid).toBe(true)
        } else {
          expect(result.valid).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 2: Keunikan Subdomain", () => {
  it("isSubdomainUnik mengembalikan false jika subdomain ada di list dengan id berbeda", () => {
    fc.assert(
      fc.property(gerejaListArb, fc.nat(), (gerejaList, indexRaw) => {
        // Pick an existing gereja's subdomain
        const index = indexRaw % gerejaList.length
        const targetSubdomain = gerejaList[index].subdomain
        const differentId = "different-id-not-in-list"

        const result = isSubdomainUnik(targetSubdomain, gerejaList, differentId)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it("isSubdomainUnik mengembalikan true jika subdomain TIDAK ada di list", () => {
    fc.assert(
      fc.property(gerejaListArb, validSubdomainArb, (gerejaList, subdomain) => {
        // Ensure subdomain is not in the list
        const notInList = !gerejaList.some((g) => g.subdomain === subdomain)
        fc.pre(notInList)

        const result = isSubdomainUnik(subdomain, gerejaList)
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it("isSubdomainUnik mengembalikan true jika subdomain ada di list tapi milik gereja yang di-exclude", () => {
    fc.assert(
      fc.property(gerejaListArb, fc.nat(), (gerejaList, indexRaw) => {
        const index = indexRaw % gerejaList.length
        const targetGereja = gerejaList[index]

        // Ensure no other gereja has the same subdomain
        const onlyOne = gerejaList.filter((g) => g.subdomain === targetGereja.subdomain).length === 1
        fc.pre(onlyOne)

        const result = isSubdomainUnik(targetGereja.subdomain, gerejaList, targetGereja.id)
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it("isSubdomainUnik mengembalikan false jika subdomain ada di list milik gereja lain (bukan excludeId)", () => {
    fc.assert(
      fc.property(gerejaListArb, fc.nat(), (gerejaList, indexRaw) => {
        // Need at least 2 gereja
        fc.pre(gerejaList.length >= 2)

        const index = indexRaw % gerejaList.length
        const targetGereja = gerejaList[index]
        // Pick a different gereja as excludeId
        const otherIndex = (index + 1) % gerejaList.length
        const otherGereja = gerejaList[otherIndex]

        // Ensure they have different ids
        fc.pre(targetGereja.id !== otherGereja.id)

        const result = isSubdomainUnik(targetGereja.subdomain, gerejaList, otherGereja.id)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it("isSubdomainUnik selalu mengembalikan true untuk list kosong", () => {
    fc.assert(
      fc.property(validSubdomainArb, (subdomain) => {
        const result = isSubdomainUnik(subdomain, [])
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})
