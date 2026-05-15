<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import SidebarNav from "@/components/layout/SidebarNav.vue"
import HeaderBar from "@/components/layout/HeaderBar.vue"

// Sidebar state — collapsed on mobile by default
const sidebarCollapsed = ref(true)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function closeSidebarOnResize() {
  if (window.innerWidth >= 768) {
    sidebarCollapsed.value = false
  } else {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  closeSidebarOnResize()
  window.addEventListener("resize", closeSidebarOnResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", closeSidebarOnResize)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <SidebarNav :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <!-- Overlay for mobile when sidebar is open -->
    <div v-if="!sidebarCollapsed" class="fixed inset-0 z-20 bg-black/50 md:hidden" @click="toggleSidebar" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <HeaderBar @toggleSidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="flex-1 p-4 md:p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
