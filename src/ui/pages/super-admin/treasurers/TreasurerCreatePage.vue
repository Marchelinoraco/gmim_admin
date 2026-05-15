<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useChurchState } from "../../../../state/churchState";
import { useTreasurerState } from "../../../../state/treasurerState";
import type { TreasurerRole } from "../../../../data/dummy";

const router = useRouter();
const { churches } = useChurchState();
const { create } = useTreasurerState();

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  churchId: churches.value[0]?.id ?? "",
  phone: "",
  role: "Bendahara" as TreasurerRole,
  status: "active" as const
});

function submit() {
  const created = create(form);
  router.push(`/super-admin/treasurers/${created.id}`);
}
</script>

<template>
  <TableCard title="Tambah Bendahara" subtitle="Form pembuatan akun (dummy).">
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
          <label>Password</label>
          <input v-model="form.password" type="password" required />
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
