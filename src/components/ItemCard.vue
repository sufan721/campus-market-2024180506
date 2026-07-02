<template>
  <article class="item-card" @click="$emit('click')">
    <ImageBox
      v-if="image !== undefined"
      :image-path="image"
      :fallback-emoji="fallbackEmoji"
      height="140px"
      border-radius="12px 12px 0 0"
      icon-size="48px"
    />
    <div class="item-card__body">
      <div class="item-card__header">
        <h3>{{ title }}</h3>
        <span v-if="tag" class="tag">{{ tag }}</span>
      </div>

      <p class="description">{{ description }}</p>

      <div class="meta">
        <span v-if="location">地点：{{ location }}</span>
        <span v-if="time">时间：{{ time }}</span>
      </div>

      <div v-if="$slots.footer" class="footer">
        <slot name="footer" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import ImageBox from './ImageBox.vue'

defineProps<{
  title: string
  description: string
  tag?: string
  location?: string
  time?: string
  image?: string
  fallbackEmoji?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.item-card {
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.item-card:hover {
  box-shadow: var(--color-card-hover-shadow);
  transform: translateY(var(--color-card-hover-lift));
}

.item-card__body {
  padding: 18px;
}

.item-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.item-card h3 {
  margin: 0;
  font-size: 18px;
}

.tag {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--color-tag-primary-bg);
  color: var(--color-tag-primary-text);
  font-size: 12px;
  white-space: nowrap;
}

.description {
  margin: 12px 0;
  color: var(--color-text-regular);
  line-height: 1.6;
}

.meta {
  display: flex;
  gap: 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.footer {
  margin-top: 12px;
}
</style>
