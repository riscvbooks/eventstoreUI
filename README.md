# eventstoreUI

eventstoreUI 是为辰龙社区文档中心（https://docs.chenlongos.cn）开发的前端程序，是一个开源项目。它依赖 [eventstore](https://github.com/asmcos/eventstore) 作为后端服务，提供文档管理、展示等功能，其中 Markdown 页面通过 vitepress的 渲染功能后台 实现单页面渲染。

## 功能介绍

- 支持书籍、博客等文档类型的创建、编辑和展示
- 提供用户管理及权限控制功能
- 集成 Markdown 解析与渲染，支持以下增强功能：
  - 图片类名自定义（通过 Docsify 插件实现）
  - 代码块复制功能（带复制状态反馈）
  - 语法高亮与语言标签显示
- 响应式设计，适配不同设备浏览
- 基于 docsify 的单页面 Markdown 渲染体验

## 环境要求

- **前端环境**
  - Node.js (v20.0 及以上版本)
  - npm (v9.0.0 及以上版本，与 Node.js v20 兼容的推荐版本)
- **后端依赖**
  - [eventstore](https://github.com/asmcos/eventstore) 服务
  - Node.js (v20.0 及以上版本，eventstore 运行要求)
  - MongoDB 数据库（eventstore 数据存储依赖）

## 安装与启动

1. 克隆仓库
```bash
git clone https://github.com/asmcos/eventstoreUI.git
cd eventstoreUI
```

2. 安装依赖
```bash
npm install
```

3. 配置服务器地址

修改 `eventstoreUI/src/lib/config.js` 文件，设置 eventstore 后端服务地址：
```javascript
export const esserver  = "ws://your-eventstore-server:port/";
export const uploadpath = "http://your-eventstore-server:port/uploads/";
```

4. 启动开发服务器
```bash
npm run dev

# 或启动服务器并在新浏览器标签页中打开应用
npm run dev -- --open
```

5. 访问应用

打开浏览器，访问 `http://localhost:5173` 即可使用应用。

## 构建生产版本

```bash
npm run build
```

构建完成后，生成的静态文件位于 `dist` 目录下，可部署到静态文件服务器。
你可以使用 `npm run preview` 预览生产构建版本。

> 如需部署应用，可能需要为目标环境安装相应的 [适配器](https://svelte.dev/docs/kit/adapters)。

## 技术栈

- 前端框架：Svelte + SvelteKit
- 构建工具：Vite
- 样式框架：Tailwind CSS
- 类型检查：TypeScript
- Markdown 处理：vitepress 后台渲染
- 实时通信：WebSocket
- 工具库：eventstore-tools（用于与后端交互）
- 存储管理：WebStorage（本地存储封装）

## 自定义插件

- **图片类名插件**：支持在 Markdown 图片语法中指定自定义类名，优化图片展示样式
- **代码复制插件**：为代码块添加复制按钮，支持复制状态反馈和语言标签显示

## 相关链接

- 辰龙社区文档中心：https://docs.chenlongos.cn
- eventstore 后端项目：https://github.com/asmcos/eventstore
