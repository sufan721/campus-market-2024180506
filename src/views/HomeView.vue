<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  { icon: '📋', title: '浏览信息', desc: '发现校园内的二手好物与服务' },
  { icon: '✏️', title: '发布信息', desc: '快速发布你想出售的商品' },
  { icon: '💬', title: '即时沟通', desc: '买卖双方在线交流' },
  { icon: '📊', title: '数据看板', desc: '查看平台运营数据概览' },
])
</script>

<template>
  <section class="home-page">
    <h2>欢迎来到校园轻集市</h2>
    <p class="intro">一个专为校园打造的信息发布与交易平台</p>

    <div class="feature-grid">
      <div v-for="f in features" :key="f.title" class="feature-card">
        <span class="feature-icon">{{ f.icon }}</span>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
      </div>
    </div>

    <div class="quick-links">
      <router-link to="/list" class="quick-btn">浏览列表 →</router-link>
      <router-link to="/publish" class="quick-btn primary">立即发布 →</router-link>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.intro {
  color: #666;
  margin-bottom: 32px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.feature-card {
  background: #f9fafb;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 24px 16px;
  transition: transform 0.15s;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.feature-card h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.feature-card p {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.quick-btn {
  display: inline-block;
  padding: 10px 24px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  text-decoration: none;
  color: #555;
  font-size: 15px;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.quick-btn.primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.quick-btn.primary:hover {
  background: #337ecc;
}
</style>
