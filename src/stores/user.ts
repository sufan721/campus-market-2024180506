import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  // 当前登录用户（模拟：默认用户 ID=1 张三）
  const currentUser = ref<UserInfo>({
    id: 1,
    name: '张三',
    avatar: '',
    school: 'XX大学',
    department: '软件工程',
    grade: '2023级',
    joinDate: '2026-03-01',
    contact: 'QQ：111222333',
  })

  const userId = computed(() => currentUser.value.id)

  /** 切换用户（仅用于 Demo 演示） */
  function switchUser(user: UserInfo) {
    currentUser.value = user
  }

  return {
    currentUser,
    userId,
    switchUser,
  }
})
