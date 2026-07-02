<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User } from '@element-plus/icons-vue'

import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { useFavoritesStore } from '../stores/favorites'
import { getTradeById, type TradeItem } from '../api/trade'
import { getLostFoundById, type LostFoundItem } from '../api/lostFound'
import { getGroupBuyById, type GroupBuyItem } from '../api/groupBuy'
import { getErrandById, type ErrandItem } from '../api/errand'
import ImageBox from '../components/ImageBox.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

type ItemType = 'trade' | 'lostfound' | 'groupbuy' | 'errand'

const itemType = computed(() => route.params.type as ItemType)
const itemId = computed(() => Number(route.params.id))

const trade = ref<TradeItem | null>(null)
const lostFound = ref<LostFoundItem | null>(null)
const groupBuy = ref<GroupBuyItem | null>(null)
const errand = ref<ErrandItem | null>(null)

const loading = ref(true)
const notFound = ref(false)

const typeLabel = computed(() => {
  const map: Record<ItemType, string> = {
    trade: '二手交易',
    lostfound: '失物招领',
    groupbuy: '拼单搭子',
    errand: '跑腿委托',
  }
  return map[itemType.value] || '详情'
})

onMounted(async () => {
  try {
    switch (itemType.value) {
      case 'trade': {
        const res = await getTradeById(itemId.value)
        trade.value = res.data
        break
      }
      case 'lostfound': {
        const res = await getLostFoundById(itemId.value)
        lostFound.value = res.data
        break
      }
      case 'groupbuy': {
        const res = await getGroupBuyById(itemId.value)
        groupBuy.value = res.data
        break
      }
      case 'errand': {
        const res = await getErrandById(itemId.value)
        errand.value = res.data
        break
      }
    }
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

function handleContact(contactName?: string, contactUserId?: number) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再联系')
    router.push('/profile')
    return
  }
  const target = contactName || '发布者'
  let route = `/chat/${encodeURIComponent(target)}`
  if (contactUserId) {
    route += `?userId=${contactUserId}`
  }
  router.push(route)
}

const isTradeFavorited = computed(() => {
  return trade.value ? favoritesStore.isFavorited(trade.value.id) : false
})

function toggleFavorite() {
  if (!trade.value) return
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再收藏')
    return
  }
  const nowFavorited = favoritesStore.toggleFavorite({
    id: trade.value.id,
    title: trade.value.title,
    category: trade.value.category,
    price: trade.value.price,
    condition: trade.value.condition,
    location: trade.value.location,
    publishTime: trade.value.publishTime,
    image: trade.value.image,
    publisher: trade.value.publisher,
  })
  ElMessage.success(nowFavorited ? '已收藏' : '已取消收藏')
}
</script>

