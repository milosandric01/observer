import { defineEventHandler, getQuery, createError } from 'h3'
import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { sessions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { pid, page, pageSize } = getQuery(event)
  if (!pid || typeof pid !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing pid' })
  }

  const limit = Math.min(Number(pageSize) || 20, 100)
  const currentPage = Math.max(Number(page) || 1, 1)
  const offset = (currentPage - 1) * limit

  const pageSessions = await db.select().from(sessions)
    .where(eq(sessions.projectId, pid))
    .orderBy(desc(sessions.lastSeenAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(sessions)
    .where(eq(sessions.projectId, pid))

  const total = Number(count)

  return {
    sessions: pageSessions,
    total,
    page: currentPage,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  }
})
