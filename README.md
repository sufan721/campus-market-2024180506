# Campus Market 校园轻集市

校园二手交易与生活服务平台，基于 Vue 3 构建。

---

## 功能概览

- **用户系统** — 学号注册 / 登录，JWT 鉴权
- **二手交易** — 发布、浏览、收藏二手商品
- **失物招领** — 发布失物 / 招领信息
- **拼单搭子** — 发起拼团、查看参与人数
- **跑腿委托** — 发布跑腿任务、设置酬劳
- **即时聊天** — 商品详情页一键联系卖家，实时收发消息
- **活动热力图** — GitHub 风格年度活动分布可视化
- **个人中心** — 个人信息、发布列表、收藏管理

---

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router / Pinia
- Element Plus
- Node.js + Express + MySQL

---

## 快速开始

```bash
git clone <repo-url>
cd campus-market-2024180506
pnpm install
pnpm dev        # 前端 → http://localhost:5173
pnpm server     # 后端 → http://localhost:3001
```

---

## 项目结构

```
├── src
│   ├── api          # 接口封装
│   ├── components   # 通用组件
│   ├── stores       # Pinia 状态管理
│   └── views        # 页面组件
├── server
│   ├── routes       # API 路由
│   ├── middleware    # 中间件（JWT 鉴权）
│   └── db.js        # 数据库连接
└── docs
```

---

## 开发日志

| Day | 内容 |
|-----|------|
| Day1 | 项目初始化、用户注册登录 |
| Day2 | 分类发布（交易/失物/拼团/跑腿）、详情页 |
| Day3 | 个人中心、消息列表、即时聊天 |
| Day4 | GitHub 风格活动热力图、注册表单精简、数据重置 |
