<script setup lang="ts">
import { computed } from "vue";
import StatCard from "../../shared/StatCard.vue";
import TableCard from "../../shared/TableCard.vue";
import { translatePaymentStatus } from "../../shared/labels";
import { churches, payments, treasurers } from "../../../data/dummy";

const totalChurches = computed(() => churches.length);
const activeChurches = computed(() => churches.filter((c) => c.isActive).length);
const trialChurches = computed(
  () => churches.filter((c) => c.subscriptionStatus === "trial").length
);
const expiredChurches = computed(
  () => churches.filter((c) => c.subscriptionStatus === "expired").length
);
const totalTreasurers = computed(() => treasurers.length);
const totalTransactions = computed(() => 328); // dummy metric

const subscriptionStats = computed(() => {
  const active = churches.filter((c) => c.subscriptionStatus === "active").length;
  const trial = churches.filter((c) => c.subscriptionStatus === "trial").length;
  const expired = churches.filter((c) => c.subscriptionStatus === "expired").length;
  return { active, trial, expired, total: churches.length || 1 };
});

const latestPayments = computed(() =>
  [...payments]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5)
);
</script>

<template>
  <div class="grid">
    <div class="stats">
      <StatCard label="Total Gereja Terdaftar" :value="totalChurches" />
      <StatCard label="Gereja Aktif" :value="activeChurches" tone="success" />
      <StatCard label="Gereja Percobaan" :value="trialChurches" tone="warning" />
      <StatCard label="Gereja Kedaluwarsa" :value="expiredChurches" tone="danger" />
      <StatCard label="Total Bendahara" :value="totalTreasurers" />
      <StatCard label="Total Transaksi" :value="totalTransactions" hint="Dummy agregat" />
    </div>

    <div class="two">
      <TableCard
        title="Statistik Langganan"
        subtitle="Ringkasan status langganan gereja (dummy)."
      >
        <div class="bars">
          <div class="bar">
            <div class="k">Aktif</div>
            <div class="track">
              <div
                class="fill success"
                :style="{
                  width:
                    (subscriptionStats.active / subscriptionStats.total) * 100 + '%'
                }"
              ></div>
            </div>
            <div class="v">{{ subscriptionStats.active }}</div>
          </div>

          <div class="bar">
            <div class="k">Percobaan</div>
            <div class="track">
              <div
                class="fill warning"
                :style="{
                  width:
                    (subscriptionStats.trial / subscriptionStats.total) * 100 + '%'
                }"
              ></div>
            </div>
            <div class="v">{{ subscriptionStats.trial }}</div>
          </div>

          <div class="bar">
            <div class="k">Kedaluwarsa</div>
            <div class="track">
              <div
                class="fill danger"
                :style="{
                  width:
                    (subscriptionStats.expired / subscriptionStats.total) * 100 + '%'
                }"
              ></div>
            </div>
            <div class="v">{{ subscriptionStats.expired }}</div>
          </div>
        </div>
      </TableCard>

      <TableCard title="Pembayaran Terbaru" subtitle="Daftar pembayaran (dummy).">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paket</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Dibuat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in latestPayments" :key="p.id">
              <td>{{ p.id }}</td>
              <td>{{ p.packageName }}</td>
              <td>Rp {{ p.amount.toLocaleString("id-ID") }}</td>
              <td>
                <span class="pill" :class="p.status">{{ translatePaymentStatus(p.status) }}</span>
              </td>
              <td>{{ new Date(p.createdAt).toLocaleString("id-ID") }}</td>
            </tr>
          </tbody>
        </table>
      </TableCard>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 14px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.two {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
}

.bars {
  display: grid;
  gap: 10px;
}

.bar {
  display: grid;
  grid-template-columns: 70px 1fr 40px;
  gap: 10px;
  align-items: center;
}

.k {
  font-size: 12px;
  color: var(--muted);
}

.track {
  height: 10px;
  border-radius: 999px;
  background: rgba(233, 238, 252, 0.08);
  border: 1px solid var(--border);
  overflow: hidden;
}

.fill {
  height: 100%;
}
.fill.success {
  background: rgba(53, 208, 161, 0.8);
}
.fill.warning {
  background: rgba(255, 184, 107, 0.85);
}
.fill.danger {
  background: rgba(255, 91, 122, 0.85);
}

.v {
  text-align: right;
  font-weight: 700;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
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

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .two {
    grid-template-columns: 1fr;
  }
}
</style>
