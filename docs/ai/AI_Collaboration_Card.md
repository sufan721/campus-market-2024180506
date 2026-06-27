# AI Collaboration Card

> 记录 AI Coding 工具在项目开发中的协作过程

---

## 协作工具

**工具名称：** Claude Code (Anthropic)

---

## Day 1 — 项目理解与启动

### 对话 1：分析项目目录结构

**Prompt：**
```
请分析 campus-market-seed 项目的目录结构，说明每个目录的用途和职责。
```

**AI 输出：**
```
campus-market-seed/
├── docs/                    # 课程文档
│   ├── ai/                  # AI 协作规范
│   ├── evidence/            # 每日过程证据模板
│   └── guide/               # 学生使用指南（环境配置、快速开始）
├── public/                  # 静态资源（favicon 等，不经过编译）
├── scripts/                 # 自动检测工具脚本
├── src/                     # 项目源码（核心开发区域）
│   ├── api/                 # API 接口层（与后端通信）
│   ├── components/          # 可复用 Vue 组件
│   ├── router/              # Vue Router 路由配置
│   ├── stores/              # Pinia 状态管理
│   ├── views/               # 页面级 Vue 组件
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口文件
├── .editorconfig            # 统一代码格式
├── .nvmrc                   # Node.js 版本声明
├── vite.config.ts           # Vite 构建配置
└── package.json             # 项目依赖与脚本
```

**自己的理解：**
项目采用 Vue 3 生态的标准工程化目录结构。`src/` 是核心开发目录，按功能分层：视图层（views）、组件层（components）、数据层（stores）、接口层（api）、路由层（router）。`docs/` 目录独立于源码，专门存放课程文档和过程证据，体现了"文档与代码同等重要"的软件工程理念。

**最终结论：**
采纳 AI 的分析。目录结构清晰，职责分明，符合 Vue 3 工程化最佳实践。

---

### 对话 2：解释 main.ts

**Prompt：**
```
请详细解释 src/main.ts 中每一行代码的作用，包括 Vue 应用创建、Pinia 和 Router 注册的流程。
```

**AI 输出：**
```typescript
// 1. 从 vue 包导入 createApp 函数 — Vue 3 的应用创建入口
import { createApp } from 'vue'
// 2. 从 pinia 包导入 createPinia 函数 — 创建全局状态管理实例
import { createPinia } from 'pinia'

// 3. 导入根组件 App.vue
import App from './App.vue'
// 4. 导入路由配置
import router from './router'

// 5. 创建 Vue 应用实例，传入根组件
const app = createApp(App)

// 6. 注册 Pinia（状态管理插件）
app.use(createPinia())
// 7. 注册 Vue Router（路由插件）
app.use(router)

// 8. 将应用挂载到 index.html 中 id="app" 的 DOM 元素上
app.mount('#app')
```

执行流程：创建应用 → 安装插件 → 挂载 DOM。

**自己的理解：**
`main.ts` 是 Vue 3 应用的"组装工厂"。Vue 3 采用显式的 `createApp()` API（对比 Vue 2 的隐式 `new Vue()`），更清晰。Pinia 和 Router 通过 `app.use()` 以插件形式注册，体现了 Vue 的插件化架构设计。`app.mount('#app')` 是整个应用的启动点。

**最终结论：**
AI 的解释准确。我学到了 Vue 3 应用的标准初始化流程：创建实例 → 注册插件 → 挂载 DOM。

---

### 对话 3：解释 Router 的作用

**Prompt：**
```
解释 src/router/index.ts 中 Vue Router 的配置和作用，为什么首页能够显示？
```

**AI 输出：**
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  // createWebHistory — 使用 HTML5 History API 模式，URL 更干净（无 # 号）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',           // 根路径 "/"
      name: 'home',        // 路由名称，用于编程式导航
      component: HomeView, // 对应的页面组件
    },
  ],
})

export default router
```

首页能显示的原因：
1. 路由配置了 `path: '/'` 映射到 `HomeView` 组件
2. `App.vue` 中的 `<RouterView />` 是路由出口，会根据当前 URL 渲染匹配的组件
3. 访问 `http://localhost:5173/`（即路径 `/`）时，Router 匹配到 `HomeView`，将其渲染到 `<RouterView />` 的位置
4. 结合 `App.vue` 模板中的标题和 `<RouterView />`，最终看到完整的首页内容

**自己的理解：**
Router 是单页应用（SPA）的核心——它让 URL 变化时不需要刷新整个页面，而是动态替换 `<RouterView />` 中的组件。`createWebHistory` 让 URL 看起来像传统的多页网站（没有 `#`），用户体验更好。

**最终结论：**
完全理解。Router = URL ↔ 组件的映射关系，`<RouterView />` = 组件的渲染位置。

---

### 对话 4：分析项目技术栈

**Prompt：**
```
请分析 campus-market-seed 项目的技术栈，包括各个技术的作用和版本。
```

**AI 输出：**

| 技术 | 版本 | 作用 |
|------|------|------|
| Vue 3 | ^3.5.38 | 前端框架 — 响应式 UI 构建 |
| TypeScript | ~6.0.0 | 类型安全 — 减少运行时错误 |
| Vite | ^8.0.16 | 构建工具 — 极速开发服务器与打包 |
| Vue Router | ^5.1.0 | SPA 路由 — URL 管理与页面导航 |
| Pinia | ^3.0.4 | 状态管理 — 跨组件数据共享 |
| ESLint | ^10.5.0 | 代码规范检查 |
| Oxlint | ~1.69.0 | Rust 编写的高速 Linter |
| pnpm | 11.9.0 | 包管理器 — 高效、节省磁盘空间 |
| Node.js | 24.12.0 | JavaScript 运行环境 |

**自己的理解：**
这是一个现代化的 Vue 3 技术栈。Vite 替代了 Webpack 提供更快的开发体验；Pinia 替代了 Vuex 成为官方推荐的状态管理方案；TypeScript 提供类型安全；pnpm 比 npm 更快更省空间；Oxlint 作为 ESLint 的补充提供更快的检查速度。

**最终结论：**
技术栈选型合理且现代化，所有技术都是当前（2026年）Vue 生态的主流选择。

---

## Day 1 协作总结

- **使用次数：** 4 次主要对话
- **AI 帮助内容：** 目录分析、代码解释、技术栈分析
- **自己完成内容：** 项目规划、证据文档编写、深度思考
- **协作感受：** AI 在"解释型"任务上表现优异，能快速准确地分析代码；但在"创造型"任务（如项目规划）上，自己的思考和判断不可替代
