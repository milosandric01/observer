import { defineEventHandler, readBody } from 'h3'
import { db } from '../../db'
import { projects } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.name || !body.domain) {
    throw createError({ statusCode: 400, message: 'Name and domain are required' })
  }

  const id = body.domain.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const project = {
    id,
    name: body.name,
    domain: body.domain,
    createdAt: new Date().toISOString()
  }

  await db.insert(projects).values(project)

  return project
})
