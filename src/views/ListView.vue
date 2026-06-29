<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Right } from '@element-plus/icons-vue'
import { getTrades, type TradeItem } from '../api/trade'
import ImageBox from '../components/ImageBox.vue'

const router = useRouter()

const items = ref<TradeItem[]>([])
const loading = ref(true)

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

onMounted(async () => {
  try {
    const res = await getTrades()
    items.value = res.data
  } finally {
    loading.value = false
  }
})

const searchKeyword = ref('')

const filteredItems = computed(() => {
  if (!searchKeyword.value) return items.value
  const kw = searchKeyword.value
  return items.value.filter(
    i => i.title.includes(kw) || i.description.includes(kw) || i.category.includes(kw)
  )
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'trade', id } })
}
</script>

<template>
  <div class="list-page">
    <div class="page-header">
      <div>
        <h1>信息列表</h1>
        <p class="subtitle">浏览校园内的二手商品与服务信息</p>
      </div>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品..."
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>

    <!-- 加载骨架 -->
    <el-row v-if="loading" :gutter="16">
      <el-col v-for="n in 6" :key="n" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="item-card">
          <el-skeleton :rows="3" animated />
        </el-card>
      </el-col>
    </el-row>

    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <el-empty description="未找到匹配的商品" />
    </div>

    <el-row v-else :gutter="16">
      <el-col v-for="item in filteredItems" :key="item.id" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="item-card" @click="goDetail(Number(item.id))">
          <ImageBox
            :image-path="item.image"
            fallback-emoji="📦"
            height="140px"
            border-radius="12px 12px 0 0"
            icon-size="48px"
          />
          <div class="item-body">
            <div class="item-header">
              <h3 class="item-title">{{ item.title }}</h3>
              <el-tag :type="getTagInfo(item.category).tagType" size="small" effect="plain">
                {{ getTagInfo(item.category).tag }}
              </el-tag>
            </div>
            <p class="item-desc">{{ item.description }}</p>
            <div class="item-footer">
              <span class="item-price">¥{{ item.price }}</span>
              <el-button type="primary" link :icon="Right">查看详情</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.list-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
}

.page-header h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 260px;
}

/* 商品卡片 */
.item-card {
  margin-bottom: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-4px);
}

.item-card :deep(.el-card__body) {
  padding: 0;
}

.item-body {
  padding: 14px 16px 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.item-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.item-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.empty-state {
  padding: 60px 0;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .search-input {
    width: 100%;
  }

  .item-body {
    padding: 12px 14px 14px;
  }

  .item-title {
    font-size: 15px;
  }

  .item-price {
    font-size: 18px;
  }
}

/* ≤ 480px */
@media (max-width: 480px) {
  .item-title {
    font-size: 14px;
  }
}
</style>
