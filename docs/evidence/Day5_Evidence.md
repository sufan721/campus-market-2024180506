# Day 5 Evidence — 状态管理与跨页面共享

> **日期：** 2026-07-01
> **阶段：** Pinia 状态管理与 Store 跨页面使用
> **状态：** ✅ 已完成

---

## 一、今日完成内容

### 1.1 创建用户状态 Store（Task 1）

**文件：** `src/stores/user.ts`

用户 Store 使用 Pinia 的 Composition API（setup 函数）风格定义，管理认证相关的全局状态：

| 组成部分 | 名称 | 类型 | 说明 |
|----------|------|------|------|
| State | `currentUser` | `UserInfo \| null` | 当前登录用户信息 |
| State | `token` | `string \| null` | JWT token（同步自 localStorage） |
| State | `loading` | `boolean` | 加载状态标识 |
| Getter | `userId` | `number \| null` | 从 currentUser 派生的用户 ID |
| Getter | `isLoggedIn` | `boolean` | 双重校验 token + currentUser 都存在 |
| Action | `initAuth()` | async | 启动时从 token 恢复登录态，失败则清除 |
| Action | `doLogin(params)` | async | 登录 → 保存 token → 设置 currentUser |
| Action | `doRegister(params)` | async | 注册 → 保存 token → 设置 currentUser |
| Action | `logout()` | sync | 清除 token + currentUser |
| Action | `loadUser(id)` | async | 公开查看他人资料（不修改当前用户状态） |

**设计决策：**
- `isLoggedIn` 同时检查 `token` 和 `currentUser`，避免只有 token 但用户信息未加载的中间状态被误判为"已登录"
- token 使用 `localStorage` 持久化，页面刷新后通过 `initAuth()` 恢复
- 使用 `mapUser()` 内部函数将 API 返回的用户数据标准化，隔离 API 层数据格式变化的影响

### 1.2 创建收藏状态 Store（Task 2）

**文件：** `src/stores/favorites.ts`

收藏 Store 管理用户收藏的商品列表，使用 localStorage 按用户维度持久化：

| 组成部分 | 名称 | 类型 | 说明 |
|----------|------|------|------|
| State | `favorites` | `FavoriteItem[]` | 收藏列表 |
| Getter | `favoriteIds` | `Set<number>` | 收藏 ID 集合（O(1) 查找） |
| Action | `isFavorited(id)` | `boolean` | 判断某商品是否已收藏 |
| Action | `toggleFavorite(item)` | `boolean` | 切换收藏状态，返回操作后是否已收藏 |
| Action | `removeFavorite(id)` | void | 移除指定收藏 |
| Action | `load()` | void | 从 localStorage 恢复当前用户的收藏 |
| Action | `clear()` | void | 清空内存中的收藏（退出登录时调用） |

**设计决策：**
- 持久化 key 格式 `fav_{userId}`，按用户隔离，切换账号时自动加载对应收藏
- `favoriteIds` 使用 `Set` 实现 O(1) 查找，避免在大收藏列表中频繁使用 `Array.find()`
- `toggleFavorite` 同时支持添加和移除，通过判断元素是否已存在决定操作
- 收藏数据存储完整的商品信息（而非仅 ID），确保即使原商品被删除，收藏列表仍可展示

### 1.3 完善个人中心页面（Task 3）

**文件：** `src/views/ProfileView.vue`（1047 行）

个人中心页面完整实现了以下功能模块：

**未登录状态：**
- 登录/注册表单切换（`el-tabs`）
- 学号（10位数字）+ 密码登录
- 精简注册：学号、密码、确认密码、姓名
- 表单验证（学号格式、密码长度、确认密码一致性）
- 演示账号提示：`2023010201 / 123456`

**已登录状态：**
- 用户信息卡片：头像、姓名、院系、年级、加入日期
- 发布统计行：4 个统计卡片（二手交易、失物招领、拼单搭子、跑腿委托），分类计数 + 彩色数字
- 活动热力图：GitHub 风格，53 周展示，基于发布和聊天数据聚合
- 我的发布 Tab：二手交易卡片网格（含收藏按钮）+ 其他类型列表
- 我的收藏 Tab：收藏商品卡片网格（含取消收藏按钮）

### 1.4 实现跨页面状态使用（Task 4）

**核心改动 1：导航栏用户状态指示器（`src/App.vue`）**

在顶部导航栏添加用户状态显示：
- **已登录：** 显示用户小头像（26px）+ 姓名，点击跳转个人中心
- **未登录：** 显示"登录"文字按钮，点击跳转登录页
- **移动端适配：** 仅显示头像（隐藏姓名），右对齐到汉堡按钮左侧

```typescript
// 复用了已有的 store 引用，无需额外导入
userStore.isLoggedIn        // 控制显示"登录"或用户信息
userStore.currentUser?.name // 显示用户名
```

**核心改动 2：二手交易列表页收藏功能（`src/views/TradeView.vue`）**

