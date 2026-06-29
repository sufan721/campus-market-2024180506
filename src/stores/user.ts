import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserById, type UserInfo as ApiUserInfo } from '../api/user'

export interface UserInfo {
  id: number
  name: string
  avatar: string
  school: string
  department: string
  grade: string
  joinDate: string
  contact: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserInfo | null>(null)
  const loading = ref(false)

  const userId = computed(() => currentUser.value?.id ?? null)

  /** 从 API 加载用户信息 */
  async function loadUser(id: number | string) {
    loading.value = true
    try {
      const res = await getUserById(id)
      currentUser.value = {
        id: Number(res.data.id),
        name: res.data.name,
        avatar: res.data.avatar,
        school: res.data.school,
        department: res.data.department,
        grade: res.data.grade,
        joinDate: res.data.joinDate,
        contact: res.data.contact,
      }
    } finally {
      loading.value = false
    }
  }

  /** 切换用户（仅用于 Demo 演示） */
  async function switchUser(user: UserInfo) {
    currentUser.value = user
  }

  return {
    currentUser,
    userId,
    loading,
    loadUser,
    switchUser,
  }
})
