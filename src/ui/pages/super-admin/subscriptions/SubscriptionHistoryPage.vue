<script setup lang="ts">
import TableCard from "../../../shared/TableCard.vue";
</script>

<template>
  <TableCard
    title="Riwayat Langganan"
    subtitle="Catatan: nanti bisa dipecah per gereja, per paket, per periode."
  >
    <div class="note">
      Data dummy saat ini hanya menyimpan pembayaran. Untuk riwayat langganan lengkap (upgrade/downgrade,
      perpanjangan, status berubah), perlu event log terpisah.
    </div>
  </TableCard>
</template>

<style scoped>
.note {
  color: var(--muted);
  line-height: 1.6;
}
</style>
