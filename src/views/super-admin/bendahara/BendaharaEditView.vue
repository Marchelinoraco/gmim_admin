<script setup>
import { reactive, computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { useGerejaStore } from "@/stores/gerejaStore"
import { ArrowLeft, Save } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Label from "@/components/ui/Label.vue"
import Select from "@/components/ui/Select.vue"
import Alert from "@/components/ui/Alert.vue"

const props = defineProps({ id: String })
const router         = useRouter()
const bendaharaStore = useBendaharaStore()
const gerejaStore    = useGerejaStore()

const bendahara = computed(() => bendaharaStore.getById(props.id))

const form = reactive({
  namaLengkap: bendahara.value?.namaLengkap || "",
  email:       bendahara.value?.email || "",
  username:    bendahara.value?.username || "",
  telepon:     bendahara.value?.telepon || "",
  gerejaId:    bendahara.value?.gerejaId || "",
  password:    "",
})

const errors  = reactive({})
const loading = ref(false)

const gerejaOptions = computed(() =>
  gerejaStore.gerejaList.map(g => ({ value: g.id, label: g.nama }))
)

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.namaLengkap.trim()) errors.namaLengkap = "Nama wajib diisi."
  if (!form.email.trim())       errors.email = "Email wajib diisi."
  if (!form.username.trim())    errors.username = "Username wajib diisi."
  if (!form.gerejaId)           errors.gerejaId = "Gereja wajib dipilih."
  if (form.password && form.password.length < 6) errors.password = "Password minimal 6 karakter."
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  loading.value = true
  const patch = { ...form }
  if (!patch.password) delete patch.password
  const result = bendaharaStore.updateBendahara(props.id, patch)
  loading.value = false
  if (result !== false) router.push(`/super-admin/bendahara/${props.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Edit Bendahara</h1>
        <p class="text-muted-foreground text-sm">{{ bendahara?.namaLengkap }}</p>
      </div>
    </div>

    <Alert v-if="bendaharaStore.notifikasi?.type === 'error'" variant="destructive">
      {{ bendaharaStore.notifikasi.message }}
    </Alert>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <Card class="p-6 space-y-5">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Akun</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5 md:col-span-2">
            <Label>Gereja <span class="text-destructive">*</span></Label>
            <Select v-model="form.gerejaId" :options="gerejaOptions" />
            <p v-if="errors.gerejaId" class="text-xs text-destructive">{{ errors.gerejaId }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Nama Lengkap <span class="text-destructive">*</span></Label>
            <Input v-model="form.namaLengkap" />
            <p v-if="errors.namaLengkap" class="text-xs text-destructive">{{ errors.namaLengkap }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Email <span class="text-destructive">*</span></Label>
            <Input v-model="form.email" type="email" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Username <span class="text-destructive">*</span></Label>
            <Input v-model="form.username" />
            <p v-if="errors.username" class="text-xs text-destructive">{{ errors.username }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Password Baru</Label>
            <Input v-model="form.password" type="password" placeholder="Kosongkan jika tidak diganti" />
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Telepon</Label>
            <Input v-model="form.telepon" />
          </div>
        </div>
      </Card>

      <div class="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" @click="router.back()">Batal</Button>
        <Button type="submit" :disabled="loading">
          <Save class="h-4 w-4" />
          {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
        </Button>
      </div>
    </form>
  </div>
</template>
