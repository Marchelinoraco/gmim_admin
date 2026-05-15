import { describe, it, expect, beforeEach } from "vitest"
import * as fc from "fast-check"
import { setActivePinia, createPinia } from "pinia"
import { useBendaharaStore } from "./bendaharaStore"

/**
 * Validates: Requirements 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3
 */

// === GENERATORS ===

// Generator: valid email
const emailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{1,8}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{1,6}$/),
    fc.constantFrom("com", "id", "org", "net")
  )
  .map(([user, domain, tld]) => `${user}@${domain}.${tld}`)

// Generator: valid gerejaId
const gerejaIdArb = fc.stringMatching(/^c-[0-9]{3}$/)

// Generator: valid role
const roleArb = fc.constantFrom("Admin Gereja", "Bendahara", "Viewer / Majelis")

// Generator: valid status
const statusArb = fc.constantFrom("active", "disabled")

// Generator: valid nama lengkap (2-100 chars)
const namaLengkapArb = fc.stringMatching(/^[A-Za-z][A-Za-z ]{1,20}$/)

// Generator: valid telepon
const teleponArb = fc.stringMatching(/^08[0-9]{2}-[0-9]{4}-[0-9]{4}$/)

// Generator: valid bendahara input for tambahBendahara
const bendaharaInputArb = fc.record({
  namaLengkap: namaLengkapArb,
  email: emailArb,
  gerejaId: gerejaIdArb,
  telepon: teleponArb,
  role: roleArb
})

// Generator: bendahara object (as stored in the list)
const bendaharaArb = fc.record({
  id: fc.uuid(),
  namaLengkap: namaLengkapArb,
  email: emailArb,
  gerejaId: gerejaIdArb,
  telepon: teleponArb,
  role: roleArb,
  status: statusArb,
  loginTerakhir: fc.constant(null),
  createdAt: fc.constant("01/01/2026 08:00:00"),
  updatedAt: fc.constant("01/01/2026 08:00:00")
})

// Generator: list of bendahara
const bendaharaListArb = fc.array(bendaharaArb, { minLength: 1, maxLength: 10 })

// Generator: gereja object (for filterBendahara)
const gerejaArb = fc.record({
  id: gerejaIdArb,
  nama: fc.stringMatching(/^GMIM [A-Za-z]{3,10}$/)
})

// Generator: gereja list
const gerejaListArb = fc.array(gerejaArb, { minLength: 1, maxLength: 5 })

// === TESTS ===

