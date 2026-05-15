<script setup>
import BaseTable from "@/components/ui/BaseTable.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  gerejaList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["detail", "edit", "toggleStatus"])

const columns = [
  { key: "namaLengkap", label: "Nama", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "gereja", label: "Gereja", sortable: true },
  { key: "telepon", label: "Telepon" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "aksi", label: "Aksi", width: "200px" }
]

function getNamaGereja(gerejaId) {
  const gereja = props.gerejaList.find((g) => g.id === gerejaId)
  return gereja ? gereja.nama : "-"
}

function isGerejaNonaktif(gerejaId) {
  const gereja = props.gerejaList.find((g) => g.id === gerejaId)
  return gereja ? gereja.statusDomain === "nonaktif" : false
}
</script>

<template>
  <BaseTable :columns="columns" :data="data" empty-message="Tidak ada bendahara yang ditemukan">
    <template #cell-namaLengkap="{ row }">
      <span class="font-medium text-gray-900">{{ row.namaLengkap }}</span>
    </template>

    <template #cell-email="{ row }">
      <span class="text-gray-600">{{ row.email }}</span>
    </template>

    <template #cell-gereja="{ row }">
      <div class="flex items-center gap-1">
        <span>{{ getNamaGereja(row.gerejaId) }}</span>
        <span v-if="isGerejaNonaktif(row.gerejaId)" class="relative group">
          <svg
            class="w-4 h-4 text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-label="Domain gereja nonaktif"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
          >
            Domain gereja nonaktif
          </span>
        </span>
      </div>
    </template>

    <template #cell-telepon="{ row }">
      <span>{{ row.telepon }}</span>
    </template>

    <template #cell-role="{ row }">
      <span>{{ row.role }}</span>
    </template>

    <template #cell-status="{ row }">
      <span
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          row.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]"
      >
        {{ row.status === "active" ? "Active" : "Disabled" }}
      </span>
    </template>

    <template #cell-aksi="{ row }">
      <div class="flex items-center gap-2">
        <BaseButton size="sm" variant="secondary" @click="emit('detail', row.id)">Detail</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="emit('edit', row.id)">Edit</BaseButton>
        <BaseButton
          size="sm"
          :variant="row.status === 'active' ? 'danger' : 'primary'"
          @click="emit('toggleStatus', row.id)"
        >
          {{ row.status === "active" ? "Nonaktifkan" : "Aktifkan" }}
        </BaseButton>
      </div>
    </template>
  </BaseTable>
</template>
