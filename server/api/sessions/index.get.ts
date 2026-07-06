import { defineEventHandler, getQuery, createError } from 'h3'
import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { sessions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { pid } = getQuery(event)
  if (!pid || typeof pid !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing pid' })
  }

  const allSessions = await db.select().from(sessions)
    .where(eq(sessions.projectId, pid))
    .orderBy(desc(sessions.lastSeenAt))
    .limit(100)

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(sessions)
    .where(eq(sessions.projectId, pid))

  return {
    sessions: allSessions,
    total: Number(count)
  }
})
