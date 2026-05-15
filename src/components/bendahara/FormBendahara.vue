<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { useGerejaStore } from "@/stores/gerejaStore"
import { validasiBendahara } from "@/utils/validasiBendahara"
import BaseInput from "@/components/ui/BaseInput.vue"
import BaseSelect from "@/components/ui/BaseSelect.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseCard from "@/components/ui/BaseCard.vue"

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ["tambah", "edit"].includes(value)
  },
  initialData: {
    type: Object,
    default: null
  },
  preselectedGerejaId: {
    type: String,
    default: ""
  }
})

const emit = defineEmits(["submit", "cancel"])

const gerejaStore = useGerejaStore()

// === FORM STATE ===
const form = ref({
  namaLengkap: "",
  email: "",
  password: "",
  gerejaId: "",
  telepon: "",
  role: ""
})

const errors = ref({})

// === COMPUTED ===
const gerejaOptions = computed(() => {
  return gerejaStore.gerejaAktifDanPending.map((g) => ({
    value: g.id,
    label: g.nama
  }))
})

const roleOptions = [
  { value: "Admin Gereja", label: "Admin Gereja" },
  { value: "Bendahara", label: "Bendahara" },
  { value: "Viewer / Majelis", label: "Viewer / Majelis" }
]

const selectedGereja = computed(() => {
  if (!form.value.gerejaId) return null
  return gerejaStore.gerejaAktifDanPending.find((g) => g.id === form.value.gerejaId) || null
})

const isModeTambah = computed(() => props.mode === "tambah")

const statusLanggananLabel = computed(() => {
  if (!selectedGereja.value) return ""
  const map = {
    active: "Aktif",
    trial: "Trial",
    expired: "Expired"
  }
  return map[selectedGereja.value.statusLangganan] || selectedGereja.value.statusLangganan
})

// === LIFECYCLE ===
onMounted(() => {
  if (props.initialData) {
    form.value.namaLengkap = props.initialData.namaLengkap || ""
    form.value.email = props.initialData.email || ""
    form.value.gerejaId = props.initialData.gerejaId || ""
    form.value.telepon = props.initialData.telepon || ""
    form.value.role = props.initialData.role || ""
  }

  if (props.preselectedGerejaId) {
    form.value.gerejaId = props.preselectedGerejaId
  }
})

// === METHODS ===
function handleSubmit() {
  const isCreate = isModeTambah.value
  const { valid, errors: validationErrors } = validasiBendahara(form.value, isCreate)

  if (!valid) {
    errors.value = validationErrors
    return
  }

  errors.value = {}

  const data = { ...form.value }
  if (!isCreate) {
    delete data.password
  }

  emit("submit", data)
}

function handleCancel() {
  emit("cancel")
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nama Lengkap -->
    <BaseInput
      label="Nama Lengkap"
      v-model="form.namaLengkap"
      placeholder="Masukkan nama lengkap"
      :error="errors.namaLengkap"
    />

    <!-- Email -->
    <BaseInput label="Email" type="email" v-model="form.email" placeholder="Masukkan email" :error="errors.email" />

    <!-- Password (hanya mode tambah) -->
    <BaseInput
      v-if="isModeTambah"
      label="Password"
      type="password"
      v-model="form.password"
      placeholder="Masukkan password (min. 8 karakter)"
      :error="errors.password"
    />

    <!-- Gereja Dropdown -->
    <BaseSelect
      label="Gereja"
      v-model="form.gerejaId"
      :options="gerejaOptions"
      placeholder="-- Pilih Gereja --"
      :error="errors.gerejaId"
    />

    <!-- Info Gereja Terpilih -->
    <BaseCard v-if="selectedGereja" variant="bordered" :shadow="false" class="!p-4">
      <div class="space-y-1">
        <p class="text-sm font-medium text-gray-800">{{ selectedGereja.nama }}</p>
        <p class="text-sm text-gray-600">
          Subdomain:
          <span class="font-mono text-blue-600">{{ selectedGereja.subdomain }}.gmimjadi.com</span>
        </p>
        <p class="text-sm text-gray-600">
          Status Langganan:
          <span
            :class="[
              'inline-block px-2 py-0.5 rounded text-xs font-medium',
              selectedGereja.statusLangganan === 'active' ? 'bg-green-100 text-green-700' : '',
              selectedGereja.statusLangganan === 'trial' ? 'bg-yellow-100 text-yellow-700' : '',
              selectedGereja.statusLangganan === 'expired' ? 'bg-red-100 text-red-700' : ''
            ]"
          >
            {{ statusLanggananLabel }}
          </span>
        </p>
      </div>
    </BaseCard>

    <!-- Telepon -->
    <BaseInput
      label="Nomor Telepon"
      v-model="form.telepon"
      placeholder="Masukkan nomor telepon"
      :error="errors.telepon"
    />

    <!-- Role Dropdown -->
    <BaseSelect
      label="Role"
      v-model="form.role"
      :options="roleOptions"
      placeholder="-- Pilih Role --"
      :error="errors.role"
    />

    <!-- Tombol Aksi -->
    <div class="flex items-center gap-3 pt-4">
      <BaseButton type="submit" variant="primary">
        {{ isModeTambah ? "Simpan" : "Perbarui" }}
      </BaseButton>
      <BaseButton type="button" variant="secondary" @click="handleCancel">Batal</BaseButton>
    </div>
  </form>
</template>
