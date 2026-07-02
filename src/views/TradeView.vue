<template>
  <section class="page">
    <div class="page-header">
      <h1>二手交易</h1>
      <p>浏览同学发布的闲置物品，发现校园内的实用好物。</p>
    </div>

    <EmptyState
      v-if="trades.length === 0"
      text="暂无二手交易信息"
    />

    <div v-else class="list">
      <ItemCard
        v-for="item in trades"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.category"
        :location="item.location"
        :time="item.publishTime"
        @click="goDetail(item.id)"
      >
        <template #footer>
          <div class="trade-footer">
            <div class="trade-footer-left">
              <strong>￥{{ item.price }}</strong>
              <span class="condition">{{ item.condition }}</span>
            </div>
            <el-button
              :type="favoritesStore.isFavorited(item.id) ? 'danger' : 'default'"
              size="small"
              circle
              @click.stop="toggleFavorite(item)"
            >
              {{ favoritesStore.isFavorited(item.id) ? '❤️' : '🤍' }}
            </el-button>
          </div>
        </template>
      </ItemCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { useFavoritesStore } from '../stores/favorites'
import ItemCard from '../components/ItemCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getTrades, type TradeItem } from '../api/trade'

const router = useRouter()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

const trades = ref<TradeItem[]>([])

onMounted(async () => {
  const res = await getTrades()
  trades.value = res.data
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'trade', id } })
}

function toggleFavorite(item: TradeItem) {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再收藏')
    router.push('/profile')
    return
  }
  const nowFavorited = favoritesStore.toggleFavorite({
    id: item.id,
    title: item.title,
    category: item.category,
    price: item.price,
    condition: item.condition,
    location: item.location,
    publishTime: item.publishTime,
    image: item.image,
    publisher: item.publisher,
  })
  ElMessage.success(nowFavorited ? '已收藏' : '已取消收藏')
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  padding: 24px;
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg);
}

.page-header h1 {
  margin: 0 0 8px;
}

.page-header p {
  margin: 0;
  color: var(--color-text-regular);
}

.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.condition {
  margin-left: 12px;
  color: var(--color-text-regular);
}

.trade-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.trade-footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
