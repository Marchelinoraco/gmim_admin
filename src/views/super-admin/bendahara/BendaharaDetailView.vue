<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { useGerejaStore } from "@/stores/gerejaStore"
import { formatLoginTerakhir } from "@/utils/formatTanggal"
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import BaseModal from "@/components/ui/BaseModal.vue"
import BaseAlert from "@/components/ui/BaseAlert.vue"
import BaseInput from "@/components/ui/BaseInput.vue"

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const bendaharaStore = useBendaharaStore()
const gerejaStore = useGerejaStore()

// Data
const bendahara = computed(() => bendaharaStore.getById(props.id))
const gereja = computed(() => {
  if (!bendahara.value) return null
  return gerejaStore.getById(bendahara.value.gerejaId)
})

// Notifikasi
const notifikasi = computed(() => bendaharaStore.notifikasi)

// Toggle Status Modal
const showToggleModal = ref(false)

// Reset Password Modal
const showResetModal = ref(false)
const newPassword = ref("")
const passwordError = ref("")

// Redirect jika bendahara tidak ditemukan
onMounted(() => {
  if (!bendahara.value) {
    router.push("/super-admin/bendahara")
  }
})

// Status badge styling
const statusBadgeClass = computed(() => {
  if (!bendahara.value) return ""
  return bendahara.value.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
})

const statusLabel = computed(() => {
  if (!bendahara.value) return ""
  return bendahara.value.status === "active" ? "Aktif" : "Nonaktif"
})

// Actions
function goToEdit() {
  router.push(`/super-admin/bendahara/${props.id}/edit`)
}

function goBack() {
  router.push("/super-admin/bendahara")
}

// Toggle Status
function openToggleModal() {
  showToggleModal.value = true
}

function confirmToggleStatus() {
  bendaharaStore.toggleStatus(props.id)
  showToggleModal.value = false
}

// Reset Password
function openResetModal() {
  newPassword.value = ""
  passwordError.value = ""
  showResetModal.value = true
}

function confirmResetPassword() {
  // Validasi password minimal 8 karakter
  if (!newPassword.value || newPassword.value.length < 8) {
    passwordError.value = "Password minimal 8 karakter"
    return
  }
  passwordError.value = ""
  bendaharaStore.resetPassword(props.id, newPassword.value)
  showResetModal.value = false
  newPassword.value = ""
}

function dismissNotifikasi() {
  bendaharaStore.notifikasi = null
}
</script>

<template>
  <div v-if="bendahara" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">Detail Bendahara</h1>
      <div class="flex gap-2">
        <BaseButton variant="primary" size="sm" @click="goToEdit">Edit</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="openToggleModal">
          {{ bendahara.status === "active" ? "Nonaktifkan" : "Aktifkan" }}
        </BaseButton>
        <BaseButton variant="danger" size="sm" @click="openResetModal">Reset Password</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="goBack">Kembali</BaseButton>
      </div>
    </div>

    <!-- Notifikasi -->
    <BaseAlert
      v-if="notifikasi"
      :type="notifikasi.type"
      :message="notifikasi.message"
      :auto-hide="notifikasi.type === 'success'"
      :auto-hide-duration="3000"
      @dismiss="dismissNotifikasi"
    />

    <!-- Info Bendahara -->
    <BaseCard title="Informasi Bendahara">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Nama Lengkap</p>
          <p class="text-base font-medium text-gray-800">{{ bendahara.namaLengkap }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Email</p>
          <p class="text-base font-medium text-gray-800">{{ bendahara.email }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Telepon</p>
          <p class="text-base font-medium text-gray-800">{{ bendahara.telepon }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Role</p>
          <p class="text-base font-medium text-gray-800">{{ bendahara.role }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Status</p>
          <span :class="['inline-block px-2 py-1 text-xs font-semibold rounded-full', statusBadgeClass]">
            {{ statusLabel }}
          </span>
        </div>
        <div>
          <p class="text-sm text-gray-500">Login Terakhir</p>
          <p class="text-base font-medium text-gray-800">{{ formatLoginTerakhir(bendahara.loginTerakhir) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Dibuat Pada</p>
          <p class="text-base font-medium text-gray-800">{{ bendahara.createdAt }}</p>
        </div>
      </div>
    </BaseCard>

    <!-- Info Gereja Terhubung -->
    <BaseCard title="Gereja Terhubung">
      <div v-if="gereja" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Nama Gereja</p>
          <p class="text-base font-medium text-gray-800">{{ gereja.nama }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Subdomain</p>
          <p class="text-base font-medium text-gray-800">{{ gereja.subdomain }}.gmimjadi.com</p>
        </div>
      </div>
      <div v-else>
        <p class="text-sm text-gray-500">Gereja tidak ditemukan</p>
      </div>
    </BaseCard>

    <!-- Modal Toggle Status -->
    <BaseModal
      v-model:show="showToggleModal"
      :title="bendahara.status === 'active' ? 'Nonaktifkan Bendahara' : 'Aktifkan Bendahara'"
      :confirm-text="bendahara.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'"
      cancel-text="Batal"
      @confirm="confirmToggleStatus"
    >
      <p class="text-gray-600">
        Apakah Anda yakin ingin
        {{ bendahara.status === "active" ? "menonaktifkan" : "mengaktifkan" }}
        bendahara
        <strong>{{ bendahara.namaLengkap }}</strong>
        ?
      </p>
    </BaseModal>

    <!-- Modal Reset Password -->
    <BaseModal
      v-model:show="showResetModal"
      title="Reset Password"
      confirm-text="Reset Password"
      cancel-text="Batal"
      @confirm="confirmResetPassword"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          Masukkan password baru untuk
          <strong>{{ bendahara.namaLengkap }}</strong>
          :
        </p>
        <BaseInput
          v-model="newPassword"
          label="Password Baru"
          type="password"
          placeholder="Minimal 8 karakter"
          :error="passwordError"
        />
      </div>
    </BaseModal>
  </div>
</template>
