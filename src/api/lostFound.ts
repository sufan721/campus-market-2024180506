import http from './http'

export interface LostFoundItem {
  id: number
  userId: number
  title: string
  type: 'lost' | 'found'
  itemName: string
  location: string
  eventTime: string
  contact: string
  status: string
  image: string
  description: string
}

export function getLostFounds() {
  return http.get<LostFoundItem[]>('/lostFounds')
}

export function getLostFoundsByUser(userId: number) {
  return http.get<LostFoundItem[]>(`/lostFounds?userId=${userId}`)
}

export function getLostFoundById(id: number) {
  return http.get<LostFoundItem>(`/lostFounds/${id}`)
}

export function createLostFound(data: Omit<LostFoundItem, 'id'>) {
  return http.post<LostFoundItem>('/lostFounds', data)
}
