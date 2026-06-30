import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/list',
      name: 'List',
      component: () => import('../views/ListView.vue'),
    },
    {
      path: '/trades',
      name: 'Trade',
      component: () => import('../views/TradeView.vue'),
    },
    {
      path: '/lost-found',
      name: 'LostFound',
      component: () => import('../views/LostFoundView.vue'),
    },
    {
      path: '/group-buy',
      name: 'GroupBuy',
      component: () => import('../views/GroupBuyView.vue'),
    },
    {
      path: '/errands',
      name: 'Errand',
      component: () => import('../views/ErrandView.vue'),
    },
    {
      path: '/detail/:type/:id',
      name: 'Detail',
      component: () => import('../views/DetailView.vue'),
    },
    {
      path: '/publish',
      name: 'Publish',
      component: () => import('../views/PublishView.vue'),
    },
    {
      path: '/message',
      name: 'Message',
      component: () => import('../views/MessageView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/chat/:contactName',
      name: 'Chat',
      component: () => import('../views/ChatView.vue'),
    },
    {
      path: '/board',
      name: 'Board',
      component: () => import('../views/BoardView.vue'),
    },
  ],
})

// 路由守卫：需要登录才能访问的页面
const protectedPaths = ['/publish', '/message', '/chat']

router.beforeEach(async (to, _from, next) => {
  const isProtected = protectedPaths.some(
    (p) => to.path === p || to.path.startsWith(p + '/'),
  )
  if (isProtected) {
    // 动态导入 store 避免循环依赖
    const { useUserStore } = await import('@/stores/user')
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next({ path: '/profile', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router

