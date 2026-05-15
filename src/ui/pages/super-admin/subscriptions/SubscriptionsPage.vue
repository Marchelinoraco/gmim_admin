<script setup lang="ts">
import { computed } from "vue";
import StatCard from "../../../shared/StatCard.vue";
import TableCard from "../../../shared/TableCard.vue";
import { useSubscriptionState } from "../../../../state/subscriptionState";
import { useChurchState } from "../../../../state/churchState";

const { payments, totalPaidAmount } = useSubscriptionState();
const { churches } = useChurchState();

const packageCounts = computed(() => {
  const map = { Basic: 0, Standard: 0, Premium: 0 } as Record<string, number>;
  for (const c of churches.value) map[c.packageName] = (map[c.packageName] ?? 0) + 1;
  return map as { Basic: number; Standard: number; Premium: number };
});

const paymentSummary = computed(() => {
  const paid = payments.value.filter((p) => p.status === "paid").length;
  const pending = payments.value.filter((p) => p.status === "pending").length;
  const failed = payments.value.filter((p) => p.status === "failed").length;
  return { paid, pending, failed };
});
</script>

<template>
  <div class="grid">
    <div class="stats">
      <StatCard label="Paket Basic" :value="packageCounts.Basic" />
      <StatCard label="Paket Standard" :value="packageCounts.Standard" tone="warning" />
      <StatCard label="Paket Premium" :value="packageCounts.Premium" tone="success" />
      <StatCard
        label="Total Pembayaran (Lunas)"
        :value="`Rp ${totalPaidAmount.toLocaleString('id-ID')}`"
      />
      <StatCard label="Lunas" :value="paymentSummary.paid" tone="success" />
      <StatCard label="Tertunda/Gagal" :value="paymentSummary.pending + paymentSummary.failed" tone="danger" />
    </div>

    <TableCard title="Aksi Cepat" subtitle="Navigasi ke modul pembayaran & riwayat.">
      <div class="actions">
        <RouterLink class="btn primary" to="/super-admin/payments">Daftar Pembayaran</RouterLink>
        <RouterLink class="btn" to="/super-admin/subscription-history">Riwayat Langganan</RouterLink>
      </div>
    </TableCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
