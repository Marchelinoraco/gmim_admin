<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import { ArrowLeft, Pencil, Globe, GlobeLock, Church, Phone, MapPin, User } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Separator from "@/components/ui/Separator.vue"

const props = defineProps({ id: String })
const router = useRouter()
const gerejaStore = useGerejaStore()

const gereja = computed(() => gerejaStore.getById(props.id))

const statusLanggananVariant = { active: "success", trial: "warning", expired: "destructive" }
const statusDomainVariant    = { aktif: "success", pending: "warning", nonaktif: "secondary" }

function handleAktifkan() {
  gerejaStore.aktifkanDomain(props.id)
}
function handleNonaktifkan() {
  gerejaStore.nonaktifkanDomain(props.id)
}
</script>

<template>
  <div v-if="gereja" class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" @click="router.back()"><ArrowLeft class="h-4 w-4" /></Button>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ gereja.nama }}</h1>
          <p class="text-muted-foreground text-sm">Detail informasi gereja</p>
        </div>
      </div>
      <Button @click="router.push(`/super-admin/gereja/${id}/edit`)">
        <Pencil class="h-4 w-4" />
        Edit
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Info utama -->
      <Card class="lg:col-span-2 p-6 space-y-5">
        <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Gereja</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <Church class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Nama Gereja</p>
              <p class="font-medium text-sm">{{ gereja.nama }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <User class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Nama Pendeta</p>
              <p class="font-medium text-sm">{{ gereja.namaPendeta || "-" }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <MapPin class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Alamat</p>
              <p class="font-medium text-sm">{{ gereja.alamat || "-" }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Phone class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Telepon</p>
              <p class="font-medium text-sm">{{ gereja.telepon || "-" }}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p class="text-xs text-muted-foreground mb-2">URL Aplikasi</p>
          <code class="text-sm font-mono bg-muted px-3 py-1.5 rounded-md">
            https://{{ gereja.subdomain }}.gmimapp.com
          </code>
        </div>
      </Card>

      <!-- Status & Domain -->
      <div class="space-y-4">
        <Card class="p-6 space-y-4">
          <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Status</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Langganan</span>
              <Badge :variant="statusLanggananVariant[gereja.statusLangganan] || 'secondary'">
                {{ gereja.statusLangganan }}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Domain</span>
              <Badge :variant="statusDomainVariant[gereja.statusDomain] || 'secondary'">
                {{ gereja.statusDomain }}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Paket</span>
              <span class="text-sm font-medium">{{ gereja.paketLangganan }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Bergabung</span>
              <span class="text-sm">{{ gereja.bergabungPada }}</span>
            </div>
          </div>
        </Card>

        <Card class="p-6 space-y-3">
          <h2 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Aksi Domain</h2>
          <Button
            v-if="gereja.statusDomain !== 'aktif'"
            class="w-full"
            @click="handleAktifkan"
          >
            <Globe class="h-4 w-4" />
            Aktifkan Domain
          </Button>
          <Button
            v-if="gereja.statusDomain === 'aktif'"
            variant="outline"
            class="w-full"
            @click="handleNonaktifkan"
          >
            <GlobeLock class="h-4 w-4" />
            Nonaktifkan Domain
          </Button>
        </Card>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center py-20">
    <div class="text-center text-muted-foreground">
      <Church class="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p>Gereja tidak ditemukan.</p>
      <Button variant="link" @click="router.push('/super-admin/gereja')">Kembali ke daftar</Button>
    </div>
  </div>
</template>
