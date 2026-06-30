<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserFilled, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore, type FavoriteItem } from '@/stores/favorites'
import { getTradesByUser, type TradeItem } from '@/api/trade'
import { getLostFoundsByUser, type LostFoundItem } from '@/api/lostFound'
import { getGroupBuysByUser, type GroupBuyItem } from '@/api/groupBuy'
import { getErrandsByUser, type ErrandItem } from '@/api/errand'
import { getMessages, type MessageItem } from '@/api/message'
import { getAllMyChats, type ChatMessage } from '@/api/chat'
import ActivityHeatmap, { type ActivityDay } from '@/components/ActivityHeatmap.vue'
import ImageBox from '@/components/ImageBox.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const favoritesStore = useFavoritesStore()

// ====== 已登录：数据 ======

const myTrades = ref<TradeItem[]>([])
const myLostFounds = ref<LostFoundItem[]>([])
const myGroupBuys = ref<GroupBuyItem[]>([])
const myErrands = ref<ErrandItem[]>([])
const myMessages = ref<MessageItem[]>([])
const myChats = ref<ChatMessage[]>([])
const loadingItems = ref(false)

// Tab 切换
const activeTab = ref<'published' | 'favorites'>('published')

const totalPublished = computed(
  () => myTrades.value.length + myLostFounds.value.length + myGroupBuys.value.length + myErrands.value.length,
)

const stats = computed(() => [
  { num: myTrades.value.length, label: '二手交易', color: '#409eff' },
  { num: myLostFounds.value.length, label: '失物招领', color: '#67c23a' },
  { num: myGroupBuys.value.length, label: '拼单搭子', color: '#e6a23c' },
  { num: myErrands.value.length, label: '跑腿委托', color: '#f56c6c' },
])

// ====== 非交易类发布列表 ======

interface MyItem {
  id: number
  title: string
  type: string
  category: string
  time: string
}

const nonTradeItems = computed<MyItem[]>(() => {
  const items: MyItem[] = [
    ...myLostFounds.value.map((l) => ({ id: l.id, title: l.title, type: '失物招领', category: l.itemName, time: l.eventTime })),
    ...myGroupBuys.value.map((g) => ({ id: g.id, title: g.title, type: '拼单搭子', category: g.type, time: g.deadline })),
    ...myErrands.value.map((e) => ({ id: e.id, title: e.title, type: '跑腿委托', category: e.taskType, time: e.deadline })),
  ]
  items.sort((a, b) => b.time.localeCompare(a.time))
  return items
})

// ====== 活动热力图 ======

const activityData = computed<ActivityDay[]>(() => {
  const dateMap = new Map<string, number>()

  function addDate(dateStr: string | undefined) {
    if (!dateStr) return
    const d = dateStr.slice(0, 10) // YYYY-MM-DD
    dateMap.set(d, (dateMap.get(d) || 0) + 1)
  }

  // 发布活动
  for (const t of myTrades.value) addDate(t.publishTime)
  for (const l of myLostFounds.value) addDate(l.eventTime)
  for (const g of myGroupBuys.value) addDate(g.deadline)
  for (const e of myErrands.value) addDate(e.deadline)

  // 聊天活动
  for (const m of myMessages.value) addDate(m.time)
  for (const c of myChats.value) addDate(c.time)

  const result: ActivityDay[] = []
  for (const [date, count] of dateMap) {
    result.push({ date, count })
  }
  result.sort((a, b) => a.date.localeCompare(b.date))
  return result
})

// ====== 数据加载 ======

async function loadMyItems() {
  loadingItems.value = true
  const uid = userStore.userId
  if (!uid) {
    loadingItems.value = false
    return
  }
  try {
    const [t, l, g, e, msgs, chats] = await Promise.all([
      getTradesByUser(uid),
      getLostFoundsByUser(uid),
      getGroupBuysByUser(uid),
      getErrandsByUser(uid),
      getMessages(),
      getAllMyChats(),
    ])
    myTrades.value = t.data
    myLostFounds.value = l.data
    myGroupBuys.value = g.data
    myErrands.value = e.data
    myMessages.value = msgs.data
    myChats.value = chats.data
  } catch {
    // 静默失败
  } finally {
    loadingItems.value = false
  }
}

// ====== 收藏 ======

function isTradeFavorited(id: number) {
  return favoritesStore.isFavorited(id)
}

function toggleTradeFavorite(item: TradeItem) {
  const nowFavorited = favoritesStore.toggleFavorite({
    id: item.id,
    title: item.title,
    category: item.category,
    price: item.price,
    condition: item.condition,
    location: item.location,
    publishTime: item.publishTime,
    image: item.image,
    publisher: item.publisher,
  })
  ElMessage.success(nowFavorited ? '已收藏' : '已取消收藏')
}

