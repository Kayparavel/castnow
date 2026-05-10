import { Hono } from "hono"
import { fetchAllSourcesCached, fetchSource } from "../services/mysql"

export const newsRoutes = new Hono()

newsRoutes.get("/news", async (c) => {
  const { data, cached } = await fetchAllSourcesCached()
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
