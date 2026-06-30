import http from './http'

export interface MessageItem {
  id: number
  userId: number
  from: string
  content: string
  time: string
  unread: boolean
}

/** 获取当前登录用户的消息列表（服务端根据 JWT 自动识别用户） */
export function getMessages() {
  return http.get<MessageItem[]>('/messages')
}

export function markMessageRead(id: number) {
  return http.patch<MessageItem>(`/messages/${id}`, { unread: false })
}
