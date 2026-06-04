<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { Church, Users, Clock, CheckCircle, TrendingUp, ArrowRight } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Badge from "@/components/ui/Badge.vue"
import Button from "@/components/ui/Button.vue"

const router       = useRouter()
const gerejaStore  = useGerejaStore()
const bendaharaStore = useBendaharaStore()

const stats = computed(() => [
  {
    label: "Total Gereja",
    value: gerejaStore.gerejaList.length,
    icon:  Church,
    color: "text-blue-600",
    bg:    "bg-blue-50",
    change: "+2 bulan ini",
  },
  {
    label: "Total Bendahara",
    value: bendaharaStore.bendaharaList.length,
    icon:  Users,
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
    change: "+1 bulan ini",
  },
  {
    label: "Domain Aktif",
    value: gerejaStore.gerejaList.filter(g => g.statusDomain === "aktif").length,
    icon:  CheckCircle,
    color: "text-green-600",
    bg:    "bg-green-50",
    change: "domain aktif",
  },
  {
    label: "Domain Pending",
    value: gerejaStore.gerejaList.filter(g => g.statusDomain === "pending").length,
    icon:  Clock,
    color: "text-amber-600",
    bg:    "bg-amber-50",
    change: "perlu ditinjau",
  },
])

const recentGereja = computed(() =>
  [...gerejaStore.gerejaList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
)

const statusLanggananVariant = {
  active:  "success",
  trial:   "warning",
  expired: "destructive",
}

const statusDomainVariant = {
  aktif:    "success",
  pending:  "warning",
  nonaktif: "secondary",
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Selamat datang di panel administrasi GMIM</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="stat in stats" :key="stat.label" class="p-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">{{ stat.label }}</p>
            <p class="text-3xl font-bold mt-2 tracking-tight">{{ stat.value }}</p>
            <p class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp class="h-3 w-3" />
              {{ stat.change }}
            </p>
          </div>
          <div :class="['p-2.5 rounded-lg', stat.bg]">
            <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Recent Gereja -->
    <Card>
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="font-semibold">Gereja Terbaru</h2>
          <p class="text-sm text-muted-foreground">5 gereja terbaru yang terdaftar</p>
        </div>
        <Button variant="outline" size="sm" @click="router.push('/super-admin/gereja')">
          Lihat Semua
          <ArrowRight class="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div class="divide-y">
        <div
          v-for="gereja in recentGereja"
          :key="gereja.id"
          class="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
          @click="router.push(`/super-admin/gereja/${gereja.id}`)"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <Church class="h-4 w-4 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ gereja.nama }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ gereja.subdomain }}.gmimapp.com</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <Badge :variant="statusLanggananVariant[gereja.statusLangganan] || 'secondary'">
              {{ gereja.statusLangganan }}
            </Badge>
            <Badge :variant="statusDomainVariant[gereja.statusDomain] || 'secondary'">
              {{ gereja.statusDomain }}
            </Badge>
          </div>
        </div>

        <div v-if="recentGereja.length === 0" class="px-6 py-8 text-center text-sm text-muted-foreground">
          Belum ada gereja terdaftar.
        </div>
      </div>
    </Card>
  </div>
</template>