function removeFavorite(id: number) {
  favoritesStore.removeFavorite(id)
  ElMessage.success('已取消收藏')
}

function goTradeDetail(id: number) {
  router.push(`/detail/trade/${id}`)
}

// ====== 登出 ======

function handleLogout() {
  favoritesStore.clear()
  userStore.logout()
  ElMessage.success('已退出登录')
}

// ====== 登录 / 注册视图 ======

const authTab = ref<'login' | 'register'>('login')
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const authLoading = ref(false)

const loginForm = reactive({ studentId: '', password: '' })
const registerForm = reactive({
  studentId: '',
  password: '',
  confirmPassword: '',
  name: '',
  school: '',
  department: '',
  grade: '',
  contact: '',
})

const loginRules: FormRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: '学号为10位数字', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const validateConfirmPass = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: '学号必须为10位数字（如2023010201）', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return
  authLoading.value = true
  try {
    await userStore.doLogin({ studentId: loginForm.studentId, password: loginForm.password })
    favoritesStore.load()
    ElMessage.success('登录成功')
    loadMyItems()
    const redirect = route.query.redirect as string
    if (redirect) router.push(redirect)
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '登录失败'
    ElMessage.error(msg)
  } finally {
    authLoading.value = false
  }
}

async function handleRegister() {
  const valid = await registerFormRef.value?.validate().catch(() => false)
  if (!valid) return
  authLoading.value = true
  try {
    await userStore.doRegister({
      studentId: registerForm.studentId,
      password: registerForm.password,
      name: registerForm.name,
      school: registerForm.school,
      department: registerForm.department,
      grade: registerForm.grade,
      contact: registerForm.contact,
    })
    favoritesStore.load()
    ElMessage.success('注册成功')
    loadMyItems()
    const redirect = route.query.redirect as string
    if (redirect) router.push(redirect)
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || '注册失败'
    ElMessage.error(msg)
  } finally {
    authLoading.value = false
  }
}

// ====== 初始化 ======

onMounted(() => {
  if (userStore.isLoggedIn) {
    favoritesStore.load()
    loadMyItems()
  }
})

// 监听登录态变化（退出时清空收藏）
watch(() => userStore.isLoggedIn, (val) => {
  if (!val) favoritesStore.clear()
})
</script>

