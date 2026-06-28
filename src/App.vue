<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, List, Edit, ChatDotRound, UserFilled, Expand, Fold } from '@element-plus/icons-vue'

const route = useRoute()
const activeIndex = ref('/home')
const drawerVisible = ref(false)

// 监听路由变化更新活跃菜单
watch(() => route.path, (path) => {
  activeIndex.value = path
})

// 屏幕宽度检测
const isMobile = ref(window.innerWidth < 768)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})

interface NavItem {
  index: string
  icon: typeof HomeFilled
  label: string
}

const navItems: NavItem[] = [
  { index: '/home', icon: HomeFilled, label: '首页' },
  { index: '/list', icon: List, label: '列表' },
  { index: '/publish', icon: Edit, label: '发布' },
  { index: '/message', icon: ChatDotRound, label: '消息' },
  { index: '/profile', icon: UserFilled, label: '我的' },
]

function onNavSelect(index: string) {
  activeIndex.value = index
  drawerVisible.value = false
}
</script>

<template>
  <el-container class="app-container">
    <!-- 顶部标题栏 -->
    <el-header class="app-header" height="auto">
      <div class="header-content">
        <div class="brand">
          <span class="brand-icon">🏪</span>
          <div class="brand-text">
            <h1 class="brand-title">校园轻集市</h1>
            <p class="brand-subtitle">AI 辅助前端工程实践种子项目</p>
          </div>
        </div>
        <!-- 移动端汉堡按钮 -->
        <el-button
          class="hamburger-btn"
          circle
          :icon="drawerVisible ? Fold : Expand"
          @click="drawerVisible = !drawerVisible"
        />
      </div>
    </el-header>

    <!-- 桌面端水平导航 -->
    <div class="nav-wrapper desktop-nav">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :ellipsis="false"
        router
        class="app-nav"
        @select="(index: string) => activeIndex = index"
      >
        <el-menu-item v-for="item in navItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 移动端底部导航栏 -->
    <div class="mobile-bottom-nav">
      <router-link
        v-for="item in navItems"
        :key="item.index"
        :to="item.index"
        class="bottom-nav-item"
        :class="{ active: activeIndex === item.index }"
        @click="activeIndex = item.index"
      >
        <el-icon :size="20"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </router-link>
    </div>

    <!-- 移动端侧滑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="75%"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="drawer-brand">
        <span class="drawer-icon">🏪</span>
        <span class="drawer-title">校园轻集市</span>
      </div>
      <el-menu
        :default-active="activeIndex"
        router
        class="drawer-menu"
        @select="(index: string) => onNavSelect(index)"
      >
        <el-menu-item v-for="item in navItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

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
  -webkit-font-smoothing: antialiased;
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

/* ========== 顶部 ========== */
.app-header {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 50%, #2c6fba 100%);
  padding: 0;
}

.header-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  font-size: 34px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  flex-shrink: 0;
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

/* 汉堡按钮 — 默认隐藏，移动端显示 */
.hamburger-btn {
  display: none;
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

/* ========== 桌面端导航 ========== */
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

/* ========== 移动端底部导航 ========== */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  z-index: 100;
  padding: 6px 0 env(safe-area-inset-bottom, 0);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  text-decoration: none;
  color: #999;
  font-size: 11px;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: #409eff;
}

/* ========== 抽屉菜单 ========== */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 12px;
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.drawer-icon {
  font-size: 28px;
}

.drawer-menu {
  border-right: none !important;
}

/* ========== 主内容区 ========== */
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

/* ========== 底部 ========== */
.app-footer {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 13px;
  background: #fff;
  border-top: 1px solid #eee;
}

/* ========== RESPONSIVE ========== */

/* ≤ 768px: 平板 / 手机横屏 */
@media (max-width: 768px) {
  .header-content {
    padding: 14px 16px;
  }

  .brand-icon {
    font-size: 28px;
  }

  .brand-title {
    font-size: 20px;
    letter-spacing: 1px;
  }

  .brand-subtitle {
    font-size: 11px;
  }

  /* 显示汉堡按钮 */
  .hamburger-btn {
    display: flex;
  }

  /* 隐藏桌面导航 */
  .desktop-nav {
    display: none;
  }

  /* 显示移动底部导航 */
  .mobile-bottom-nav {
    display: flex;
  }

  /* 内容区下移为底部导航留空间 */
  .app-main {
    padding: 16px 12px 80px;
  }

  .app-footer {
    display: none;
  }
}

/* ≤ 480px: 小屏手机 */
@media (max-width: 480px) {
  .brand-icon {
    font-size: 24px;
  }

  .brand-title {
    font-size: 18px;
  }

  .brand-subtitle {
    display: none;
  }

  .app-main {
    padding: 12px 10px 76px;
  }
}
</style>