在列表页商品卡片中添加收藏按钮：
- 每张卡片右下角显示 ❤️/🤍 圆形按钮
- 已收藏显示红色实心（`type="danger"`），未收藏显示灰色空心（`type="default"`）
- 未登录用户点击时弹出警告并跳转登录页
- 使用 `@click.stop` 阻止事件冒泡，避免触发卡片点击导航

#### 跨页面 Store 使用全景矩阵

| 页面 / 组件 | userStore | favoritesStore | 使用方式 |
|---|---|---|---|
| **App.vue** (导航栏) | `initAuth`, `isLoggedIn`, `currentUser` | `load` | 全局初始化 + 导航栏用户状态显示 |
| **TradeView.vue** (列表页) | `isLoggedIn`（鉴权） | `isFavorited`, `toggleFavorite` | 列表收藏按钮 |
| **DetailView.vue** (详情页) | `isLoggedIn`（鉴权） | `isFavorited`, `toggleFavorite` | 详情收藏按钮 + 联系卖家鉴权 |
| **PublishView.vue** (发布页) | `isLoggedIn`, `currentUser` | — | 发布鉴权 + 发布者身份信息 |
| **ProfileView.vue** (个人中心) | 全部 | `load`, `clear`, `isFavorited`, `toggleFavorite`, `removeFavorite`, `favorites` | 登录/注册 + 个人信息 + 收藏管理 |
| **MessageView.vue** (消息页) | `isLoggedIn` | — | 页面鉴权 |
| **ChatView.vue** (聊天页) | `currentUser` | — | 当前用户上下文 |
| **router/index.ts** (路由守卫) | `isLoggedIn` | — | 受保护路由的前置鉴权 |

**三个收藏入口的联动效果：**
```
列表页点收藏 → 详情页自动显示已收藏 → 个人中心收藏列表同步更新
个人中心取消收藏 → 列表页按钮自动变灰 → 详情页按钮自动变灰
```

---

## 二、学习收获

### 2.1 技术层面

1. **Pinia Composition API 风格** — 使用 `defineStore` + `setup` 函数组织状态，比 Options API 风格更灵活，与 Vue 3 Composition API 保持一致
2. **响应式状态共享原理** — Pinia store 返回的 `ref` 和 `computed` 是响应式的，在任何组件中修改都会触发所有使用方更新，无需手动发布/订阅
3. **localStorage 持久化模式** — 收藏数据按用户维度存储（`fav_{userId}`），登录时加载、退出时清空，实现数据隔离
4. **路由守卫 + Store 协作** — `router.beforeEach` 中动态导入 Store 避免循环依赖，实现未登录重定向

### 2.2 工程化思维

1. **哪些状态适合放在 Store 中？**
   - 多个组件/页面需要共享的状态（如 `isLoggedIn`、`currentUser`）
   - 需要在页面切换间保持的状态（如 `favorites` 列表）
   - 需要全局访问的用户上下文（如导航栏显示用户名）

2. **哪些状态不适合放在 Store 中？**
   - 仅单个组件使用的表单数据（如登录表单的 `loginForm`、`registerForm`）
   - 临时的 UI 状态（如 `activeTab`、`drawerVisible`）
   - 仅用于渲染的组件本地数据（如 `myTrades`、`myLostFounds` 列表数据在 ProfileView 本地管理即可）

3. **Store 设计原则：**
   - **单一职责** — user store 只管认证，favorites store 只管收藏
   - **最小暴露** — 通过 getter 提供派生状态，不暴露原始数据
   - **动作封装** — 所有状态修改通过 action 函数，不在组件中直接 `store.state = xxx`

### 2.3 AI 协作认知

1. AI 在分析已有代码结构方面非常高效，能快速找到跨页面 Store 使用的每个位置
2. AI 生成的代码需要人工确认与现有代码风格一致（如 import 路径使用 `../` 还是 `@/`）
3. 好的 Prompt 应包含明确的技术约束（如"使用与 DetailView 相同的 auth gate 模式"）

---

## 三、遇到的问题

| 问题 | 解决方案 |
|------|----------|
| ItemCard 组件的 footer 插槽原本只有简单文本，需要添加按钮和布局 | 使用 flex 布局将价格信息和收藏按钮分置左右，`.trade-footer` + `.trade-footer-left` |
| 点击收藏按钮会同时触发卡片点击导航 | 使用 `@click.stop` 阻止事件冒泡，与 ProfileView 中相同的处理方式 |
| 移动端导航栏空间有限，用户名可能溢出 | 在 ≤768px 时隐藏用户名文字（`display: none`），仅显示小头像 |
| TradeView 原本没有引入任何 Store | 参照 DetailView 的 auth gate 模式添加 `useUserStore` 和 `useFavoritesStore`，保持一致的鉴权逻辑 |

---

## 四、AI 协作情况

