<script setup lang="ts">
import { ref } from 'vue'

// 静态统计数据
const stats = ref({
  totalUsers: 1286,
  totalItems: 567,
  totalOrders: 2341,
  activeToday: 89,
})

const weeklyData = ref([
  { day: '周一', count: 34 },
  { day: '周二', count: 42 },
  { day: '周三', count: 28 },
  { day: '周四', count: 51 },
  { day: '周五', count: 67 },
  { day: '周六', count: 45 },
  { day: '周日', count: 22 },
])

const categories = ref([
  { name: '二手教材', count: 124 },
  { name: '电子产品', count: 98 },
  { name: '生活用品', count: 87 },
  { name: '代取服务', count: 56 },
  { name: '其他', count: 202 },
])

function maxCount() {
  return Math.max(...weeklyData.value.map(d => d.count))
}
</script>

<template>
  <div class="board-page">
    <h1>数据看板</h1>
    <p class="subtitle">校园市场运营概览</p>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.totalUsers }}</span>
        <span class="stat-label">注册用户</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.totalItems }}</span>
        <span class="stat-label">在售商品</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.totalOrders }}</span>
        <span class="stat-label">累计订单</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.activeToday }}</span>
        <span class="stat-label">今日活跃</span>
      </div>
    </div>

    <!-- 周趋势图(简易柱状) -->
    <div class="chart-section">
      <h2>本周发布量</h2>
      <div class="bar-chart">
        <div
          v-for="d in weeklyData"
          :key="d.day"
          class="bar-col"
        >
          <span class="bar-value">{{ d.count }}</span>
          <div
            class="bar"
            :style="{ height: (d.count / maxCount() * 140) + 'px' }"
          ></div>
          <span class="bar-label">{{ d.day }}</span>
        </div>
      </div>
    </div>

    <!-- 分类占比 -->
    <div class="chart-section">
      <h2>分类分布</h2>
      <div class="category-list">
        <div v-for="cat in categories" :key="cat.name" class="category-row">
          <span class="cat-name">{{ cat.name }}</span>
          <div class="cat-bar-track">
            <div
              class="cat-bar-fill"
              :style="{ width: (cat.count / 202 * 100) + '%' }"
            ></div>
          </div>
          <span class="cat-count">{{ cat.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-page {
  max-width: 720px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}

.stat-card {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.chart-section {
  margin-bottom: 28px;
}

.chart-section h2 {
  font-size: 17px;
  margin-bottom: 16px;
  color: #444;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 0 8px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.bar-value {
  font-size: 12px;
  color: #888;
}

.bar {
  width: 28px;
  background: linear-gradient(180deg, #409eff, #6bb5ff);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.4s;
}

.bar-label {
  font-size: 12px;
  color: #999;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-name {
  width: 80px;
  font-size: 14px;
  color: #555;
  text-align: right;
}

.cat-bar-track {
  flex: 1;
  height: 18px;
  background: #f0f0f0;
  border-radius: 9px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #6bb5ff);
  border-radius: 9px;
  transition: width 0.4s;
}

.cat-count {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  width: 40px;
}
</style>
