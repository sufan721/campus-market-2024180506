<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserFilled, List, Star, Setting, InfoFilled, ArrowRight, Switch,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getTradesByUser, type TradeItem } from '@/api/trade'
import { getLostFoundsByUser, type LostFoundItem } from '@/api/lostFound'
import { getGroupBuysByUser, type GroupBuyItem } from '@/api/groupBuy'
import { getErrandsByUser, type ErrandItem } from '@/api/errand'

const router = useRouter()
const userStore = useUserStore()

// 用户发布的所有物品
const myTrades = ref<TradeItem[]>([])
const myLostFounds = ref<LostFoundItem[]>([])
const myGroupBuys = ref<GroupBuyItem[]>([])
const myErrands = ref<ErrandItem[]>([])

const loading = ref(false)

// 统计数据
const totalPublished = computed(
  () => myTrades.value.length + myLostFounds.value.length + myGroupBuys.value.length + myErrands.value.length,
)

const stats = computed(() => [
  { num: myTrades.value.length, label: '二手交易', color: '#409eff' },
  { num: myLostFounds.value.length, label: '失物招领', color: '#67c23a' },
  { num: myGroupBuys.value.length, label: '拼单搭子', color: '#e6a23c' },
  { num: myErrands.value.length, label: '跑腿委托', color: '#f56c6c' },
])

// 合并所有发布（按时间排序后展示）
interface MyItem {
  id: number
  title: string
  type: string
  category: string
  time: string
}

const myItems = computed<MyItem[]>(() => {
  const items: MyItem[] = [
    ...myTrades.value.map(t => ({ id: t.id, title: t.title, type: '二手交易', category: t.category, time: t.publishTime })),
    ...myLostFounds.value.map(l => ({ id: l.id, title: l.title, type: '失物招领', category: l.itemName, time: l.eventTime })),
    ...myGroupBuys.value.map(g => ({ id: g.id, title: g.title, type: '拼单搭子', category: g.type, time: g.deadline })),
    ...myErrands.value.map(e => ({ id: e.id, title: e.title, type: '跑腿委托', category: e.taskType, time: e.deadline })),
  ]
  items.sort((a, b) => b.time.localeCompare(a.time))
  return items
})

async function loadMyItems() {
  loading.value = true
  const uid = userStore.userId
  try {
    const [t, l, g, e] = await Promise.all([
      getTradesByUser(uid),
      getLostFoundsByUser(uid),
      getGroupBuysByUser(uid),
      getErrandsByUser(uid),
    ])
    myTrades.value = t.data
    myLostFounds.value = l.data
    myGroupBuys.value = g.data
    myErrands.value = e.data
  } catch {
    // Mock 服务未启动时静默失败
  } finally {
    loading.value = false
  }
}

onMounted(loadMyItems)
</script>

<template>
  <div class="profile-page">
    <h1 class="page-title">个人中心</h1>

    <!-- 用户信息卡片 -->
    <el-card shadow="hover" class="user-card">
      <div class="user-info">
        <el-avatar :icon="UserFilled" :size="72" class="user-avatar" />
        <div class="user-meta">
          <h2>{{ userStore.currentUser.name }}</h2>
          <p>{{ userStore.currentUser.department }} · {{ userStore.currentUser.grade }}</p>
          <el-tag size="small" effect="plain">加入于 {{ userStore.currentUser.joinDate }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 发布统计 -->
    <el-row :gutter="14" class="stats-row">
      <el-col :xs="6" v-for="s in stats" :key="s.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <span class="stat-num" :style="{ color: s.color }">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 我的发布列表 -->
    <el-card shadow="never" class="menu-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">📋 我的发布（{{ totalPublished }}）</span>
          <el-button type="primary" link @click="loadMyItems" :loading="loading">
            刷新
          </el-button>
        </div>
      </template>

      <div v-if="totalPublished === 0 && !loading" class="empty-hint">
        暂无发布内容，去<a href="javascript:void(0)" @click="$router.push('/publish')">发布</a>第一条吧！
      </div>

      <div
        v-for="(item, i) in myItems"
        :key="`${item.type}-${item.id}`"
        class="menu-item"
        :class="{ 'menu-item-last': i === myItems.length - 1 }"
      >
        <div class="menu-left">
          <span class="item-type-tag" :class="`tag-${item.type}`">{{ item.type }}</span>
          <span class="item-title">{{ item.title }}</span>
        </div>
        <div class="menu-right">
          <span class="item-time">{{ item.time }}</span>
          <el-icon class="menu-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
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

.stat-card :deep(.el-card__body) {
  padding: 14px 8px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 26px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* 我的发布列表 */
.menu-card {
  border-radius: 14px;
}

.menu-card :deep(.el-card__body) {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.empty-hint a {
  color: #409eff;
  text-decoration: none;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item-last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.item-type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-二手交易 { background: #ecf5ff; color: #409eff; }
.tag-失物招领 { background: #f0f9eb; color: #67c23a; }
.tag-拼单搭子 { background: #fdf6ec; color: #e6a23c; }
.tag-跑腿委托 { background: #fef0f0; color: #f56c6c; }

.item-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.item-time {
  font-size: 12px;
  color: #bbb;
}

.menu-arrow {
  color: #ccc;
  font-size: 14px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }

  .user-card :deep(.el-card__body) {
    padding: 18px;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
  }

  .user-meta h2 {
    font-size: 18px;
  }

  .stat-num {
    font-size: 22px;
  }

  .menu-item {
    padding: 12px 14px;
  }

  .item-title {
    font-size: 13px;
  }
}

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
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>
