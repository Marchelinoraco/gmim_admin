<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import FormBendahara from "@/components/bendahara/FormBendahara.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"

const route = useRoute()
const router = useRouter()
const bendaharaStore = useBendaharaStore()

// Support preselectedGerejaId dari query param (navigasi dari detail gereja)
const preselectedGerejaId = computed(() => route.query.gerejaId || "")

// Cek apakah navigasi berasal dari halaman detail gereja
const cameFromGereja = computed(() => !!route.query.gerejaId)

function handleSubmit(data) {
  const newBendahara = bendaharaStore.tambahBendahara(data)
  if (newBendahara && newBendahara.id) {
    router.push(`/super-admin/bendahara/${newBendahara.id}`)
  }
}

function handleCancel() {
  if (cameFromGereja.value) {
    router.back()
  } else {
    router.push("/super-admin/bendahara")
  }
}

function dismissNotifikasi() {
  bendaharaStore.notifikasi = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Tambah Bendahara</h1>
      <p class="text-sm text-gray-500 mt-1">Buat akun bendahara baru untuk gereja</p>
    </div>

    <!-- Notifikasi dari store -->
    <BaseAlert
      v-if="bendaharaStore.notifikasi"
      :type="bendaharaStore.notifikasi.type"
      :message="bendaharaStore.notifikasi.message"
      :auto-hide="bendaharaStore.notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="dismissNotifikasi"
    />

    <!-- Form Card -->
    <BaseCard title="Data Bendahara">
      <FormBendahara
        mode="tambah"
        :preselected-gereja-id="preselectedGerejaId"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </BaseCard>
  </div>
</template>
