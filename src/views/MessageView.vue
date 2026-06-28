<script setup lang="ts">
import { ref } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'

interface Message {
  id: number
  from: string
  avatar?: string
  content: string
  time: string
  unread: boolean
}

const messages = ref<Message[]>([
  { id: 1, from: '张三', content: '你好，高等数学还在吗？我想买', time: '10分钟前', unread: true },
  { id: 2, from: '李四', content: '键盘能便宜点吗？60出吗？', time: '30分钟前', unread: true },
  { id: 3, from: '系统通知', content: '你的商品"台灯 LED 护眼"已通过审核', time: '2小时前', unread: false },
  { id: 4, from: '王五', content: '好的，明天下午3点交易可以吗？', time: '昨天', unread: false },
  { id: 5, from: '系统通知', content: '欢迎加入校园轻集市！请完善你的个人资料', time: '3天前', unread: false },
])

const unreadCount = ref(messages.value.filter(m => m.unread).length)

function openChat(msg: Message) {
  msg.unread = false
  unreadCount.value = messages.value.filter(m => m.unread).length
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

    <div class="message-list">
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
            <span class="msg-time">{{ msg.time }}</span>
          </div>
          <p class="msg-content">{{ msg.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-page {
  max-width: 640px;
  margin: 0 auto;
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
</style>
