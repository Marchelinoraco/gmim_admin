<script setup>
import { computed } from "vue"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { formatLoginTerakhir } from "@/utils/formatTanggal"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseTable from "@/components/ui/BaseTable.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

const props = defineProps({
  gerejaId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(["tambahBendahara", "lihatBendahara"])

const bendaharaStore = useBendaharaStore()

const bendaharaList = computed(() => bendaharaStore.bendaharaByGereja(props.gerejaId))

const columns = [
  { key: "namaLengkap", label: "Nama" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "loginTerakhir", label: "Login Terakhir" }
]
</script>

<template>
  <BaseCard title="Bendahara Terdaftar">
    <!-- Header with Tambah Bendahara button -->
    <div v-if="bendaharaList.length > 0" class="flex justify-end mb-4">
      <BaseButton size="sm" @click="emit('tambahBendahara')">Tambah Bendahara</BaseButton>
    </div>

    <!-- Table when data exists -->
    <BaseTable v-if="bendaharaList.length > 0" :columns="columns" :data="bendaharaList">
      <template #cell-namaLengkap="{ row }">
        <button
          class="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
          @click="emit('lihatBendahara', row.id)"
        >
          {{ row.namaLengkap }}
        </button>
      </template>

      <template #cell-status="{ row }">
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          {{ row.status === "active" ? "Active" : "Disabled" }}
        </span>
      </template>

      <template #cell-loginTerakhir="{ row }">
        <span class="text-gray-600">
          {{ formatLoginTerakhir(row.loginTerakhir) }}
        </span>
      </template>
    </BaseTable>

    <!-- Empty state -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500 mb-4">Belum ada bendahara terdaftar</p>
      <BaseButton size="sm" @click="emit('tambahBendahara')">Tambah Bendahara</BaseButton>
    </div>
  </BaseCard>
</template>
