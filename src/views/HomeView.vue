<script setup lang="ts">
import { ref } from 'vue'
import { List, Edit, ChatDotRound, TrendCharts } from '@element-plus/icons-vue'

const features = ref([
  { icon: List, title: '浏览信息', desc: '发现校园内的二手好物与服务', color: '#409eff' },
  { icon: Edit, title: '发布信息', desc: '快速发布你想出售的商品或服务', color: '#67c23a' },
  { icon: ChatDotRound, title: '即时沟通', desc: '买卖双方在线交流，高效便捷', color: '#e6a23c' },
  { icon: TrendCharts, title: '数据看板', desc: '实时查看平台运营数据概览', color: '#f56c6c' },
])
</script>

<template>
  <div class="home-page">
    <!-- Banner -->
    <div class="hero">
      <div class="hero-badge">Vue 3 + Element Plus</div>
      <h2 class="hero-title">欢迎来到校园轻集市</h2>
      <p class="hero-desc">一个专为校园打造的信息发布与交易平台，让闲置流转更简单</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" round @click="$router.push('/list')">
          浏览商品
        </el-button>
        <el-button size="large" round @click="$router.push('/publish')">
          立即发布
        </el-button>
      </div>
    </div>

    <!-- 特性卡片 -->
    <el-row :gutter="20">
      <el-col v-for="f in features" :key="f.title" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon-wrap" :style="{ background: f.color + '18', color: f.color }">
            <el-icon :size="28"><component :is="f.icon" /></el-icon>
          </div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速入口 -->
    <el-card class="quick-card" shadow="never">
      <div class="quick-inner">
        <span class="quick-label">🚀 快速发布闲置，开启校园交易</span>
        <el-button type="primary" @click="$router.push('/publish')">立即开始 →</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
}

/* Hero */
.hero {
  text-align: center;
  padding: 40px 20px 32px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
  border-radius: 16px;
}

.hero-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #333 0%, #555 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  color: #777;
  font-size: 16px;
  margin: 0 0 24px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
}

/* 特性卡片 */
.feature-card {
  text-align: center;
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card :deep(.el-card__body) {
  padding: 28px 16px;
}

.feature-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.feature-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.feature-desc {
  margin: 0;
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}

/* 快速入口 */
.quick-card {
  border-radius: 12px;
  margin-top: 8px;
}

.quick-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-label {
  font-size: 16px;
  font-weight: 500;
  color: #555;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 24px;
  }
  .quick-inner {
    flex-direction: column;
    gap: 14px;
  }
}
</style>
