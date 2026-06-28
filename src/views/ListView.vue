<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface ListItem {
  id: number
  title: string
  price: number
  desc: string
}

const items = ref<ListItem[]>([
  { id: 1, title: '二手教材-高等数学', price: 15, desc: '九成新，几乎无笔记' },
  { id: 2, title: '机械键盘 IKBC C87', price: 80, desc: '樱桃红轴，使用一年' },
  { id: 3, title: '台灯 LED 护眼', price: 25, desc: '三档调光，配件齐全' },
  { id: 4, title: '代取快递服务', price: 3, desc: '校内驿站代取，当日送达' },
  { id: 5, title: '考研英语真题集', price: 20, desc: '2024版，含解析册' },
])

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { id } })
}
</script>

<template>
  <div class="list-page">
    <h1>信息列表</h1>
    <p class="subtitle">浏览校园内的二手商品与服务信息</p>

    <ul class="item-list">
      <li v-for="item in items" :key="item.id" class="item-card" @click="goDetail(item.id)">
        <div class="item-header">
          <span class="item-title">{{ item.title }}</span>
          <span class="item-price">¥{{ item.price }}</span>
        </div>
        <p class="item-desc">{{ item.desc }}</p>
        <span class="item-link">查看详情 →</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-page {
  max-width: 680px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.item-list {
  list-style: none;
  padding: 0;
}

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.item-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-title {
  font-weight: 600;
  font-size: 16px;
}

.item-price {
  color: #e74c3c;
  font-weight: 700;
  font-size: 18px;
}

.item-desc {
  color: #888;
  font-size: 14px;
  margin: 0 0 8px;
}

.item-link {
  font-size: 13px;
  color: #409eff;
}
</style>
