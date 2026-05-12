# CastNow / 知了

[newsnow-kayparavel](https://github.com/Kayparavel/newsnow-kayparavel) 的配套项目。直接连接 NewsNow 的 MySQL 数据库，以卡片形式展示新闻，并支持 TTS 语音播报。使用前请先完成 NewsNow 的部署并确保 MySQL 增量库已正常运行。

**功能亮点：**
- 卡片式新闻浏览，支持按源分组、搜索、关注/收藏
- TTS 语音播报，可自定义音色和播报风格
- 从 sources.json 自动匹配源名称、颜色等元信息
- 定时自动刷新 + 手动刷新绕过缓存
- Docker 一键部署

## 本地开发

> 需要 Node.js >= 20，pnpm

```bash
pnpm install

# 终端1：后端
pnpm dev:server

# 终端2：前端（Vite dev server，自动代理 /api -> :3000）
pnpm dev
```

### 环境变量

在 `castnow/` 下创建 `.env.server`：

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=newsnownow

# TTS（可选）
MIMO_API_KEY=
TTS_BASE_URL=https://api.xiaomimimo.com/v1
TTS_VOICE_SAMPLE_PATH=./data/voice-sample.wav
TTS_STYLE_PROMPT=

# 定时刷新间隔（秒），不设则不启用
CRON_INTERVAL=
# MySQL 查询缓存（秒），默认 300
CACHE_TTL=
```

> 需要先有 NewsNow 的 MySQL 数据库，以及 `data/sources.json` 文件。

## 生产部署

```bash
pnpm build
pnpm start
```

`pnpm start` 会用 `tsx` 启动后端，同时 serve 前端构建产物和 API。

## Docker 部署

```bash
docker compose up -d
```

`data/` 目录映射到容器 `/app/data`，存放 `sources.json` 和语音样本。环境变量通过 `.env` 文件或 `docker-compose.yml` 配置。

## License

[MIT](./LICENSE) © kayparavel

## 赞赏

如果本项目对你有所帮助，可以给小猫买点零食。如果需要定制或者其他帮助，请通过下列方式联系备注。

![](./screenshots/wechat-kayparavel.png)
![](./screenshots/wechatpay-kayparavel.png)
![](./screenshots/alipaypay-kayparavel.jpg)
