import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserById, login, register, getMe, type UserInfo as ApiUserInfo, type LoginParams, type RegisterParams } from '../api/user'

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
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)

  const userId = computed(() => currentUser.value?.id ?? null)
  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)

  /** 启动时从 localStorage 恢复登录态 */
  async function initAuth() {
    if (!token.value) return
    try {
      const res = await getMe()
      currentUser.value = mapUser(res.data)
    } catch {
      // token 过期或无效，清除
      clearAuth()
    }
  }

  /** 登录 */
  async function doLogin(params: LoginParams) {
    const res = await login(params)
    setAuth(res.data.token, res.data.user)
    return res.data
  }

  /** 注册 */
  async function doRegister(params: RegisterParams) {
    const res = await register(params)
    setAuth(res.data.token, res.data.user)
    return res.data
  }

  /** 登出 */
  function logout() {
    clearAuth()
  }

  /** 从 API 加载用户信息（公开查看他人资料） */
  async function loadUser(id: number | string) {
    loading.value = true
    try {
      const res = await getUserById(id)
      return mapUser(res.data)
    } finally {
      loading.value = false
    }
  }

  // ====== 内部辅助 ======

  function setAuth(newToken: string, user: ApiUserInfo & { username?: string }) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
    currentUser.value = mapUser(user)
  }

  function clearAuth() {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('auth_token')
  }

  function mapUser(raw: ApiUserInfo): UserInfo {
    return {
      id: Number(raw.id),
      name: raw.name,
      avatar: raw.avatar,
      school: raw.school,
      department: raw.department,
      grade: raw.grade,
      joinDate: raw.joinDate,
      contact: raw.contact,
    }
  }

  return {
    currentUser,
    token,
    loading,
    userId,
    isLoggedIn,
    initAuth,
    doLogin,
    doRegister,
    logout,
    loadUser,
  }
})
