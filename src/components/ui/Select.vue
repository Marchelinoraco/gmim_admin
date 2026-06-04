<script setup>
import { cn } from "@/lib/utils"
defineProps({
  class:      { type: String, default: "" },
  modelValue: { default: "" },
  disabled:   { type: Boolean, default: false },
  options:    { type: Array, default: () => [] }, // [{ value, label }]
  placeholder:{ type: String, default: "Pilih..." },
})
defineEmits(["update:modelValue"])
</script>

<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :class="cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', $props.class)"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
