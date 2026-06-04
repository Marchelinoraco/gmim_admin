<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useBendaharaStore } from "@/stores/bendaharaStore"
import { useGerejaStore } from "@/stores/gerejaStore"
import { Users, Plus, Search, Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-vue-next"
import Card from "@/components/ui/Card.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Input from "@/components/ui/Input.vue"
import Dialog from "@/components/ui/Dialog.vue"

const router          = useRouter()
const bendaharaStore  = useBendaharaStore()
const gerejaStore     = useGerejaStore()

const search       = ref("")
const deleteTarget = ref(null)
const showDialog   = ref(false)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return bendaharaStore.bendaharaList
  return bendaharaStore.bendaharaList.filter(b =>
    b.namaLengkap.toLowerCase().includes(q) ||
    b.username.toLowerCase().includes(q) ||
    b.email.toLowerCase().includes(q)
  )
})

function getNamaGereja(gerejaId) {
  return gerejaStore.getById(gerejaId)?.nama || gerejaId
}

function konfirmasiHapus(b) {
  deleteTarget.value = b
  showDialog.value = true
}

function handleHapus() {
  if (deleteTarget.value) bendaharaStore.hapusBendahara(deleteTarget.value.id)
  showDialog.value = false
  deleteTarget.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Daftar Bendahara</h1>
        <p class="text-muted-foreground text-sm mt-1">{{ bendaharaStore.bendaharaList.length }} bendahara terdaftar</p>
      </div>
      <Button @click="router.push('/super-admin/bendahara/tambah')">
        <Plus class="h-4 w-4" />
        Tambah Bendahara
      </Button>
    </div>

    <Card>
      <div class="px-4 py-3 border-b flex items-center gap-3">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="search" placeholder="Cari nama, username, email..." class="pl-9" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted/40">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Bendahara</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Gereja</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="b in filtered" :key="b.id" class="hover:bg-muted/20 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold text-xs">
                    {{ b.namaLengkap.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium truncate">{{ b.namaLengkap }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ b.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ getNamaGereja(b.gerejaId) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{{ b.username }}</td>
              <td class="px-4 py-3">
                <Badge :variant="b.status === 'active' ? 'success' : 'secondary'">{{ b.status }}</Badge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" @click="router.push(`/super-admin/bendahara/${b.id}`)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="router.push(`/super-admin/bendahara/${b.id}/edit`)">
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" :title="b.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'"
                    @click="bendaharaStore.toggleStatus(b.id)">
                    <component :is="b.status === 'active' ? ToggleRight : ToggleLeft" class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="konfirmasiHapus(b)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-muted-foreground">
                <Users class="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Tidak ada bendahara ditemukan.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Dialog
      :open="showDialog"
      title="Hapus Bendahara"
      :description="`Hapus akun bendahara ${deleteTarget?.namaLengkap}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus"
      cancel-text="Batal"
      variant="destructive"
      @confirm="handleHapus"
      @cancel="showDialog = false"
      @update:open="showDialog = $event"
    />
  </div>
</template>
