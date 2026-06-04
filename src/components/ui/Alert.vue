<script setup>
import { cn } from "@/lib/utils"
defineProps({
  variant: { type: String, default: "default" }, // default | destructive | success | warning
  class:   { type: String, default: "" },
})
const variants = {
  default:     "bg-background text-foreground border",
  destructive: "border-destructive/50 text-destructive bg-destructive/10",
  success:     "border-emerald-200 text-emerald-800 bg-emerald-50",
  warning:     "border-amber-200 text-amber-800 bg-amber-50",
}
</script>
<template>
  <div role="alert" :class="cn('relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11', variants[variant], $props.class)">
    <slot />
  </div>
</template>
