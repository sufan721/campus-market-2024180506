<template>
  <div
    class="image-box"
    :class="{ 'image-box--placeholder': showPlaceholder }"
    :style="boxStyle"
  >
    <img
      v-if="imagePath"
      :src="imagePath"
      :alt="alt"
      class="image-box__img"
      @error="onError"
      @load="onLoad"
    />
    <span v-if="showPlaceholder" class="image-box__emoji" :style="{ fontSize: iconSize }">
      {{ fallbackEmoji }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  imagePath: string
  fallbackEmoji: string
  alt?: string
  height?: string
  borderRadius?: string
  iconSize?: string
}>(), {
  alt: '图片',
  height: '140px',
  borderRadius: '12px 12px 0 0',
  iconSize: '48px',
})

const imgFailed = ref(false)

const showPlaceholder = computed(() => !props.imagePath || imgFailed.value)

const boxStyle = computed(() => ({
  height: props.height,
  borderRadius: props.borderRadius,
}))

function onError() {
  imgFailed.value = true
}

function onLoad() {
  imgFailed.value = false
}
</script>

<style scoped>
.image-box {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-image-placeholder-from) 0%, var(--color-image-placeholder-to) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-box--placeholder {
  background: linear-gradient(135deg, var(--color-image-placeholder-from) 0%, var(--color-image-placeholder-to) 100%);
}

.image-box__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-box__emoji {
  opacity: 0.5;
  pointer-events: none;
}
</style>