<template>
  <div class="profile-page">
    <!-- ==================== 未登录：登录/注册表单 ==================== -->
    <template v-if="!userStore.isLoggedIn">
      <div class="auth-card-wrapper">
        <div class="auth-header">
          <span class="auth-icon">🏪</span>
          <h2>校园轻集市</h2>
          <p>登录后即可发布商品、发送消息</p>
        </div>

        <el-card shadow="hover" class="auth-card">
          <el-tabs v-model="authTab" class="auth-tabs" :stretch="true">
            <!-- 登录 -->
            <el-tab-pane label="登录" name="login">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                label-width="0"
                size="large"
                @keyup.enter="handleLogin"
              >
                <el-form-item prop="studentId">
                  <el-input v-model="loginForm.studentId" placeholder="学号（10位数字）" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="authLoading"
                    style="width: 100%"
                    @click="handleLogin"
                  >
                    登 录
                  </el-button>
                </el-form-item>
              </el-form>
              <p class="auth-tip">
                演示账号：2023010201 / 123456
              </p>
            </el-tab-pane>

            <!-- 注册 -->
            <el-tab-pane label="注册" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                label-width="0"
                size="large"
              >
                <el-form-item prop="studentId">
                  <el-input v-model="registerForm.studentId" placeholder="学号（10位数字，如2023010201）" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="密码（至少6位）"
                    show-password
                  />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item prop="name">
                  <el-input v-model="registerForm.name" placeholder="姓名 *" />
                </el-form-item>
                <el-form-item prop="school">
                  <el-input v-model="registerForm.school" placeholder="学校" />
                </el-form-item>
                <el-form-item prop="department">
                  <el-input v-model="registerForm.department" placeholder="学院 / 专业" />
                </el-form-item>
                <el-form-item prop="grade">
                  <el-input v-model="registerForm.grade" placeholder="年级（如 2024级）" />
                </el-form-item>
                <el-form-item prop="contact">
                  <el-input v-model="registerForm.contact" placeholder="联系方式（QQ / 微信等）" />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="success"
                    :loading="authLoading"
                    style="width: 100%"
                    @click="handleRegister"
                  >
                    注 册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </template>

    <!-- ==================== 已登录：个人中心 ==================== -->
    <template v-else>
      <div class="page-header">
        <h1 class="page-title">个人中心</h1>
        <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
      </div>

      <!-- 用户信息卡片 -->
      <el-card shadow="hover" class="user-card">
        <div class="user-info">
          <el-avatar :icon="UserFilled" :size="72" class="user-avatar" />
          <div class="user-meta">
            <h2>{{ userStore.currentUser?.name }}</h2>
            <p>{{ userStore.currentUser?.department }} · {{ userStore.currentUser?.grade }}</p>
            <el-tag size="small" effect="plain">加入于 {{ userStore.currentUser?.joinDate }}</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 发布统计 -->
      <el-row :gutter="14" class="stats-row">
        <el-col :xs="6" v-for="s in stats" :key="s.label">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <span class="stat-num" :style="{ color: s.color }">{{ s.num }}</span>
              <span class="stat-label">{{ s.label }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 活动热力图 -->
      <el-card shadow="never" class="section-card">
        <ActivityHeatmap :activities="activityData" :week-count="20" />
      </el-card>

      <!-- Tab：我的发布 / 我的收藏 -->
      <el-card shadow="never" class="section-card tab-card">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- ========== 我的发布 ========== -->
          <el-tab-pane label="我的发布" name="published">
            <template #label>
              <span class="tab-label">📋 我的发布（{{ totalPublished }}）</span>
            </template>

            <div v-if="totalPublished === 0 && !loadingItems" class="empty-hint">
              暂无发布内容，去<a href="javascript:void(0)" @click="$router.push('/publish')">发布</a>第一条吧！
            </div>

            <!-- 二手交易卡片网格 -->
            <div v-if="myTrades.length > 0" class="trade-section">
              <h3 class="section-subtitle">🛒 二手交易</h3>
              <div class="trade-grid">
                <article
                  v-for="item in myTrades"
                  :key="`trade-${item.id}`"
                  class="trade-card"
                  @click="goTradeDetail(item.id)"
                >
                  <ImageBox
                    :image-path="item.image"
                    fallback-emoji="📦"
                    height="160px"
                    border-radius="14px 14px 0 0"
                    icon-size="56px"
                  />
                  <div class="trade-card__body">
                    <div class="trade-card__header">
                      <h4>{{ item.title }}</h4>
                      <span class="tag tag--trade">{{ item.category }}</span>
                    </div>
                    <div class="trade-card__meta">
                      <span class="trade-price">¥{{ item.price }}</span>
                      <span class="trade-condition">{{ item.condition }}</span>
                    </div>
                    <div class="trade-card__footer">
                      <span class="trade-location">📍 {{ item.location }}</span>
                      <span class="trade-time">{{ item.publishTime }}</span>
                    </div>
                    <!-- 收藏按钮 -->
                    <el-button
                      :type="isTradeFavorited(item.id) ? 'danger' : 'default'"
                      size="small"
                      circle
                      class="fav-btn"
                      @click.stop="toggleTradeFavorite(item)"
                    >
                      {{ isTradeFavorited(item.id) ? '❤️' : '🤍' }}
                    </el-button>
                  </div>
                </article>
              </div>
            </div>

            <!-- 其他类型列表 -->
            <div v-if="nonTradeItems.length > 0" class="other-section">
              <h3 class="section-subtitle">📌 其他发布</h3>
              <div
                v-for="(item, i) in nonTradeItems"
                :key="`${item.type}-${item.id}`"
                class="menu-item"
                :class="{ 'menu-item-last': i === nonTradeItems.length - 1 }"
              >
                <div class="menu-left">
                  <span class="item-type-tag" :class="`tag-${item.type}`">{{ item.type }}</span>
                  <span class="item-title">{{ item.title }}</span>
                </div>
                <div class="menu-right">
                  <span class="item-time">{{ item.time }}</span>
                  <el-icon class="menu-arrow"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- ========== 我的收藏 ========== -->
          <el-tab-pane name="favorites">
            <template #label>
              <span class="tab-label">❤️ 我的收藏（{{ favoritesStore.favorites.length }}）</span>
            </template>

            <div v-if="favoritesStore.favorites.length === 0" class="empty-hint">
              暂无收藏，去<a href="javascript:void(0)" @click="$router.push('/trades')">逛逛</a>二手交易吧！
            </div>

            <div v-else class="trade-grid">
              <article
                v-for="item in favoritesStore.favorites"
                :key="`fav-${item.id}`"
                class="trade-card"
                @click="goTradeDetail(item.id)"
              >
                <ImageBox
                  :image-path="item.image"
                  fallback-emoji="📦"
                  height="140px"
                  border-radius="12px 12px 0 0"
                  icon-size="48px"
                />
                <div class="trade-card__body">
                  <div class="trade-card__header">
                    <h4>{{ item.title }}</h4>
                    <span class="tag tag--trade">{{ item.category }}</span>
                  </div>
                  <div class="trade-card__meta">
                    <span class="trade-price">¥{{ item.price }}</span>
                    <span class="trade-condition">{{ item.condition }}</span>
                  </div>
                  <div class="trade-card__footer">
                    <span class="trade-location">📍 {{ item.location }}</span>
                    <span class="trade-time">{{ item.publishTime }}</span>
                  </div>
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    class="unfav-btn"
                    @click.stop="removeFavorite(item.id)"
                  >
                    取消收藏
                  </el-button>
                </div>
              </article>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
}

