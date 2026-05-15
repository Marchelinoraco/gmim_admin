<script setup>
import { ref, computed, watch } from "vue"
import { useGerejaStore } from "@/stores/gerejaStore"
import { validasiSubdomain } from "@/utils/validasiSubdomain"
import BaseInput from "@/components/ui/BaseInput.vue"
import BaseSelect from "@/components/ui/BaseSelect.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseModal from "@/components/ui/BaseModal.vue"

const props = defineProps({
  mode: {
    type: String,
    default: "tambah",
    validator: (value) => ["tambah", "edit"].includes(value)
  },
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(["submit", "cancel"])

const gerejaStore = useGerejaStore()

// Form state
const form = ref({
  nama: props.initialData?.nama || "",
  alamat: props.initialData?.alamat || "",
  namaPendeta: props.initialData?.namaPendeta || "",
  telepon: props.initialData?.telepon || "",
  subdomain: props.initialData?.subdomain || "",
  paketLangganan: props.initialData?.paketLangganan || ""
})

// Error state
const errors = ref({
  nama: "",
  alamat: "",
  namaPendeta: "",
  telepon: "",
  subdomain: "",
  paketLangganan: ""
})

// Subdomain confirmation dialog state (edit mode)
const showSubdomainDialog = ref(false)
const pendingSubdomain = ref("")
const originalSubdomain = props.initialData?.subdomain || ""

// Paket langganan options
const paketOptions = [
  { value: "Basic", label: "Basic" },
  { value: "Standard", label: "Standard" },
  { value: "Premium", label: "Premium" }
]

// Preview URL computed
const previewUrl = computed(() => {
  if (form.value.subdomain && form.value.subdomain.trim() !== "") {
    return `${form.value.subdomain}.gmimjadi.com`
  }
  return ""
})

// Real-time subdomain validation
watch(
  () => form.value.subdomain,
  (newValue) => {
    if (!newValue || newValue.trim() === "") {
      errors.value.subdomain = ""
      return
    }

    const hasil = validasiSubdomain(newValue)
    if (!hasil.valid) {
      errors.value.subdomain = hasil.pesan
      return
    }

    // Check uniqueness
    const excludeId = props.mode === "edit" && props.initialData ? props.initialData.id : null
    const tersedia = gerejaStore.isSubdomainTersedia(newValue, excludeId)
    if (!tersedia) {
      errors.value.subdomain = "Subdomain sudah digunakan"
      return
    }

    errors.value.subdomain = ""
  }
)

// Validate all fields
function validateForm() {
  let valid = true

  // Nama
  if (!form.value.nama || form.value.nama.trim() === "") {
    errors.value.nama = "Nama gereja wajib diisi"
    valid = false
  } else {
    errors.value.nama = ""
  }

  // Alamat
  if (!form.value.alamat || form.value.alamat.trim() === "") {
    errors.value.alamat = "Alamat wajib diisi"
    valid = false
  } else {
    errors.value.alamat = ""
  }

  // Nama Pendeta
  if (!form.value.namaPendeta || form.value.namaPendeta.trim() === "") {
    errors.value.namaPendeta = "Nama pendeta wajib diisi"
    valid = false
  } else {
    errors.value.namaPendeta = ""
  }

  // Telepon
  if (!form.value.telepon || form.value.telepon.trim() === "") {
    errors.value.telepon = "Nomor telepon wajib diisi"
    valid = false
  } else {
    errors.value.telepon = ""
  }

  // Subdomain
  const hasilSubdomain = validasiSubdomain(form.value.subdomain)
  if (!hasilSubdomain.valid) {
    errors.value.subdomain = hasilSubdomain.pesan
    valid = false
  } else {
    const excludeId = props.mode === "edit" && props.initialData ? props.initialData.id : null
    const tersedia = gerejaStore.isSubdomainTersedia(form.value.subdomain, excludeId)
    if (!tersedia) {
      errors.value.subdomain = "Subdomain sudah digunakan"
      valid = false
    } else {
      errors.value.subdomain = ""
    }
  }

  // Paket Langganan
  if (!form.value.paketLangganan) {
    errors.value.paketLangganan = "Paket langganan wajib dipilih"
    valid = false
  } else {
    errors.value.paketLangganan = ""
  }

  return valid
}

// Handle form submission
function handleSubmit() {
  if (!validateForm()) return

  // In edit mode, if subdomain changed, show confirmation dialog
  if (props.mode === "edit" && form.value.subdomain !== originalSubdomain) {
    pendingSubdomain.value = form.value.subdomain
    showSubdomainDialog.value = true
    return
  }

  emitSubmit()
}

// Confirm subdomain change and submit
function confirmSubdomainChange() {
  showSubdomainDialog.value = false
  emitSubmit()
}

// Cancel subdomain change dialog
function cancelSubdomainChange() {
  showSubdomainDialog.value = false
}

// Emit submit with form data
function emitSubmit() {
  emit("submit", { ...form.value })
}

// Handle cancel
function handleCancel() {
  emit("cancel")
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Nama Gereja -->
    <BaseInput v-model="form.nama" label="Nama Gereja" placeholder="Masukkan nama gereja" :error="errors.nama" />

    <!-- Alamat -->
    <BaseInput v-model="form.alamat" label="Alamat" placeholder="Masukkan alamat gereja" :error="errors.alamat" />

    <!-- Nama Pendeta -->
    <BaseInput
      v-model="form.namaPendeta"
      label="Nama Pendeta"
      placeholder="Masukkan nama pendeta"
      :error="errors.namaPendeta"
    />

    <!-- Telepon -->
    <BaseInput
      v-model="form.telepon"
      label="Nomor Telepon"
      placeholder="Masukkan nomor telepon"
      :error="errors.telepon"
    />

    <!-- Subdomain -->
    <div>
      <BaseInput
        v-model="form.subdomain"
        label="Subdomain"
        placeholder="contoh: sion-manado"
        :error="errors.subdomain"
        :maxlength="30"
      />
      <p v-if="previewUrl" class="mt-1 text-sm text-blue-600">
        {{ previewUrl }}
      </p>
    </div>

    <!-- Paket Langganan -->
    <BaseSelect
      v-model="form.paketLangganan"
      label="Paket Langganan"
      :options="paketOptions"
      placeholder="-- Pilih Paket --"
      :error="errors.paketLangganan"
    />

    <!-- Action Buttons -->
    <div class="flex items-center gap-3 pt-4">
      <BaseButton type="submit" variant="primary">
        {{ mode === "tambah" ? "Simpan" : "Perbarui" }}
      </BaseButton>
      <BaseButton variant="secondary" @click="handleCancel">Batal</BaseButton>
    </div>

    <!-- Subdomain Change Confirmation Dialog (Edit Mode) -->
    <BaseModal
      v-model:show="showSubdomainDialog"
      title="Konfirmasi Perubahan Subdomain"
      confirm-text="Ya, Ubah"
      cancel-text="Batal"
      @confirm="confirmSubdomainChange"
      @cancel="cancelSubdomainChange"
    >
      <p class="text-gray-700">
        Anda akan mengubah subdomain dari
        <span class="font-semibold">{{ originalSubdomain }}.gmimjadi.com</span>
        menjadi
        <span class="font-semibold">{{ pendingSubdomain }}.gmimjadi.com</span>
        .
      </p>
      <p class="mt-2 text-gray-600">
        URL lama tidak akan berfungsi setelah perubahan ini. Status domain akan kembali menjadi "pending".
      </p>
    </BaseModal>
  </form>
</template>
