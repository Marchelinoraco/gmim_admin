import { describe, it, expect } from "vitest"
import { validasiSubdomain, isSubdomainUnik } from "./validasiSubdomain.js"

describe("validasiSubdomain", () => {
  it("mengembalikan error jika subdomain kosong", () => {
    expect(validasiSubdomain("")).toEqual({ valid: false, pesan: "Subdomain wajib diisi" })
    expect(validasiSubdomain(null)).toEqual({ valid: false, pesan: "Subdomain wajib diisi" })
    expect(validasiSubdomain(undefined)).toEqual({ valid: false, pesan: "Subdomain wajib diisi" })
    expect(validasiSubdomain("   ")).toEqual({ valid: false, pesan: "Subdomain wajib diisi" })
  })

  it("mengembalikan error jika subdomain kurang dari 3 karakter", () => {
    expect(validasiSubdomain("ab")).toEqual({ valid: false, pesan: "Subdomain harus antara 3-30 karakter" })
    expect(validasiSubdomain("a")).toEqual({ valid: false, pesan: "Subdomain harus antara 3-30 karakter" })
  })

  it("mengembalikan error jika subdomain lebih dari 30 karakter", () => {
    const longSubdomain = "a".repeat(31)
    expect(validasiSubdomain(longSubdomain)).toEqual({ valid: false, pesan: "Subdomain harus antara 3-30 karakter" })
  })

  it("mengembalikan error jika format subdomain tidak valid", () => {
    expect(validasiSubdomain("ABC")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
    expect(validasiSubdomain("sub_domain")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
    expect(validasiSubdomain("-subdomain")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
    expect(validasiSubdomain("subdomain-")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
    expect(validasiSubdomain("sub--domain")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
    expect(validasiSubdomain("sub domain")).toEqual({ valid: false, pesan: "Format subdomain tidak valid" })
  })

  it("mengembalikan valid untuk subdomain yang benar", () => {
    expect(validasiSubdomain("abc")).toEqual({ valid: true, pesan: "" })
    expect(validasiSubdomain("sion-manado")).toEqual({ valid: true, pesan: "" })
    expect(validasiSubdomain("gereja123")).toEqual({ valid: true, pesan: "" })
    expect(validasiSubdomain("eben-haezer-tomohon")).toEqual({ valid: true, pesan: "" })
    expect(validasiSubdomain("a1b")).toEqual({ valid: true, pesan: "" })
  })

  it("mengembalikan valid untuk subdomain tepat 3 karakter", () => {
    expect(validasiSubdomain("abc")).toEqual({ valid: true, pesan: "" })
  })

  it("mengembalikan valid untuk subdomain tepat 30 karakter", () => {
    const subdomain30 = "a".repeat(30)
    expect(validasiSubdomain(subdomain30)).toEqual({ valid: true, pesan: "" })
  })
})

describe("isSubdomainUnik", () => {
  const gerejaList = [
    { id: "c-001", subdomain: "sion-manado" },
    { id: "c-002", subdomain: "eben-tomohon" },
    { id: "c-003", subdomain: "bethesda-bitung" }
  ]

  it("mengembalikan true jika subdomain belum digunakan", () => {
    expect(isSubdomainUnik("gereja-baru", gerejaList)).toBe(true)
  })

  it("mengembalikan false jika subdomain sudah digunakan", () => {
    expect(isSubdomainUnik("sion-manado", gerejaList)).toBe(false)
  })

  it("mengembalikan true jika subdomain digunakan oleh gereja yang di-exclude", () => {
    expect(isSubdomainUnik("sion-manado", gerejaList, "c-001")).toBe(true)
  })

  it("mengembalikan false jika subdomain digunakan oleh gereja lain (bukan yang di-exclude)", () => {
    expect(isSubdomainUnik("sion-manado", gerejaList, "c-002")).toBe(false)
  })

  it("mengembalikan true jika daftar gereja kosong", () => {
    expect(isSubdomainUnik("sion-manado", [])).toBe(true)
  })
})
