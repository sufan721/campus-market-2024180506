<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { List, Edit, ChatDotRound, TrendCharts, Right } from '@element-plus/icons-vue'
import { getTrades, type TradeItem } from '../api/trade'
import ImageBox from '../components/ImageBox.vue'

const router = useRouter()

const features = [
  { icon: List, title: '浏览信息', desc: '发现校园内的二手好物与服务', color: '#409eff' },
  { icon: Edit, title: '发布信息', desc: '快速发布你想出售的商品或服务', color: '#67c23a' },
  { icon: ChatDotRound, title: '即时沟通', desc: '买卖双方在线交流，高效便捷', color: '#e6a23c' },
  { icon: TrendCharts, title: '数据看板', desc: '实时查看平台运营数据概览', color: '#f56c6c' },
]

// ========== 平台数据滚动计数器 ==========
interface StatItem {
  label: string
  target: number
  suffix: string
}

const stats: StatItem[] = [
  { label: '累计商品', target: 1286, suffix: '' },
  { label: '活跃用户', target: 3560, suffix: '' },
  { label: '成交订单', target: 892, suffix: '' },
  { label: '好评率', target: 98, suffix: '%' },
]

const statDisplays = ref<string[]>(stats.map(() => '0'))
const statsRevealed = ref(false)

function animateCount(el: StatItem, index: number) {
  const duration = 2000
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    const current = Math.round(eased * el.target)
    statDisplays.value[index] = current + el.suffix
    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

onMounted(() => {
  statsRevealed.value = true
  stats.forEach((s, i) => {
    setTimeout(() => animateCount(s, i), 250 + i * 120)
  })
})

// ========== 推荐 — 展示商品 ==========
const allTrades = ref<TradeItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getTrades()
    allTrades.value = res.data
  } finally {
    loading.value = false
  }
})

/** 根据 category 推导 tag 和 tagType */
const tagMap: Record<string, { tag: string; tagType: 'success' | 'warning' | 'info' | 'danger' }> = {
  '教材资料': { tag: '教材', tagType: 'info' },
  '数码配件': { tag: '数码', tagType: 'success' },
  '生活用品': { tag: '生活', tagType: 'warning' },
  '出行工具': { tag: '出行', tagType: 'success' },
  '家用电器': { tag: '家电', tagType: 'danger' },
}

function getTagInfo(category: string) {
  return tagMap[category] || { tag: category, tagType: 'info' as const }
}

// ========== 滚动触发入场 ==========
const featuresRef = ref<HTMLElement | null>(null)
const productsRef = ref<HTMLElement | null>(null)
const featuresRevealed = ref(false)
const productsRevealed = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        if (entry.target === featuresRef.value) featuresRevealed.value = true
        if (entry.target === productsRef.value) productsRevealed.value = true
      }
    },
    { threshold: 0.15 },
  )

  if (featuresRef.value) observer.observe(featuresRef.value)
  if (productsRef.value) observer.observe(productsRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'trade', id } })
}
</script>

<template>
  <div class="home-page">
    <!-- ======== Hero：首屏全高 ======== -->
    <section class="hero">
      <h2 class="hero-title">欢迎来到校园轻集市</h2>
      <p class="hero-desc">一个专为校园打造的信息发布与交易平台，让闲置流转更简单</p>

      <div class="hero-stats" :class="{ revealed: statsRevealed }">
        <div v-for="(s, i) in stats" :key="s.label" class="hero-stat-item">
          <span class="hero-stat-number">{{ statDisplays[i] }}</span>
          <span class="hero-stat-label">{{ s.label }}</span>
        </div>
      </div>

      <div class="hero-actions">
        <el-button class="hero-btn hero-btn-primary" size="large" round @click="$router.push('/list')">
          浏览商品
        </el-button>
        <el-button class="hero-btn hero-btn-outline" size="large" round @click="$router.push('/publish')">
          立即发布
        </el-button>
      </div>
      <div class="hero-scroll-hint">
        <span>向下探索</span>
        <span class="scroll-arrow">↓</span>
      </div>
    </section>

    <!-- ======== 特性卡片（滚动触发） ======== -->
    <section
      ref="featuresRef"
      class="reveal-section"
      :class="{ revealed: featuresRevealed }"
    >
      <el-row :gutter="20">
        <el-col v-for="(f, idx) in features" :key="f.title" :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="feature-card" :style="{ animationDelay: `${idx * 0.12}s` }">
            <div class="feature-icon-wrap" :style="{ background: f.color + '18', color: f.color }">
              <el-icon :size="28"><component :is="f.icon" /></el-icon>
            </div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ======== 推荐（按分类展示，滚动触发） ======== -->
    <section
      ref="productsRef"
      class="reveal-section"
      :class="{ revealed: productsRevealed }"
    >
      <div class="section-header">
        <div>
          <h2 class="section-title">推荐</h2>
          <p class="section-subtitle">精选好物，按分类浏览</p>
        </div>
        <el-button type="primary" link :icon="Right" @click="$router.push('/list')">
          查看全部
        </el-button>
      </div>

      <!-- 加载骨架 -->
      <div v-if="loading">
        <el-row :gutter="16">
          <el-col v-for="n in 3" :key="n" :xs="24" :sm="12" :md="8">
            <el-card shadow="hover" class="product-card">
              <el-skeleton :rows="3" animated />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-row v-else :gutter="16">
        <el-col
          v-for="(item, idx) in allTrades"
          :key="item.id"
          :xs="24" :sm="12" :md="8"
        >
          <el-card
            shadow="hover"
            class="product-card"
            :style="{ animationDelay: `${0.15 + idx * 0.1}s` }"
            @click="goDetail(Number(item.id))"
          >
            <ImageBox
              :image-path="item.image"
              fallback-emoji="📦"
              height="140px"
              border-radius="12px 12px 0 0"
              icon-size="48px"
            />
            <div class="product-body">
              <div class="product-header">
                <h3 class="product-title">{{ item.title }}</h3>
                <el-tag :type="getTagInfo(item.category).tagType" size="small" effect="plain">
                  {{ getTagInfo(item.category).tag }}
                </el-tag>
              </div>
              <p class="product-desc">{{ item.description }}</p>
              <div class="product-footer">
                <span class="product-price">¥{{ item.price }}</span>
                <el-button type="primary" link :icon="Right">查看详情</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ======== 快速入口 ======== -->
    <el-card class="quick-card" shadow="never">
      <div class="quick-inner">
        <span class="quick-label">🚀 快速发布闲置，开启校园交易</span>
        <el-button type="primary" @click="$router.push('/publish')">立即开始 →</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* ================================================
   动画关键帧
   ================================================ */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatArrow {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(6px); }
}