| 维度 | 详情 |
|------|------|
| 使用工具 | Claude Code（VSCode 扩展） |
| 对话次数 | 1 次主要对话（含代码分析、方案设计、代码实现） |
| AI 协助内容 | 代码结构探索、跨页面 Store 使用位置分析、App.vue 用户指示器实现、TradeView.vue 收藏功能实现、Day5_Evidence.md 文档框架 |
| 自主完成内容 | Store 设计决策理解、教学要点分析、"哪些状态适合 Store"的工程判断、文档内容细化 |
| 协作模式 | AI 负责信息收集（Explore agent）、代码生成和文档模板，自己负责设计决策和教学反思 |
| 满意度 | 满意 — AI 快速定位了已实现和缺失的功能点，代码改动精准且风格一致 |

---

## 五、后续计划

### Day 6 计划
- [ ] 即时通讯功能（聊天页面实时消息）
- [ ] WebSocket 或轮询实现消息同步
- [ ] 消息列表与未读提醒
- [ ] 完成 Day6 Evidence

### Day 7 计划
- [ ] 数据看板页面完善
- [ ] 项目整体优化与收尾
- [ ] 最终文档整理
- [ ] 完成 Day7 Evidence

---

## 六、实验思考

### 6.1 Day5 的核心问题：哪些状态应该放在 Store 中？

这是 Day5 最核心的工程判断问题。通过今天的实践，我总结出以下判断标准：

**应该放在 Store 中的状态（满足任一条件即可）：**

1. **跨组件共享** — 多个组件/页面需要读取或修改同一份数据
   - 示例：`isLoggedIn` — 导航栏、发布页、详情页、路由守卫都需要
   - 示例：`favorites` — 列表页、详情页、个人中心共享同一份收藏数据

2. **需要跨页面保持** — 页面切换后状态不应丢失
   - 示例：`currentUser` — 从列表页跳转到详情页，用户身份不变
   - 示例：token — 页面刷新后需要恢复登录态

3. **全局上下文** — 整个应用都需要感知的状态
   - 示例：`isLoggedIn` 决定导航栏显示"登录"还是用户名

**不应该放在 Store 中的状态：**

1. **仅单组件使用** — 只有当前组件读取和修改
   - 示例：`searchKeyword`（ListView）、`activeTab`（ProfileView）、表单数据
   - 反例：如果 `drawerVisible`（侧边栏开关）只在 App.vue 使用，就不需要 Store

2. **临时 UI 状态** — 生命周期短暂的视觉状态
   - 示例：`loading`、动画状态、hover 效果

3. **组件内部派生数据** — 基于已加载数据计算的结果
   - 示例：`totalPublished`（ProfileView 中的 computed）、`nonTradeItems`

### 6.2 Store 数量越多越好吗？

**不是。** Store 应该按"领域"划分，而非按"页面"划分：

- ✅ 好的划分：`user`（用户领域）、`favorites`（收藏领域）—— 每个 Store 对应一个业务领域
- ❌ 差的划分：`homePage`、`detailPage`、`publishPage` —— Store 变成了页面状态的垃圾桶

判断标准：**如果你发现两个 Store 总是在一起被导入和使用，就应该考虑合并它们。**

### 6.3 今天的最大收获

今天最大的收获是一个**架构判断力**的提升：

> **不是所有全局状态都需要 Store，也不是所有局部状态都不需要 Store。关键在于"哪些组件需要共享这份数据"。**

具体来说：
- `isLoggedIn` 放在 Store 中是正确的，因为 8 个地方需要它
- `loginForm` 放在组件本地是正确的，因为只有 ProfileView 的登录表单需要它
- 收藏功能从详情页扩展到列表页，只需要在列表页导入同一个 Store 并调用同一个 `toggleFavorite`，不需要重复实现逻辑

这个判断力不会过时——无论未来用什么框架（Vuex、Redux、Zustand），"哪些状态需要全局管理"的思考方式是一样的。

---

## 七、实验检查清单

- [ ] 用户 Store（`stores/user.ts`）完整可用：登录、注册、登出、状态恢复
- [ ] 收藏 Store（`stores/favorites.ts`）完整可用：添加、移除、查询、持久化
- [ ] 个人中心页面展示用户资料、发布统计、活动热力图
- [ ] 个人中心页面"我的发布"和"我的收藏"Tab 正常切换
- [ ] 导航栏显示用户登录状态（已登录显示头像+姓名，未登录显示"登录"按钮）
- [ ] 移动端导航栏正确显示用户头像（隐藏姓名）
- [ ] 二手交易列表页每张卡片有收藏按钮
- [ ] 收藏按钮在列表页、详情页、个人中心三处联动更新
- [ ] 未登录点击收藏弹出提示并跳转登录页
- [ ] 退出登录后收藏清空、导航栏恢复"登录"按钮
- [ ] 完成 Day5 Evidence（本文档）
- [ ] 完成 Git Commit
