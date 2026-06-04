<script setup>
import { reactive, ref, computed } from "vue"
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

const router         = useRouter()
const bendaharaStore = useBendaharaStore()
const gerejaStore    = useGerejaStore()

const form = reactive({
  namaLengkap: "", email: "", username: "",
  password: "", telepon: "", gerejaId: "",
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
  if (!form.password || form.password.length < 6) errors.password = "Password minimal 6 karakter."
  if (!form.gerejaId)           errors.gerejaId = "Gereja wajib dipilih."
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  loading.value = true
  const result = bendaharaStore.tambahBendahara({ ...form })
  loading.value = false
  if (result !== false) router.push("/super-admin/bendahara")
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Tambah Bendahara</h1>
        <p class="text-muted-foreground text-sm">Daftarkan bendahara baru</p>
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
            <Select v-model="form.gerejaId" :options="gerejaOptions" placeholder="Pilih gereja..." />
            <p v-if="errors.gerejaId" class="text-xs text-destructive">{{ errors.gerejaId }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Nama Lengkap <span class="text-destructive">*</span></Label>
            <Input v-model="form.namaLengkap" placeholder="Nama Lengkap" />
            <p v-if="errors.namaLengkap" class="text-xs text-destructive">{{ errors.namaLengkap }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Email <span class="text-destructive">*</span></Label>
            <Input v-model="form.email" type="email" placeholder="email@gereja.id" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Username <span class="text-destructive">*</span></Label>
            <Input v-model="form.username" placeholder="username-login" />
            <p v-if="errors.username" class="text-xs text-destructive">{{ errors.username }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Password <span class="text-destructive">*</span></Label>
            <Input v-model="form.password" type="password" placeholder="Minimal 6 karakter" />
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Telepon</Label>
            <Input v-model="form.telepon" placeholder="0811-xxxx-xxxx" />
          </div>
        </div>
      </Card>

      <div class="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" @click="router.back()">Batal</Button>
        <Button type="submit" :disabled="loading">
          <Save class="h-4 w-4" />
          {{ loading ? "Menyimpan..." : "Simpan Bendahara" }}
        </Button>
      </div>
    </form>
  </div>
</template>