/* ================================================
   布局
   ================================================ */
.home-page {
  width: 100%;
}

/* Hero 撑满全屏 */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 40px 20px 32px;
  margin-top: -28px;
  margin-bottom: 32px;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  background: url('/hero-bg.jpg') center / cover no-repeat;
  border-radius: 0;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.06);
  z-index: 0;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero-title,
.hero-desc,
.hero-stats,
.hero-actions {
  opacity: 0;
}

.hero-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  animation: fadeInUp 0.6s ease-out 0.2s forwards;
}

.hero-title {
  margin: 0 0 16px;
  font-size: 52px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4), 0 4px 30px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  animation: fadeInUp 0.6s ease-out 0.55s forwards;
}

.hero-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0 0 20px;
  line-height: 1.6;
  max-width: 420px;
  animation: fadeInUp 0.6s ease-out 0.85s forwards;
}

.hero-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out 1.2s forwards;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.hero-stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
  font-variant-numeric: tabular-nums;
}

.hero-stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  animation: fadeInUp 0.6s ease-out 1.15s forwards;
}

.hero-btn {
  min-width: 140px;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid transparent;
  transition: all 0.25s;
}

.hero-btn-primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.hero-btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
}

.hero-btn-outline {
  background: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.55);
}

.hero-btn-outline:hover {
  color: #fff;
  border-color: #fff;
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

/* 向下滚动提示 */
.hero-scroll-hint {
  position: absolute;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out 2s forwards;
}

.scroll-arrow {
  font-size: 16px;
  animation: floatArrow 1.8s ease-in-out infinite;
}

/* ================================================
   滚动触发区域
   ================================================ */
.reveal-section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.reveal-section.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* 特性卡片 */
.feature-card {
  text-align: center;
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s;
  opacity: 0;
}

.reveal-section.revealed .feature-card {
  animation: fadeInUp 0.5s ease-out forwards;
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

/* 商品卡片区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 4px;
}

.section-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.section-subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 商品卡片 */
.product-card {
  margin-bottom: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
}

.reveal-section.revealed .product-card {
  animation: fadeInUp 0.5s ease-out forwards;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-card :deep(.el-card__body) {
  padding: 0;
}

.product-body {
  padding: 14px 16px 16px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.product-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.product-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
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

/* ================================================
   RESPONSIVE — ≤ 768px
   ================================================ */
@media (max-width: 768px) {
  .hero {
    min-height: 100vh;
    margin-top: -16px;
    padding: 28px 16px 24px;
    margin-bottom: 24px;
    border-radius: 0;
  }

  .hero-title {
    font-size: 36px;
    letter-spacing: 1px;
  }

  .hero-desc {
    font-size: 14px;
    margin-bottom: 16px;
    max-width: 320px;
  }

  .hero-btn {
    min-width: 120px;
    height: 42px;
    font-size: 14px;
  }

  .hero-stats {
    gap: 24px;
    margin-bottom: 20px;
  }

  .hero-stat-number {
    font-size: 22px;
  }

  .hero-stat-label {
    font-size: 11px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .hero-btn {
    width: 80%;
  }

  .feature-card :deep(.el-card__body) {
    padding: 20px 14px;
  }

  .feature-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .feature-title {
    font-size: 15px;
  }

  .quick-inner {
    flex-direction: column;
    gap: 14px;
    text-align: center;
  }

  .quick-label {
    font-size: 14px;
  }

  .hero-scroll-hint {
    bottom: 70px;
  }

  .section-title {
    font-size: 19px;
  }

  .product-body {
    padding: 12px 14px 14px;
  }

  .product-title {
    font-size: 15px;
  }

  .product-price {
    font-size: 18px;
  }
}

/* ================================================
   RESPONSIVE — ≤ 480px
   ================================================ */
@media (max-width: 480px) {
  .hero {
    min-height: 100vh;
    margin-top: -12px;
    padding: 22px 12px 18px;
  }

  .hero-title {
    font-size: 28px;
    letter-spacing: 0;
  }

  .hero-badge {
    font-size: 11px;
    padding: 3px 12px;
  }

  .hero-stats {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-stat-number {
    font-size: 18px;
  }

  .hero-stat-label {
    font-size: 10px;
  }

  .hero-btn {
    width: 100%;
  }

  .section-title {
    font-size: 17px;
  }

  .product-title {
    font-size: 14px;
  }

  .product-price {
    font-size: 16px;
  }
}
</style>
