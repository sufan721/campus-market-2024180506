<template>
  <div class="empty-state">
    <p>{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--color-text-regular);
  background: var(--color-card-bg);
  border-radius: var(--border-radius-card);
  border: 1px dashed var(--color-border-dark);
}
</style>
