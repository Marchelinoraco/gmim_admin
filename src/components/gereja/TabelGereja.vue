<script setup>
import BaseTable from "@/components/ui/BaseTable.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["detail", "edit", "hapus"])

const columns = [
  { key: "nama", label: "Nama", sortable: true },
  { key: "subdomain", label: "Subdomain", sortable: true },
  { key: "statusDomain", label: "Status Domain" },
  { key: "paketLangganan", label: "Paket Langganan" },
  { key: "aksi", label: "Aksi", width: "200px" }
]

function badgeClass(status) {
  switch (status) {
    case "aktif":
      return "bg-green-50 text-green-700 border border-green-200"
    case "pending":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200"
    case "nonaktif":
      return "bg-red-50 text-red-700 border border-red-200"
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200"
  }
}

function badgeLabel(status) {
  switch (status) {
    case "aktif":
      return "Aktif"
    case "pending":
      return "Pending"
    case "nonaktif":
      return "Nonaktif"
    default:
      return status
  }
}
</script>

<template>
  <BaseTable :columns="columns" :data="data" empty-message="Tidak ada data gereja">
    <template #cell-statusDomain="{ row }">
      <span
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          badgeClass(row.statusDomain)
        ]"
      >
        {{ badgeLabel(row.statusDomain) }}
      </span>
    </template>

    <template #cell-aksi="{ row }">
      <div class="flex items-center gap-2">
        <BaseButton variant="secondary" size="sm" @click="emit('detail', row.id)">Detail</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="emit('edit', row.id)">Edit</BaseButton>
        <BaseButton variant="danger" size="sm" @click="emit('hapus', row.id)">Hapus</BaseButton>
      </div>
    </template>
  </BaseTable>
</template>
