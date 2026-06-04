<script setup>
import { cn } from "@/lib/utils"
defineProps({ class: { type: String, default: "" }, orientation: { type: String, default: "horizontal" } })
</script>
<template>
  <div
    role="separator"
    :class="cn('shrink-0 bg-border', $props.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', $props.class)"
  />
</template>
