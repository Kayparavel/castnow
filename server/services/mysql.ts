import process from "node:process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import mysql from "mysql2/promise"
import { logger } from "../logger"

interface NewsRow {
  id: string
  updated: number
  data: string
}

let pool: mysql.Pool | undefined

export async function getMySQLPool(): Promise<mysql.Pool | undefined> {
  if (pool) return pool
  const host = process.env.MYSQL_HOST
  if (!host) {
    logger.warn("[mysql] MYSQL_HOST not set, skipping")
    return undefined
  }
  try {
    pool = mysql.createPool({
      host,
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DB || "newsnow",
      waitForConnections: true,
      connectionLimit: 3,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 10000,
    })
    const conn = await pool.getConnection()
    conn.release()
    logger.success("[mysql] connected")
    return pool
  } catch (e) {
    logger.error("[mysql] connection failed:", e)
    pool = undefined
    return undefined
  }
}

interface SourceJsonEntry {
  name: string
  color?: string
  type?: string
  title?: string
  home?: string
  redirect?: string
  column?: string
}

let sourcesCache: Record<string, SourceJsonEntry> | undefined
let sourcesCacheTime = 0
const SOURCES_CACHE_TTL = 60_000

export function loadSources(): Record<string, SourceJsonEntry> {
  const now = Date.now()
  if (sourcesCache && now - sourcesCacheTime < SOURCES_CACHE_TTL) return sourcesCache
  try {
    const p = process.env.SOURCES_JSON_PATH || join(import.meta.dirname, "../../data/sources.json")
    sourcesCache = JSON.parse(readFileSync(p, "utf-8"))
    sourcesCacheTime = now
  } catch (e) {
    logger.warn("[sources] failed to load sources.json:", e)
    if (!sourcesCache) sourcesCache = {}
  }
  return sourcesCache!
}

function getSourceMeta(id: string) {
  const sources = loadSources()
  const entry = sources[id]
  if (!entry) return { name: id, color: "gray" }
  return {
    name: entry.name,
    color: entry.color || "gray",
    type: entry.type,
    title: entry.title,
    home: entry.home,
    column: entry.column,
  }
}

export async function fetchAllSources() {
  const p = await getMySQLPool()
  if (!p) return []
  const [rows] = await p.query("SELECT id, updated, data FROM news_items") as [NewsRow[], any]
  return rows.map(row => ({
    id: row.id,
    updated: row.updated,
    items: JSON.parse(row.data),
    meta: getSourceMeta(row.id),
  }))
}

const CACHE_TTL = Number(process.env.CACHE_TTL) || 300

interface CacheEntry {
  data: Awaited<ReturnType<typeof fetchAllSources>>
  time: number
}

let allSourcesCache: CacheEntry | undefined

export async function fetchAllSourcesCached() {
  const now = Date.now()
  if (allSourcesCache && now - allSourcesCache.time < CACHE_TTL * 1000) {
    logger.info(`[news] cache hit, ${allSourcesCache.data.length} source(s) (age ${Math.round((now - allSourcesCache.time) / 1000)}s)`)
    return { data: allSourcesCache.data, cached: true }
  }
  logger.info("[news] cache miss, querying MySQL...")
  const data = await fetchAllSources()
  if (data.length > 0) {
    allSourcesCache = { data, time: now }
    logger.success(`[news] loaded ${data.length} source(s) from MySQL, cached for ${CACHE_TTL}s`)
  }
  return { data, cached: false }
}

export async function fetchAllSourcesFresh() {
  logger.info("[news] force refresh, querying MySQL...")
  const data = await fetchAllSources()
  if (data.length > 0) {
    allSourcesCache = { data, time: Date.now() }
    logger.success(`[news] force loaded ${data.length} source(s) from MySQL`)
  }
  return data
}

export async function fetchSource(sourceId: string) {
  const p = await getMySQLPool()
  if (!p) return undefined
  const [rows] = await p.query("SELECT id, updated, data FROM news_items WHERE id = ?", [sourceId]) as [NewsRow[], any]
  if (!rows.length) return undefined
  return {
    id: rows[0].id,
    updated: rows[0].updated,
    items: JSON.parse(rows[0].data),
    meta: getSourceMeta(rows[0].id),
  }
}
