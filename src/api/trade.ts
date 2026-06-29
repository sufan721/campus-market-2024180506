import http from './http'

export interface TradeItem {
  id: number
  userId: number
  title: string
  category: string
  price: number
  condition: string
  location: string
  publisher: string
  publishTime: string
  image: string
  status: string
  description: string
}

export function getTrades() {
  return http.get<TradeItem[]>('/trades')
}

export function getTradesByUser(userId: number) {
  return http.get<TradeItem[]>(`/trades?userId=${userId}`)
}

export function getTradeById(id: number) {
  return http.get<TradeItem>(`/trades/${id}`)
}

export function createTrade(data: Omit<TradeItem, 'id'>) {
  return http.post<TradeItem>('/trades', data)
}
