<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import FormGereja from "@/components/gereja/FormGereja.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"

const router = useRouter()
const gerejaStore = useGerejaStore()

const notifikasi = computed(() => gerejaStore.notifikasi)

function handleSubmit(data) {
  const hasil = gerejaStore.tambahGereja(data)
  if (hasil) {
    router.push(`/super-admin/gereja/${hasil.id}`)
  }
}

function handleCancel() {
  router.push("/super-admin/gereja")
}

function dismissNotifikasi() {
  gerejaStore.notifikasi = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Tambah Gereja</h1>
    </div>

    <BaseAlert
      v-if="notifikasi"
      :type="notifikasi.type"
      :message="notifikasi.message"
      :auto-hide="notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="dismissNotifikasi"
    />

    <BaseCard title="Form Tambah Gereja">
      <FormGereja mode="tambah" @submit="handleSubmit" @cancel="handleCancel" />
    </BaseCard>
  </div>
</template>
