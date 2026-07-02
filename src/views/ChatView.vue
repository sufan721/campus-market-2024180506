<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import {
  getChatMessages,
  sendChatMessage,
  type ChatMessage,
} from '../api/chat'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const contactName = ref(decodeURIComponent(route.params.contactName as string))
const contactUserId = ref(route.query.userId ? Number(route.query.userId) : undefined)
const messages = ref<ChatMessage[]>([])
const loading = ref(true)
const inputText = ref('')
const sending = ref(false)
const chatBody = ref<HTMLElement | null>(null)

let pollTimer: ReturnType<typeof setInterval> | null = null

async function loadMessages() {
  try {
    const res = await getChatMessages(contactName.value)
    messages.value = res.data
  } catch {
    // 静默轮询，不弹错误
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMessages()
  await scrollToBottom()
  // 每 3 秒轮询，实时显示对方新消息
  pollTimer = setInterval(async () => {
    await loadMessages()
    await scrollToBottom()
  }, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

async function scrollToBottom() {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  sending.value = true
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timeStr =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  const newMsg: Omit<ChatMessage, 'id' | 'userId'> & { contactUserId?: number } = {
    contactName: contactName.value,
    content: text,
    time: timeStr,
    direction: 'sent',
  }
  if (contactUserId.value) {
    newMsg.contactUserId = contactUserId.value
  }

  try {
    const res = await sendChatMessage(newMsg)
    messages.value.push(res.data)
    inputText.value = ''
    await scrollToBottom()
  } catch {
    ElMessage.error('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function goBack() {
  router.back()
}

/** 只展示时:分 */
function formatChatTime(timeStr: string): string {
  const d = new Date(timeStr)
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}
</script>

<template>
  <div class="chat-page">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <el-button :icon="ArrowLeft" text circle size="large" @click="goBack" />
      <el-avatar :icon="UserFilled" :size="36" />
      <div class="header-info">
        <span class="header-name">{{ contactName }}</span>
        <span class="header-sub">校园轻集市用户</span>
      </div>
    </div>

    <!-- 消息区域 -->
    <div ref="chatBody" class="chat-body">
      <!-- 加载中 -->
      <div v-if="loading" class="chat-loading">
        <el-icon class="is-loading" :size="24"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32z"/></svg></el-icon>
        <span>加载中…</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="messages.length === 0" class="chat-empty">
        <div class="empty-icon">💬</div>
        <p>还没有聊天记录</p>
        <p class="empty-sub">发送第一条消息，开始和 {{ contactName }} 对话吧</p>
      </div>

      <!-- 消息列表 -->
      <template v-else>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-msg"
          :class="msg.direction === 'sent' ? 'msg-sent' : 'msg-received'"
        >
          <el-avatar
            v-if="msg.direction === 'received'"
            :icon="UserFilled"
            :size="32"
            class="msg-avatar"
          />
          <div class="msg-bubble-wrap">
            <div class="msg-bubble">
              {{ msg.content }}
            </div>
            <span class="msg-time">{{ formatChatTime(msg.time) }}</span>
          </div>
          <el-avatar
            v-if="msg.direction === 'sent'"
            :icon="UserFilled"
            :size="32"
            class="msg-avatar"
          />
        </div>
      </template>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-bar">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入消息…"
        resize="none"
        @keydown="handleKeydown"
      />
      <el-button
        type="primary"
        :disabled="!inputText.trim() || sending"
        :loading="sending"
        @click="handleSend"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  /* 扣除顶部导航 + footer */
  max-height: calc(100vh - 140px);
  background: var(--color-bg-chat);
  border-radius: var(--border-radius-card);
  overflow: hidden;
}

/* ====== 顶部栏 ====== */
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-header);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.header-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.header-sub {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* ====== 消息区域 ====== */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-bg-chat);
}

.chat-body::-webkit-scrollbar {
  width: 5px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: 4px;
}

/* 加载中 */
.chat-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: auto;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

/* 空状态 */
.chat-empty {
  text-align: center;
  margin: auto;
  color: var(--el-text-color-placeholder);
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 10px;
}

.chat-empty p {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

.empty-sub {
  font-size: 13px !important;
  color: var(--el-text-color-placeholder) !important;
}

/* ====== 消息项 ====== */
.chat-msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
}

.msg-sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-received {
  align-self: flex-start;
}

.msg-avatar {
  flex-shrink: 0;
}

.msg-bubble-wrap {
  display: flex;
  flex-direction: column;
}

.msg-sent .msg-bubble-wrap {
  align-items: flex-end;
}

.msg-received .msg-bubble-wrap {
  align-items: flex-start;
}

.msg-bubble {
  padding: 10px 15px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg-sent .msg-bubble {
  background: var(--color-chat-sent-bg);
  color: var(--color-chat-sent-text);
  border-bottom-right-radius: 6px;
}

.msg-received .msg-bubble {
  background: var(--color-chat-received-bg);
  color: var(--el-text-color-primary);
  border-bottom-left-radius: 6px;
}

.msg-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
  padding: 0 4px;
}

/* ====== 输入区域 ====== */
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 14px;
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border-header);
  flex-shrink: 0;
}

.chat-input-bar :deep(.el-textarea__inner) {
  border-radius: 12px;
}

.chat-input-bar .el-button {
  flex-shrink: 0;
  border-radius: 12px;
  height: 40px;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .chat-page {
    height: calc(100vh - 120px);
    max-height: calc(100vh - 120px);
    border-radius: 0;
  }

  .chat-msg {
    max-width: 88%;
  }

  .msg-bubble {
    font-size: 14px;
    padding: 9px 13px;
  }

  .chat-body {
    padding: 12px 10px;
    gap: 12px;
  }

  .chat-input-bar {
    padding: 8px 10px;
    gap: 8px;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .chat-page {
    height: calc(100vh - 100px);
    max-height: calc(100vh - 100px);
  }

  .chat-msg {
    max-width: 92%;
  }

  .msg-avatar {
    display: none;
  }

  .msg-bubble {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 14px;
  }

  .msg-sent .msg-bubble {
    border-bottom-right-radius: 4px;
  }

  .msg-received .msg-bubble {
    border-bottom-left-radius: 4px;
  }

  .chat-body {
    padding: 10px 8px;
    gap: 10px;
  }

  .chat-input-bar {
    padding: 6px 8px;
  }

  .chat-input-bar :deep(.el-textarea__inner) {
    font-size: 14px;
  }
}
</style>
