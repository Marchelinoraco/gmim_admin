<script setup>
defineProps({
  title: {
    type: String,
    default: ""
  },
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "bordered", "flat"].includes(value)
  },
  padding: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div
    class="bg-white rounded-lg"
    :class="[
      shadow ? 'shadow-md' : '',
      padding ? 'p-6' : '',
      variant === 'bordered' ? 'border border-gray-200' : '',
      variant === 'flat' ? 'shadow-none' : ''
    ]"
  >
    <h3 v-if="title" class="text-lg font-semibold text-gray-800 mb-4">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>
