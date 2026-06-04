<script setup>
defineProps({
  open:         { type: Boolean, default: false },
  title:        { type: String, default: "" },
  description:  { type: String, default: "" },
  confirmText:  { type: String, default: "Konfirmasi" },
  cancelText:   { type: String, default: "Batal" },
  variant:      { type: String, default: "default" }, // default | destructive
})
defineEmits(["confirm", "cancel", "update:open"])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60" @click="$emit('update:open', false); $emit('cancel')" />

        <!-- Dialog panel -->
        <div class="relative z-10 w-full max-w-md mx-4 bg-background rounded-lg shadow-xl border">
          <div class="px-6 pt-6 pb-4">
            <h2 v-if="title" class="text-lg font-semibold text-foreground">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
            <div class="mt-4">
              <slot />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30 rounded-b-lg">
            <button
              class="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors"
              @click="$emit('update:open', false); $emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button
              class="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white transition-colors"
              :class="variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
