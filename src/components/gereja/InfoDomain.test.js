import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import InfoDomain from "./InfoDomain.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

/**
 * Unit tests for InfoDomain.vue
 * Validates: Requirements 1.5, 2.2, 2.3, 2.4, 2.5, 2.6
 */

function createWrapper(gereja) {
  return mount(InfoDomain, {
    props: { gereja },
    global: {
      components: { BaseCard, BaseButton }
    }
  })
}

describe("InfoDomain.vue", () => {
  describe("Badge renders correct color class for each statusDomain", () => {
    it('renders green badge when statusDomain is "aktif"', () => {
      const wrapper = createWrapper({
        subdomain: "sion-manado",
        statusDomain: "aktif"
      })
      const badge = wrapper.find(".rounded-full")
      expect(badge.classes()).toContain("bg-green-100")
      expect(badge.classes()).toContain("text-green-800")
      expect(badge.text()).toBe("Aktif")
    })

    it('renders yellow badge when statusDomain is "pending"', () => {
      const wrapper = createWrapper({
        subdomain: "eben-tomohon",
        statusDomain: "pending"
      })
      const badge = wrapper.find(".rounded-full")
      expect(badge.classes()).toContain("bg-yellow-100")
      expect(badge.classes()).toContain("text-yellow-800")
      expect(badge.text()).toBe("Pending")
    })

    it('renders red badge when statusDomain is "nonaktif"', () => {
      const wrapper = createWrapper({
        subdomain: "bethesda-bitung",
        statusDomain: "nonaktif"
      })
      const badge = wrapper.find(".rounded-full")
      expect(badge.classes()).toContain("bg-red-100")
      expect(badge.classes()).toContain("text-red-800")
      expect(badge.text()).toBe("Nonaktif")
    })
  })

  describe("Button visibility based on statusDomain", () => {
    it('shows "Aktifkan Domain" button when status is "pending"', () => {
      const wrapper = createWrapper({
        subdomain: "eben-tomohon",
        statusDomain: "pending"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).toContain("Aktifkan Domain")
    })

    it('shows "Aktifkan Domain" button when status is "nonaktif"', () => {
      const wrapper = createWrapper({
        subdomain: "bethesda-bitung",
        statusDomain: "nonaktif"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).toContain("Aktifkan Domain")
    })

    it('shows "Nonaktifkan Domain" button when status is "aktif"', () => {
      const wrapper = createWrapper({
        subdomain: "sion-manado",
        statusDomain: "aktif"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).toContain("Nonaktifkan Domain")
    })

    it('hides "Aktifkan Domain" button when status is "aktif"', () => {
      const wrapper = createWrapper({
        subdomain: "sion-manado",
        statusDomain: "aktif"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).not.toContain("Aktifkan Domain")
    })

    it('hides "Nonaktifkan Domain" button when status is "pending"', () => {
      const wrapper = createWrapper({
        subdomain: "eben-tomohon",
        statusDomain: "pending"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).not.toContain("Nonaktifkan Domain")
    })

    it('hides "Nonaktifkan Domain" button when status is "nonaktif"', () => {
      const wrapper = createWrapper({
        subdomain: "bethesda-bitung",
        statusDomain: "nonaktif"
      })
      const buttons = wrapper.findAllComponents(BaseButton)
      const texts = buttons.map((b) => b.text())
      expect(texts).not.toContain("Nonaktifkan Domain")
    })
  })

  describe("URL display", () => {
    it('displays URL correctly as "{subdomain}.gmimjadi.com"', () => {
      const wrapper = createWrapper({
        subdomain: "sion-manado",
        statusDomain: "aktif"
      })
      const urlElement = wrapper.find(".font-mono")
      expect(urlElement.text()).toBe("sion-manado.gmimjadi.com")
    })

    it("displays URL with different subdomain", () => {
      const wrapper = createWrapper({
        subdomain: "eben-tomohon",
        statusDomain: "pending"
      })
      const urlElement = wrapper.find(".font-mono")
      expect(urlElement.text()).toBe("eben-tomohon.gmimjadi.com")
    })
  })
})
