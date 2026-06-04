<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useGerejaStore } from "@/stores/gerejaStore"
import { Church, Plus, Search, Pencil, Trash2, Eye } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Input from "@/components/ui/Input.vue"
import Alert from "@/components/ui/Alert.vue"
import Dialog from "@/components/ui/Dialog.vue"

const router      = useRouter()
const gerejaStore = useGerejaStore()

const search       = ref("")
const deleteTarget = ref(null)
const showDialog   = ref(false)

const notifikasi = computed(() => gerejaStore.notifikasi)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return gerejaStore.gerejaList
  return gerejaStore.gerejaList.filter(g =>
    g.nama.toLowerCase().includes(q) ||
    g.subdomain.toLowerCase().includes(q) ||
    (g.namaPendeta || "").toLowerCase().includes(q)
  )
})

function konfirmasiHapus(gereja) {
  deleteTarget.value = gereja
  showDialog.value = true
}

function handleHapus() {
  if (deleteTarget.value) gerejaStore.hapusGereja(deleteTarget.value.id)
  showDialog.value = false
  deleteTarget.value = null
}

const statusLanggananVariant = { active: "success", trial: "warning", expired: "destructive" }
const statusDomainVariant    = { aktif: "success", pending: "warning", nonaktif: "secondary" }
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Daftar Gereja</h1>
        <p class="text-muted-foreground text-sm mt-1">{{ gerejaStore.gerejaList.length }} gereja terdaftar</p>
      </div>
      <Button @click="router.push('/super-admin/gereja/tambah')">
        <Plus class="h-4 w-4" />
        Tambah Gereja
      </Button>
    </div>

    <Alert v-if="notifikasi" :variant="notifikasi.type === 'error' ? 'destructive' : 'success'">
      {{ notifikasi.message }}
    </Alert>

    <Card>
      <div class="px-4 py-3 border-b flex items-center gap-3">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="search" placeholder="Cari nama, subdomain, pendeta..." class="pl-9" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted/40">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Gereja</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Subdomain</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Langganan</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Domain</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="gereja in filtered" :key="gereja.id" class="hover:bg-muted/20 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Church class="h-4 w-4 text-primary" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium truncate">{{ gereja.nama }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ gereja.namaPendeta }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-muted-foreground font-mono text-xs">{{ gereja.subdomain }}.gmimapp.com</td>
              <td class="px-4 py-3"><span class="text-xs font-medium">{{ gereja.paketLangganan }}</span></td>
              <td class="px-4 py-3">
                <Badge :variant="statusLanggananVariant[gereja.statusLangganan] || 'secondary'">{{ gereja.statusLangganan }}</Badge>
              </td>
              <td class="px-4 py-3">
                <Badge :variant="statusDomainVariant[gereja.statusDomain] || 'secondary'">{{ gereja.statusDomain }}</Badge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" @click="router.push(`/super-admin/gereja/${gereja.id}`)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="router.push(`/super-admin/gereja/${gereja.id}/edit`)">
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="konfirmasiHapus(gereja)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-muted-foreground">
                <Church class="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Tidak ada gereja ditemukan.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Dialog
      :open="showDialog"
      title="Hapus Gereja"
      :description="`Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus"
      cancel-text="Batal"
      variant="destructive"
      @confirm="handleHapus"
      @cancel="showDialog = false"
      @update:open="showDialog = $event"
    />
  </div>
</template>
