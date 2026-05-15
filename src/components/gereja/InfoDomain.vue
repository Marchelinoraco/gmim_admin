<script setup>
import BaseCard from "@/components/ui/BaseCard.vue"
import BaseButton from "@/components/ui/BaseButton.vue"

defineProps({
  gereja: {
    type: Object,
    required: true
  }
})

defineEmits(["aktifkanDomain", "nonaktifkanDomain"])

const badgeClasses = {
  aktif: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  nonaktif: "bg-red-100 text-red-800"
}

const badgeLabels = {
  aktif: "Aktif",
  pending: "Pending",
  nonaktif: "Nonaktif"
}
</script>

<template>
  <BaseCard title="Informasi Domain">
    <div class="space-y-4">
      <!-- Subdomain -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">Subdomain</span>
        <span class="text-sm text-gray-900">{{ gereja.subdomain }}</span>
      </div>

      <!-- URL Lengkap -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">URL</span>
        <span class="text-sm text-blue-600 font-mono">{{ gereja.subdomain }}.gmimjadi.com</span>
      </div>

      <!-- Status Domain -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">Status Domain</span>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="badgeClasses[gereja.statusDomain]"
        >
          {{ badgeLabels[gereja.statusDomain] }}
        </span>
      </div>

      <!-- Tombol Aksi -->
      <div class="pt-4 border-t border-gray-200">
        <BaseButton
          v-if="gereja.statusDomain === 'pending' || gereja.statusDomain === 'nonaktif'"
          variant="primary"
          size="sm"
          @click="$emit('aktifkanDomain')"
        >
          Aktifkan Domain
        </BaseButton>

        <BaseButton
          v-if="gereja.statusDomain === 'aktif'"
          variant="danger"
          size="sm"
          @click="$emit('nonaktifkanDomain')"
        >
          Nonaktifkan Domain
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>
