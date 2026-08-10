# 友邻 Youlin (悦邻里) — 智慧社区纯粹邻里论坛与综合服务平台

> 试点小区：**新塘街道彩虹社区 · 云彩之城**
>
> 专为现代品质社区打造的超轻量、无广告纯粹邻里互助小程序与智慧社区治理服务端。

---

## ⚡ 一键并发启动 (前后端同时启动)

在项目根目录下，直接运行一键启动脚本：

```bash
./start.sh
```

运行后将自动完成环境校验，并并发启动：
1. 📡 **Java (Spring Boot 3) 后端 API 服务**：`http://localhost:8080/api/v1`
2. 🗄️ **H2 数据库控制台**：`http://localhost:8080/h2-console`
3. 📱 **Uni-app 微信小程序编译**：输出产物至 `miniapp/dist/dev/mp-weixin`

> 💡 **退出方式**：在终端按 `Ctrl + C` 即可一键优雅停止所有前后端进程。

---

## 📁 项目目录架构

```text
社区论坛/
├── start.sh              # 🚀 前后端一键并发启动脚本
├── miniapp/              # 📱 Uni-app 微信小程序前端工程 (Vue3 + Pinia)
│   ├── src/
│   │   ├── pages/        # 页面 (首页/帖子详情/发布/服务大厅/个人中心)
│   │   ├── store/        # Pinia 社区与用户状态管理
│   │   └── utils/        # 全局媒体压缩/上传控制与网络封装
│   └── dist/dev/mp-weixin # 微信开发者工具导入目录
├── server/               # 📡 Java Spring Boot 3 企业级后端服务
│   ├── src/main/java/    # RESTful API 控制器、Service、Mapper、Entity
│   └── src/main/resources/ # application.yml, schema.sql, data.sql
└── demo/                 # 🌐 H5 单页高保真交互演示页面 (GitHub Pages)
```

---

## 🛠️ 技术选型

- **前端小程序**：Vue3 + Uni-app + Vanilla CSS + Pinia
- **后端服务端**：Java 17 + Spring Boot 3.2.x + MyBatis-Plus + H2 数据库
- **部署发布**：支持 Docker 单文件部署与 GitHub Pages 展示

---

## 🔗 线上预览与 GitHub 仓库

- **GitHub 仓库**：[https://github.com/mjj949723261-prog/Youlin.git](https://github.com/mjj949723261-prog/Youlin.git)
- **网页版体验**：[https://mjj949723261-prog.github.io/Youlin/](https://mjj949723261-prog.github.io/Youlin/)
