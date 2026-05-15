<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useChurchState } from "../../../../state/churchState";
import type { PackageName, SubscriptionStatus } from "../../../../data/dummy";

const router = useRouter();
const { create } = useChurchState();

const form = reactive({
  name: "",
  address: "",
  pastorName: "",
  phone: "",
  subdomain: "",
  packageName: "Basic" as PackageName,
  subscriptionStatus: "trial" as SubscriptionStatus,
  subscriptionEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true
});

function submit() {
  const created = create(form);
  router.push(`/super-admin/churches/${created.id}`);
}
</script>

<template>
  <TableCard title="Tambah Gereja" subtitle="Form pembuatan gereja (dummy).">
    <form class="form" @submit.prevent="submit">
      <div class="grid">
        <div class="field">
          <label>Nama Gereja</label>
          <input v-model="form.name" required placeholder="GMIM ..." />
        </div>
        <div class="field">
          <label>Subdomain Gereja</label>
          <input v-model="form.subdomain" required placeholder="mis: sion-manado" />
        </div>
        <div class="field">
          <label>Alamat Gereja</label>
          <input v-model="form.address" required />
        </div>
        <div class="field">
          <label>Nama Pendeta</label>
          <input v-model="form.pastorName" required />
        </div>
        <div class="field">
          <label>Nomor Telepon</label>
          <input v-model="form.phone" required />
        </div>
        <div class="field">
          <label>Paket Langganan</label>
          <select v-model="form.packageName">
            <option>Basic</option>
            <option>Standard</option>
            <option>Premium</option>
          </select>
        </div>
        <div class="field">
          <label>Status Langganan</label>
          <select v-model="form.subscriptionStatus">
            <option value="active">Aktif</option>
            <option value="trial">Percobaan</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>
        <div class="field">
          <label>Masa Aktif Langganan (sampai)</label>
          <input v-model="form.subscriptionEndsAt" type="date" required />
        </div>
      </div>

      <div class="actions">
        <button class="btn" type="button" @click="router.back()">Batal</button>
        <button class="btn primary" type="submit">Simpan</button>
      </div>
    </form>
  </TableCard>
</template>

<style scoped>
.form {
  display: grid;
  gap: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
