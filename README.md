# Yoolin (悦邻里) 社区小程序 🏡

> 专为智慧社区与邻里互助打造的超轻量、纯粹无广告的贴吧风社区论坛小程序。

---

## 🌟 项目亮点

* **纯粹贴吧体验**：无臃肿干扰，聚焦邻里真实求助、闲置面交、房屋出租与活动交流。
* **右侧侧滑板块筛选**：流畅的贝塞尔平滑侧滑抽屉，支持纯文字板块精准过滤。
* **高颜值发布流程**：支持板块弹窗选择回显、9张图片/1个视频互斥逻辑，并贴心融入《邻里友好发帖公约》。
* **精简 3 项底栏**：整合“首页与邻里圈”，配有高感矢量图标，高效直达核心场景。

---

## 🛠️ 技术栈

* **前端框架**：Uni-app (`Vue 3` + `Vite` + `<script setup>`)
* **状态管理**：Pinia (`store/community.js`)
* **运行平台**：微信小程序 (`mp-weixin`) / H5 / iOS / Android
* **数据流与架构**：SaaS 多小区架构 (街道 ➔ 小区 ➔ 业主/物业/商户)

---

## 📁 目录结构

```text
Yoolin/
├── miniapp/             # Uni-app 微信小程序前端源码
│   ├── src/
│   │   ├── components/  # 复用组件 (如 PostCard 帖子卡片)
│   │   ├── pages/       # 页面 (index 首页, publish 发布页, service 服务, mine 我的)
│   │   └── store/       # Pinia 状态库 (小区/用户状态)
│   └── pages.json       # 页面路由与 3 项 TabBar 配置
├── demo/                # H5 高保真 HTML 交互原型 (index.html)
├── docs/                # 产品架构、商业模式与数据库 Schema 规划文档
└── README.md            # 项目说明
```

---

## 🚀 快速启动

### 1. 安装依赖

```bash
cd miniapp
npm install
```

### 2. 本地开发编译 (微信小程序)

```bash
npm run dev:mp-weixin
```

编译产物将生成在 `miniapp/dist/dev/mp-weixin`，使用 **微信开发者工具** 导入该目录即可预览和开发。

---

## 📄 开源许可

[MIT License](LICENSE)
