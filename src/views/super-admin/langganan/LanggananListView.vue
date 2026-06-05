<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Langganan</h1>
        <p class="text-muted-foreground text-sm mt-1">Kelola status langganan semua gereja</p>
      </div>
    </div>

    <!-- Filter status -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="f in filterOptions" :key="f.value"
        class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="filterStatus === f.value
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-white text-muted-foreground border-input hover:border-primary/50'"
        @click="filterStatus = filterStatus === f.value ? '' : f.value">
        {{ f.label }}
      </button>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">Memuat data langganan...</div>

    <Card v-else>
      <div v-if="!filtered.length" class="px-6 py-10 text-center text-sm text-muted-foreground">
        Tidak ada data langganan{{ filterStatus ? ` dengan status "${filterStatus}"` : "" }}.
      </div>
      <table v-else class="w-full text-sm">
        <thead class="border-b bg-muted/30">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gereja</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Paket</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Berakhir</th>
            <th class="px-4 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="l in filtered" :key="l.id" class="hover:bg-muted/20">
            <td class="px-4 py-3 font-medium">{{ l.gerejaNama }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ l.paketNama }}</td>
            <td class="px-4 py-3">
              <Badge :variant="statusVariant(l.status)">{{ labelStatus(l.status) }}</Badge>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
              {{ l.status === 'trial' ? l.trialBerakhir || '—' : l.berakhir || '—' }}
            </td>
            <td class="px-4 py-3 text-right">
              <button class="text-xs text-primary hover:underline" @click="openOverride(l)">
                Override
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>

    <!-- Modal Override -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-lg border bg-card shadow-lg p-6 space-y-4">
        <h2 class="font-semibold text-lg">Override Langganan — {{ target?.gerejaNama }}</h2>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <select v-model="override.status"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Tanggal Berakhir</label>
          <input v-model="override.berakhir" type="date"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Catatan (opsional)</label>
          <input v-model="override.catatan" type="text" placeholder="Alasan override..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div v-if="overrideError" class="text-sm text-rose-500">{{ overrideError }}</div>

        <div class="flex gap-2 pt-1">
          <button class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            :disabled="saving" @click="confirmOverride">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
          <button class="px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-muted"
            @click="showModal = false">
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { adminApi } from "@/api/admin"
import Card from "@/components/ui/Card.vue"
import Badge from "@/components/ui/Badge.vue"

const list        = ref([])
const loading     = ref(false)
const filterStatus = ref("")
const showModal   = ref(false)
const target      = ref(null)
const saving      = ref(false)
const overrideError = ref("")

const override = ref({ status: "", berakhir: "", catatan: "" })

const filterOptions = [
  { value: "trial",    label: "Trial" },
  { value: "active",   label: "Aktif" },
  { value: "past_due", label: "Past Due" },
  { value: "expired",  label: "Expired" },
]

const filtered = computed(() =>
  filterStatus.value ? list.value.filter((l) => l.status === filterStatus.value) : list.value
)

async function load() {
  loading.value = true
  try {
    const data = await adminApi.getAllLangganan()
    list.value = data.data || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openOverride(l) {
  target.value      = l
  overrideError.value = ""
  override.value = {
    status:   l.status,
    berakhir: l.berakhir || "",
    catatan:  "",
  }
  showModal.value = true
}

async function confirmOverride() {
  saving.value = true
  overrideError.value = ""
  try {
    const payload = { status: override.value.status }
    if (override.value.berakhir) payload.berakhir = override.value.berakhir
    if (override.value.catatan)  payload.catatan  = override.value.catatan

    const res = await adminApi.overrideLangganan(target.value.id, payload)
    const idx = list.value.findIndex((l) => l.id === target.value.id)
    if (idx !== -1 && res.data) list.value[idx] = res.data
    showModal.value = false
    await load()
  } catch (err) {
    overrideError.value = err.data?.message || "Gagal menyimpan override."
  } finally {
    saving.value = false
  }
}

function labelStatus(s) {
  return { trial: "Trial", active: "Aktif", past_due: "Past Due", expired: "Expired", canceled: "Canceled" }[s] || s
}

function statusVariant(s) {
  return { trial: "warning", active: "success", past_due: "warning", expired: "destructive", canceled: "secondary" }[s] || "secondary"
}

onMounted(load)
</script>
