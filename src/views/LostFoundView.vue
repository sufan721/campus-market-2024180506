<template>
  <section class="page">
    <div class="page-header">
      <h1>失物招领</h1>
      <p>发布或查找失物信息，互帮互助共建温暖校园。</p>
    </div>

    <EmptyState
      v-if="lostFounds.length === 0"
      text="暂无失物招领信息"
    />

    <div v-else class="list">
      <ItemCard
        v-for="item in lostFounds"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.type === 'lost' ? '寻物' : '招领'"
        :location="item.location"
        :time="item.eventTime"
        :image="item.image"
        :fallback-emoji="item.type === 'lost' ? '🔍' : '🎁'"
        @click="goDetail(item.id)"
      >
        <template #footer>
          <span>{{ item.itemName }}</span>
          <span class="contact">联系：{{ item.contact }}</span>
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
import { getLostFounds, type LostFoundItem } from '../api/lostFound'

const router = useRouter()

const lostFounds = ref<LostFoundItem[]>([])

onMounted(async () => {
  const res = await getLostFounds()
  lostFounds.value = res.data
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'lostfound', id } })
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

.contact {
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