describe("Feature: domain-dan-bendahara-management, Property 7: Keunikan Email per Gereja", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("isEmailTerdaftar returns true iff ada bendahara lain (bukan excludeId) dengan email DAN gerejaId yang sama", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), (list, indexRaw) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const target = list[index]

        // Check with a different excludeId — should find the target
        const result = store.isEmailTerdaftar(target.email, target.gerejaId, "non-existent-id")
        expect(result).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it("isEmailTerdaftar returns false when email exists but gerejaId is different", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), gerejaIdArb, (list, indexRaw, differentGerejaId) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const target = list[index]

        // Ensure the differentGerejaId is actually different
        fc.pre(differentGerejaId !== target.gerejaId)
        // Ensure no other bendahara has same email AND the different gerejaId
        fc.pre(!list.some((b) => b.email === target.email && b.gerejaId === differentGerejaId))

        const result = store.isEmailTerdaftar(target.email, differentGerejaId, null)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it("isEmailTerdaftar returns false when excludeId matches the only bendahara with that email+gereja", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), (list, indexRaw) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const target = list[index]

        // Ensure only one bendahara has this email+gerejaId combo
        const sameCombo = list.filter((b) => b.email === target.email && b.gerejaId === target.gerejaId)
        fc.pre(sameCombo.length === 1)

        const result = store.isEmailTerdaftar(target.email, target.gerejaId, target.id)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it("isEmailTerdaftar returns false for email not in list", () => {
    fc.assert(
      fc.property(bendaharaListArb, emailArb, gerejaIdArb, (list, email, gerejaId) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        // Ensure email is not in the list for this gereja
        fc.pre(!list.some((b) => b.email === email && b.gerejaId === gerejaId))

        const result = store.isEmailTerdaftar(email, gerejaId, null)
        expect(result).toBe(false)
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 8: Bendahara Baru Selalu Berstatus active", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("tambahBendahara selalu membuat bendahara dengan status === 'active' untuk input apapun", () => {
    fc.assert(
      fc.property(bendaharaInputArb, (input) => {
        const store = useBendaharaStore()
        const result = store.tambahBendahara(input)

        expect(result.status).toBe("active")
      }),
      { numRuns: 100 }
    )
  })

  it("tambahBendahara mengabaikan status dari input dan selalu set 'active'", () => {
    fc.assert(
      fc.property(bendaharaInputArb, statusArb, (input, forcedStatus) => {
        const store = useBendaharaStore()
        // Try to force a different status via input
        const inputWithStatus = { ...input, status: forcedStatus }
        const result = store.tambahBendahara(inputWithStatus)

        expect(result.status).toBe("active")
      }),
      { numRuns: 100 }
    )
  })

  it("tambahBendahara menyimpan semua field input dengan benar", () => {
    fc.assert(
      fc.property(bendaharaInputArb, (input) => {
        const store = useBendaharaStore()
        const result = store.tambahBendahara(input)

        expect(result.namaLengkap).toBe(input.namaLengkap)
        expect(result.email).toBe(input.email)
        expect(result.gerejaId).toBe(input.gerejaId)
        expect(result.telepon).toBe(input.telepon)
        expect(result.role).toBe(input.role)
        expect(result.id).toBeDefined()
        expect(result.createdAt).toBeDefined()
        expect(result.updatedAt).toBeDefined()
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 9: Filter Kombinasi Bendahara (Logika AND)", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("filterBendahara dengan filterGereja hanya mengembalikan bendahara dengan gerejaId yang cocok", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), gerejaListArb, (list, indexRaw, gerejaList) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const targetGerejaId = list[index].gerejaId

        const result = store.filterBendahara("", targetGerejaId, "", gerejaList)

        result.forEach((b) => {
          expect(b.gerejaId).toBe(targetGerejaId)
        })
      }),
      { numRuns: 100 }
    )
  })

  it("filterBendahara dengan filterStatus hanya mengembalikan bendahara dengan status yang cocok", () => {
    fc.assert(
      fc.property(bendaharaListArb, statusArb, gerejaListArb, (list, status, gerejaList) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const result = store.filterBendahara("", "", status, gerejaList)

        result.forEach((b) => {
          expect(b.status).toBe(status)
        })
      }),
      { numRuns: 100 }
    )
  })

  it("filterBendahara dengan pencarian hanya mengembalikan bendahara yang cocok nama/email/namaGereja (case-insensitive)", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), gerejaListArb, (list, indexRaw, gerejaList) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const target = list[index]
        // Use part of the name as search keyword
        const keyword = target.namaLengkap.slice(0, 3)

        const result = store.filterBendahara(keyword, "", "", gerejaList)

        result.forEach((b) => {
          const namaGereja = gerejaList.find((g) => g.id === b.gerejaId)?.nama || ""
          const matchesNama = b.namaLengkap.toLowerCase().includes(keyword.toLowerCase())
          const matchesEmail = b.email.toLowerCase().includes(keyword.toLowerCase())
          const matchesGereja = namaGereja.toLowerCase().includes(keyword.toLowerCase())
          expect(matchesNama || matchesEmail || matchesGereja).toBe(true)
        })
      }),
      { numRuns: 100 }
    )
  })

  it("filterBendahara dengan kombinasi filter mengembalikan hanya item yang memenuhi SEMUA kriteria (AND)", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.nat(), statusArb, gerejaListArb, (list, indexRaw, status, gerejaList) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const index = indexRaw % list.length
        const target = list[index]
        const keyword = target.namaLengkap.slice(0, 2)
        const targetGerejaId = target.gerejaId

        const result = store.filterBendahara(keyword, targetGerejaId, status, gerejaList)

        result.forEach((b) => {
          // Must match gereja
          expect(b.gerejaId).toBe(targetGerejaId)
          // Must match status
          expect(b.status).toBe(status)
          // Must match search keyword
          const namaGereja = gerejaList.find((g) => g.id === b.gerejaId)?.nama || ""
          const matchesNama = b.namaLengkap.toLowerCase().includes(keyword.toLowerCase())
          const matchesEmail = b.email.toLowerCase().includes(keyword.toLowerCase())
          const matchesGereja = namaGereja.toLowerCase().includes(keyword.toLowerCase())
          expect(matchesNama || matchesEmail || matchesGereja).toBe(true)
        })
      }),
      { numRuns: 100 }
    )
  })

  it("filterBendahara tanpa filter mengembalikan semua bendahara", () => {
    fc.assert(
      fc.property(bendaharaListArb, gerejaListArb, (list, gerejaList) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        const result = store.filterBendahara("", "", "", gerejaList)

        expect(result.length).toBe(list.length)
      }),
      { numRuns: 100 }
    )
  })
})

describe("Feature: domain-dan-bendahara-management, Property 10: Toggle Status Bendahara", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("toggleStatus mengubah 'active' menjadi 'disabled'", () => {
    fc.assert(
      fc.property(bendaharaArb, (bendahara) => {
        const store = useBendaharaStore()
        const activeBendahara = { ...bendahara, status: "active" }
        store.bendaharaList = [activeBendahara]

        store.toggleStatus(activeBendahara.id)

        const updated = store.getById(activeBendahara.id)
        expect(updated.status).toBe("disabled")
      }),
      { numRuns: 100 }
    )
  })

  it("toggleStatus mengubah 'disabled' menjadi 'active'", () => {
    fc.assert(
      fc.property(bendaharaArb, (bendahara) => {
        const store = useBendaharaStore()
        const disabledBendahara = { ...bendahara, status: "disabled" }
        store.bendaharaList = [disabledBendahara]

        store.toggleStatus(disabledBendahara.id)

        const updated = store.getById(disabledBendahara.id)
        expect(updated.status).toBe("active")
      }),
      { numRuns: 100 }
    )
  })

  it("toggleStatus dua kali mengembalikan status ke semula", () => {
    fc.assert(
      fc.property(bendaharaArb, (bendahara) => {
        const store = useBendaharaStore()
        store.bendaharaList = [{ ...bendahara }]
        const originalStatus = bendahara.status

        store.toggleStatus(bendahara.id)
        store.toggleStatus(bendahara.id)

        const updated = store.getById(bendahara.id)
        expect(updated.status).toBe(originalStatus)
      }),
      { numRuns: 100 }
    )
  })

  it("toggleStatus mengembalikan null untuk id yang tidak ditemukan", () => {
    fc.assert(
      fc.property(bendaharaListArb, fc.uuid(), (list, nonExistentId) => {
        const store = useBendaharaStore()
        store.bendaharaList = [...list]

        // Ensure the id doesn't exist
        fc.pre(!list.some((b) => b.id === nonExistentId))

        const result = store.toggleStatus(nonExistentId)
        expect(result).toBeNull()
      }),
      { numRuns: 100 }
    )
  })
})
