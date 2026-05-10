import process from "node:process"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { serveStatic } from "@hono/node-server/serve-static"
import { config } from "dotenv"
import { newsRoutes } from "./routes/news"
import { ttsRoutes } from "./routes/tts"
import { fetchAllSources } from "./services/mysql"
import { logger } from "./logger"

config({ path: ".env.server" })

const app = new Hono()

app.route("/api", newsRoutes)
app.route("/api", ttsRoutes)
app.use("/*", serveStatic({ root: "./dist/public" }))

const intervalSeconds = Number(process.env.CRON_INTERVAL) || 0
if (intervalSeconds > 0) {
  logger.info(`[auto-refresh] enabled, every ${intervalSeconds}s`)
  async function refresh() {
    try {
      const sources = await fetchAllSources()
      logger.info(`[auto-refresh] ${sources.length} source(s) available`)
    } catch (e) {
      logger.error("[auto-refresh] error:", e)
    }
  }
  await refresh()
  setInterval(refresh, intervalSeconds * 1000)
}

const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, (info) => {
  logger.success(`castnow running at http://localhost:${info.port}`)
})
