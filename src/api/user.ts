import http from './http'

export interface UserInfo {
  id: number | string
  name: string
  avatar: string
  school: string
  department: string
  grade: string
  joinDate: string
  contact: string
}

export function getUserById(id: number | string) {
  return http.get<UserInfo>(`/users/${id}`)
}