/* ====== 登录/注册卡片 ====== */
.auth-card-wrapper {
  max-width: 420px;
  margin: 20px auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
}

.auth-icon {
  font-size: 44px;
}

.auth-header h2 {
  margin: 8px 0 4px;
  font-size: 22px;
}

.auth-header p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.auth-card {
  border-radius: 14px;
}

.auth-card :deep(.el-card__body) {
  padding: 8px 24px 20px;
}

.auth-tabs :deep(.el-tabs__header) {
  margin-bottom: 10px;
}

.auth-tip {
  text-align: center;
  color: #a8abb2;
  font-size: 12px;
  margin: 0;
}

/* ====== 已登录视图 ====== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.page-title {
  font-size: 22px;
  margin: 0;
}

.user-card {
  border-radius: 14px;
  margin-bottom: 18px;
}

.user-card :deep(.el-card__body) {
  padding: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #337ecc);
  flex-shrink: 0;
}

.user-meta h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.user-meta p {
  margin: 0 0 6px;
  color: #999;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 18px;
}

.stat-card {
  border-radius: 12px;
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  padding: 14px 8px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 26px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

/* ====== 通用卡片 ====== */
.section-card {
  border-radius: 14px;
  margin-bottom: 18px;
}

.section-card :deep(.el-card__body) {
  padding: 20px;
}

.section-subtitle {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 14px;
  color: #333;
}

/* ====== Tab 卡片 ====== */
.tab-card :deep(.el-card__body) {
  padding: 8px 20px 20px;
}

.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}

.tab-label {
  font-weight: 600;
  font-size: 15px;
}

/* ====== 二手交易卡片网格 ====== */
.trade-section {
  margin-bottom: 20px;
}

.trade-grid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 14px !important;
}

.trade-card {
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.trade-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.trade-card__body {
  padding: 14px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trade-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.trade-card__header h4 {
  margin: 0;
  font-size: 15px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag--trade {
  background: #ecf5ff;
  color: #409eff;
}

.trade-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
}

.trade-condition {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.trade-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #bbb;
}

.trade-location {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trade-time {
  flex-shrink: 0;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.unfav-btn {
  margin-top: 10px;
  width: 100%;
}

/* ====== 其他发布列表 ====== */
.other-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #fafbfc;
}

.menu-item-last {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.item-type-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-失物招领 { background: #f0f9eb; color: #67c23a; }
.tag-拼单搭子 { background: #fdf6ec; color: #e6a23c; }
.tag-跑腿委托 { background: #fef0f0; color: #f56c6c; }

.item-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.item-time {
  font-size: 12px;
  color: #bbb;
}

.menu-arrow {
  color: #ccc;
  font-size: 14px;
}

/* ====== 空状态 ====== */
.empty-hint {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.empty-hint a {
  color: #409eff;
  text-decoration: none;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .profile-page {
    max-width: 100%;
  }

  .auth-card-wrapper {
    max-width: 100%;
    margin: 10px auto;
  }

  .auth-card :deep(.el-card__body) {
    padding: 8px 16px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .user-card :deep(.el-card__body) {
    padding: 18px;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
  }

  .user-meta h2 {
    font-size: 18px;
  }

  .stat-num {
    font-size: 22px;
  }

  .section-card :deep(.el-card__body) {
    padding: 14px;
  }

  .trade-card__body {
    padding: 12px;
  }

  .trade-card__header h4 {
    font-size: 14px;
  }

  .trade-price {
    font-size: 16px;
  }

  .menu-item {
    padding: 10px 0;
  }

  .item-title {
    font-size: 13px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .trade-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .auth-header h2 {
    font-size: 20px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 0;
  }

  .user-card :deep(.el-card__body) {
    padding: 14px;
  }

  .user-info {
    gap: 14px;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
  }

  .user-meta h2 {
    font-size: 16px;
  }

  .user-meta p {
    font-size: 13px;
  }

  .stat-num {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>
