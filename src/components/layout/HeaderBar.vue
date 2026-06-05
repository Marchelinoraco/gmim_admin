<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { Menu, Shield, LogOut } from "lucide-vue-next"
import { useAdminAuthStore } from "@/stores/adminAuthStore"

const emit    = defineEmits(["toggleSidebar"])
const route   = useRoute()
const router  = useRouter()
const auth    = useAdminAuthStore()

const breadcrumb = computed(() => {
  const p = route.path
  if (p.startsWith("/super-admin/gereja/") && p.endsWith("/edit")) return ["Gereja", "Edit"]
  if (p.match(/^\/super-admin\/gereja\/[^/]+$/))                   return ["Gereja", "Detail"]
  if (p === "/super-admin/gereja/tambah")                          return ["Gereja", "Tambah"]
  if (p === "/super-admin/gereja")                                 return ["Gereja"]
  if (p.startsWith("/super-admin/bendahara/") && p.endsWith("/edit")) return ["Bendahara", "Edit"]
  if (p.match(/^\/super-admin\/bendahara\/[^/]+$/))                return ["Bendahara", "Detail"]
  if (p === "/super-admin/bendahara/tambah")                       return ["Bendahara", "Tambah"]
  if (p === "/super-admin/bendahara")                              return ["Bendahara"]
  if (p === "/super-admin/langganan")                              return ["Langganan"]
  return ["Dashboard"]
})

async function handleLogout() {
  await auth.logout()
  router.push({ name: "Login" })
}
</script>

<template>
  <header class="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-background border-b border-border">
    <div class="flex items-center gap-3">
      <button
        class="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent transition-colors"
        @click="emit('toggleSidebar')"
      >
        <Menu class="h-4 w-4" />
      </button>

      <nav class="flex items-center gap-1.5 text-sm">
        <span class="text-muted-foreground">Super Admin</span>
        <template v-for="(crumb, i) in breadcrumb" :key="i">
          <span class="text-muted-foreground">/</span>
          <span :class="i === breadcrumb.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'">
            {{ crumb }}
          </span>
        </template>
      </nav>
    </div>

    <div class="flex items-center gap-2">
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary shrink-0">
          <Shield class="h-3 w-3 text-primary-foreground" />
        </div>
        <span class="text-sm font-medium">{{ auth.nama || "Super Admin" }}</span>
      </div>
      <button
        class="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        <span class="hidden sm:inline">Logout</span>
      </button>
    </div>
  </header>
</template>
