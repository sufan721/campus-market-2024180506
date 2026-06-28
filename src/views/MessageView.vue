<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  id: number
  from: string
  content: string
  time: string
  unread: boolean
}

const messages = ref<Message[]>([
  { id: 1, from: '张三', content: '你好，高等数学还在吗？', time: '10:30', unread: true },
  { id: 2, from: '李四', content: '键盘能便宜点吗？60出吗？', time: '09:15', unread: true },
  { id: 3, from: '系统通知', content: '你的商品"台灯 LED 护眼"已通过审核', time: '昨天', unread: false },
  { id: 4, from: '王五', content: '好的，明天下午3点交易可以', time: '昨天', unread: false },
])
</script>

<template>
  <div class="message-page">
    <h1>消息</h1>
    <p class="subtitle">查看买卖双方的沟通记录</p>

    <div class="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ unread: msg.unread }"
      >
        <div class="msg-avatar">{{ msg.from[0] }}</div>
        <div class="msg-body">
          <div class="msg-header">
            <span class="msg-from">{{ msg.from }}</span>
            <span class="msg-time">{{ msg.time }}</span>
          </div>
          <p class="msg-content">{{ msg.content }}</p>
        </div>
        <span v-if="msg.unread" class="unread-dot"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-page {
  max-width: 600px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 8px;
  transition: background 0.15s;
  cursor: pointer;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-item.unread {
  background: #f0f7ff;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.msg-from {
  font-weight: 600;
  font-size: 15px;
}

.msg-time {
  font-size: 12px;
  color: #999;
}

.msg-content {
  margin: 0;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  flex-shrink: 0;
}
</style>
