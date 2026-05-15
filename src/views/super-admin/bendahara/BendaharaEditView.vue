<script setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import FormBendahara from "@/components/bendahara/FormBendahara.vue"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const bendaharaStore = useBendaharaStore()

const bendahara = computed(() => bendaharaStore.getById(props.id))
const notifikasi = computed(() => bendaharaStore.notifikasi)

onMounted(() => {
  if (!bendahara.value) {
    router.push("/super-admin/bendahara")
  }
})

function handleSubmit(data) {
  // Cek duplikasi email di gereja yang sama (exclude bendahara saat ini)
  if (bendaharaStore.isEmailTerdaftar(data.email, data.gerejaId, props.id)) {
    bendaharaStore.notifikasi = {
      type: "error",
      message: "Email sudah terdaftar pada gereja ini"
    }
    return
  }

  const hasil = bendaharaStore.updateBendahara(props.id, data)
  if (hasil) {
    router.push(`/super-admin/bendahara/${props.id}`)
  }
}

function handleCancel() {
  router.push(`/super-admin/bendahara/${props.id}`)
}

function dismissNotifikasi() {
  bendaharaStore.notifikasi = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Edit Bendahara</h1>
    </div>

    <BaseAlert
      v-if="notifikasi"
      :type="notifikasi.type"
      :message="notifikasi.message"
      :auto-hide="notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="dismissNotifikasi"
    />

    <BaseCard v-if="bendahara" title="Form Edit Bendahara">
      <FormBendahara mode="edit" :initial-data="bendahara" @submit="handleSubmit" @cancel="handleCancel" />
    </BaseCard>
  </div>
</template>
