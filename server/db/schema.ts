import { pgTable, text, integer, serial, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull(),
  createdAt: text('created_at').notNull()
})

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  sessionId: text('session_id').notNull(),
  visitor: text('visitor'),
  startedAt: text('started_at').notNull(),
  lastSeenAt: text('last_seen_at'),
  pageviews: jsonb('pageviews').$type<string[]>().default([]),
  totalClicks: integer('total_clicks').default(0),
  maxScroll: integer('max_scroll').default(0),
  eventCount: integer('event_count').default(0),
  browser: text('browser'),
  os: text('os'),
  device: text('device'),
  country: text('country'),
  source: text('source'),
  referrerUrl: text('referrer_url'),
  language: text('language'),
  timezone: text('timezone'),
  connection: text('connection'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  loadTime: integer('load_time'),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  sessionId: text('session_id').notNull(),
  visitor: text('visitor'),
  receivedAt: text('received_at').notNull(),
  payload: jsonb('payload').$type<any[]>().notNull()
})

export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').notNull()
})
