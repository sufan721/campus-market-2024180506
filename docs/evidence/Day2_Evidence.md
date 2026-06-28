# Day2 证据卡：多页面布局 & 路由导航

## 一、今日新增页面

| 文件 | 页面 | 功能说明 |
|------|------|----------|
| `src/views/ListView.vue` | 列表页 | 展示商品/服务列表，支持点击跳转详情 |
| `src/views/DetailView.vue` | 详情页 | 根据路由参数 `id` 展示单个商品详细信息 |
| `src/views/PublishView.vue` | 发布页 | 包含表单：标题、价格、描述 |
| `src/views/MessageView.vue` | 消息页 | 模拟消息列表，展示未读状态 |
| `src/views/ProfileView.vue` | 个人中心 | 用户头像、统计数据、菜单列表 |
| `src/views/BoardView.vue` | 看板页 | 统计卡片 + 柱状图 + 分类分布 |
| `src/views/HomeView.vue` | 首页 | 功能特性展示，快捷入口 |

## 二、路由设计

### 路由表

| 路径 | 路由名 | 组件 | 说明 |
|------|--------|------|------|
| `/` | - | - | 重定向到 `/home` |
| `/home` | Home | HomeView | 首页（同步加载） |
| `/list` | List | ListView | 列表页（懒加载） |
| `/detail/:id` | Detail | DetailView | 详情页（懒加载，携带 id 参数） |
| `/publish` | Publish | PublishView | 发布页（懒加载） |
| `/message` | Message | MessageView | 消息页（懒加载） |
| `/profile` | Profile | ProfileView | 个人中心（懒加载） |
| `/board` | Board | BoardView | 看板页（懒加载） |

### 设计要点
- **懒加载**：除首页外，所有页面使用 `() => import(...)` 动态导入，减小首屏体积
- **参数路由**：`/detail/:id` 支持从列表页携带商品 ID 跳转，实现页面间数据传递
- **根路径重定向**：`/` 自动跳转到 `/home`，避免空白页

## 三、导航结构

App.vue 中使用 `<router-link>` 实现顶部导航栏：
- 🏠 首页 → /home
- 📋 列表 → /list
- ✏️ 发布 → /publish
- 💬 消息 → /message
- 👤 我的 → /profile

特性：
- 使用 `active-class` 高亮当前页面
- sticky 定位，滚动时导航栏固定在顶部
- 纯原生 HTML/CSS，未使用 Element Plus（项目未安装）

## 四、进阶任务完成情况

### ⭐ 看板页设计
- 4 项统计卡片（注册用户、在售商品、累计订单、今日活跃）
- CSS 柱状图（本周发布量趋势）
- 横向条形图（分类分布占比）
- 全部为静态演示数据

### ⭐ 路由跳转增强
- 列表页点击商品卡片 → `router.push({ name: 'Detail', params: { id } })`
- 详情页读取 `route.params.id` 动态展示对应商品
- 支持"返回列表"按钮（`router.back()`）

### ⭐ UI 优化
- 项目未安装 Element Plus，采用原生 HTML/CSS 实现
- 统一的卡片风格、配色体系（主色 #409eff）
- 响应式交互（hover 效果、过渡动画）

## 五、遇到的问题

1. **TypeScript 类型检查**：vue-tsc 构建时对 `.vue` 文件的类型推导需要确保 `tsconfig.app.json` 配置正确 —— 项目已预配置，无问题。

2. **路由参数响应式**：DetailView 中 `route.params.id` 是字符串，需要 `Number()` 转换后才能与模拟数据对象的数字 key 匹配。

3. **导航活跃状态**：`router-link` 的 `active-class` 在匹配嵌套路由时可能不精确 —— 当前路由均为一级路径，不存在此问题。

## 六、AI 协作记录

| 协作环节 | AI 协助内容 |
|----------|-------------|
| 页面骨架生成 | 批量创建 6 个 Vue SFC 文件，每个包含完整的 `<template>` / `<script>` / `<style>` |
| 路由配置 | 根据要求生成 8 条路由规则，包含参数路由和懒加载 |
| 导航组件 | 在 App.vue 中实现 sticky 导航栏 + router-link |
| 看板页 | 生成带 CSS 图表的统计数据展示页面 |
| 类型检查 | 运行 `vue-tsc --build` 验证零错误 |
| 文档撰写 | 整理本日证据卡，记录设计决策和实现细节 |

## 七、产出物清单

```
src/views/HomeView.vue      # 首页（更新）
src/views/ListView.vue      # 列表页（新增）
src/views/DetailView.vue    # 详情页（新增）
src/views/PublishView.vue   # 发布页（新增）
src/views/MessageView.vue   # 消息页（新增）
src/views/ProfileView.vue   # 个人中心（新增）
src/views/BoardView.vue     # 看板页（新增）
src/router/index.ts         # 路由配置（更新）
src/App.vue                 # 导航+布局（更新）
docs/evidence/Day2_Evidence.md  # 本文件
```
