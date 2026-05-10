# CastNow / 知了

从 NewsNow 的 MySQL 增量库读取新闻，卡片展示 + TTS 语音播报。

## 技术方案

- 前端：React 19 + Vite + UnoCSS
- 后端：Hono + @hono/node-server（极轻量，无复杂构建依赖）
- 数据库：只读连接 NewsNow 的 MySQL（newsnow 库，news_items 表）
- TTS：HTTP 调用外部 API（当前小米 Mimo，OpenAI 兼容接口，以后可换）
- 生产运行：tsx 直接跑 TypeScript，不需要编译步骤
- 部署：Docker，追求低内存开销

## 核心功能

1. 定时从 MySQL 读取最新增量新闻
2. 前端卡片展示新闻列表
3. 点击播报按钮，后端调 TTS API 合成音频，前端播放

## TTS 接口（Mimo）

非流式：POST `https://api.xiaomimimo.com/v1/chat/completions`
- model: mimo-v2.5-tts-voicedesign
- 返回 base64 编码的 wav 音频
- 需要环境变量 MIMO_API_KEY
- 流式功能暂未上线，等上线后可改为流式降低延迟

## 开发方式

```bash
pnpm install
# 终端1：启动后端
pnpm dev:server
# 终端2：启动前端（开发时自动代理 /api 到后端）
pnpm dev
```

## 生产构建

```bash
pnpm build   # Vite 构建前端到 dist/public
pnpm start   # tsx 启动后端，serve 前端静态文件 + API
```

## 环境变量（.env.server）

MYSQL_HOST / MYSQL_PORT / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DB - MySQL 连接
MIMO_API_KEY - TTS API 密钥
TTS_BASE_URL - TTS API 地址（默认小米 Mimo）
CRON_INTERVAL - 定时刷新间隔（秒），不设则不启用
PORT - 服务端口（默认 3000）
