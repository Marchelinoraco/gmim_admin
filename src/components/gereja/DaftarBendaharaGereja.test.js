import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { setActivePinia, createPinia } from "pinia"
import DaftarBendaharaGereja from "./DaftarBendaharaGereja.vue"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseTable from "@/components/ui/BaseTable.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

/**
 * Unit tests for DaftarBendaharaGereja.vue
 * Validates: Requirements 4.6, 6.5
 */

function createWrapper(gerejaId = "c-999") {
  return mount(DaftarBendaharaGereja, {
    props: { gerejaId },
    global: {
      components: { BaseCard, BaseTable, BaseButton }
    }
  })
}

describe("DaftarBendaharaGereja.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe("Empty state", () => {
    it('shows "Belum ada bendahara terdaftar" when no bendahara for the gereja', () => {
      // Use a gerejaId that has no bendahara in the dummy data
      const wrapper = createWrapper("c-999")
      expect(wrapper.text()).toContain("Belum ada bendahara terdaftar")
    })

    it('shows "Tambah Bendahara" button in empty state', () => {
      const wrapper = createWrapper("c-999")
      const buttons = wrapper.findAllComponents(BaseButton)
      const tambahBtn = buttons.find((b) => b.text() === "Tambah Bendahara")
      expect(tambahBtn).toBeDefined()
    })
  })

  describe("Tambah Bendahara button emits event", () => {
    it('emits "tambahBendahara" when Tambah Bendahara button is clicked in empty state', async () => {
      const wrapper = createWrapper("c-999")
      const buttons = wrapper.findAllComponents(BaseButton)
      const tambahBtn = buttons.find((b) => b.text() === "Tambah Bendahara")

      await tambahBtn.trigger("click")
      expect(wrapper.emitted("tambahBendahara")).toBeTruthy()
    })

    it('emits "tambahBendahara" when Tambah Bendahara button is clicked with existing data', async () => {
      // Set up store with bendahara for this gereja
      const store = useBendaharaStore()
      store.bendaharaList = [
        {
          id: "u-200",
          namaLengkap: "Test User",
          email: "test@test.com",
          gerejaId: "c-001",
          telepon: "0812-0000-0000",
          role: "Bendahara",
          status: "active",
          loginTerakhir: "2026-05-12T09:15:00.000Z",
          createdAt: "10/01/2026 09:00:00",
          updatedAt: "10/01/2026 09:00:00"
        }
      ]

      const wrapper = createWrapper("c-001")
      const buttons = wrapper.findAllComponents(BaseButton)
      const tambahBtn = buttons.find((b) => b.text() === "Tambah Bendahara")

      await tambahBtn.trigger("click")
      expect(wrapper.emitted("tambahBendahara")).toBeTruthy()
    })
  })
})
