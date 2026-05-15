import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import * as fc from "fast-check"
import { useGerejaStore } from "./gerejaStore"

/**
 * Validates: Requirements 1.4, 2.7, 2.8, 3.1
 */

// === GENERATORS ===

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
  .filter((s) => s.length >= 3 && s.length <= 30)

// Generator: unique subdomain that won't collide with dummy data
const uniqueSubdomainArb = validSubdomainArb.filter(
  (s) => s !== "sion-manado" && s !== "eben-tomohon" && s !== "bethesda-bitung"
)

// Generator: valid gereja input
const validGerejaInputArb = uniqueSubdomainArb.map((subdomain) => ({
  nama: "Gereja Test",
  alamat: "Jl. Test",
  namaPendeta: "Pdt. Test",
  telepon: "0812-0000-0000",
  subdomain,
  paketLangganan: "Basic",
  statusLangganan: "trial"
}))

// Generator: statusDomain values
const statusDomainArb = fc.constantFrom("aktif", "pending", "nonaktif")

// Generator: array of gereja inputs with unique subdomains
const uniqueGerejaInputsArb = fc
  .array(uniqueSubdomainArb, { minLength: 1, maxLength: 5 })
  .filter((subdomains) => new Set(subdomains).size === subdomains.length)
  .map((subdomains) =>
    subdomains.map((subdomain) => ({
      nama: "Gereja " + subdomain,
      alamat: "Jl. " + subdomain,
      namaPendeta: "Pdt. " + subdomain,
      telepon: "0812-0000-0000",
      subdomain,
      paketLangganan: "Basic",
      statusLangganan: "trial"
    }))
  )

// === TESTS ===

