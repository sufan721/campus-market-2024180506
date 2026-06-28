<script setup lang="ts"></script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">校园轻集市</h1>
      <p class="app-desc">AI 辅助前端工程实践种子项目</p>
    </header>

    <nav class="app-nav">
      <router-link to="/home" class="nav-link" active-class="nav-link--active">
        🏠 首页
      </router-link>
      <router-link to="/list" class="nav-link" active-class="nav-link--active">
        📋 列表
      </router-link>
      <router-link to="/publish" class="nav-link" active-class="nav-link--active">
        ✏️ 发布
      </router-link>
      <router-link to="/message" class="nav-link" active-class="nav-link--active">
        💬 消息
      </router-link>
      <router-link to="/profile" class="nav-link" active-class="nav-link--active">
        👤 我的
      </router-link>
    </nav>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 24px 16px 12px;
  background: #f5f7fa;
}

.app-title {
  margin: 0;
  font-size: 22px;
  color: #333;
}

.app-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #999;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 2px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-link {
  padding: 12px 18px;
  text-decoration: none;
  color: #666;
  font-size: 15px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.nav-link:hover {
  color: #409eff;
}

.nav-link--active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.app-main {
  flex: 1;
  padding: 28px 16px 40px;
}
</style>
