<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useChurchState } from "../../../../state/churchState";
import { translateSubscriptionStatus } from "../../../shared/labels";

const router = useRouter();
const { churches, remove, toggleActive } = useChurchState();

const q = ref("");
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return churches.value;
  return churches.value.filter((c) => {
    return (
      c.name.toLowerCase().includes(s) ||
      c.subdomain.toLowerCase().includes(s) ||
      c.packageName.toLowerCase().includes(s)
    );
  });
});

function goNew() {
  router.push("/super-admin/churches/new");
}
</script>

<template>
  <TableCard title="Daftar Gereja" subtitle="Manajemen gereja (dummy CRUD in-memory).">
    <template #actions>
      <div class="actions">
        <input v-model="q" class="search" placeholder="Cari nama/subdomain/paket…" />
        <button class="btn primary" @click="goNew">Tambah Gereja</button>
      </div>
    </template>

    <table class="table">
      <thead>
        <tr>
          <th>Nama Gereja</th>
          <th>Subdomain</th>
          <th>Status Langganan</th>
          <th>Paket</th>
          <th>Tanggal Bergabung</th>
          <th>Status</th>
          <th style="width: 220px">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filtered" :key="c.id">
          <td class="strong">{{ c.name }}</td>
          <td class="mono">{{ c.subdomain }}</td>
          <td>
            <span class="pill" :class="c.subscriptionStatus">{{ translateSubscriptionStatus(c.subscriptionStatus) }}</span>
          </td>
          <td>{{ c.packageName }}</td>
          <td>{{ c.joinedAt }}</td>
          <td>
            <span class="pill" :class="c.isActive ? 'active' : 'inactive'">
              {{ c.isActive ? "Aktif" : "Nonaktif" }}
            </span>
          </td>
          <td>
            <div class="row-actions">
              <RouterLink class="btn" :to="`/super-admin/churches/${c.id}`">Detail</RouterLink>
              <RouterLink class="btn" :to="`/super-admin/churches/${c.id}/edit`">Edit</RouterLink>
              <button class="btn" @click="toggleActive(c.id)">
                {{ c.isActive ? "Nonaktifkan" : "Aktifkan" }}
              </button>
              <button class="btn danger" @click="remove(c.id)">Hapus</button>
            </div>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="7" class="empty">Tidak ada data.</td>
        </tr>
      </tbody>
    </table>
  </TableCard>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  min-width: 280px;
  border: 1px solid var(--border);
  background: rgba(18, 32, 58, 0.7);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  outline: none;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  vertical-align: top;
}

.table th {
  color: var(--muted);
  font-weight: 600;
}

.strong {
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: rgba(233, 238, 252, 0.85);
}

.pill {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
  display: inline-flex;
}

.pill.active {
  border-color: rgba(53, 208, 161, 0.35);
  background: rgba(53, 208, 161, 0.14);
}
.pill.inactive {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}
.pill.active,
.pill.inactive {
  color: rgba(233, 238, 252, 0.92);
}

.pill.trial {
  border-color: rgba(255, 184, 107, 0.35);
  background: rgba(255, 184, 107, 0.14);
}
.pill.expired {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}
.pill.active,
.pill.trial,
.pill.expired {
  color: rgba(233, 238, 252, 0.92);
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty {
  padding: 16px;
  color: var(--muted);
}
</style>