describe("Feature: domain-dan-bendahara-management, Property 3: Gereja Baru Selalu Berstatus Domain pending", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("tambahGereja selalu membuat gereja dengan statusDomain === 'pending' untuk input valid apapun", () => {
    fc.assert(
      fc.property(validGerejaInputArb, (input) => {
        const store = useGerejaStore()
        // Clear existing data to avoid subdomain collision
        store.gerejaList = []

        const result = store.tambahGereja(input)
        expect(result).not.toBe(false)
        expect(result.statusDomain).toBe("pending")
      }),
      { numRuns: 100 }
    )
  })

  it("tambahGereja mengabaikan statusDomain dari input dan selalu set ke 'pending'", () => {
    fc.assert(
      fc.property(validGerejaInputArb, statusDomainArb, (input, forcedStatus) => {
        const store = useGerejaStore()
        store.gerejaList = []

        // Try to force a different statusDomain via input
        const inputWithStatus = { ...input, statusDomain: forcedStatus }
        const result = store.tambahGereja(inputWithStatus)

        expect(result).not.toBe(false)
        expect(result.statusDomain).toBe("pending")
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 4: Transisi Status Domain", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("aktifkanDomain mengubah statusDomain menjadi 'aktif' untuk gereja manapun di store", () => {
    fc.assert(
      fc.property(validGerejaInputArb, (input) => {
        const store = useGerejaStore()
        store.gerejaList = []

        const gereja = store.tambahGereja(input)
        expect(gereja).not.toBe(false)

        const success = store.aktifkanDomain(gereja.id)
        expect(success).toBe(true)

        const updated = store.getById(gereja.id)
        expect(updated.statusDomain).toBe("aktif")
      }),
      { numRuns: 100 }
    )
  })

  it("nonaktifkanDomain mengubah statusDomain menjadi 'nonaktif' untuk gereja manapun di store", () => {
    fc.assert(
      fc.property(validGerejaInputArb, (input) => {
        const store = useGerejaStore()
        store.gerejaList = []

        const gereja = store.tambahGereja(input)
        expect(gereja).not.toBe(false)

        // First activate, then deactivate
        store.aktifkanDomain(gereja.id)
        const success = store.nonaktifkanDomain(gereja.id)
        expect(success).toBe(true)

        const updated = store.getById(gereja.id)
        expect(updated.statusDomain).toBe("nonaktif")
      }),
      { numRuns: 100 }
    )
  })

  it("aktifkanDomain dari status 'nonaktif' mengubah ke 'aktif'", () => {
    fc.assert(
      fc.property(validGerejaInputArb, (input) => {
        const store = useGerejaStore()
        store.gerejaList = []

        const gereja = store.tambahGereja(input)
        expect(gereja).not.toBe(false)

        // Set to nonaktif first
        store.nonaktifkanDomain(gereja.id)
        expect(store.getById(gereja.id).statusDomain).toBe("nonaktif")

        // Then activate
        const success = store.aktifkanDomain(gereja.id)
        expect(success).toBe(true)
        expect(store.getById(gereja.id).statusDomain).toBe("aktif")
      }),
      { numRuns: 100 }
    )
  })

  it("aktifkanDomain dan nonaktifkanDomain mengembalikan false untuk id yang tidak ada", () => {
    fc.assert(
      fc.property(fc.uuid(), (fakeId) => {
        const store = useGerejaStore()
        store.gerejaList = []

        expect(store.aktifkanDomain(fakeId)).toBe(false)
        expect(store.nonaktifkanDomain(fakeId)).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 5: Filter Gereja Aktif dan Pending", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("gerejaAktifDanPending tidak pernah mengandung gereja dengan statusDomain 'nonaktif'", () => {
    fc.assert(
      fc.property(
        uniqueGerejaInputsArb,
        fc.array(statusDomainArb, { minLength: 1, maxLength: 5 }),
        (inputs, statuses) => {
          const store = useGerejaStore()
          store.gerejaList = []

          // Add gereja and assign various statuses
          const addedGereja = []
          for (const input of inputs) {
            const gereja = store.tambahGereja(input)
            if (gereja) addedGereja.push(gereja)
          }

          // Assign statuses to added gereja
          for (let i = 0; i < addedGereja.length; i++) {
            const status = statuses[i % statuses.length]
            if (status === "aktif") {
              store.aktifkanDomain(addedGereja[i].id)
            } else if (status === "nonaktif") {
              store.nonaktifkanDomain(addedGereja[i].id)
            }
            // "pending" is already the default
          }

          // Verify: gerejaAktifDanPending never contains nonaktif
          const filtered = store.gerejaAktifDanPending
          for (const g of filtered) {
            expect(g.statusDomain).not.toBe("nonaktif")
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it("gerejaAktifDanPending mengandung semua gereja dengan statusDomain 'aktif' atau 'pending'", () => {
    fc.assert(
      fc.property(
        uniqueGerejaInputsArb,
        fc.array(statusDomainArb, { minLength: 1, maxLength: 5 }),
        (inputs, statuses) => {
          const store = useGerejaStore()
          store.gerejaList = []

          // Add gereja and assign various statuses
          const addedGereja = []
          for (const input of inputs) {
            const gereja = store.tambahGereja(input)
            if (gereja) addedGereja.push(gereja)
          }

          // Assign statuses
          for (let i = 0; i < addedGereja.length; i++) {
            const status = statuses[i % statuses.length]
            if (status === "aktif") {
              store.aktifkanDomain(addedGereja[i].id)
            } else if (status === "nonaktif") {
              store.nonaktifkanDomain(addedGereja[i].id)
            }
          }

          // Verify: all aktif/pending gereja are in the filtered list
          const filtered = store.gerejaAktifDanPending
          const filteredIds = filtered.map((g) => g.id)

          for (const g of store.gerejaList) {
            if (g.statusDomain === "aktif" || g.statusDomain === "pending") {
              expect(filteredIds).toContain(g.id)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it("jumlah gerejaAktifDanPending === jumlah gereja dengan statusDomain aktif + pending", () => {
    fc.assert(
      fc.property(
        uniqueGerejaInputsArb,
        fc.array(statusDomainArb, { minLength: 1, maxLength: 5 }),
        (inputs, statuses) => {
          const store = useGerejaStore()
          store.gerejaList = []

          const addedGereja = []
          for (const input of inputs) {
            const gereja = store.tambahGereja(input)
            if (gereja) addedGereja.push(gereja)
          }

          // Assign statuses
          for (let i = 0; i < addedGereja.length; i++) {
            const status = statuses[i % statuses.length]
            if (status === "aktif") {
              store.aktifkanDomain(addedGereja[i].id)
            } else if (status === "nonaktif") {
              store.nonaktifkanDomain(addedGereja[i].id)
            }
          }

          const expectedCount = store.gerejaList.filter((g) => g.statusDomain !== "nonaktif").length
          expect(store.gerejaAktifDanPending.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })
})
