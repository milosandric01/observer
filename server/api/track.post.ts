import { defineEventHandler, readBody, getHeader } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { projects, sessions, events } from '../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.projectId || !body.sessionId || !Array.isArray(body.events)) {
    throw createError({ statusCode: 400, message: 'Invalid payload' })
  }

  // Origin check: verify the request comes from the registered domain
  const [project] = await db.select().from(projects).where(eq(projects.id, body.projectId)).limit(1)
  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const origin = getHeader(event, 'origin') || getHeader(event, 'referer') || ''
  if (origin && origin !== 'null' && project.domain) {
    const originHost = origin.replace(/^https?:\/\//, '').replace(/[:/].*$/, '')
    if (!originHost.endsWith(project.domain) && originHost !== 'localhost') {
      throw createError({ statusCode: 403, message: 'Domain mismatch' })
    }
  }

  // Store raw events
  await db.insert(events).values({
    projectId: body.projectId,
    sessionId: body.sessionId,
    visitor: body.visitor,
    receivedAt: new Date().toISOString(),
    payload: body.events
  })

  // Upsert session summary
  const [existing] = await db.select().from(sessions)
    .where(and(eq(sessions.projectId, body.projectId), eq(sessions.sessionId, body.sessionId)))
    .limit(1)

  if (existing) {
    const pageviews = existing.pageviews || []
    let totalClicks = existing.totalClicks || 0
    let maxScroll = existing.maxScroll || 0

    for (const ev of body.events) {
      if (ev.type === 'pageview' && !pageviews.includes(ev.path)) {
        pageviews.push(ev.path)
      }
      if (ev.type === 'click') totalClicks++
      if (ev.type === 'scroll' && ev.data?.maxDepth > maxScroll) {
        maxScroll = Math.min(100, ev.data.maxDepth)
      }
    }

    await db.update(sessions).set({
      lastSeenAt: new Date().toISOString(),
      eventCount: (existing.eventCount || 0) + body.events.length,
      pageviews,
      totalClicks,
      maxScroll
    }).where(eq(sessions.id, existing.id))
  } else {
    const pageviews: string[] = []
    let totalClicks = 0
    let maxScroll = 0

    for (const ev of body.events) {
      if (ev.type === 'pageview' && !pageviews.includes(ev.path)) {
        pageviews.push(ev.path)
      }
      if (ev.type === 'click') totalClicks++
      if (ev.type === 'scroll' && ev.data?.maxDepth > maxScroll) {
        maxScroll = Math.min(100, ev.data.maxDepth)
      }
    }

    await db.insert(sessions).values({
      projectId: body.projectId,
      sessionId: body.sessionId,
      visitor: body.visitor,
      startedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      pageviews,
      totalClicks,
      maxScroll,
      eventCount: body.events.length
    })
  }

  return { ok: true }
})
