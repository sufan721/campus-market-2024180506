<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Right } from '@element-plus/icons-vue'

const router = useRouter()

interface ListItem {
  id: number
  title: string
  price: number
  desc: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'info' | 'danger'
}

const items = ref<ListItem[]>([
  { id: 1, title: '二手教材-高等数学', price: 15, desc: '九成新，几乎无笔记', tag: '教材', tagType: 'info' },
  { id: 2, title: '机械键盘 IKBC C87', price: 80, desc: '樱桃红轴，使用一年', tag: '数码', tagType: 'success' },
  { id: 3, title: '台灯 LED 护眼', price: 25, desc: '三档调光，配件齐全', tag: '生活', tagType: 'warning' },
  { id: 4, title: '代取快递服务', price: 3, desc: '校内驿站代取，当日送达', tag: '服务', tagType: 'danger' },
  { id: 5, title: '考研英语真题集', price: 20, desc: '2024版，含解析册', tag: '教材', tagType: 'info' },
])

const searchKeyword = ref('')

const filteredItems = computed(() => {
  if (!searchKeyword.value) return items.value
  return items.value.filter(
    i => i.title.includes(searchKeyword.value) || i.desc.includes(searchKeyword.value)
  )
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { id } })
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

    <div v-if="filteredItems.length === 0" class="empty-state">
      <el-empty description="未找到匹配的商品" />
    </div>

    <el-row v-else :gutter="16">
      <el-col v-for="item in filteredItems" :key="item.id" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="item-card" @click="goDetail(item.id)">
          <!-- 图片占位 -->
          <div class="item-image">
            <span class="image-icon">📦</span>
          </div>
          <div class="item-body">
            <div class="item-header">
              <h3 class="item-title">{{ item.title }}</h3>
              <el-tag :type="item.tagType" size="small" effect="plain">{{ item.tag }}</el-tag>
            </div>
            <p class="item-desc">{{ item.desc }}</p>
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
  max-width: 880px;
  margin: 0 auto;
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

.item-image {
  height: 140px;
  background: linear-gradient(135deg, #e8f4fd 0%, #dce9f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px 12px 0 0;
}

.image-icon {
  font-size: 48px;
  opacity: 0.6;
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

  .item-image {
    height: 120px;
  }

  .image-icon {
    font-size: 40px;
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
  .item-image {
    height: 100px;
  }

  .image-icon {
    font-size: 36px;
  }

  .item-title {
    font-size: 14px;
  }
}
</style>
