<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useTreasurerState } from "../../../../state/treasurerState";
import { useChurchState } from "../../../../state/churchState";
import type { TreasurerRole } from "../../../../data/dummy";

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));

const { getById, update } = useTreasurerState();
const { churches } = useChurchState();

const user = computed(() => getById(id.value));

const form = reactive({
  fullName: user.value?.fullName ?? "",
  email: user.value?.email ?? "",
  churchId: user.value?.churchId ?? churches.value[0]?.id ?? "",
  phone: user.value?.phone ?? "",
  role: (user.value?.role ?? "Bendahara") as TreasurerRole,
  status: user.value?.status ?? "active"
});

function submit() {
  const saved = update(id.value, form);
  if (!saved) return;
  router.push(`/super-admin/treasurers/${id.value}`);
}
</script>

<template>
  <TableCard v-if="user" title="Edit Bendahara" subtitle="Perubahan disimpan ke state in-memory.">
    <form class="form" @submit.prevent="submit">
      <div class="grid">
        <div class="field">
          <label>Nama Lengkap</label>
          <input v-model="form.fullName" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="field">
          <label>Gereja</label>
          <select v-model="form.churchId" required>
            <option v-for="c in churches" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Nomor Telepon</label>
          <input v-model="form.phone" required />
        </div>
        <div class="field">
          <label>Role Pengguna</label>
          <select v-model="form.role">
            <option>Bendahara</option>
            <option>Admin Gereja</option>
            <option>Viewer / Majelis</option>
          </select>
        </div>
        <div class="field">
          <label>Status Akun</label>
          <select v-model="form.status">
            <option value="active">Aktif</option>
            <option value="disabled">Nonaktif</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button class="btn" type="button" @click="router.back()">Batal</button>
        <button class="btn primary" type="submit">Simpan</button>
      </div>
    </form>
  </TableCard>

  <TableCard v-else title="Pengguna tidak ditemukan" subtitle="ID tidak valid.">
    <button class="btn" @click="router.push('/super-admin/treasurers')">Kembali</button>
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
