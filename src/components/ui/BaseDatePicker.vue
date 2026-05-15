<script setup>
import { computed } from "vue"

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  label: {
    type: String,
    default: ""
  },
  error: {
    type: String,
    default: ""
  },
  max: {
    type: String,
    default: () => new Date().toISOString().split("T")[0]
  },
  min: {
    type: String,
    default: ""
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: "Pilih tanggal"
  }
})

const emit = defineEmits(["update:modelValue"])

const inputId = computed(() => `date-${props.label?.replace(/\s+/g, "-").toLowerCase() || "picker"}`)

function handleInput(event) {
  emit("update:modelValue", event.target.value)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="inputId"
      type="date"
      :value="modelValue"
      :max="max"
      :min="min || undefined"
      :disabled="disabled"
      :required="required"
      :class="[
        'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
        disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'
      ]"
      @input="handleInput"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
