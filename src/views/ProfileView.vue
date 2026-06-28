<script setup lang="ts">
import { ref } from 'vue'

const user = ref({
  name: '未登录用户',
  avatar: '',
  school: 'XX大学',
  joinDate: '2026-06-01',
})

const stats = ref({
  published: 3,
  sold: 1,
  bought: 2,
})
</script>

<template>
  <div class="profile-page">
    <h1>个人中心</h1>

    <div class="profile-card">
      <div class="avatar">
        <span class="avatar-text">{{ user.name[0] }}</span>
      </div>
      <div class="user-info">
        <h2>{{ user.name }}</h2>
        <p>{{ user.school }}</p>
        <p class="join-date">加入于 {{ user.joinDate }}</p>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-num">{{ stats.published }}</span>
        <span class="stat-label">已发布</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.sold }}</span>
        <span class="stat-label">已售出</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.bought }}</span>
        <span class="stat-label">已购买</span>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item">
        <span>📋 我的发布</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>❤️ 我的收藏</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>⚙️ 设置</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>❓ 关于</span>
        <span class="arrow">›</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 520px;
  margin: 0 auto;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #3b8cda);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
}

.user-info h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.user-info p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.join-date {
  margin-top: 4px !important;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 15px;
  transition: color 0.15s;
}

.menu-item:hover {
  color: #409eff;
}

.arrow {
  font-size: 20px;
  color: #ccc;
}
</style>
