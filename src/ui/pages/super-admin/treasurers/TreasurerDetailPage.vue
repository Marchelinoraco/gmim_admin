<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useTreasurerState } from "../../../../state/treasurerState";
import { useChurchState } from "../../../../state/churchState";
import { translateAccountStatus } from "../../../shared/labels";

const route = useRoute();
const router = useRouter();
const id = computed(() => String(route.params.id));

const { getById, toggleStatus, resetPassword } = useTreasurerState();
const { churches } = useChurchState();

const user = computed(() => getById(id.value));
const churchName = computed(() => {
  const cid = user.value?.churchId;
  if (!cid) return "-";
  return churches.value.find((c) => c.id === cid)?.name ?? "-";
});

function doReset() {
  if (!user.value) return;
  resetPassword(user.value.id, "password-baru");
  alert("Password di-reset (dummy).");
}
</script>

<template>
  <TableCard v-if="user" :title="`Detail Bendahara • ${user.fullName}`" subtitle="Profil & aktivitas (dummy).">
    <template #actions>
      <div class="actions">
        <button class="btn" @click="router.push(`/super-admin/treasurers/${user.id}/edit`)">Edit</button>
        <button class="btn" @click="toggleStatus(user.id)">{{ user.status === "active" ? "Nonaktifkan" : "Aktifkan" }}</button>
        <button class="btn danger" @click="doReset">Reset Password</button>
      </div>
    </template>

    <div class="grid">
      <div class="card inner">
        <div class="k">Email</div>
        <div class="v mono">{{ user.email }}</div>
        <div class="k">Nomor Telepon</div>
        <div class="v">{{ user.phone }}</div>
        <div class="k">Role</div>
        <div class="v">{{ user.role }}</div>
        <div class="k">Status Akun</div>
        <div class="v">
          <span class="pill" :class="user.status">{{ translateAccountStatus(user.status) }}</span>
        </div>
      </div>

      <div class="card inner">
        <div class="k">Gereja Terkait</div>
        <div class="v">{{ churchName }}</div>
        <div class="k">Riwayat Login</div>
        <div class="v muted">{{ new Date(user.lastLoginAt).toLocaleString("id-ID") }}</div>
        <div class="k">Aktivitas Penginputan</div>
        <div class="v muted">12 input pemasukan • 4 input pengeluaran (dummy)</div>
      </div>
    </div>
  </TableCard>

  <TableCard v-else title="Pengguna tidak ditemukan" subtitle="ID tidak valid.">
    <button class="btn" @click="router.push('/super-admin/treasurers')">Kembali</button>
  </TableCard>
</template>

<style scoped>
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
.muted {
  color: var(--muted);
}
.pill {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
}
.pill.active {
  border-color: rgba(53, 208, 161, 0.35);
  background: rgba(53, 208, 161, 0.14);
}
.pill.disabled {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
