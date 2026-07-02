import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ThemeInfo {
  id: string
  name: string
  description: string
  preview: string // CSS gradient string for preview card
}

export const themes: ThemeInfo[] = [
  {
    id: 'default',
    name: '清新默认',
    description: '蓝白清爽校园风',
    preview: 'linear-gradient(135deg, #409eff, #a0cfff)',
  },
  {
    id: 'minimalist',
    name: '极简清冷',
    description: '莫兰迪灰蓝 · 毛玻璃质感',
    preview: 'linear-gradient(135deg, #8ea4b8, #dce3ea)',
  },
  {
    id: 'vintage',
    name: '复古油画',
    description: '焦糖奶油 · 画布纹理',
    preview: 'linear-gradient(135deg, #8b6914, #d4c5a9)',
  },
  {
    id: 'macaron',
    name: '奶油马卡龙',
    description: '浅粉薄荷绿 · 云朵圆角',
    preview: 'linear-gradient(135deg, #e8a0b0, #a8d8b8)',
  },
  {
    id: 'ink-wash',
    name: '水墨国风',
    description: '宣纸米白 · 墨青灰 · 朱砂点缀',
    preview: 'linear-gradient(135deg, #5b6e82, #e0dac8)',
  },
]

const STORAGE_KEY = 'app_theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>(
    localStorage.getItem(STORAGE_KEY) || 'default'
  )

  function setTheme(themeId: string) {
    if (!themes.find(t => t.id === themeId)) return
    currentTheme.value = themeId
    localStorage.setItem(STORAGE_KEY, themeId)
    applyTheme(themeId)
  }

  function applyTheme(themeId: string) {
    document.documentElement.className = `theme-${themeId}`
  }

  function initTheme() {
    applyTheme(currentTheme.value)
  }

  return {
    currentTheme,
    setTheme,
    initTheme,
  }
})
