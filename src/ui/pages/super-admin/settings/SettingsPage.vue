<script setup lang="ts">
import { reactive } from "vue";
import TableCard from "../../../shared/TableCard.vue";

const settings = reactive({
  baseDomain: "gmim-keuangan.id",
  subdomainPattern: "{subdomain}.gmim-keuangan.id",
  defaultPackage: "Standard",
  theme: "Dark",
  notifications: true
});
</script>

<template>
  <TableCard title="Pengaturan Sistem" subtitle="Konfigurasi domain, paket, tampilan, notifikasi (dummy).">
    <form class="form" @submit.prevent="() => alert('Tersimpan (dummy).')">
      <div class="grid">
        <div class="field">
          <label>Pengaturan Domain</label>
          <input v-model="settings.baseDomain" />
        </div>
        <div class="field">
          <label>Pengaturan Subdomain</label>
          <input v-model="settings.subdomainPattern" />
        </div>
        <div class="field">
          <label>Pengaturan Paket (Default)</label>
          <select v-model="settings.defaultPackage">
            <option>Basic</option>
            <option>Standard</option>
            <option>Premium</option>
          </select>
        </div>
        <div class="field">
          <label>Pengaturan Tampilan</label>
          <select v-model="settings.theme">
            <option value="Dark">Gelap</option>
            <option value="Light">Terang</option>
          </select>
        </div>
        <div class="field">
          <label>Pengaturan Notifikasi</label>
          <select v-model="settings.notifications">
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      <div class="actions">
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
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
