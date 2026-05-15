<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["toggle"])

const route = useRoute()
const router = useRouter()

function isActive(menuRoute) {
  return route.path === menuRoute || route.path.startsWith(menuRoute + "/")
}

function navigateTo(menuRoute) {
  router.push(menuRoute)
  if (window.innerWidth < 768) {
    emit("toggle")
  }
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 md:relative md:translate-x-0"
    :class="[collapsed ? '-translate-x-full' : 'translate-x-0', 'w-64']"
  >
    <!-- App Header -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
      <div class="flex-shrink-0 w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <h2 class="text-sm font-semibold text-gray-900 truncate">GMIM Admin</h2>
        <p class="text-xs text-gray-500">Super Admin Panel</p>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <ul class="space-y-1">
        <!-- Dashboard -->
        <li>
          <button
            @click="navigateTo('/super-admin/dashboard')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
            :class="isActive('/super-admin/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              :class="isActive('/super-admin/dashboard') ? 'text-blue-600' : 'text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span>Dashboard</span>
          </button>
        </li>

        <!-- Gereja -->
        <li>
          <button
            @click="navigateTo('/super-admin/gereja')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
            :class="isActive('/super-admin/gereja') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              :class="isActive('/super-admin/gereja') ? 'text-blue-600' : 'text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Gereja</span>
          </button>
        </li>

        <!-- Bendahara -->
        <li>
          <button
            @click="navigateTo('/super-admin/bendahara')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
            :class="isActive('/super-admin/bendahara') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              :class="isActive('/super-admin/bendahara') ? 'text-blue-600' : 'text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Bendahara</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-gray-200">
      <p class="text-xs text-gray-400 text-center">GMIM Admin v1.0</p>
    </div>
  </aside>
</template>
