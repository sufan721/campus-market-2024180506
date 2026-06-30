<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'
import { getMessages, markMessageRead, type MessageItem } from '../api/message'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const messages = ref<MessageItem[]>([])
const loading = ref(true)

const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(async () => {
  if (!isLoggedIn.value) {
    loading.value = false
    return
  }
  try {
    const res = await getMessages()
    messages.value = res.data
  } finally {
    loading.value = false
  }
})

const unreadCount = computed(() => messages.value.filter(m => m.unread).length)

/** 格式化时间戳为相对时间 */
function formatRelativeTime(timeStr: string): string {
  const now = new Date()
  const target = new Date(timeStr)
  const diffMs = now.getTime() - target.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay === 1) return '昨天'
  if (diffDay < 7) return `${diffDay}天前`
  return timeStr.slice(0, 10)
}

async function openChat(msg: MessageItem) {
  if (msg.unread) {
    try {
      await markMessageRead(msg.id)
    } catch {
      // 即使 API 失败也更新本地状态
    }
    msg.unread = false
  }
  // 系统通知不跳转聊天
  if (msg.from === '系统通知') return
  router.push(`/chat/${encodeURIComponent(msg.from)}`)
}
</script>

<template>
  <div class="message-page">
    <div class="page-header">
      <div>
        <h1>消息</h1>
        <p class="subtitle">查看买卖双方的沟通记录</p>
      </div>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge">
        <el-button circle>💬</el-button>
      </el-badge>
    </div>

    <!-- 未登录 -->
    <el-empty v-if="!isLoggedIn && !loading" description="请先登录后查看消息">
      <el-button type="primary" @click="$router.push('/profile')">前往登录</el-button>
    </el-empty>

    <!-- 加载骨架 -->
    <div v-else-if="loading" class="message-list">
      <div v-for="n in 5" :key="n" class="message-item">
        <el-skeleton :rows="2" animated style="flex:1" />
      </div>
    </div>

    <div v-else class="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ unread: msg.unread }"
        @click="openChat(msg)"
      >
        <el-badge
          :value="msg.unread ? '' : undefined"
          :hidden="!msg.unread"
          is-dot
          class="avatar-wrap"
        >
          <el-avatar :icon="UserFilled" :size="44" />
        </el-badge>
        <div class="msg-body">
          <div class="msg-header">
            <span class="msg-from">{{ msg.from }}</span>
            <span class="msg-time">{{ formatRelativeTime(msg.time) }}</span>
          </div>
          <p class="msg-content">{{ msg.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.badge {
  flex-shrink: 0;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 2px;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-item.unread {
  background: #ecf5ff;
}

.avatar-wrap {
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.msg-from {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}

.msg-time {
  font-size: 12px;
  color: #bbb;
  flex-shrink: 0;
  margin-left: 12px;
}

.msg-content {
  margin: 0;
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }

  .message-item {
    padding: 14px 12px;
    gap: 10px;
  }

  .msg-from {
    font-size: 14px;
  }

  .msg-content {
    font-size: 13px;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .message-item {
    padding: 12px 10px;
  }

  .msg-time {
    display: none;
  }
}
</style>
