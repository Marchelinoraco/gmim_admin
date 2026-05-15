<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

type NavItem = { label: string; to: string; icon: string };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Super Admin",
    items: [{ label: "Dashboard", to: "/super-admin/dashboard", icon: "📊" }]
  },
  {
    title: "Manajemen",
    items: [
      { label: "Gereja", to: "/super-admin/churches", icon: "⛪" },
      { label: "Bendahara", to: "/super-admin/treasurers", icon: "👤" },
      { label: "Langganan", to: "/super-admin/subscriptions", icon: "💳" }
    ]
  },
  {
    title: "Monitoring",
    items: [{ label: "Sistem", to: "/super-admin/monitoring", icon: "🧾" }]
  },
  {
    title: "Pengaturan",
    items: [{ label: "Sistem", to: "/super-admin/settings", icon: "⚙️" }]
  }
];

const route = useRoute();
const activePath = computed(() => route.path);
</script>

<template>
  <div class="brand">
    <div class="logo">GMIM</div>
    <div class="meta">
      <div class="name">gmim_admin</div>
      <div class="desc">Panel Super Admin</div>
    </div>
  </div>

  <div class="groups">
    <div v-for="g in groups" :key="g.title" class="group">
      <div class="group-title">{{ g.title }}</div>
      <RouterLink
        v-for="item in g.items"
        :key="item.to"
        :to="item.to"
        class="item"
        :class="{ active: activePath.startsWith(item.to) }"
      >
        <span class="icon">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </div>

  <div class="footer">
    <div class="chip">Dummy data • Vue 3</div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 10px 14px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(91, 140, 255, 0.35),
    rgba(91, 140, 255, 0.1)
  );
  border: 1px solid rgba(91, 140, 255, 0.35);
  font-weight: 800;
  letter-spacing: 0.3px;
}

.meta .name {
  font-weight: 700;
}

.meta .desc {
  font-size: 12px;
  color: var(--muted);
}

.groups {
  display: grid;
  gap: 14px;
}

.group-title {
  font-size: 12px;
  color: var(--muted);
  margin: 0 8px 8px;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  color: rgba(233, 238, 252, 0.9);
}

.item:hover {
  border-color: rgba(91, 140, 255, 0.3);
  background: rgba(18, 32, 58, 0.55);
}

.item.active {
  border-color: rgba(91, 140, 255, 0.45);
  background: rgba(91, 140, 255, 0.12);
}

.icon {
  width: 20px;
}

.footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}
</style>
