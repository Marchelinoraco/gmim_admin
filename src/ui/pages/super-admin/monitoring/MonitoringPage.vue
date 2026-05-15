<script setup lang="ts">
import { computed } from "vue";
import TableCard from "../../../shared/TableCard.vue";
import { translateMonitoringType } from "../../../shared/labels";

type LogRow = {
  at: string;
  actor: string;
  type: "login" | "input" | "system";
  message: string;
};

const logs: LogRow[] = [
  {
    at: "2026-05-12 16:10",
    actor: "u-101 (Admin Gereja)",
    type: "login",
    message: "Login berhasil"
  },
  {
    at: "2026-05-12 16:20",
    actor: "u-100 (Bendahara)",
    type: "input",
    message: "Tambah pemasukan: Rp 1.250.000"
  },
  {
    at: "2026-05-12 16:35",
    actor: "system",
    type: "system",
    message: "Tugas laporan bulanan ditambahkan ke antrean"
  }
];

const usage = computed(() => ({
  activeUsersToday: 12,
  requestsToday: 1840,
  avgLatencyMs: 220
}));
</script>

<template>
  <div class="grid">
    <TableCard title="Statistik Penggunaan" subtitle="Ringkasan penggunaan sistem (dummy).">
      <div class="stats">
        <div class="chip">Pengguna aktif: {{ usage.activeUsersToday }}</div>
        <div class="chip">Permintaan: {{ usage.requestsToday }}</div>
        <div class="chip">Rata-rata latency: {{ usage.avgLatencyMs }} ms</div>
      </div>
    </TableCard>

    <TableCard title="Log Sistem" subtitle="Aktivitas Login / Penginputan / Sistem (dummy).">
      <table class="table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Aktor</th>
            <th>Tipe</th>
            <th>Pesan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.at + l.actor">
            <td class="mono">{{ l.at }}</td>
            <td>{{ l.actor }}</td>
            <td><span class="pill" :class="l.type">{{ translateMonitoringType(l.type) }}</span></td>
            <td>{{ l.message }}</td>
          </tr>
        </tbody>
      </table>
    </TableCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
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
.pill.login {
  border-color: rgba(91, 140, 255, 0.35);
  background: rgba(91, 140, 255, 0.14);
}
.pill.input {
  border-color: rgba(53, 208, 161, 0.35);
  background: rgba(53, 208, 161, 0.14);
}
.pill.system {
  border-color: rgba(255, 184, 107, 0.35);
  background: rgba(255, 184, 107, 0.14);
}
</style>
