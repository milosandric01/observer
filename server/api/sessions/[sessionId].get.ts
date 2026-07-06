import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../../db'
import { sessions, events } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  const { pid } = getQuery(event)

  if (!sessionId || !pid) {
    throw createError({ statusCode: 400, message: 'Missing session or project id' })
  }

  const [session] = await db.select().from(sessions)
    .where(and(eq(sessions.projectId, String(pid)), eq(sessions.sessionId, sessionId)))
    .limit(1)

  if (!session) {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }

  const rows = await db.select().from(events)
    .where(and(eq(events.projectId, String(pid)), eq(events.sessionId, sessionId)))
    .orderBy(asc(events.receivedAt))

  const timeline = rows
    .flatMap((r) => r.payload || [])
    .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))

  return { ...session, events: timeline }
})
