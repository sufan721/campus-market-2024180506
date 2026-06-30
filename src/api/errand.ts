import http from './http'

export interface ErrandItem {
  id: number
  userId: number
  title: string
  taskType: string
  reward: number
  from: string
  to: string
  deadline: string
  publisher: string
  status: string
  image: string
  description: string
}

export function getErrands() {
  return http.get<ErrandItem[]>('/errands')
}

export function getErrandsByUser(userId: number) {
  return http.get<ErrandItem[]>(`/errands?userId=${userId}`)
}

export function getErrandById(id: number) {
  return http.get<ErrandItem>(`/errands/${id}`)
}

export function createErrand(data: Omit<ErrandItem, 'id' | 'userId'>) {
  return http.post<ErrandItem>('/errands', data)
}
