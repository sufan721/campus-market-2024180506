<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Edit, ChatDotRound, UserFilled, Expand, Fold, Goods, Search, Connection, Service } from '@element-plus/icons-vue'
import { useUserStore } from './stores/user'
import { useFavoritesStore } from './stores/favorites'
import { useThemeStore } from './stores/theme'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

const route = useRoute()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()
const themeStore = useThemeStore()
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

// 初始化认证状态 & 主题
onMounted(async () => {
  themeStore.initTheme()
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

const allNavItems: NavItem[] = [
  { index: '/home', icon: HomeFilled, label: '首页' },
  { index: '/trades', icon: Goods, label: '二手交易' },
  { index: '/lost-found', icon: Search, label: '失物招领' },
  { index: '/group-buy', icon: Connection, label: '拼单搭子' },
  { index: '/errands', icon: Service, label: '跑腿委托' },
  { index: '/publish', icon: Edit, label: '发布' },
  { index: '/message', icon: ChatDotRound, label: '消息' },
  { index: '/profile', icon: UserFilled, label: '我的' },
]

/** 移动端底部导航 — 精简 5 项 */
const bottomNavItems: NavItem[] = [
  { index: '/home', icon: HomeFilled, label: '首页' },
  { index: '/trades', icon: Goods, label: '交易' },
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
    <!-- 顶部标题栏（浅绿色，含导航） -->
    <el-header class="app-header">
      <div class="header-content">
        <!-- 品牌 -->
        <div class="brand" @click="$router.push('/home')">
          <span class="brand-icon">🏪</span>
          <h1 class="brand-title">校园轻集市</h1>
        </div>

        <!-- 主题切换 -->
        <ThemeSwitcher />

        <!-- 桌面端导航 — 全部平铺 -->
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          :ellipsis="false"
          router
          class="header-nav desktop-nav"
          @select="(index: string) => activeIndex = index"
        >
          <el-menu-item v-for="item in allNavItems" :key="item.index" :index="item.index">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>

        <!-- 用户状态指示器 -->
        <div class="user-indicator" @click="$router.push('/profile')">
          <template v-if="userStore.isLoggedIn">
            <el-avatar :size="26" :icon="UserFilled" class="user-avatar-mini" />
            <span class="user-name">{{ userStore.currentUser?.name }}</span>
          </template>
          <el-button v-else text size="small" class="login-btn">登录</el-button>
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

    <!-- 移动端底部导航栏 -->
    <div class="mobile-bottom-nav">
      <router-link
        v-for="item in bottomNavItems"
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
        <el-menu-item v-for="item in allNavItems" :key="item.index" :index="item.index">
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
  font-family: var(--font-family-base);
  background-color: var(--color-bg-page);
  background-image: var(--texture-page-bg);
  background-size: var(--texture-page-bg-size, auto);
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
  --header-height: 52px;
  height: var(--header-height);
  background: var(--color-bg-header);
  backdrop-filter: var(--effect-frosted);
  -webkit-backdrop-filter: var(--effect-frosted);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-header);
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
  color: var(--color-brand-title);
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 桌面端导航 — 圆润胶囊标签 */
.header-nav {
  margin-left: auto;
  background: transparent !important;
  border-bottom: none !important;
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-nav :deep(.el-menu-item) {
  height: 34px;
  line-height: 34px;
  margin: 0 2px;
  padding: 0 16px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text-regular);
  border-radius: 20px;
  border-bottom: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-nav :deep(.el-menu-item:hover) {
  color: var(--color-text-primary) !important;
  background: var(--color-hover-bg) !important;
  border-radius: 20px;
}

.header-nav :deep(.el-menu-item.is-active) {
  color: #fff !important;
  background: var(--color-btn-primary-bg) !important;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: var(--color-btn-primary-shadow);
}

/* 用户状态指示器 */
.user-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 20px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}

.user-avatar-mini {
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  color: var(--color-text-regular);
  font-weight: 500;
  white-space: nowrap;
}

.login-btn {
  color: var(--color-text-regular) !important;
  font-weight: 500;
}

/* 汉堡按钮 — 默认隐藏，移动端显示 */
.hamburger-btn {
  display: none;
  margin-left: auto;
  background: rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
  color: var(--color-text-regular) !important;
}

/* ========== 移动端底部导航 ========== */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-footer);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
  padding: 6px 0 env(safe-area-inset-bottom, 0);
  box-shadow: var(--shadow-bottom-nav);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: var(--color-text-regular);
}

/* ========== 抽屉菜单 ========== */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px 12px;
  background: var(--color-bg-header);
  color: var(--color-text-primary);
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

.drawer-menu :deep(.el-menu-item) {
  border-radius: 12px;
  margin: 2px 8px;
  height: 44px;
  line-height: 44px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-regular);
  transition: all 0.2s;
}

.drawer-menu :deep(.el-menu-item:hover) {
  color: var(--color-text-primary) !important;
  background: var(--color-hover-bg) !important;
}

.drawer-menu :deep(.el-menu-item.is-active) {
  color: #fff !important;
  background: var(--color-btn-primary-bg) !important;
  font-weight: 600;
  box-shadow: var(--color-btn-primary-shadow);
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
  color: var(--color-text-secondary);
  font-size: 13px;
  background: var(--color-bg-footer);
  border-top: 1px solid var(--color-border-light);
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

  /* 用户指示器靠右，仅显示头像 */
  .user-indicator {
    margin-left: auto;
    margin-right: 8px;
  }

  .user-name {
    display: none;
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
