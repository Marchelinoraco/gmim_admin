<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import TableCard from "../../../shared/TableCard.vue";
import { useTreasurerState } from "../../../../state/treasurerState";
import { useChurchState } from "../../../../state/churchState";
import { translateAccountStatus } from "../../../shared/labels";

const router = useRouter();
const { treasurers, remove, toggleStatus } = useTreasurerState();
const { churches } = useChurchState();

const q = ref("");
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return treasurers.value;
  return treasurers.value.filter((u) => {
    const church = churches.value.find((c) => c.id === u.churchId);
    return (
      u.fullName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (church?.name.toLowerCase().includes(s) ?? false)
    );
  });
});

function churchName(churchId: string) {
  return churches.value.find((c) => c.id === churchId)?.name ?? "-";
}
</script>

<template>
  <TableCard title="Daftar Bendahara" subtitle="Manajemen akun bendahara (dummy CRUD in-memory).">
    <template #actions>
      <div class="actions">
        <input v-model="q" class="search" placeholder="Cari nama/email/gereja…" />
        <button class="btn primary" @click="router.push('/super-admin/treasurers/new')">
          Tambah Bendahara
        </button>
      </div>
    </template>

    <table class="table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Email</th>
          <th>Gereja</th>
          <th>Nomor Telepon</th>
          <th>Role</th>
          <th>Status Akun</th>
          <th style="width: 260px">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in filtered" :key="u.id">
          <td class="strong">{{ u.fullName }}</td>
          <td class="mono">{{ u.email }}</td>
          <td>{{ churchName(u.churchId) }}</td>
          <td>{{ u.phone }}</td>
          <td>{{ u.role }}</td>
          <td>
            <span class="pill" :class="u.status">{{ translateAccountStatus(u.status) }}</span>
          </td>
          <td>
            <div class="row-actions">
              <RouterLink class="btn" :to="`/super-admin/treasurers/${u.id}`">Detail</RouterLink>
              <RouterLink class="btn" :to="`/super-admin/treasurers/${u.id}/edit`">Edit</RouterLink>
              <button class="btn" @click="toggleStatus(u.id)">
                {{ u.status === "active" ? "Nonaktifkan" : "Aktifkan" }}
              </button>
              <button class="btn danger" @click="remove(u.id)">Hapus</button>
            </div>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="7" class="empty">Tidak ada data.</td>
        </tr>
      </tbody>
    </table>
  </TableCard>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  min-width: 280px;
  border: 1px solid var(--border);
  background: rgba(18, 32, 58, 0.7);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  outline: none;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  vertical-align: top;
}

.table th {
  color: var(--muted);
  font-weight: 600;
}

.strong {
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: rgba(233, 238, 252, 0.85);
}

.pill {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
  display: inline-flex;
}

.pill.active {
  border-color: rgba(53, 208, 161, 0.35);
  background: rgba(53, 208, 161, 0.14);
}
.pill.disabled {
  border-color: rgba(255, 91, 122, 0.35);
  background: rgba(255, 91, 122, 0.14);
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty {
  padding: 16px;
  color: var(--muted);
}
</style>
