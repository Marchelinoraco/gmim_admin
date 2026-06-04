<script setup>
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps({
  variant: { type: String, default: "default" },
  class:   { type: String, default: "" },
})

const variants = {
  default:     "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:   "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline:     "text-foreground",
  success:     "border-transparent bg-emerald-100 text-emerald-700",
  warning:     "border-transparent bg-amber-100 text-amber-700",
}

const classes = computed(() =>
  cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
     variants[props.variant] || variants.default, props.class)
)
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