<template>
  <div class="detail-page">
    <!-- 返回 -->
    <el-page-header @back="goBack" :title="`返回${typeLabel}列表`" class="back-header" />

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 未找到 -->
    <el-empty v-else-if="notFound" :description="`ID: ${itemId} 的信息未找到`" />

    <!-- ==================== 二手交易详情 ==================== -->
    <div v-else-if="itemType === 'trade' && trade" class="detail-content">
      <ImageBox
        :image-path="trade.image"
        fallback-emoji="📦"
        height="220px"
        border-radius="16px"
        icon-size="72px"
      />

      <div class="detail-header">
        <div class="title-row">
          <h1>{{ trade.title }}</h1>
          <el-tag type="success" effect="light">{{ trade.category }}</el-tag>
        </div>
        <p class="price">¥{{ trade.price }}</p>
        <p class="desc">{{ trade.description }}</p>
      </div>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📝 详细信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="成色">{{ trade.condition }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ trade.location }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ trade.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="trade.status === 'open' ? 'success' : 'info'" size="small">
              {{ trade.status === 'open' ? '在售' : '已售' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">👤 卖家信息</span>
        </template>
        <div class="seller-row">
          <el-avatar :icon="User" size="default" />
          <span class="seller-name">{{ trade.publisher }}</span>
        </div>
      </el-card>

      <div class="actions">
        <el-button type="primary" size="large" @click="handleContact(trade.publisher, trade.userId)">
          💬 联系卖家
        </el-button>
        <el-button
          :type="isTradeFavorited ? 'danger' : 'default'"
          size="large"
          @click="toggleFavorite"
        >
          {{ isTradeFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
        </el-button>
        <el-button size="large" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- ==================== 失物招领详情 ==================== -->
    <div v-else-if="itemType === 'lostfound' && lostFound" class="detail-content">
      <ImageBox
        :image-path="lostFound.image"
        :fallback-emoji="lostFound.type === 'lost' ? '🔍' : '🎁'"
        height="220px"
        border-radius="16px"
        icon-size="72px"
      />

      <div class="detail-header">
        <div class="title-row">
          <h1>{{ lostFound.title }}</h1>
          <el-tag :type="lostFound.type === 'lost' ? 'danger' : 'success'" effect="light">
            {{ lostFound.type === 'lost' ? '寻物' : '招领' }}
          </el-tag>
        </div>
        <p class="desc">{{ lostFound.description }}</p>
      </div>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📝 详细信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物品名称">{{ lostFound.itemName }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ lostFound.location }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ lostFound.eventTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="lostFound.status === 'open' ? 'warning' : 'info'" size="small">
              {{ lostFound.status === 'open' ? '寻找中' : '已找到' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📞 联系方式</span>
        </template>
        <p class="contact-info">{{ lostFound.contact }}</p>
      </el-card>

      <div class="actions">
        <el-button type="primary" size="large" @click="handleContact('发布者', lostFound.userId)">
          💬 联系发布者
        </el-button>
        <el-button size="large" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- ==================== 拼单搭子详情 ==================== -->
    <div v-else-if="itemType === 'groupbuy' && groupBuy" class="detail-content">
      <ImageBox
        :image-path="groupBuy.image"
        fallback-emoji="🤝"
        height="220px"
        border-radius="16px"
        icon-size="72px"
      />

      <div class="detail-header">
        <div class="title-row">
          <h1>{{ groupBuy.title }}</h1>
          <el-tag type="warning" effect="light">{{ groupBuy.type }}</el-tag>
        </div>
        <p class="desc">{{ groupBuy.description }}</p>
      </div>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📝 拼单进度</span>
        </template>
        <div class="progress-wrap">
          <div class="progress-header">
            <span>已有 <strong>{{ groupBuy.currentCount }}</strong> 人参与</span>
            <span>目标 <strong>{{ groupBuy.targetCount }}</strong> 人</span>
          </div>
          <el-progress
            :percentage="Math.round(groupBuy.currentCount / groupBuy.targetCount * 100)"
            :stroke-width="16"
            :color="groupBuy.currentCount >= groupBuy.targetCount ? 'var(--color-accent-green)' : 'var(--color-accent-blue)'"
          />
        </div>
        <el-descriptions :column="2" border style="margin-top: 16px;">
          <el-descriptions-item label="地点">{{ groupBuy.location }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ groupBuy.deadline }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="groupBuy.status === 'open' ? 'success' : 'info'" size="small">
              {{ groupBuy.status === 'open' ? '进行中' : '已结束' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">👤 发起者</span>
        </template>
        <div class="seller-row">
          <el-avatar :icon="User" size="default" />
          <span class="seller-name">{{ groupBuy.publisher }}</span>
        </div>
      </el-card>

      <div class="actions">
        <el-button type="primary" size="large" @click="handleContact(groupBuy.publisher, groupBuy.userId)">
          🤝 参与拼单
        </el-button>
        <el-button size="large" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- ==================== 跑腿委托详情 ==================== -->
    <div v-else-if="itemType === 'errand' && errand" class="detail-content">
      <ImageBox
        :image-path="errand.image"
        fallback-emoji="🏃"
        height="220px"
        border-radius="16px"
        icon-size="72px"
      />

      <div class="detail-header">
        <div class="title-row">
          <h1>{{ errand.title }}</h1>
          <el-tag type="danger" effect="light">{{ errand.taskType }}</el-tag>
        </div>
        <p class="price">💰 ￥{{ errand.reward }}</p>
        <p class="desc">{{ errand.description }}</p>
      </div>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📝 任务详情</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="起点">{{ errand.from }}</el-descriptions-item>
          <el-descriptions-item label="终点">{{ errand.to }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ errand.deadline }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="errand.status === 'open' ? 'danger' : 'info'" size="small">
              {{ errand.status === 'open' ? '待接单' : '已接单' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">👤 发布者</span>
        </template>
        <div class="seller-row">
          <el-avatar :icon="User" size="default" />
          <span class="seller-name">{{ errand.publisher }}</span>
        </div>
      </el-card>

      <div class="actions">
        <el-button type="primary" size="large" @click="handleContact(errand.publisher, errand.userId)">
          🏃 我要接单
        </el-button>
        <el-button size="large" @click="goBack">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  width: 100%;
}

.back-header {
  margin-bottom: 20px;
}

.loading-wrap {
  padding: 40px 0;
}

.detail-image {
  height: 220px;
  background: linear-gradient(135deg, var(--color-image-placeholder-from) 0%, var(--color-image-placeholder-to) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.image-icon {
  font-size: 72px;
  opacity: 0.5;
}

.detail-header {
  margin-bottom: 24px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.title-row h1 {
  margin: 0;
  font-size: 26px;
  word-break: break-all;
}

.price {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-price);
  margin: 0 0 8px;
}

.desc {
  margin: 0;
  color: var(--color-text-regular);
  font-size: 15px;
}

.section-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 15px;
}

.seller-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-name {
  font-weight: 600;
  font-size: 15px;
}

.contact-info {
  margin: 0;
  color: var(--color-text-regular);
  font-size: 15px;
}

.progress-wrap {
  text-align: center;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--color-text-regular);
  font-size: 14px;
}

.progress-header strong {
  color: var(--color-text-primary);
  font-size: 18px;
}

.actions {
  display: flex;
  gap: 14px;
  margin-top: 24px;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .detail-image {
    height: 180px;
    border-radius: 12px;
  }

  .image-icon {
    font-size: 56px;
  }

  .title-row h1 {
    font-size: 22px;
  }

  .price {
    font-size: 28px;
  }

  .desc {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
    gap: 10px;
  }

  .actions .el-button {
    width: 100%;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .detail-image {
    height: 150px;
  }

  .image-icon {
    font-size: 48px;
  }

  .title-row h1 {
    font-size: 20px;
  }

  .price {
    font-size: 24px;
  }

  .section-card :deep(.el-card__header) {
    padding: 10px 14px;
  }

  .section-card :deep(.el-card__body) {
    padding: 12px 14px;
  }
}
</style>
