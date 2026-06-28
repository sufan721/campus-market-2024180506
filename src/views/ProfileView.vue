<script setup lang="ts">
import { ref } from 'vue'
import { UserFilled, List, Star, Setting, InfoFilled, ArrowRight } from '@element-plus/icons-vue'

const user = ref({
  name: '未登录用户',
  school: 'XX大学',
  joinDate: '2026-06-01',
})

const stats = ref([
  { num: 3, label: '已发布', icon: List, color: '#409eff' },
  { num: 1, label: '已售出', icon: Star, color: '#67c23a' },
  { num: 2, label: '已购买', icon: List, color: '#e6a23c' },
])

const menus = ref([
  { icon: List, label: '我的发布', action: '' },
  { icon: Star, label: '我的收藏', action: '' },
  { icon: Setting, label: '设置', action: '' },
  { icon: InfoFilled, label: '关于', action: '' },
])
</script>

<template>
  <div class="profile-page">
    <h1 style="font-size:22px;margin:0 0 20px;">个人中心</h1>

    <!-- 用户信息卡片 -->
    <el-card shadow="hover" class="user-card">
      <div class="user-info">
        <el-avatar :icon="UserFilled" :size="72" class="user-avatar" />
        <div class="user-meta">
          <h2>{{ user.name }}</h2>
          <p>{{ user.school }}</p>
          <el-tag size="small" effect="plain">加入于 {{ user.joinDate }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 统计 -->
    <el-row :gutter="14" class="stats-row">
      <el-col :span="8" v-for="s in stats" :key="s.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <span class="stat-num" :style="{ color: s.color }">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 菜单 -->
    <el-card shadow="never" class="menu-card">
      <div
        v-for="(m, i) in menus"
        :key="m.label"
        class="menu-item"
        :class="{ 'menu-item-last': i === menus.length - 1 }"
      >
        <div class="menu-left">
          <el-icon :size="18"><component :is="m.icon" /></el-icon>
          <span>{{ m.label }}</span>
        </div>
        <el-icon class="menu-arrow"><ArrowRight /></el-icon>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 560px;
  margin: 0 auto;
}

/* 用户卡片 */
.user-card {
  border-radius: 14px;
  margin-bottom: 18px;
}

.user-card :deep(.el-card__body) {
  padding: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #337ecc);
  flex-shrink: 0;
}

.user-meta h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.user-meta p {
  margin: 0 0 6px;
  color: #999;
  font-size: 14px;
}

/* 统计 */
.stats-row {
  margin-bottom: 18px;
}

.stat-card {
  border-radius: 12px;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

/* 菜单 */
.menu-card {
  border-radius: 14px;
}

.menu-card :deep(.el-card__body) {
  padding: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 15px;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.menu-item-last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-arrow {
  color: #ccc;
  font-size: 14px;
}
</style>
