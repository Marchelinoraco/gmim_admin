<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import TabelGereja from "@/components/gereja/TabelGereja.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"
import BaseModal from "@/components/ui/BaseModal.vue"

const router = useRouter()
const gerejaStore = useGerejaStore()

const notifikasi = computed(() => gerejaStore.notifikasi)
const gerejaList = computed(() => gerejaStore.gerejaList)

// State untuk dialog konfirmasi hapus
const showModalHapus = ref(false)
const gerejaIdHapus = ref(null)

function navigasiTambah() {
  router.push("/super-admin/gereja/tambah")
}

function navigasiDetail(id) {
  router.push(`/super-admin/gereja/${id}`)
}

function navigasiEdit(id) {
  router.push(`/super-admin/gereja/${id}/edit`)
}

function konfirmasiHapus(id) {
  gerejaIdHapus.value = id
  showModalHapus.value = true
}

function handleHapus() {
  if (gerejaIdHapus.value) {
    gerejaStore.hapusGereja(gerejaIdHapus.value)
  }
  showModalHapus.value = false
  gerejaIdHapus.value = null
}

function batalHapus() {
  showModalHapus.value = false
  gerejaIdHapus.value = null
}

function dismissNotifikasi() {
  gerejaStore.notifikasi = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Daftar Gereja</h1>
      <BaseButton variant="primary" @click="navigasiTambah">Tambah Gereja</BaseButton>
    </div>

    <BaseAlert
      v-if="notifikasi"
      :type="notifikasi.type"
      :message="notifikasi.message"
      :auto-hide="notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="dismissNotifikasi"
    />

    <TabelGereja :data="gerejaList" @detail="navigasiDetail" @edit="navigasiEdit" @hapus="konfirmasiHapus" />

    <BaseModal
      v-model:show="showModalHapus"
      title="Konfirmasi Hapus Gereja"
      confirm-text="Hapus"
      cancel-text="Batal"
      @confirm="handleHapus"
      @cancel="batalHapus"
    >
      <p class="text-sm text-gray-600">
        Apakah Anda yakin ingin menghapus gereja ini? Tindakan ini tidak dapat dibatalkan.
      </p>
    </BaseModal>
  </div>
</template>
