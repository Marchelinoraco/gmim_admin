<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { useGerejaStore } from "@/stores/gerejaStore"
import { ArrowLeft, Pencil, Mail, Phone, User, Building, Clock } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Separator from "@/components/ui/Separator.vue"

const props = defineProps({ id: String })
const router         = useRouter()
const bendaharaStore = useBendaharaStore()
const gerejaStore    = useGerejaStore()

const bendahara   = computed(() => bendaharaStore.getById(props.id))
const namaGereja  = computed(() => gerejaStore.getById(bendahara.value?.gerejaId)?.nama || "-")

function formatDate(iso) {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" })
}
</script>

<template>
  <div v-if="bendahara" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ bendahara.namaLengkap }}</h1>
          <p class="text-muted-foreground text-sm">Detail akun bendahara</p>
        </div>
      </div>
      <Button @click="router.push(`/super-admin/bendahara/${id}/edit`)">
        <Pencil class="h-4 w-4" />
        Edit
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-2 p-6 space-y-5">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Akun</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <User class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Nama Lengkap</p>
              <p class="font-medium text-sm">{{ bendahara.namaLengkap }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Mail class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Email</p>
              <p class="font-medium text-sm">{{ bendahara.email }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Phone class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Telepon</p>
              <p class="font-medium text-sm">{{ bendahara.telepon || "-" }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Building class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Gereja</p>
              <p class="font-medium text-sm">{{ namaGereja }}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div class="flex items-start gap-3">
          <Clock class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p class="text-xs text-muted-foreground">Login Terakhir</p>
            <p class="font-medium text-sm">{{ formatDate(bendahara.loginTerakhir) }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-6 space-y-4">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Status Akun</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Status</span>
            <Badge :variant="bendahara.status === 'active' ? 'success' : 'secondary'">{{ bendahara.status }}</Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Username</span>
            <code class="text-xs bg-muted px-2 py-0.5 rounded font-mono">{{ bendahara.username }}</code>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Role</span>
            <span class="text-sm font-medium">{{ bendahara.role }}</span>
          </div>
        </div>
        <Separator />
        <Button
          variant="outline"
          class="w-full"
          @click="bendaharaStore.toggleStatus(bendahara.id)"
        >
          {{ bendahara.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun' }}
        </Button>
      </Card>
    </div>
  </div>

  <div v-else class="flex items-center justify-center py-20">
    <div class="text-center text-muted-foreground">
      <p>Bendahara tidak ditemukan.</p>
      <Button variant="link" @click="router.push('/super-admin/bendahara')">Kembali</Button>
    </div>
  </div>
</template>
