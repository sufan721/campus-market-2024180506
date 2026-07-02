<template>
  <section class="page">
    <div class="page-header">
      <h1>跑腿委托</h1>
      <p>发布跑腿任务或接单，用零碎时间赚点零花钱。</p>
    </div>

    <EmptyState
      v-if="errands.length === 0"
      text="暂无跑腿任务"
    />

    <div v-else class="list">
      <ItemCard
        v-for="item in errands"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.taskType"
        :location="item.from + ' → ' + item.to"
        :time="item.deadline"
        @click="goDetail(item.id)"
      >
        <template #footer>
          <strong class="reward">💰 ￥{{ item.reward }}</strong>
          <span class="publisher">发布者：{{ item.publisher }}</span>
        </template>
      </ItemCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ItemCard from '../components/ItemCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getErrands, type ErrandItem } from '../api/errand'

const router = useRouter()

const errands = ref<ErrandItem[]>([])

onMounted(async () => {
  const res = await getErrands()
  errands.value = res.data
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'errand', id } })
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

.reward {
  color: var(--color-text-price);
  font-size: 16px;
}

.publisher {
  margin-left: 12px;
  color: var(--color-text-regular);
  font-size: 13px;
}

@media (max-width: 768px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
