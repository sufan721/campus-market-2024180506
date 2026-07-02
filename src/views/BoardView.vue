<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TrendCharts, UserFilled, Goods, Coin } from '@element-plus/icons-vue'
import { getDashboard, type DashboardData } from '../api/dashboard'

const dashboard = ref<DashboardData | null>(null)
const loading = ref(true)

const stats = ref([
  { label: '注册用户', value: 0, icon: UserFilled, color: 'var(--color-accent-blue)', bg: 'var(--color-accent-blue-bg)' },
  { label: '在售商品', value: 0, icon: Goods, color: 'var(--color-accent-green)', bg: 'var(--color-accent-green-bg)' },
  { label: '累计订单', value: 0, icon: Coin, color: 'var(--color-accent-orange)', bg: 'var(--color-accent-orange-bg)' },
  { label: '今日活跃', value: 0, icon: TrendCharts, color: 'var(--color-accent-red)', bg: 'var(--color-accent-red-bg)' },
])

const weeklyData = ref<{ day: string; count: number }[]>([])
const categories = ref<{ name: string; count: number; color: string }[]>([])

onMounted(async () => {
  try {
    const res = await getDashboard()
    dashboard.value = res.data
    const d = res.data
    stats.value[0].value = d.userCount
    stats.value[1].value = d.productCount
    stats.value[2].value = d.orderCount
    stats.value[3].value = d.activeToday
    weeklyData.value = d.weeklyData
    categories.value = d.categories
  } finally {
    loading.value = false
  }
})

const maxWeekly = computed(() => Math.max(...weeklyData.value.map(d => d.count), 1))
const maxCategory = computed(() => Math.max(...categories.value.map(c => c.count), 1))
</script>

<template>
  <div class="board-page">
    <div class="page-header">
      <h1>数据看板</h1>
      <p class="subtitle">校园市场运营概览 · 实时数据</p>
    </div>

    <!-- 加载骨架 -->
    <template v-if="loading">
      <el-row :gutter="16" class="stats-row">
        <el-col v-for="n in 4" :key="n" :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <el-skeleton :rows="2" animated />
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="never" class="chart-card">
        <el-skeleton :rows="5" animated />
      </el-card>
    </template>

    <template v-else>
      <!-- 统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col v-for="s in stats" :key="s.label" :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-inner">
              <div class="stat-icon" :style="{ background: s.bg }">
                <el-icon :size="24" :color="s.color"><component :is="s.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ s.value }}</span>
                <span class="stat-label">{{ s.label }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 柱状图 -->
      <el-card shadow="never" class="chart-card">
        <template #header>
          <span class="card-title">📊 本周发布量</span>
        </template>
        <div class="bar-chart">
          <div v-for="d in weeklyData" :key="d.day" class="bar-col">
            <span class="bar-value">{{ d.count }}</span>
            <div
              class="bar"
              :style="{
                height: (d.count / maxWeekly * 140) + 'px',
                background: d.count === maxWeekly
                  ? 'linear-gradient(180deg, var(--color-chart-bar-highlight-from), var(--color-chart-bar-highlight-to))'
                  : 'linear-gradient(180deg, var(--color-chart-bar-normal-from), var(--color-chart-bar-normal-to))'
              }"
            ></div>
            <span class="bar-label">{{ d.day }}</span>
          </div>
        </div>
      </el-card>

      <!-- 分类分布 -->
      <el-card shadow="never" class="chart-card">
        <template #header>
          <span class="card-title">📂 分类分布</span>
        </template>
        <div class="category-list">
          <div v-for="cat in categories" :key="cat.name" class="category-row">
            <span class="cat-name">{{ cat.name }}</span>
            <el-progress
              :percentage="Math.round(cat.count / maxCategory * 100)"
              :color="cat.color"
              :stroke-width="14"
              :show-text="false"
              style="flex:1;margin:0 12px;"
            />
            <span class="cat-count">{{ cat.count }}</span>
          </div>
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.board-page {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  padding: 18px 16px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 图表卡片 */
.chart-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 0 12px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.bar-value {
  font-size: 12px;
  color: var(--color-chart-bar-text);
  font-weight: 600;
}

.bar {
  width: 32px;
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bar-label {
  font-size: 13px;
  color: var(--color-chart-bar-text);
  font-weight: 500;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-row {
  display: flex;
  align-items: center;
}

.cat-name {
  width: 80px;
  font-size: 14px;
  color: var(--color-text-regular);
  text-align: right;
  font-weight: 500;
}

.cat-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  width: 40px;
  text-align: left;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }

  .stat-inner {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 12px;
  }

  .bar-chart {
    height: 160px;
    padding: 0 4px;
  }

  .bar {
    width: 24px;
    border-radius: 4px 4px 0 0;
  }

  .bar-value {
    font-size: 10px;
  }

  .bar-label {
    font-size: 11px;
  }

  .cat-name {
    width: 60px;
    font-size: 12px;
    text-align: left;
  }

  .cat-count {
    width: 32px;
    font-size: 13px;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .page-header h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 12px;
  }

  .stat-card :deep(.el-card__body) {
    padding: 14px 10px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .stat-value {
    font-size: 18px;
  }

  .bar-chart {
    height: 130px;
  }

  .bar {
    width: 18px;
  }

  .bar-value {
    font-size: 9px;
  }

  .bar-label {
    font-size: 10px;
  }

  .category-row {
    flex-wrap: wrap;
  }

  .cat-name {
    width: 100%;
    margin-bottom: 4px;
    font-size: 12px;
  }
}
</style>
