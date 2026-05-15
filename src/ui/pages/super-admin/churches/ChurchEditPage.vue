<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useChurchState } from "../../../../state/churchState";
import type { PackageName, SubscriptionStatus } from "../../../../data/dummy";

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));
const { getById, update } = useChurchState();

const church = computed(() => getById(id.value));
const form = reactive({
  name: church.value?.name ?? "",
  address: church.value?.address ?? "",
  pastorName: church.value?.pastorName ?? "",
  phone: church.value?.phone ?? "",
  subdomain: church.value?.subdomain ?? "",
  packageName: (church.value?.packageName ?? "Basic") as PackageName,
  subscriptionStatus: (church.value?.subscriptionStatus ?? "trial") as SubscriptionStatus,
  subscriptionEndsAt: church.value?.subscriptionEndsAt ?? new Date().toISOString().slice(0, 10),
  isActive: church.value?.isActive ?? true
});

function submit() {
  const saved = update(id.value, form);
  if (!saved) return;
  router.push(`/super-admin/churches/${id.value}`);
}
</script>

<template>
  <TableCard v-if="church" title="Edit Gereja" subtitle="Perubahan disimpan ke state in-memory.">
    <form class="form" @submit.prevent="submit">
      <div class="grid">
        <div class="field">
          <label>Nama Gereja</label>
          <input v-model="form.name" required />
        </div>
        <div class="field">
          <label>Subdomain Gereja</label>
          <input v-model="form.subdomain" required />
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

  <TableCard v-else title="Gereja tidak ditemukan" subtitle="ID tidak valid.">
    <button class="btn" @click="router.push('/super-admin/churches')">Kembali</button>
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
