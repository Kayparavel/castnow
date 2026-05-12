import { Hono } from "hono"
import { fetchAllSourcesCached, fetchAllSourcesFresh, fetchSource, loadSources } from "../services/mysql"
import { logger } from "../logger"

export const newsRoutes = new Hono()

newsRoutes.get("/news", async (c) => {
  const force = c.req.query("force") === "true"
  const data = force ? await fetchAllSourcesFresh() : (await fetchAllSourcesCached()).data
  logger.info(`[news] GET /news${force ? " (force)" : ""} -> ${data.length} source(s)`)
  return c.json(data.map(s => ({
    sourceId: s.id,
    updatedTime: s.updated,
    items: s.items,
    meta: s.meta,
  })))
})

newsRoutes.get("/news/:id", async (c) => {
  const id = c.req.param("id")
  const source = await fetchSource(id)
  if (!source) return c.json({ error: `Source not found: ${id}` }, 404)
  return c.json({
    sourceId: source.id,
    updatedTime: source.updated,
    items: source.items,
    meta: source.meta,
  })
})

newsRoutes.get("/source-definitions", (c) => {
  const sources = loadSources()
  const result = Object.entries(sources)
    .filter(([_, s]) => !s.redirect)
    .map(([id, s]) => ({
      id,
      name: s.name,
      title: s.title,
      color: s.color,
      column: s.column,
      home: s.home,
    }))
  return c.json(result)
})
