import axios from 'axios'

const http = axios.create({
  // 开发环境通过 Vite 代理转发到 localhost:3001，无需跨域
  baseURL: '/api',
  timeout: 5000,
})

// 请求拦截器：自动附带 JWT 令牌
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 时清除过期令牌
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
    }
    return Promise.reject(error)
  },
)

export default http
