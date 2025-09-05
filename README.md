# eventstoreUI

eventstoreUI 是为[辰龙社区文档中心](https://docs.chenlongos.cn)开发的开源前端程序，依赖 [eventstore](https://github.com/asmcos/eventstore) 后端服务提供文档管理与展示能力，采用 vitepress 实现 Markdown 页面的全功能渲染与单页应用体验。


## 核心功能

- 支持书籍、博客等多类型文档的创建、编辑与展示，满足多样化内容创作需求
- 提供用户管理及精细化权限控制，保障内容归属与访问安全
- 基于 vitepress 实现完整的 Markdown 解析与渲染，支持多项增强功能：
  - 图片类名自定义（原生支持 Markdown 扩展语法，灵活适配设计需求）
  - 代码块一键复制（含复制状态反馈，提升阅读体验）
  - 语法高亮与语言标签显示，代码阅读更清晰
- 响应式设计，完美适配 PC、平板、手机等不同设备浏览场景
- 单页面应用架构，加载流畅无跳转
- **版权与内容安全增强**：
  - 实现「有版权无限制阅读」模式：用户可无障碍阅读所有内容，同时明确内容归属作者，保障创作者版权权益
  - 支持全站内容下载：即使特定内容因合规等原因被屏蔽，用户仍可下载已获取的内容副本，避免信息丢失
  - 内容签名验证机制：每篇内容均附带作者数字签名，签名信息包含创作时间，可通过签名与时间戳追溯内容创作源头，确保内容未被篡改且创作时间可验证


## 环境要求

### 前端环境
- Node.js (v20.0 及以上版本)
- npm (v9.0.0 及以上版本，需与 Node.js v20 版本兼容)

### 后端依赖
- [eventstore](https://github.com/asmcos/eventstore) 服务（核心后端支撑）
- Node.js (v20.0 及以上版本，eventstore 运行必需)
- MongoDB 数据库（eventstore 数据存储依赖，用于存储文档、用户、签名等数据）


## 安装与启动

1. **克隆仓库**
```bash
git clone https://github.com/asmcos/eventstoreUI.git
cd eventstoreUI
```

2. **安装依赖**
```bash
npm install
```

3. **配置后端服务地址**
修改 `eventstoreUI/src/lib/config.js` 文件，设置 eventstore 后端服务的 WebSocket 与文件上传地址：
```javascript
export const esserver  = "ws://your-eventstore-server:port/"; // 后端WebSocket服务地址
export const uploadpath = "http://your-eventstore-server:port/uploads/"; // 后端文件上传地址
```

4. **启动开发服务器**
```bash
# 启动开发服务
npm run dev

# 启动开发服务并自动在新浏览器标签页打开
npm run dev -- --open
```

5. **访问应用**
打开浏览器访问 `http://localhost:5173`，即可进入 eventstoreUI 应用界面。


## 构建生产版本

```bash
# 构建生产环境静态文件
npm run build

# 预览生产构建结果（本地验证用）
npm run preview
```

构建完成后，静态文件将生成在 `dist` 目录下，可部署至 Nginx、Apache 等静态文件服务器。  
> 注：若需部署到特定环境（如 Vercel、Netlify 或服务器），可能需要为目标环境安装对应的 [SvelteKit 适配器](https://svelte.dev/docs/kit/adapters)。


## 技术栈

- 前端框架：Svelte + SvelteKit（轻量高效，减少运行时开销）
- 构建工具：Vite（快速热更新，提升开发效率）
- 样式方案：Tailwind CSS（原子化样式，灵活适配设计）
- 类型安全：TypeScript（减少类型错误，提升代码可维护性）
- Markdown 处理：vitepress 全功能渲染（原生支持扩展语法，保障渲染性能与兼容性）
- 实时通信：WebSocket（实现前端与后端的实时数据交互）
- 工具依赖：eventstore-tools（封装与后端的交互逻辑，简化开发）
- 本地存储：WebStorage（轻量存储用户偏好、临时数据等）


## 自定义插件

- **图片类名插件**：基于 vitepress 扩展语法实现，支持在 Markdown 中为图片指定自定义 CSS 类名，实现图片样式精细化控制
- **代码块复制插件**：为 Markdown 代码块添加复制按钮，点击后提供明确的复制成功/失败反馈，同时显示代码语言标签，提升代码阅读体验


## 相关链接

- 辰龙社区文档中心：https://docs.chenlongos.cn  （eventstoreUI 实际应用场景）
- eventstore 后端项目：https://github.com/asmcos/eventstore （eventstoreUI 依赖的核心后端服务）