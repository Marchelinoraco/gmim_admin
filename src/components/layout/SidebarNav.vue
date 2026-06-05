<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { LayoutDashboard, Church, Users, CreditCard, ChevronRight, Shield } from "lucide-vue-next"
import { cn } from "@/lib/utils"

defineProps({ collapsed: { type: Boolean, default: false } })
const emit = defineEmits(["toggle"])

const route  = useRoute()
const router = useRouter()

const active = computed(() => {
  const p = route.path
  return {
    dashboard:  p.startsWith("/super-admin/dashboard"),
    gereja:     p.startsWith("/super-admin/gereja"),
    bendahara:  p.startsWith("/super-admin/bendahara"),
    langganan:  p.startsWith("/super-admin/langganan"),
  }
})

const menus = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutDashboard, path: "/super-admin/dashboard" },
  { key: "gereja",     label: "Gereja",     icon: Church,          path: "/super-admin/gereja" },
  { key: "bendahara",  label: "Pengguna",   icon: Users,           path: "/super-admin/bendahara" },
  { key: "langganan",  label: "Langganan",  icon: CreditCard,      path: "/super-admin/langganan" },
]

function navigateTo(path) {
  router.push(path)
  if (window.innerWidth < 768) emit("toggle")
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:relative md:translate-x-0 w-64"
    :class="collapsed ? '-translate-x-full' : 'translate-x-0'"
  >
    <div class="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border shrink-0">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Shield class="h-4 w-4 text-primary-foreground" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-sidebar-foreground truncate">GMIM Admin</p>
        <p class="text-xs text-muted-foreground">Super Admin Panel</p>
      </div>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      <p class="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Menu</p>
      <button
        v-for="menu in menus"
        :key="menu.key"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        :class="active[menu.key]
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'"
        @click="navigateTo(menu.path)"
      >
        <component :is="menu.icon" class="h-4 w-4 shrink-0" />
        <span class="flex-1 text-left">{{ menu.label }}</span>
        <ChevronRight v-if="active[menu.key]" class="h-3 w-3" />
      </button>
    </nav>

    <div class="px-3 py-4 border-t border-sidebar-border">
      <p class="text-xs text-muted-foreground text-center">GMIM Keuangan v1.0</p>
    </div>
  </aside>
</template>
