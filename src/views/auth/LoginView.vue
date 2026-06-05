<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center mb-6">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3">
          <svg class="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Super Admin</h1>
        <p class="text-sm text-muted-foreground mt-1">Panel administrasi platform GMIM Keuangan</p>
      </div>

      <div class="rounded-lg border bg-card shadow-sm p-6">
        <div v-if="errorMessage" class="mb-4 rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required autocomplete="email"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="admin@gmim.app" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" required autocomplete="current-password"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Password" />
          </div>
          <button type="submit"
            class="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            :disabled="loading">
            {{ loading ? "Memproses..." : "Masuk" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { useAdminAuthStore } from "@/stores/adminAuthStore"

const router    = useRouter()
const authStore = useAdminAuthStore()

const form = reactive({ email: "", password: "" })
const errorMessage = ref("")
const loading      = ref(false)

async function handleLogin() {
  errorMessage.value = ""
  loading.value      = true
  try {
    const result = await authStore.login(form.email, form.password)
    if (result.success) {
      router.push({ name: "Dashboard" })
    } else {
      errorMessage.value = result.message
    }
  } finally {
    loading.value = false
  }
}
</script>
