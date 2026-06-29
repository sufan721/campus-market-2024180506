import http from './http'

export interface MessageItem {
  id: number
  userId: number
  from: string
  content: string
  time: string
  unread: boolean
}

export function getMessages(userId: number) {
  return http.get<MessageItem[]>(`/messages?userId=${userId}`)
}

export function markMessageRead(id: number) {
  return http.patch<MessageItem>(`/messages/${id}`, { unread: false })
}
