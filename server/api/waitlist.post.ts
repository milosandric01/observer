import { defineEventHandler, readBody } from 'h3'
import { db } from '../db'
import { waitlist } from '../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.email || typeof body.email !== 'string') {
    throw createError({ statusCode: 400, message: 'Email is required' })
  }

  const email = body.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email' })
  }

  await db.insert(waitlist).values({
    email,
    createdAt: new Date().toISOString()
  }).onConflictDoNothing()

  return { ok: true }
})
