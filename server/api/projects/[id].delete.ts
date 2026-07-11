import { defineEventHandler, getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { projects, sessions, events } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing project id' })
  }

  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  // Remove associated data first (no cascade defined)
  await db.delete(events).where(eq(events.projectId, id))
  await db.delete(sessions).where(eq(sessions.projectId, id))
  await db.delete(projects).where(eq(projects.id, id))

  return { ok: true }
})
