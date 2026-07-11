import { defineEventHandler, getQuery, createError } from 'h3'
import { eq, sql, and, gte } from 'drizzle-orm'
import { db } from '../../db'
import { sessions, events } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { pid, days } = getQuery(event)
  if (!pid || typeof pid !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing pid' })
  }

  const numDays = Math.min(Number(days) || 14, 90)
  const since = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000).toISOString()

  // Sessions per day
  const dailySessions = await db.select({
    date: sql<string>`DATE(${sessions.startedAt})`.as('date'),
    count: sql<number>`count(*)`.as('count'),
    avgScroll: sql<number>`ROUND(AVG(${sessions.maxScroll}))`.as('avg_scroll'),
    totalClicks: sql<number>`SUM(${sessions.totalClicks})`.as('total_clicks'),
    totalPageviews: sql<number>`SUM(COALESCE(jsonb_array_length(${sessions.pageviews}), 0))`.as('total_pageviews'),
  })
    .from(sessions)
    .where(and(eq(sessions.projectId, pid), gte(sessions.startedAt, since)))
    .groupBy(sql`DATE(${sessions.startedAt})`)
    .orderBy(sql`DATE(${sessions.startedAt})`)

  // Fill in missing days with zeros
  const result = []
  const now = new Date()
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const existing = dailySessions.find((r: any) => r.date === dateStr)
    result.push({
      date: dateStr,
      sessions: existing ? Number(existing.count) : 0,
      avgScroll: existing ? Number(existing.avgScroll) || 0 : 0,
      clicks: existing ? Number(existing.totalClicks) || 0 : 0,
      pageviews: existing ? Number(existing.totalPageviews) || 0 : 0,
    })
  }

  return result
})
