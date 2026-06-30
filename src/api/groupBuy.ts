import http from './http'

export interface GroupBuyItem {
  id: number
  userId: number
  title: string
  type: string
  targetCount: number
  currentCount: number
  deadline: string
  location: string
  publisher: string
  status: string
  image: string
  description: string
}

export function getGroupBuys() {
  return http.get<GroupBuyItem[]>('/groupBuys')
}

export function getGroupBuysByUser(userId: number) {
  return http.get<GroupBuyItem[]>(`/groupBuys?userId=${userId}`)
}

export function getGroupBuyById(id: number) {
  return http.get<GroupBuyItem>(`/groupBuys/${id}`)
}

export function createGroupBuy(data: Omit<GroupBuyItem, 'id' | 'userId'>) {
  return http.post<GroupBuyItem>('/groupBuys', data)
}
