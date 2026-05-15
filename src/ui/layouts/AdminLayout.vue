<script setup lang="ts">
import SidebarNav from "../shared/SidebarNav.vue";
import TopBar from "../shared/TopBar.vue";
</script>

<template>
  <div class="shell">
    <aside class="sidebar card">
      <SidebarNav />
    </aside>

    <div class="main">
      <header class="topbar">
        <TopBar />
      </header>
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  padding: 18px;
  min-height: 100vh;
}

.sidebar {
  padding: 14px;
  position: sticky;
  top: 18px;
  height: calc(100vh - 36px);
  overflow: auto;
}

.main {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 18px;
  z-index: 10;
}

.content {
  min-width: 0;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: relative;
    height: auto;
  }
  .topbar {
    top: 0;
  }
}
</style>
