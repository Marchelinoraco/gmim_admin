<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { useGerejaStore } from "@/stores/gerejaStore"
import FilterBendahara from "@/components/bendahara/FilterBendahara.vue"
import TabelBendahara from "@/components/bendahara/TabelBendahara.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseModal from "@/components/ui/BaseModal.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"
import BaseCard from "@/components/ui/BaseCard.vue"

const router = useRouter()
const bendaharaStore = useBendaharaStore()
const gerejaStore = useGerejaStore()

// Filter state
const pencarian = ref("")
const filterGereja = ref("")
const filterStatus = ref("")

// Modal state
const showModal = ref(false)
const toggleTargetId = ref(null)

// Computed
const filteredBendahara = computed(() => {
  return bendaharaStore.filterBendahara(pencarian.value, filterGereja.value, filterStatus.value, gerejaStore.gerejaList)
})

const gerejaOptions = computed(() => {
  return gerejaStore.gerejaList.map((g) => ({
    value: g.id,
    label: g.nama
  }))
})

const toggleTargetNama = computed(() => {
  if (!toggleTargetId.value) return ""
  const bendahara = bendaharaStore.getById(toggleTargetId.value)
  return bendahara ? bendahara.namaLengkap : ""
})

const toggleTargetStatus = computed(() => {
  if (!toggleTargetId.value) return ""
  const bendahara = bendaharaStore.getById(toggleTargetId.value)
  return bendahara ? bendahara.status : ""
})

// Event handlers
function onDetail(id) {
  router.push(`/super-admin/bendahara/${id}`)
}

function onEdit(id) {
  router.push(`/super-admin/bendahara/${id}/edit`)
}

function onToggleStatus(id) {
  toggleTargetId.value = id
  showModal.value = true
}

function confirmToggleStatus() {
  bendaharaStore.toggleStatus(toggleTargetId.value)
  showModal.value = false
  toggleTargetId.value = null
}

function onTambah() {
  router.push("/super-admin/bendahara/tambah")
}

function dismissNotifikasi() {
  bendaharaStore.notifikasi = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Bendahara</h1>
      <BaseButton variant="primary" @click="onTambah">Tambah Bendahara</BaseButton>
    </div>

    <!-- Notifikasi -->
    <BaseAlert
      v-if="bendaharaStore.notifikasi"
      :type="bendaharaStore.notifikasi.type"
      :message="bendaharaStore.notifikasi.message"
      :auto-hide="true"
      :auto-hide-duration="bendaharaStore.notifikasi.type === 'success' ? 3000 : 5000"
      @dismiss="dismissNotifikasi"
    />

    <!-- Filter -->
    <BaseCard>
      <FilterBendahara
        :gereja-options="gerejaOptions"
        @update:pencarian="(val) => (pencarian = val)"
        @update:filter-gereja="(val) => (filterGereja = val)"
        @update:filter-status="(val) => (filterStatus = val)"
      />
    </BaseCard>

    <!-- Tabel -->
    <BaseCard :padding="false">
      <TabelBendahara
        :data="filteredBendahara"
        :gereja-list="gerejaStore.gerejaList"
        @detail="onDetail"
        @edit="onEdit"
        @toggle-status="onToggleStatus"
      />
    </BaseCard>

    <!-- Modal Konfirmasi Toggle Status -->
    <BaseModal
      v-model:show="showModal"
      :title="toggleTargetStatus === 'active' ? 'Nonaktifkan Bendahara' : 'Aktifkan Bendahara'"
      :confirm-text="toggleTargetStatus === 'active' ? 'Nonaktifkan' : 'Aktifkan'"
      cancel-text="Batal"
      @confirm="confirmToggleStatus"
    >
      <p class="text-gray-600">
        Apakah Anda yakin ingin
        <span class="font-semibold">{{ toggleTargetStatus === "active" ? "menonaktifkan" : "mengaktifkan" }}</span>
        bendahara
        <span class="font-semibold">{{ toggleTargetNama }}</span>
        ?
      </p>
    </BaseModal>
  </div>
</template>
