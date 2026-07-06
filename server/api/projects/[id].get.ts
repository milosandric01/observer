import { defineEventHandler, getRouterParam } from 'h3'
import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { projects, sessions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const [project] = await db.select().from(projects).where(eq(projects.id, id!)).limit(1)
  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const allSessions = await db.select().from(sessions)
    .where(eq(sessions.projectId, id!))
    .orderBy(desc(sessions.lastSeenAt))
    .limit(100)

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(sessions)
    .where(eq(sessions.projectId, id!))

  return {
    ...project,
    sessions: allSessions,
    totalSessions: Number(count)
  }
})
