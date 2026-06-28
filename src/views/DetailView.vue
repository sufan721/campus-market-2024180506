<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const itemId = computed(() => Number(route.params.id))

const data: Record<number, {
  title: string; price: number; desc: string; detail: string
  seller: string; tag: string; tagType: 'success' | 'warning' | 'info' | 'danger'
}> = {
  1: { title: '二手教材-高等数学', price: 15, desc: '九成新，几乎无笔记', detail: '同济大学第七版，上下册齐全，书角无折痕，内部有少量铅笔标注可擦除。适合大一新生使用。', seller: '张三', tag: '教材', tagType: 'info' },
  2: { title: '机械键盘 IKBC C87', price: 80, desc: '樱桃红轴，使用一年', detail: 'IKBC C87 机械键盘，Cherry MX Red 红轴，87键紧凑布局，PBT键帽不打油。包装盒配件齐全，购买于京东自营。', seller: '李四', tag: '数码', tagType: 'success' },
  3: { title: '台灯 LED 护眼', price: 25, desc: '三档调光，配件齐全', detail: '小米LED台灯1S，支持三档色温调节，无频闪，支持APP控制，灯臂可多角度调节。', seller: '王五', tag: '生活', tagType: 'warning' },
  4: { title: '代取快递服务', price: 3, desc: '校内驿站代取，当日送达', detail: '驿站排队久？我帮你取！校内所有驿站均可代取，送到宿舍楼下，今日下午统一配送。', seller: '赵六', tag: '服务', tagType: 'danger' },
  5: { title: '考研英语真题集', price: 20, desc: '2024版，含解析册', detail: '张剑黄皮书 2024 考研英语一历年真题及详解，包含近10年真题，解析详尽，适合考研备考。', seller: '孙七', tag: '教材', tagType: 'info' },
}

const info = ref(data[itemId.value] || null)

function goBack() {
  router.back()
}

function handleContact() {
  ElMessage.success(`已向卖家「${info.value?.seller}」发送消息`)
}
</script>

<template>
  <div class="detail-page">
    <!-- 返回 -->
    <el-page-header @back="goBack" title="返回列表" class="back-header" />

    <div v-if="info" class="detail-content">
      <!-- 图片占位 -->
      <div class="detail-image">
        <span class="image-icon">📦</span>
      </div>

      <!-- 标题 & 价格 -->
      <div class="detail-header">
        <div class="title-row">
          <h1>{{ info.title }}</h1>
          <el-tag :type="info.tagType" effect="light">{{ info.tag }}</el-tag>
        </div>
        <p class="price">¥{{ info.price }}</p>
        <p class="desc">{{ info.desc }}</p>
      </div>

      <!-- 详细描述 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">📝 详细描述</span>
        </template>
        <p class="detail-text">{{ info.detail }}</p>
      </el-card>

      <!-- 卖家信息 -->
      <el-card shadow="never" class="section-card">
        <template #header>
          <span class="section-title">👤 卖家信息</span>
        </template>
        <div class="seller-row">
          <el-avatar :icon="User" size="default" />
          <span class="seller-name">{{ info.seller }}</span>
        </div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" size="large" @click="handleContact">
          💬 联系卖家
        </el-button>
        <el-button size="large" @click="goBack">
          返回列表
        </el-button>
      </div>
    </div>

    <!-- 未找到 -->
    <el-empty v-else :description="`ID: ${itemId} 的商品未找到`" />
  </div>
</template>

<style scoped>
.detail-page {
  width: 100%;
}

.back-header {
  margin-bottom: 20px;
}

.detail-image {
  height: 220px;
  background: linear-gradient(135deg, #e8f4fd 0%, #d0e4f5 100%);
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
  color: #f56c6c;
  margin: 0 0 8px;
}

.desc {
  margin: 0;
  color: #777;
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

.detail-text {
  margin: 0;
  color: #555;
  line-height: 1.8;
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

  .detail-text {
    font-size: 14px;
    line-height: 1.7;
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
