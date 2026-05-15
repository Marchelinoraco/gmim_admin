<script setup lang="ts">
import { computed, ref } from "vue";
import TableCard from "../../../shared/TableCard.vue";
import { useSubscriptionState } from "../../../../state/subscriptionState";
import { useChurchState } from "../../../../state/churchState";
import { translatePaymentStatus } from "../../../shared/labels";

const { payments } = useSubscriptionState();
const { churches } = useChurchState();

const q = ref("");
const rows = computed(() => {
  const s = q.value.trim().toLowerCase();
  const base = [...payments.value].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (!s) return base;
  return base.filter((p) => {
    const church = churches.value.find((c) => c.id === p.churchId);
    return p.id.toLowerCase().includes(s) || (church?.name.toLowerCase().includes(s) ?? false);
  });
});

function churchName(churchId: string) {
  return churches.value.find((c) => c.id === churchId)?.name ?? "-";
}
</script>

<template>
  <TableCard title="Daftar Pembayaran" subtitle="Status pembayaran (dummy).">
    <template #actions>
      <input v-model="q" class="search" placeholder="Cari ID / gereja…" />
    </template>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Gereja</th>
          <th>Paket</th>
          <th>Jumlah</th>
          <th>Status</th>
          <th>Dibuat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in rows" :key="p.id">
          <td class="mono">{{ p.id }}</td>
          <td>{{ churchName(p.churchId) }}</td>
          <td>{{ p.packageName }}</td>
          <td>Rp {{ p.amount.toLocaleString("id-ID") }}</td>
          <td><span class="pill" :class="p.status">{{ translatePaymentStatus(p.status) }}</span></td>
          <td>{{ new Date(p.createdAt).toLocaleString("id-ID") }}</td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="6" class="empty">Tidak ada data.</td>
        </tr>
      </tbody>
    </table>
  </TableCard>
</template>

<style scoped>
.search {
  min-width: 260px;
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
  min-width: 880px;
}
.table th,
.table td {
  text-align: left;
  padding: 10px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.table th {
  color: var(--muted);
  font-weight: 600;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
}
.pill {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
}
.pill.paid {
  border-color: rgba(53, 208, 161, 0.35);
  background: rgba(53, 208, 161, 0.14);
}
.pill.pending {
  border-color: rgba(255, 184, 107, 0.35);
  background: rgba(255, 184, 107, 0.14);
}
.pill.failed {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}
.empty {
  padding: 16px;
  color: var(--muted);
}
</style>
