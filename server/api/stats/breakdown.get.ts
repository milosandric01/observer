import { defineEventHandler, getQuery, createError } from 'h3'
import { eq, and, sql, desc, isNotNull, ne } from 'drizzle-orm'
import { db } from '../../db'
import { sessions } from '../../db/schema'

// Aggregate session counts for a single column
async function breakdown(pid: string, column: any) {
  const rows = await db
    .select({ label: column, value: sql<number>`count(*)`.as('value') })
    .from(sessions)
    .where(and(eq(sessions.projectId, pid), isNotNull(column), ne(column, '')))
    .groupBy(column)
    .orderBy(desc(sql`count(*)`))
    .limit(50)
  return rows.map((r: any) => ({ label: r.label, value: Number(r.value) }))
}

// Aggregate top viewed pages by unnesting the pageviews array
async function pageBreakdown(pid: string) {
  const result: any = await db.execute(sql`
    SELECT page AS label, count(*) AS value
    FROM ${sessions}, jsonb_array_elements_text(${sessions.pageviews}) AS page
    WHERE ${sessions.projectId} = ${pid}
    GROUP BY page
    ORDER BY count(*) DESC
    LIMIT 50
  `)
  const rows = result.rows ?? result
  return rows.map((r: any) => ({ label: r.label, value: Number(r.value) }))
}

// Map a source name to a marketing channel
function channelFor(source: string): string {
  const search = ['Google', 'Bing', 'DuckDuckGo', 'Yahoo', 'Baidu', 'Yandex']
  const social = ['X', 'Facebook', 'Instagram', 'LinkedIn', 'Reddit', 'YouTube', 'TikTok', 'Pinterest']
  if (source === 'Direct') return 'Direct'
  if (search.includes(source)) return 'Organic Search'
  if (social.includes(source)) return 'Social'
  return 'Referral'
}

export default defineEventHandler(async (event) => {
  const { pid } = getQuery(event)
  if (!pid || typeof pid !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing pid' })
  }

  const [sources, campaigns, countries, browsers, os, devices, pages] = await Promise.all([
    breakdown(pid, sessions.source),
    breakdown(pid, sessions.utmCampaign),
    breakdown(pid, sessions.country),
    breakdown(pid, sessions.browser),
    breakdown(pid, sessions.os),
    breakdown(pid, sessions.device),
    pageBreakdown(pid),
  ])

  // Derive channels from source counts
  const channelMap: Record<string, number> = {}
  for (const s of sources) {
    const ch = channelFor(s.label)
    channelMap[ch] = (channelMap[ch] || 0) + s.value
  }
  const channels = Object.entries(channelMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  return { channels, sources, campaigns, countries, browsers, os, devices, pages }
})
