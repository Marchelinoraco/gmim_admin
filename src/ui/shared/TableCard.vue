<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="card wrap">
    <header class="head">
      <div class="titles">
        <div class="title">{{ title }}</div>
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.wrap {
  padding: 14px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.title {
  font-weight: 800;
}

.subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.body {
  overflow: auto;
}
</style>
