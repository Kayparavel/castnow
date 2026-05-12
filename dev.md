# CastNow / 知了

从 NewsNow 的 MySQL 增量库读取新闻，卡片展示 + TTS 语音播报。

## 项目目录

```
castnow/
├── server/           # 后端（Hono）
│   ├── index.ts      # 服务入口、cron 自动刷新
│   ├── routes/
│   │   ├── news.ts   # /api/news, /api/source-definitions
│   │   └── tts.ts    # /api/tts
│   └── services/
│       ├── mysql.ts  # MySQL 连接、sources.json 加载、查询缓存
│       └── tts.ts    # TTS 合成 + 音频缓存
├── src/              # 前端（React）
│   ├── main.tsx
│   ├── atoms.ts      # jotai 状态（当前 tab、关注列表，持久化 localStorage）
│   ├── hooks/
│   │   ├── useNews.ts
│   │   ├── useTTS.ts
│   │   └── useSourceDefinitions.ts
│   └── components/
│       ├── App.tsx
│       ├── NavBar.tsx
│       ├── MoreDialog.tsx
│       └── NewsCard.tsx
├── shared/           # 前后端共享类型
│   └── types.ts
├── data/             # Docker 卷挂载点（sources.json、语音样本）
└── public/icons/     # 新闻源图标（从 NewsNow 复制）
```

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 19 + Vite + UnoCSS + jotai + TanStack Query |
| 后端 | Hono + @hono/node-server |
| 数据库 | 只读连接 NewsNow 的 MySQL（`news_items` 表） |
| TTS | Mimo mimo-v2.5-tts-voiceclone（OpenAI 兼容接口） |

## 环境变量（.env.server）

| 变量 | 说明 |
|------|------|
| `MYSQL_HOST/PORT/USER/PASSWORD/DB` | MySQL 连接 |
| `MIMO_API_KEY` | TTS API 密钥 |
| `TTS_BASE_URL` | TTS API 地址（默认 `https://api.xiaomimimo.com/v1`） |
| `TTS_VOICE_SAMPLE_PATH` | 音色复刻参考音频（wav/mp3） |
| `TTS_STYLE_PROMPT` | TTS user message 风格指令 |
| `CRON_INTERVAL` | 定时刷新间隔（秒），不设则不启用 |
| `CACHE_TTL` | MySQL 查询缓存（秒，默认 300） |
| `SOURCES_JSON_PATH` | sources.json 路径（默认 `data/sources.json`） |
| `PORT` | 服务端口（默认 3000） |

## 核心功能

### 新闻展示
- 后端从 MySQL 查询 `news_items`，匹配 `sources.json` 元信息（name、color、column）
- 两级缓存：sources.json 文件缓存（60s）+ MySQL 查询缓存（`CACHE_TTL`）
- 刷新按钮绕过缓存强制查询（`?force=true`）
- `/api/source-definitions` 返回 sources.json 全量源定义（不依赖数据库）

### 关注/分类
- 关注列表存 localStorage（key: `castnow:focus`），通过 jotai `atomWithStorage`
- 导航栏：**更多** / **关注** / **全部**（`bg-primary/1` 样式）
- "更多"弹窗（`createPortal` 到 body）按 column 自动分组展示所有源，支持搜索
- 卡片星标按钮切换关注状态

### TTS 语音播报
- 模型：`mimo-v2.5-tts-voiceclone`，音色复刻（样本 ≤10MB base64，仅 wav/mp3）
- 后端内存缓存合成结果（1h TTL，最多 50 条）
- 文本：所有新闻标题 + 平台名结尾

## 开发

```bash
pnpm install
pnpm dev:server   # 终端1：后端
pnpm dev          # 终端2：前端（Vite dev proxy /api -> :3000）
```

## 生产

```bash
pnpm build
pnpm start        # tsx 启动后端，serve 前端静态文件 + API
```

## Docker 部署

```bash
docker compose up -d
```

`data/` 目录映射到容器 `/app/data`，存放 `sources.json` 和语音样本。
