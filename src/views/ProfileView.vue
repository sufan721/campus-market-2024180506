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
    <h1 class="page-title">个人中心</h1>

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
      <el-col :xs="8" v-for="s in stats" :key="s.label">
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
  width: 100%;
}

.page-title {
  font-size: 22px;
  margin: 0 0 20px;
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

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }

  .user-card :deep(.el-card__body) {
    padding: 18px;
  }

  .user-avatar {
    --size: 56px;
    width: 56px;
    height: 56px;
  }

  .user-meta h2 {
    font-size: 18px;
  }

  .stat-num {
    font-size: 24px;
  }

  .menu-item {
    padding: 14px 16px;
    font-size: 14px;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .page-title {
    font-size: 18px;
    margin-bottom: 14px;
  }

  .user-card :deep(.el-card__body) {
    padding: 14px;
  }

  .user-info {
    gap: 14px;
  }

  .user-avatar {
    --size: 48px;
    width: 48px;
    height: 48px;
  }

  .user-meta h2 {
    font-size: 16px;
  }

  .user-meta p {
    font-size: 13px;
  }

  .stat-num {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>
