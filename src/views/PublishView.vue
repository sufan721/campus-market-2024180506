<script setup lang="ts">
import { ref } from 'vue'

const title = ref('')
const price = ref('')
const desc = ref('')

function submitPublish() {
  if (!title.value || !price.value || !desc.value) {
    alert('请填写完整信息')
    return
  }
  alert(`发布成功：${title.value}`)
  title.value = ''
  price.value = ''
  desc.value = ''
}
</script>

<template>
  <div class="publish-page">
    <h1>发布信息</h1>
    <p class="subtitle">填写以下表单发布你的商品或服务</p>

    <form class="publish-form" @submit.prevent="submitPublish">
      <div class="form-group">
        <label for="title">标题</label>
        <input id="title" v-model="title" type="text" placeholder="请输入商品/服务名称" required />
      </div>

      <div class="form-group">
        <label for="price">价格 (¥)</label>
        <input id="price" v-model="price" type="number" placeholder="请输入价格" required min="0" />
      </div>

      <div class="form-group">
        <label for="desc">描述</label>
        <textarea id="desc" v-model="desc" placeholder="请详细描述商品/服务信息" required rows="5"></textarea>
      </div>

      <button type="submit" class="submit-btn">发布</button>
    </form>
  </div>
</template>

<style scoped>
.publish-page {
  max-width: 520px;
  margin: 0 auto;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #409eff;
  outline: none;
}

.submit-btn {
  padding: 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #337ecc;
}
</style>
