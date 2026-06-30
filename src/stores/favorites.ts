import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

export interface FavoriteItem {
  id: number
  title: string
  category: string
  price: number
  condition: string
  location: string
  publishTime: string
  image: string
  publisher: string
  /** 添加收藏的时间戳 */
  favoritedAt: number
}

function storageKey(userId: number) {
  return `fav_${userId}`
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteItem[]>([])

  const favoriteIds = computed(() => new Set(favorites.value.map((f) => f.id)))

  function isFavorited(id: number): boolean {
    return favoriteIds.value.has(id)
  }

  /** 切换收藏状态，返回当前是否已收藏 */
  function toggleFavorite(item: Omit<FavoriteItem, 'favoritedAt'>): boolean {
    const idx = favorites.value.findIndex((f) => f.id === item.id)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
      persist()
      return false
    } else {
      favorites.value.push({ ...item, favoritedAt: Date.now() })
      persist()
      return true
    }
  }

  function removeFavorite(id: number) {
    favorites.value = favorites.value.filter((f) => f.id !== id)
    persist()
  }

  /** 登录后调用：从 localStorage 恢复 */
  function load() {
    const userStore = useUserStore()
    const uid = userStore.userId
    if (!uid) {
      favorites.value = []
      return
    }
    try {
      const raw = localStorage.getItem(storageKey(uid))
      favorites.value = raw ? JSON.parse(raw) : []
    } catch {
      favorites.value = []
    }
  }

  /** 退出登录时调用：清空内存 */
  function clear() {
    favorites.value = []
  }

  // ====== 内部 ======

  function persist() {
    const userStore = useUserStore()
    const uid = userStore.userId
    if (!uid) return
    localStorage.setItem(storageKey(uid), JSON.stringify(favorites.value))
  }

  return {
    favorites,
    favoriteIds,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    load,
    clear,
  }
})
