import http from './http'

export interface UserInfo {
  id: number | string
  studentId?: string
  name: string
  avatar: string
  school: string
  department: string
  grade: string
  joinDate: string
  contact: string
}

export interface LoginParams {
  studentId: string
  password: string
}

export interface RegisterParams {
  studentId: string
  password: string
  name: string
  school?: string
  department?: string
  grade?: string
  contact?: string
}

export interface AuthResponse {
  token: string
  user: UserInfo & { studentId: string }
}

export function getUserById(id: number | string) {
  return http.get<UserInfo>(`/users/${id}`)
}

export function login(data: LoginParams) {
  return http.post<AuthResponse>('/auth/login', data)
}

export function register(data: RegisterParams) {
  return http.post<AuthResponse>('/auth/register', data)
}

export function getMe() {
  return http.get<UserInfo & { studentId: string }>('/auth/me')
}
