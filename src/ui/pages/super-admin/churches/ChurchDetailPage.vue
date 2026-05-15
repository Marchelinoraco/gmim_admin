<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useChurchState } from "../../../../state/churchState";
import { useTreasurerState } from "../../../../state/treasurerState";
import { useSubscriptionState } from "../../../../state/subscriptionState";
import { translateSubscriptionStatus, translatePaymentStatus } from "../../../shared/labels";

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));

const { getById, toggleActive } = useChurchState();
const { treasurers } = useTreasurerState();
const { payments } = useSubscriptionState();

const church = computed(() => getById(id.value));
const churchTreasurers = computed(() =>
  treasurers.value.filter((t) => t.churchId === id.value)
);
const churchPayments = computed(() =>
  payments.value
    .filter((p) => p.churchId === id.value)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
);
</script>

<template>
  <div class="wrap" v-if="church">
    <TableCard :title="`Detail Gereja • ${church.name}`" subtitle="Informasi & ringkasan (dummy).">
      <template #actions>
        <div class="actions">
          <button class="btn" @click="router.push(`/super-admin/churches/${church.id}/edit`)">
            Edit
          </button>
          <button class="btn" @click="toggleActive(church.id)">
            {{ church.isActive ? "Nonaktifkan" : "Aktifkan" }}
          </button>
        </div>
      </template>

      <div class="grid">
        <div class="card inner">
          <div class="k">Subdomain</div>
          <div class="v mono">{{ church.subdomain }}</div>
          <div class="k">Alamat Gereja</div>
          <div class="v">{{ church.address }}</div>
          <div class="k">Nama Pendeta</div>
          <div class="v">{{ church.pastorName }}</div>
          <div class="k">Nomor Telepon</div>
          <div class="v">{{ church.phone }}</div>
        </div>

        <div class="card inner">
          <div class="k">Status Langganan</div>
          <div class="v">
            <span class="pill" :class="church.subscriptionStatus">{{
              translateSubscriptionStatus(church.subscriptionStatus)
            }}</span>
          </div>
          <div class="k">Paket Langganan</div>
          <div class="v">{{ church.packageName }}</div>
          <div class="k">Bergabung</div>
          <div class="v">{{ church.joinedAt }}</div>
          <div class="k">Masa Aktif Sampai</div>
          <div class="v">{{ church.subscriptionEndsAt }}</div>
        </div>
      </div>
    </TableCard>

    <div class="two">
      <TableCard title="Jumlah Bendahara" :subtitle="`Total: ${churchTreasurers.length}`">
        <ul class="list">
          <li v-for="t in churchTreasurers" :key="t.id">
            <span class="strong">{{ t.fullName }}</span>
            <span class="muted">• {{ t.role }} • {{ t.status }}</span>
          </li>
          <li v-if="churchTreasurers.length === 0" class="muted">Belum ada pengguna.</li>
        </ul>
      </TableCard>

      <TableCard title="Statistik Keuangan" subtitle="Ringkas transaksi/pembayaran (dummy).">
        <div class="muted" style="margin-bottom: 10px">
          Total pembayaran: {{ churchPayments.length }}
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paket</th>
              <th>Status</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in churchPayments" :key="p.id">
              <td class="mono">{{ p.id }}</td>
              <td>{{ p.packageName }}</td>
              <td><span class="pill" :class="p.status">{{ p.status }}</span></td>
              <td>Rp {{ p.amount.toLocaleString("id-ID") }}</td>
            </tr>
            <tr v-if="churchPayments.length === 0">
              <td colspan="4" class="muted">Belum ada pembayaran.</td>
            </tr>
          </tbody>
        </table>
      </TableCard>
    </div>
  </div>

  <TableCard v-else title="Gereja tidak ditemukan" subtitle="ID tidak valid.">
    <button class="btn" @click="router.push('/super-admin/churches')">Kembali</button>
  </TableCard>
</template>

<style scoped>
.wrap {
  display: grid;
  gap: 12px;
}
.actions {
  display: flex;
  gap: 10px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.inner {
  padding: 12px;
  border-radius: 14px;
  box-shadow: none;
  background: rgba(18, 32, 58, 0.45);
}
.k {
  color: var(--muted);
  font-size: 12px;
  margin-top: 10px;
}
.k:first-child {
  margin-top: 0;
}
.v {
  margin-top: 4px;
  font-weight: 600;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.list {
  margin: 0;
  padding-left: 18px;
  color: rgba(233, 238, 252, 0.92);
}
.strong {
  font-weight: 700;
}
.muted {
  color: var(--muted);
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
.pill.pending,
.pill.trial {
  border-color: rgba(255, 184, 107, 0.35);
  background: rgba(255, 184, 107, 0.14);
}
.pill.failed,
.pill.expired {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}
@media (max-width: 1100px) {
  .grid,
  .two {
    grid-template-columns: 1fr;
  }
}
</style>
