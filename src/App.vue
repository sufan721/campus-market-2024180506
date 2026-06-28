<script setup lang="ts">
import { ref } from 'vue'
import { HomeFilled, List, Edit, ChatDotRound, UserFilled } from '@element-plus/icons-vue'

const activeIndex = ref('/home')
</script>

<template>
  <el-container class="app-container">
    <!-- 顶部标题栏 -->
    <el-header class="app-header" height="auto">
      <div class="header-content">
        <div class="brand">
          <span class="brand-icon">🏪</span>
          <div>
            <h1 class="brand-title">校园轻集市</h1>
            <p class="brand-subtitle">AI 辅助前端工程实践种子项目</p>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 导航栏 -->
    <div class="nav-wrapper">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :ellipsis="false"
        router
        class="app-nav"
        @select="(index: string) => activeIndex = index"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/list">
          <el-icon><List /></el-icon>
          <span>列表</span>
        </el-menu-item>
        <el-menu-item index="/publish">
          <el-icon><Edit /></el-icon>
          <span>发布</span>
        </el-menu-item>
        <el-menu-item index="/message">
          <el-icon><ChatDotRound /></el-icon>
          <span>消息</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><UserFilled /></el-icon>
          <span>我的</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <!-- 底部 -->
    <el-footer class="app-footer">
      <span>© 2026 校园轻集市 — 前端工程实践项目</span>
    </el-footer>
  </el-container>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f0f2f5;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部 */
.app-header {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 50%, #2c6fba 100%);
  padding: 0;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.brand-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

/* 导航 */
.nav-wrapper {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.app-nav {
  max-width: 900px;
  margin: 0 auto;
  border-bottom: none !important;
}

.app-nav .el-menu-item {
  font-size: 15px;
  font-weight: 500;
}

.app-nav .el-menu-item.is-active {
  color: #409eff;
  border-bottom-color: #409eff;
}

/* 主内容 */
.app-main {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 40px;
  flex: 1;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 底部 */
.app-footer {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
  background: #fff;
  border-top: 1px solid #eee;
}
</style>
