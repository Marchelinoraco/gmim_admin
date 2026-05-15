<script setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import FormGereja from "@/components/gereja/FormGereja.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const gerejaStore = useGerejaStore()

const gereja = computed(() => gerejaStore.getById(props.id))

// Redirect jika gereja tidak ditemukan
onMounted(() => {
  if (!gereja.value) {
    router.push("/super-admin/gereja")
  }
})

function handleSubmit(data) {
  const result = gerejaStore.updateGereja(props.id, data)
  if (result) {
    router.push(`/super-admin/gereja/${props.id}`)
  }
}

function handleCancel() {
  router.push(`/super-admin/gereja/${props.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Notifikasi -->
    <BaseAlert
      v-if="gerejaStore.notifikasi"
      :type="gerejaStore.notifikasi.type"
      :message="gerejaStore.notifikasi.message"
      :auto-hide="gerejaStore.notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="gerejaStore.notifikasi = null"
    />

    <!-- Form Edit Gereja -->
    <BaseCard v-if="gereja" title="Edit Gereja">
      <FormGereja mode="edit" :initial-data="gereja" @submit="handleSubmit" @cancel="handleCancel" />
    </BaseCard>
  </div>
</template>
