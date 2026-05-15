import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useBendaharaStore } from "./bendaharaStore"

describe("bendaharaStore", () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useBendaharaStore()
  })

  describe("state", () => {
    it("initializes bendaharaList from dummy data", () => {
      expect(store.bendaharaList.length).toBeGreaterThan(0)
    })

    it("initializes notifikasi as null", () => {
      expect(store.notifikasi).toBeNull()
    })
  })

  describe("bendaharaByGereja", () => {
    it("returns bendahara filtered by gerejaId", () => {
      const result = store.bendaharaByGereja("c-001")
      expect(result.every((b) => b.gerejaId === "c-001")).toBe(true)
    })

    it("returns empty array for non-existent gerejaId", () => {
      const result = store.bendaharaByGereja("non-existent")
      expect(result).toEqual([])
    })
  })

  describe("getById", () => {
    it("returns bendahara by id", () => {
      const result = store.getById("u-100")
      expect(result).toBeDefined()
      expect(result.id).toBe("u-100")
    })

    it("returns undefined for non-existent id", () => {
      const result = store.getById("non-existent")
      expect(result).toBeUndefined()
    })
  })

  describe("tambahBendahara", () => {
    it("adds new bendahara with status active", () => {
      const input = {
        namaLengkap: "Test User",
        email: "test@example.com",
        gerejaId: "c-001",
        telepon: "0812-0000-0000",
        role: "Bendahara"
      }
      const result = store.tambahBendahara(input)
      expect(result.status).toBe("active")
      expect(result.id).toMatch(/^u-[a-z0-9]{6}$/)
      expect(result.namaLengkap).toBe("Test User")
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.loginTerakhir).toBeNull()
    })

    it("sets success notification", () => {
      store.tambahBendahara({
        namaLengkap: "Test",
        email: "t@t.com",
        gerejaId: "c-001",
        telepon: "0812",
        role: "Bendahara"
      })
      expect(store.notifikasi.type).toBe("success")
    })
  })

  describe("updateBendahara", () => {
    it("updates bendahara fields and sets updatedAt", () => {
      const result = store.updateBendahara("u-100", { namaLengkap: "Updated Name" })
      expect(result.namaLengkap).toBe("Updated Name")
      expect(result.updatedAt).toBeDefined()
    })

    it("returns null for non-existent id", () => {
      const result = store.updateBendahara("non-existent", { namaLengkap: "X" })
      expect(result).toBeNull()
      expect(store.notifikasi.type).toBe("error")
    })
  })

  describe("hapusBendahara", () => {
    it("removes bendahara and returns true", () => {
      const initialLength = store.bendaharaList.length
      const result = store.hapusBendahara("u-100")
      expect(result).toBe(true)
      expect(store.bendaharaList.length).toBe(initialLength - 1)
    })

    it("returns false for non-existent id", () => {
      const result = store.hapusBendahara("non-existent")
      expect(result).toBe(false)
      expect(store.notifikasi.type).toBe("error")
    })
  })

  describe("toggleStatus", () => {
    it("toggles active to disabled", () => {
      const bendahara = store.getById("u-100")
      expect(bendahara.status).toBe("active")
      const result = store.toggleStatus("u-100")
      expect(result.status).toBe("disabled")
      expect(store.notifikasi.type).toBe("success")
    })

    it("toggles disabled to active", () => {
      const bendahara = store.getById("u-102")
      expect(bendahara.status).toBe("disabled")
      const result = store.toggleStatus("u-102")
      expect(result.status).toBe("active")
      expect(store.notifikasi.type).toBe("success")
    })

    it("returns null and sets error for non-existent id", () => {
      const result = store.toggleStatus("non-existent")
      expect(result).toBeNull()
      expect(store.notifikasi.type).toBe("error")
    })
  })

  describe("resetPassword", () => {
    it("returns true for existing bendahara", () => {
      const result = store.resetPassword("u-100", "newpassword123")
      expect(result).toBe(true)
      expect(store.notifikasi.type).toBe("success")
    })

    it("returns false for non-existent bendahara", () => {
      const result = store.resetPassword("non-existent", "newpassword123")
      expect(result).toBe(false)
      expect(store.notifikasi.type).toBe("error")
    })
  })

  describe("isEmailTerdaftar", () => {
    it("returns true if email exists for same gereja", () => {
      const result = store.isEmailTerdaftar("yohanes@sion-manado.id", "c-001")
      expect(result).toBe(true)
    })

    it("returns false if email exists for different gereja", () => {
      const result = store.isEmailTerdaftar("yohanes@sion-manado.id", "c-002")
      expect(result).toBe(false)
    })

    it("excludes bendahara with excludeId", () => {
      const result = store.isEmailTerdaftar("yohanes@sion-manado.id", "c-001", "u-100")
      expect(result).toBe(false)
    })
  })

  describe("filterBendahara", () => {
    const gerejaList = [
      { id: "c-001", nama: "GMIM Sion Manado" },
      { id: "c-002", nama: "GMIM Eben Haezer Tomohon" },
      { id: "c-003", nama: "GMIM Bethesda Bitung" }
    ]

    it("returns all when no filters applied", () => {
      const result = store.filterBendahara("", "", "", gerejaList)
      expect(result.length).toBe(store.bendaharaList.length)
    })

    it("filters by pencarian (nama)", () => {
      const result = store.filterBendahara("Yohanes", "", "", gerejaList)
      expect(result.length).toBe(1)
      expect(result[0].namaLengkap).toBe("Yohanes W.")
    })

    it("filters by pencarian (email)", () => {
      const result = store.filterBendahara("debora@", "", "", gerejaList)
      expect(result.length).toBe(1)
      expect(result[0].email).toBe("debora@eben-tomohon.id")
    })

    it("filters by pencarian (nama gereja)", () => {
      const result = store.filterBendahara("Sion", "", "", gerejaList)
      expect(result.length).toBe(1)
      expect(result[0].gerejaId).toBe("c-001")
    })

    it("filters by gereja", () => {
      const result = store.filterBendahara("", "c-002", "", gerejaList)
      expect(result.every((b) => b.gerejaId === "c-002")).toBe(true)
    })

    it("filters by status", () => {
      const result = store.filterBendahara("", "", "disabled", gerejaList)
      expect(result.every((b) => b.status === "disabled")).toBe(true)
    })

    it("applies AND logic for combined filters", () => {
      const result = store.filterBendahara("", "c-001", "active", gerejaList)
      expect(result.every((b) => b.gerejaId === "c-001" && b.status === "active")).toBe(true)
    })

    it("is case-insensitive for pencarian", () => {
      const result = store.filterBendahara("yohanes", "", "", gerejaList)
      expect(result.length).toBe(1)
    })
  })
})
