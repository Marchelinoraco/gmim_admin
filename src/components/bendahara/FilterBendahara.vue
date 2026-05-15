<script setup>
import { ref, onUnmounted } from "vue"
import BaseInput from "@/components/ui/BaseInput.vue"
import BaseSelect from "@/components/ui/BaseSelect.vue"

defineProps({
  gerejaOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["update:pencarian", "update:filterGereja", "update:filterStatus"])

// Debounce pencarian
const pencarian = ref("")
let debounceTimer = null

function onPencarianInput(value) {
  pencarian.value = value
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    emit("update:pencarian", value)
  }, 300)
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Filter gereja
function onFilterGerejaChange(value) {
  emit("update:filterGereja", value)
}

// Filter status
function onFilterStatusChange(value) {
  emit("update:filterStatus", value)
}

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" }
]
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 w-full">
    <div class="flex-1">
      <BaseInput
        :modelValue="pencarian"
        placeholder="Cari nama, email, atau gereja..."
        @update:modelValue="onPencarianInput"
      />
    </div>
    <div class="w-full sm:w-48">
      <BaseSelect
        :options="[{ value: '', label: 'Semua Gereja' }, ...gerejaOptions]"
        modelValue=""
        @update:modelValue="onFilterGerejaChange"
      />
    </div>
    <div class="w-full sm:w-48">
      <BaseSelect :options="statusOptions" modelValue="" @update:modelValue="onFilterStatusChange" />
    </div>
  </div>
</template>
