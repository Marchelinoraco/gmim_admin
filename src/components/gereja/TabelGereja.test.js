import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import TabelGereja from "./TabelGereja.vue"
import BaseTable from "@/components/ui/BaseTable.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

/**
 * Unit tests for TabelGereja.vue
 * Validates: Requirements 1.5, 2.2, 2.3, 2.4
 */

const sampleData = [
  {
    id: "c-001",
    nama: "GMIM Sion Manado",
    subdomain: "sion-manado",
    statusDomain: "aktif",
    paketLangganan: "Premium"
  },
  {
    id: "c-002",
    nama: "GMIM Eben Haezer Tomohon",
    subdomain: "eben-tomohon",
    statusDomain: "pending",
    paketLangganan: "Standard"
  },
  {
    id: "c-003",
    nama: "GMIM Bethesda Bitung",
    subdomain: "bethesda-bitung",
    statusDomain: "nonaktif",
    paketLangganan: "Basic"
  }
]

function createWrapper(data = sampleData) {
  return mount(TabelGereja, {
    props: { data },
    global: {
      components: { BaseTable, BaseButton }
    }
  })
}

describe("TabelGereja.vue", () => {
  describe("Badge renders correct color class for each statusDomain", () => {
    it('renders green badge for "aktif" status', () => {
      const wrapper = createWrapper()
      const badges = wrapper.findAll(".rounded-full")
      const aktifBadge = badges.find((b) => b.text() === "Aktif")
      expect(aktifBadge).toBeDefined()
      expect(aktifBadge.classes()).toContain("bg-green-50")
      expect(aktifBadge.classes()).toContain("text-green-700")
    })

    it('renders yellow badge for "pending" status', () => {
      const wrapper = createWrapper()
      const badges = wrapper.findAll(".rounded-full")
      const pendingBadge = badges.find((b) => b.text() === "Pending")
      expect(pendingBadge).toBeDefined()
      expect(pendingBadge.classes()).toContain("bg-yellow-50")
      expect(pendingBadge.classes()).toContain("text-yellow-700")
    })

    it('renders red badge for "nonaktif" status', () => {
      const wrapper = createWrapper()
      const badges = wrapper.findAll(".rounded-full")
      const nonaktifBadge = badges.find((b) => b.text() === "Nonaktif")
      expect(nonaktifBadge).toBeDefined()
      expect(nonaktifBadge.classes()).toContain("bg-red-50")
      expect(nonaktifBadge.classes()).toContain("text-red-700")
    })
  })

  describe("Event emissions", () => {
    it('emits "detail" event with row id when Detail button is clicked', async () => {
      const wrapper = createWrapper()
      const detailButtons = wrapper.findAllComponents(BaseButton).filter((b) => b.text() === "Detail")
      expect(detailButtons.length).toBeGreaterThan(0)

      await detailButtons[0].trigger("click")
      expect(wrapper.emitted("detail")).toBeTruthy()
      expect(wrapper.emitted("detail")[0]).toEqual(["c-001"])
    })

    it('emits "hapus" event with row id when Hapus button is clicked', async () => {
      const wrapper = createWrapper()
      const hapusButtons = wrapper.findAllComponents(BaseButton).filter((b) => b.text() === "Hapus")
      expect(hapusButtons.length).toBeGreaterThan(0)

      await hapusButtons[0].trigger("click")
      expect(wrapper.emitted("hapus")).toBeTruthy()
      expect(wrapper.emitted("hapus")[0]).toEqual(["c-001"])
    })
  })
})
