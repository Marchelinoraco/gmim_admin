<script setup>
import { reactive, computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import { ArrowLeft, Save } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Input from "@/components/ui/Input.vue"
import Label from "@/components/ui/Label.vue"
import Select from "@/components/ui/Select.vue"
import Alert from "@/components/ui/Alert.vue"

const props = defineProps({ id: String })
const router = useRouter()
const gerejaStore = useGerejaStore()

const gereja = computed(() => gerejaStore.getById(props.id))

const form = reactive({
  nama: gereja.value?.nama || "",
  alamat: gereja.value?.alamat || "",
  namaPendeta: gereja.value?.namaPendeta || "",
  telepon: gereja.value?.telepon || "",
  subdomain: gereja.value?.subdomain || "",
  paketLangganan: gereja.value?.paketLangganan || "Basic",
  statusLangganan: gereja.value?.statusLangganan || "trial",
})

const errors  = reactive({})
const loading = ref(false)

const paketOptions    = [{ value: "Basic", label: "Basic" }, { value: "Standard", label: "Standard" }, { value: "Premium", label: "Premium" }]
const langgananOptions = [{ value: "trial", label: "Trial" }, { value: "active", label: "Active" }, { value: "expired", label: "Expired" }]

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.nama.trim())      errors.nama = "Nama gereja wajib diisi."
  if (!form.subdomain.trim()) errors.subdomain = "Subdomain wajib diisi."
  if (!form.namaPendeta.trim()) errors.namaPendeta = "Nama pendeta wajib diisi."
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  loading.value = true
  const result = gerejaStore.updateGereja(props.id, { ...form })
  loading.value = false
  if (result !== false) router.push(`/super-admin/gereja/${props.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Edit Gereja</h1>
        <p class="text-muted-foreground text-sm">{{ gereja?.nama }}</p>
      </div>
    </div>

    <Alert v-if="gerejaStore.notifikasi?.type === 'error'" variant="destructive">
      {{ gerejaStore.notifikasi.message }}
    </Alert>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <Card class="p-6 space-y-5">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Gereja</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label>Nama Gereja <span class="text-destructive">*</span></Label>
            <Input v-model="form.nama" placeholder="GMIM Sion Manado" />
            <p v-if="errors.nama" class="text-xs text-destructive">{{ errors.nama }}</p>
          </div>
          <div class="space-y-1.5">
            <Label>Nama Pendeta <span class="text-destructive">*</span></Label>
            <Input v-model="form.namaPendeta" placeholder="Pdt. Nama Lengkap" />
            <p v-if="errors.namaPendeta" class="text-xs text-destructive">{{ errors.namaPendeta }}</p>
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <Label>Alamat</Label>
            <Input v-model="form.alamat" placeholder="Jl. Nama Jalan, Kota" />
          </div>
          <div class="space-y-1.5">
            <Label>Telepon</Label>
            <Input v-model="form.telepon" placeholder="0811-xxxx-xxxx" />
          </div>
          <div class="space-y-1.5">
            <Label>Subdomain <span class="text-destructive">*</span></Label>
            <div class="flex">
              <Input v-model="form.subdomain" placeholder="nama-gereja" class="rounded-r-none" />
              <span class="inline-flex items-center h-10 px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">.gmimapp.com</span>
            </div>
            <p v-if="errors.subdomain" class="text-xs text-destructive">{{ errors.subdomain }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-6 space-y-5">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Langganan</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label>Paket</Label>
            <Select v-model="form.paketLangganan" :options="paketOptions" />
          </div>
          <div class="space-y-1.5">
            <Label>Status</Label>
            <Select v-model="form.statusLangganan" :options="langgananOptions" />
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
