<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger";
}>();
</script>

<template>
  <div class="wrap card" :class="tone ?? 'primary'">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 14px 14px 12px;
  display: grid;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: var(--muted);
}

.value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.hint {
  font-size: 12px;
  color: var(--muted);
}

.primary {
  border-color: rgba(91, 140, 255, 0.22);
}
.success {
  border-color: rgba(53, 208, 161, 0.22);
}
.warning {
  border-color: rgba(255, 184, 107, 0.22);
}
.danger {
  border-color: rgba(255, 91, 122, 0.22);
}
</style>
