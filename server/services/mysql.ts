import process from "node:process"
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

export async function fetchAllSources() {
  const p = await getMySQLPool()
  if (!p) return []
  const [rows] = await p.query("SELECT id, updated, data FROM news_items") as [NewsRow[], any]
  return rows.map(row => ({
    id: row.id,
    updated: row.updated,
    items: JSON.parse(row.data),
  }))
}

export async function fetchSource(sourceId: string) {
  const p = await getMySQLPool()
  if (!p) return undefined
  const [rows] = await p.query("SELECT id, updated, data FROM news_items WHERE id = ?", [sourceId]) as [NewsRow[], any]
  if (!rows.length) return undefined
  return { id: rows[0].id, updated: rows[0].updated, items: JSON.parse(rows[0].data) }
}
