<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const title = computed(() => {
  const path = route.path;
  if (path.includes("/super-admin/churches")) return "Manajemen Gereja";
  if (path.includes("/super-admin/treasurers")) return "Manajemen Bendahara";
  if (
    path.includes("/super-admin/subscriptions") ||
    path.includes("/super-admin/payments") ||
    path.includes("/super-admin/subscription-history")
  ) {
    return "Manajemen Langganan";
  }
  if (path.includes("/super-admin/monitoring")) return "Monitoring Sistem";
  if (path.includes("/super-admin/settings")) return "Pengaturan Sistem";
  return "Dashboard Super Admin";
});
</script>

<template>
  <div class="wrap card">
    <div class="left">
      <div class="title">{{ title }}</div>
      <div class="subtitle chip">Panel Super Admin</div>
    </div>
    <div class="right">
      <button class="btn">Ekspor</button>
      <button class="btn primary">Tambah</button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.title {
  font-weight: 700;
  letter-spacing: 0.2px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  white-space: nowrap;
}

.right {
  display: flex;
  gap: 10px;
}
</style>
