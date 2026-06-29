<template>
  <section class="page">
    <div class="page-header">
      <h1>拼单搭子</h1>
      <p>找到志同道合的同学，一起拼单省更多！</p>
    </div>

    <EmptyState
      v-if="groupBuys.length === 0"
      text="暂无拼单信息"
    />

    <div v-else class="list">
      <ItemCard
        v-for="item in groupBuys"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.type"
        :location="item.location"
        :time="item.deadline"
        @click="goDetail(item.id)"
      >
        <template #footer>
          <span>{{ item.currentCount }} / {{ item.targetCount }} 人</span>
          <el-progress
            :percentage="Math.round(item.currentCount / item.targetCount * 100)"
            :stroke-width="6"
            :show-text="false"
            style="flex: 1; margin-left: 12px;"
          />
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
import { getGroupBuys, type GroupBuyItem } from '../api/groupBuy'

const router = useRouter()

const groupBuys = ref<GroupBuyItem[]>([])

onMounted(async () => {
  const res = await getGroupBuys()
  groupBuys.value = res.data
})

function goDetail(id: number) {
  router.push({ name: 'Detail', params: { type: 'groupbuy', id } })
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
  border-radius: 16px;
  background: #fff;
}

.page-header h1 {
  margin: 0 0 8px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
