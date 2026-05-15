<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"

const emit = defineEmits(["toggleSidebar"])

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    "/super-admin/dashboard": "Dashboard",
    "/super-admin/gereja": "Daftar Gereja",
    "/super-admin/gereja/tambah": "Tambah Gereja",
    "/super-admin/bendahara": "Daftar Bendahara",
    "/super-admin/bendahara/tambah": "Tambah Bendahara"
  }

  // Check exact match first
  if (titles[route.path]) return titles[route.path]

  // Check for detail/edit routes
  if (route.path.match(/^\/super-admin\/gereja\/[^/]+\/edit$/)) return "Edit Gereja"
  if (route.path.match(/^\/super-admin\/gereja\/[^/]+$/)) return "Detail Gereja"
  if (route.path.match(/^\/super-admin\/bendahara\/[^/]+\/edit$/)) return "Edit Bendahara"
  if (route.path.match(/^\/super-admin\/bendahara\/[^/]+$/)) return "Detail Bendahara"

  return "Dashboard"
})
</script>

<template>
  <header
    class="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200"
  >
    <!-- Left: Mobile menu toggle + Page title -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger button -->
      <button
        @click="emit('toggleSidebar')"
        class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
    </div>

    <!-- Right: Admin badge -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 text-sm font-medium">SA</span>
        </div>
        <div class="hidden sm:block text-right">
          <p class="text-sm font-medium text-gray-700 leading-tight">Super Admin</p>
        </div>
      </div>
    </div>
  </header>
</template>
