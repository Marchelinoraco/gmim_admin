<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import { formatTanggal } from "@/utils/formatTanggal"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseModal from "@/components/ui/BaseModal.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"
import InfoDomain from "@/components/gereja/InfoDomain.vue"
import DaftarBendaharaGereja from "@/components/gereja/DaftarBendaharaGereja.vue"

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const gerejaStore = useGerejaStore()

const gereja = computed(() => gerejaStore.getById(props.id))

// Modal state
const showModalAktifkan = ref(false)
const showModalNonaktifkan = ref(false)

// Redirect if gereja not found
onMounted(() => {
  if (!gereja.value) {
    router.push("/super-admin/gereja")
  }
})

// Status langganan badge classes
const statusLanggananClasses = {
  active: "bg-green-100 text-green-800",
  trial: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800"
}

const statusLanggananLabels = {
  active: "Active",
  trial: "Trial",
  expired: "Expired"
}

// Domain handlers
function handleAktifkanDomain() {
  showModalAktifkan.value = true
}

function handleNonaktifkanDomain() {
  showModalNonaktifkan.value = true
}

function konfirmasiAktifkan() {
  gerejaStore.aktifkanDomain(props.id)
  showModalAktifkan.value = false
}

function konfirmasiNonaktifkan() {
  gerejaStore.nonaktifkanDomain(props.id)
  showModalNonaktifkan.value = false
}

// Bendahara handlers
function handleTambahBendahara() {
  router.push(`/super-admin/bendahara/tambah?gerejaId=${props.id}`)
}

function handleLihatBendahara(bendaharaId) {
  router.push(`/super-admin/bendahara/${bendaharaId}`)
}

// Navigation
function goToEdit() {
  router.push(`/super-admin/gereja/${props.id}/edit`)
}

function goToList() {
  router.push("/super-admin/gereja")
}
</script>

<template>
  <div v-if="gereja" class="space-y-6">
    <!-- Notifikasi -->
    <BaseAlert
      v-if="gerejaStore.notifikasi"
      :type="gerejaStore.notifikasi.type"
      :message="gerejaStore.notifikasi.message"
      :auto-hide="true"
      :auto-hide-duration="3000"
      @dismiss="gerejaStore.notifikasi = null"
    />

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Detail Gereja</h1>
      <div class="flex gap-3">
        <BaseButton variant="secondary" @click="goToList">Kembali</BaseButton>
        <BaseButton variant="primary" @click="goToEdit">Edit</BaseButton>
      </div>
    </div>

    <!-- Info Gereja -->
    <BaseCard title="Informasi Gereja">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span class="text-sm font-medium text-gray-500">Nama Gereja</span>
          <p class="text-gray-900">{{ gereja.nama }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Alamat</span>
          <p class="text-gray-900">{{ gereja.alamat }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Nama Pendeta</span>
          <p class="text-gray-900">{{ gereja.namaPendeta }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Telepon</span>
          <p class="text-gray-900">{{ gereja.telepon }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Paket Langganan</span>
          <p class="text-gray-900">{{ gereja.paketLangganan }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Status Langganan</span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="statusLanggananClasses[gereja.statusLangganan]"
          >
            {{ statusLanggananLabels[gereja.statusLangganan] }}
          </span>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Bergabung Pada</span>
          <p class="text-gray-900">{{ formatTanggal(gereja.bergabungPada) }}</p>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-500">Langganan Berakhir</span>
          <p class="text-gray-900">{{ formatTanggal(gereja.langgananBerakhir) }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Info Domain -->
    <InfoDomain
      :gereja="gereja"
      @aktifkan-domain="handleAktifkanDomain"
      @nonaktifkan-domain="handleNonaktifkanDomain"
    />

    <!-- Daftar Bendahara -->
    <DaftarBendaharaGereja
      :gereja-id="props.id"
      @tambah-bendahara="handleTambahBendahara"
      @lihat-bendahara="handleLihatBendahara"
    />

    <!-- Modal Konfirmasi Aktifkan Domain -->
    <BaseModal
      v-model:show="showModalAktifkan"
      title="Aktifkan Domain"
      confirm-text="Aktifkan"
      cancel-text="Batal"
      @confirm="konfirmasiAktifkan"
      @cancel="showModalAktifkan = false"
    >
      <p class="text-gray-600">
        Apakah Anda yakin ingin mengaktifkan domain
        <span class="font-semibold">{{ gereja.subdomain }}.gmimjadi.com</span>
        ?
      </p>
    </BaseModal>

    <!-- Modal Konfirmasi Nonaktifkan Domain -->
    <BaseModal
      v-model:show="showModalNonaktifkan"
      title="Nonaktifkan Domain"
      confirm-text="Nonaktifkan"
      cancel-text="Batal"
      @confirm="konfirmasiNonaktifkan"
      @cancel="showModalNonaktifkan = false"
    >
      <p class="text-gray-600">
        Apakah Anda yakin ingin menonaktifkan domain
        <span class="font-semibold">{{ gereja.subdomain }}.gmimjadi.com</span>
        ? Domain tidak akan dapat diakses setelah dinonaktifkan.
      </p>
    </BaseModal>
  </div>
</template>
