import http from './http'

export interface ChatMessage {
  id: number
  userId: number
  contactName: string
  content: string
  time: string
  direction: 'sent' | 'received'
}

/** 获取与某个联系人的聊天记录 */
export function getChatMessages(contactName: string) {
  return http.get<ChatMessage[]>(
    `/chatMessages?contactName=${encodeURIComponent(contactName)}`,
  )
}

/** 获取当前用户的所有聊天消息（用于活动统计等） */
export function getAllMyChats() {
  return http.get<ChatMessage[]>('/chatMessages')
}

/** 发送一条聊天消息（userId 由服务端从 JWT 获取，contactUserId 用于通知接收方） */
export function sendChatMessage(
  data: Omit<ChatMessage, 'id' | 'userId'> & { contactUserId?: number },
) {
  return http.post<ChatMessage>('/chatMessages', data)
}
