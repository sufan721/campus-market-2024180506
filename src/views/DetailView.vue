<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const itemId = computed(() => Number(route.params.id))

// 模拟数据（实际项目中会从 API 获取）
const data: Record<number, { title: string; price: number; desc: string; detail: string; seller: string }> = {
  1: { title: '二手教材-高等数学', price: 15, desc: '九成新，几乎无笔记', detail: '同济大学第七版，上下册齐全，书角无折痕，内部有少量铅笔标注可擦除。适合大一新生使用。', seller: '张三' },
  2: { title: '机械键盘 IKBC C87', price: 80, desc: '樱桃红轴，使用一年', detail: 'IKBC C87 机械键盘，Cherry MX Red 红轴，87键紧凑布局，PBT键帽不打油。包装盒配件齐全。', seller: '李四' },
  3: { title: '台灯 LED 护眼', price: 25, desc: '三档调光，配件齐全', detail: '小米LED台灯1S，支持三档色温调节，无频闪，支持APP控制，灯臂可多角度调节。', seller: '王五' },
  4: { title: '代取快递服务', price: 3, desc: '校内驿站代取，当日送达', detail: '驿站排队久？我帮你取！校内所有驿站均可代取，送到宿舍楼下，今日下午统一配送。', seller: '赵六' },
  5: { title: '考研英语真题集', price: 20, desc: '2024版，含解析册', detail: '张剑黄皮书 2024 考研英语一历年真题及详解，包含近10年真题，解析详尽。', seller: '孙七' },
}

const info = ref(data[itemId.value] || null)

function goBack() {
  router.back()
}
</script>

<template>
  <div class="detail-page">
    <button class="back-btn" @click="goBack">← 返回列表</button>

    <div v-if="info" class="detail-card">
      <h1>{{ info.title }}</h1>
      <p class="price">¥{{ info.price }}</p>
      <p class="desc">{{ info.desc }}</p>
      <div class="detail-section">
        <h3>详细描述</h3>
        <p>{{ info.detail }}</p>
      </div>
      <div class="seller-info">
        <span>卖家：{{ info.seller }}</span>
      </div>
    </div>

    <div v-else class="not-found">
      <h2>商品不存在</h2>
      <p>ID: {{ itemId }} 的商品未找到</p>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 680px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #409eff;
  font-size: 15px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 28px 24px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
  margin: 8px 0;
}

.desc {
  color: #555;
  font-size: 15px;
  margin-bottom: 20px;
}

.detail-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
  margin-bottom: 16px;
}

.detail-section h3 {
  margin-bottom: 8px;
}

.detail-section p {
  color: #666;
  line-height: 1.7;
}

.seller-info {
  background: #f5f7fa;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #555;
}

.not-found {
  text-align: center;
  padding: 60px 0;
  color: #999;
}
</style>
