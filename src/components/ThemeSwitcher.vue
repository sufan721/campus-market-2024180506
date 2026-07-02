<script setup lang="ts">
import { Brush } from '@element-plus/icons-vue'
import { useThemeStore, themes } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <el-popover
    placement="bottom"
    :width="260"
    trigger="click"
    :teleported="true"
  >
    <template #reference>
      <el-button
        class="theme-toggle-btn"
        circle
        :icon="Brush"
        size="small"
        title="切换主题"
      />
    </template>

    <div class="theme-picker">
      <div class="theme-picker-title">选择主题</div>
      <div class="theme-grid">
        <div
          v-for="t in themes"
          :key="t.id"
          class="theme-card"
          :class="{ active: themeStore.currentTheme === t.id }"
          @click="themeStore.setTheme(t.id)"
        >
          <div
            class="theme-preview"
            :style="{ background: t.preview }"
          >
            <span v-if="themeStore.currentTheme === t.id" class="theme-check">✓</span>
          </div>
          <div class="theme-meta">
            <span class="theme-name">{{ t.name }}</span>
            <span class="theme-desc">{{ t.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.theme-toggle-btn {
  color: var(--color-text-regular) !important;
  background: transparent !important;
  border-color: transparent !important;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--color-hover-bg) !important;
  color: var(--color-text-primary) !important;
}

.theme-picker {
  padding: 4px 0;
}

.theme-picker-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 0 4px 10px;
}

.theme-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.theme-card:hover {
  background: var(--color-hover-bg);
  border-color: var(--color-border-base);
}

.theme-card.active {
  border-color: var(--el-color-primary);
  background: var(--color-hover-bg);
}

.theme-preview {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.10);
}

.theme-check {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.theme-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.theme-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.theme-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
