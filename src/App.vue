<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, List, Edit, ChatDotRound, UserFilled, Expand, Fold, Goods, Search, Connection, Service } from '@element-plus/icons-vue'
import { useUserStore } from './stores/user'
import { useFavoritesStore } from './stores/favorites'

const route = useRoute()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const activeIndex = ref('/home')
const drawerVisible = ref(false)

// 业务子页面的路由列表
const bizRoutes = ['/trades', '/lost-found', '/group-buy', '/errands']

// 监听路由变化更新活跃菜单
watch(() => route.path, (path) => {
  // 业务子页面高亮"分类"父菜单
  activeIndex.value = bizRoutes.includes(path) ? '/trades' : path
})

// 屏幕宽度检测
const isMobile = ref(window.innerWidth < 768)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})

// 初始化认证状态
onMounted(async () => {
  await userStore.initAuth()
  if (userStore.isLoggedIn) {
    favoritesStore.load()
  }
})

interface NavItem {
  index: string
  icon: typeof HomeFilled
  label: string
}

const navItems: NavItem[] = [
  { index: '/home', icon: HomeFilled, label: '首页' },
  { index: '/trades', icon: List, label: '分类' },
  { index: '/publish', icon: Edit, label: '发布' },
  { index: '/message', icon: ChatDotRound, label: '消息' },
  { index: '/profile', icon: UserFilled, label: '我的' },
]

interface BizItem {
  index: string
  icon: typeof Goods
  label: string
}

const bizItems: BizItem[] = [
  { index: '/trades', icon: Goods, label: '二手交易' },
  { index: '/lost-found', icon: Search, label: '失物招领' },
  { index: '/group-buy', icon: Connection, label: '拼单搭子' },
  { index: '/errands', icon: Service, label: '跑腿委托' },
]

function onNavSelect(index: string) {
  activeIndex.value = index
  drawerVisible.value = false
}
</script>

<template>
  <el-container class="app-container">
    <!-- 顶部标题栏（浅绿色，含导航） -->
    <el-header class="app-header">
      <div class="header-content">
        <!-- 品牌 -->
        <div class="brand" @click="$router.push('/home')">
          <span class="brand-icon">🏪</span>
          <h1 class="brand-title">校园轻集市</h1>
        </div>

        <!-- 桌面端导航 — 内嵌在 header 中 -->
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          :ellipsis="false"
          router
          class="header-nav desktop-nav"
          @select="(index: string) => activeIndex = index"
        >
          <template v-for="item in navItems" :key="item.index">
            <el-sub-menu v-if="item.index === '/trades'" index="biz-sub">
              <template #title>
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </template>
              <el-menu-item v-for="biz in bizItems" :key="biz.index" :index="biz.index">
                <el-icon><component :is="biz.icon" /></el-icon>
                <span>{{ biz.label }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.index">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </template>
        </el-menu>

        <!-- 移动端汉堡按钮 -->
        <el-button
          class="hamburger-btn"
          circle
          :icon="drawerVisible ? Fold : Expand"
          @click="drawerVisible = !drawerVisible"
        />
      </div>
    </el-header>

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
        <template v-for="item in navItems" :key="item.index">
          <el-sub-menu v-if="item.index === '/trades'" index="biz-sub-drawer">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item v-for="biz in bizItems" :key="biz.index" :index="biz.index">
              <el-icon><component :is="biz.icon" /></el-icon>
              <span>{{ biz.label }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.index">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
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

/* ========== 顶部（浅灰色） ========== */
.app-header {
  --header-height: 52px;
  height: var(--header-height);
  background: #f0f1f3;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}

.brand-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 桌面端导航 — 内嵌在 header */
.header-nav {
  margin-left: auto;
  background: transparent !important;
  border-bottom: none !important;
  height: var(--header-height);
}

.header-nav :deep(.el-menu-item) {
  height: var(--header-height);
  line-height: var(--header-height);
  font-size: 14px;
  font-weight: 500;
  color: #555;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.header-nav :deep(.el-menu-item:hover) {
  color: #333 !important;
  background: rgba(0, 0, 0, 0.04) !important;
}

.header-nav :deep(.el-menu-item.is-active) {
  color: #222 !important;
  border-bottom-color: #666 !important;
  background: rgba(0, 0, 0, 0.05) !important;
}

/* 汉堡按钮 — 默认隐藏，移动端显示 */
.hamburger-btn {
  display: none;
  margin-left: auto;
  background: rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
  color: #555 !important;
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
  color: #555;
}

/* ========== 抽屉菜单 ========== */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 12px;
  background: #f0f1f3;
  color: #333;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
}

.drawer-icon {
  font-size: 26px;
}

.drawer-menu {
  border-right: none !important;
}

/* ========== 主内容区 ========== */
.app-main {
  width: 100%;
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
  .app-header {
    --header-height: 48px;
  }

  .header-content {
    padding: 0 16px;
  }

  .brand-icon {
    font-size: 22px;
  }

  .brand-title {
    font-size: 17px;
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
  .app-header {
    --header-height: 44px;
  }

  .header-content {
    padding: 0 12px;
  }

  .brand-icon {
    font-size: 20px;
  }

  .brand-title {
    font-size: 15px;
  }

  .app-main {
    padding: 12px 10px 76px;
  }
}
</style>
