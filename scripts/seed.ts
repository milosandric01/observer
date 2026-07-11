import { Pool } from 'pg'

const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/observer'
const pool = new Pool({ connectionString: url })

const PROJECTS = [
  { id: 'proj-acme-saas', name: 'Acme SaaS', domain: 'acme-saas.com' },
  { id: 'proj-blog-site', name: 'My Blog', domain: 'myblog.dev' },
]

const SITE_PAGES: Record<string, { path: string; title: string; sections?: string[] }[]> = {
  'proj-acme-saas': [
    { path: '/', title: 'Acme SaaS – Automate your workflow', sections: ['hero', 'how-it-works', 'features', 'pricing', 'cta'] },
    { path: '/pricing', title: 'Pricing – Acme SaaS', sections: ['pricing-hero', 'plans', 'faq'] },
    { path: '/features', title: 'Features – Acme SaaS', sections: ['features-hero', 'feature-list', 'cta'] },
    { path: '/signup', title: 'Sign Up – Acme SaaS' },
    { path: '/checkout', title: 'Checkout – Acme SaaS' },
    { path: '/docs', title: 'Documentation – Acme SaaS', sections: ['docs-nav', 'docs-content'] },
    { path: '/about', title: 'About – Acme SaaS' },
  ],
  'proj-blog-site': [
    { path: '/', title: 'My Blog – Web dev thoughts', sections: ['hero', 'latest-posts', 'newsletter'] },
    { path: '/posts/getting-started', title: 'Getting Started with Observer', sections: ['article', 'comments'] },
    { path: '/posts/why-observer', title: 'Why I Built Observer', sections: ['article', 'comments'] },
    { path: '/posts/analytics-guide', title: 'The Complete Analytics Guide', sections: ['article', 'comments'] },
    { path: '/about', title: 'About Me' },
    { path: '/contact', title: 'Contact' },
  ],
}

const REFERRERS = [
  '', // direct
  'https://google.com/search?q=acme+saas',
  'https://google.com/search?q=website+analytics',
  'https://x.com/',
  'https://reddit.com/r/SaaS/',
  'https://producthunt.com/',
  'https://news.ycombinator.com/',
  'https://linkedin.com/',
  '',
  '',
]

const CLICK_TARGETS = [
  { tag: 'a', classes: ['nav-link'], text: 'Pricing', href: '/pricing' },
  { tag: 'a', classes: ['nav-link'], text: 'Features', href: '/features' },
  { tag: 'a', classes: ['btn-primary'], text: 'Start free' },
  { tag: 'a', classes: ['btn-primary'], text: 'Join the waitlist' },
  { tag: 'button', classes: ['btn-primary'], text: 'Sign up' },
  { tag: 'button', classes: ['submit'], text: 'Subscribe' },
  { tag: 'a', classes: ['btn-ghost'], text: 'See how it works' },
  { tag: 'button', classes: ['copy-btn'], text: 'Copy' },
  { tag: 'a', classes: ['card'], text: 'Read more' },
  { tag: 'button', classes: ['close'], text: '×' },
]

const FORM_FIELDS = [
  { tag: 'input', type: 'email', name: 'email', placeholder: 'you@company.com', label: 'Email' },
  { tag: 'input', type: 'text', name: 'name', placeholder: 'Jane Doe', label: 'Full name' },
  { tag: 'input', type: 'password', name: 'password', label: 'Password' },
  { tag: 'select', name: 'plan', label: 'Plan' },
]

const JS_ERRORS = [
  "TypeError: Cannot read properties of undefined (reading 'map')",
  'ReferenceError: analytics is not defined',
  'NetworkError: Failed to fetch /api/subscribe',
  "TypeError: null is not an object (evaluating 'el.style')",
  "SyntaxError: Unexpected token '<' in JSON at position 0",
]

const SCREEN_SIZES = [
  { w: 1920, h: 1080 },
  { w: 1440, h: 900 },
  { w: 1366, h: 768 },
  { w: 390, h: 844 },   // iPhone
  { w: 412, h: 915 },   // Android
  { w: 768, h: 1024 },  // iPad
  { w: 1536, h: 864 },
]

// Visitor profiles — weighted toward desktop Chrome
const VISITOR_PROFILES = [
  { browser: 'Chrome',  os: 'Windows', device: 'Desktop' as const },
  { browser: 'Chrome',  os: 'Windows', device: 'Desktop' as const },
  { browser: 'Chrome',  os: 'Mac OS',  device: 'Desktop' as const },
  { browser: 'Chrome',  os: 'Mac OS',  device: 'Desktop' as const },
  { browser: 'Chrome',  os: 'Mac OS',  device: 'Desktop' as const },
  { browser: 'Safari',  os: 'Mac OS',  device: 'Desktop' as const },
  { browser: 'Safari',  os: 'Mac OS',  device: 'Desktop' as const },
  { browser: 'Firefox', os: 'Windows', device: 'Desktop' as const },
  { browser: 'Firefox', os: 'Linux',   device: 'Desktop' as const },
  { browser: 'Edge',    os: 'Windows', device: 'Desktop' as const },
  { browser: 'Safari',  os: 'iOS',     device: 'Mobile' as const },
  { browser: 'Safari',  os: 'iOS',     device: 'Mobile' as const },
  { browser: 'Chrome',  os: 'Android', device: 'Mobile' as const },
  { browser: 'Chrome',  os: 'Android', device: 'Mobile' as const },
  { browser: 'Safari',  os: 'iOS',     device: 'Tablet' as const },
  { browser: 'Chrome',  os: 'Android', device: 'Tablet' as const },
]

const COUNTRIES = [
  'US', 'US', 'US', 'US', // weighted
  'GB', 'GB',
  'DE', 'DE',
  'FR',
  'CA', 'CA',
  'AU',
  'NL',
  'SE',
  'JP',
  'BR',
  'IN',
  'PL',
  'ES',
  'KR',
]

// Source derived from referrer
const SOURCE_MAP: Record<string, string> = {
  '': 'Direct',
  'https://google.com/search?q=acme+saas': 'Google',
  'https://google.com/search?q=website+analytics': 'Google',
  'https://x.com/': 'X',
  'https://reddit.com/r/SaaS/': 'Reddit',
  'https://producthunt.com/': 'Product Hunt',
  'https://news.ycombinator.com/': 'Hacker News',
  'https://linkedin.com/': 'LinkedIn',
}

const LANGUAGES = ['en-US', 'en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'ja-JP', 'nl-NL', 'sv-SE']
const TIMEZONES = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'America/Sao_Paulo']
const CONNECTIONS = ['4g', '4g', '4g', 'wifi', '3g', 'slow-2g']

// UTM campaigns (only some sessions have them)
const UTM_CAMPAIGNS = [
  null, null, null, null, null, // most have none
  { source: 'twitter', medium: 'social', campaign: 'launch' },
  { source: 'newsletter', medium: 'email', campaign: 'weekly-digest' },
  { source: 'producthunt', medium: 'referral', campaign: 'ph-launch' },
  { source: 'google', medium: 'cpc', campaign: 'brand-search' },
]

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  )
}

async function seed() {
  console.log('Seeding observer database...')

  await pool.query('DELETE FROM events')
  await pool.query('DELETE FROM sessions')
  await pool.query('DELETE FROM projects')
  await pool.query('DELETE FROM waitlist')
  console.log('Cleared existing data.')

  for (const proj of PROJECTS) {
    await pool.query(
      'INSERT INTO projects (id, name, domain, created_at) VALUES ($1, $2, $3, $4)',
      [proj.id, proj.name, proj.domain, new Date().toISOString()]
    )
    console.log(`Created project: ${proj.name} (${proj.id})`)
  }

  const now = Date.now()
  let totalSessions = 0
  let totalEvents = 0

  for (const proj of PROJECTS) {
    const sitePages = SITE_PAGES[proj.id]
    const isMain = proj.id === 'proj-acme-saas'

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const baseCount = isMain ? randInt(18, 40) : randInt(6, 18)
      const trend = 1 + (13 - dayOffset) * 0.05
      const sessionsToday = Math.round(baseCount * trend)

      for (let s = 0; s < sessionsToday; s++) {
        const sessionId = generateId()
        const visitor = generateId()
        const screen = rand(SCREEN_SIZES)
        const referrer = rand(REFERRERS)
        const profile = rand(VISITOR_PROFILES)
        const country = rand(COUNTRIES)
        const source = SOURCE_MAP[referrer] || 'Direct'
        const language = rand(LANGUAGES)
        const timezone = rand(TIMEZONES)
        const connection = rand(CONNECTIONS)
        const utm = rand(UTM_CAMPAIGNS)
        const loadTime = randInt(280, 3200)

        const dayStart = new Date(now - dayOffset * 24 * 60 * 60 * 1000)
        dayStart.setHours(randInt(6, 23), randInt(0, 59), randInt(0, 59))

        const events: any[] = []
        let ts = dayStart.getTime()
        let sessionMaxScroll = 0

        // Visit 1-5 pages
        const numPages = randInt(1, Math.min(5, sitePages.length))
        const visitedPaths: string[] = []
        const pagesToVisit = [sitePages[0]] // start on landing page
        for (let p = 1; p < numPages; p++) {
          const page = rand(sitePages)
          if (!pagesToVisit.find(pp => pp.path === page.path)) pagesToVisit.push(page)
        }

        for (let pi = 0; pi < pagesToVisit.length; pi++) {
          const page = pagesToVisit[pi]
          if (!visitedPaths.includes(page.path)) visitedPaths.push(page.path)

          const pageUrl = `https://${proj.domain}${page.path}`

          // pageview event
          events.push({
            type: 'pageview',
            timestamp: ts,
            url: pageUrl,
            path: page.path,
            data: {
              referrer: pi === 0 ? referrer : `https://${proj.domain}${pagesToVisit[pi - 1].path}`,
              title: page.title,
              screenWidth: screen.w,
              screenHeight: screen.h,
            },
          })
          ts += randInt(500, 2000)

          // section_view events
          if (page.sections) {
            for (const section of page.sections) {
              const engaged = Math.random() > 0.3
              const duration = engaged ? randInt(2000, 15000) : randInt(300, 1500)
              events.push({
                type: 'section_view',
                timestamp: ts,
                url: pageUrl,
                path: page.path,
                data: { section, duration, engaged, tag: 'section', id: section },
              })
              ts += duration
            }
          }

          // scroll events (1-3 per page)
          const scrolls = randInt(1, 3)
          for (let si = 0; si < scrolls; si++) {
            const depth = randInt(15, 100)
            if (depth > sessionMaxScroll) sessionMaxScroll = depth
            events.push({
              type: 'scroll',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: { depth, maxDepth: sessionMaxScroll },
            })
            ts += randInt(1000, 5000)
          }

          // click events (0-6 per page)
          const clicks = randInt(0, 6)
          for (let ci = 0; ci < clicks; ci++) {
            const target = rand(CLICK_TARGETS)
            events.push({
              type: 'click',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: {
                element: { ...target },
                x: randInt(50, screen.w - 50),
                y: randInt(50, screen.h - 50),
              },
            })
            ts += randInt(300, 3000)
          }

          // form interactions (occasional)
          if (Math.random() > 0.7 && (page.path === '/signup' || page.path === '/checkout' || page.path === '/contact' || page.path === '/')) {
            const field = rand(FORM_FIELDS)
            events.push({
              type: 'form_focus',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: { element: { ...field } },
            })
            ts += randInt(2000, 8000)

            if (Math.random() > 0.4) {
              events.push({
                type: 'form_submit',
                timestamp: ts,
                url: pageUrl,
                path: page.path,
                data: {
                  element: { tag: 'form', id: 'signup-form' },
                  action: pageUrl,
                  method: 'post',
                },
              })
              ts += randInt(500, 1500)
            }
          }

          // rage click (rare — ~5%)
          if (Math.random() > 0.95) {
            const target = rand(CLICK_TARGETS.slice(2, 6))
            events.push({
              type: 'click',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: {
                element: { ...target },
                x: randInt(100, 400),
                y: randInt(100, 400),
                rageClick: true,
                clickCount: randInt(4, 9),
              },
            })
            ts += randInt(200, 800)
          }

          // JS error (rare — ~3%)
          if (Math.random() > 0.97) {
            events.push({
              type: 'error',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: { message: rand(JS_ERRORS), source: 'window.onerror' },
            })
            ts += randInt(100, 500)
          }

          // page_leave before next page
          if (pi < pagesToVisit.length - 1) {
            events.push({
              type: 'page_leave',
              timestamp: ts,
              url: pageUrl,
              path: page.path,
              data: { timeOnPage: ts - (events.find(e => e.path === page.path && e.type === 'pageview')?.timestamp || ts), maxScroll: sessionMaxScroll },
            })
            ts += randInt(200, 1000)
          }
        }

        // Final page_leave
        const lastPage = pagesToVisit[pagesToVisit.length - 1]
        events.push({
          type: 'page_leave',
          timestamp: ts,
          url: `https://${proj.domain}${lastPage.path}`,
          path: lastPage.path,
          data: { timeOnPage: ts - dayStart.getTime(), maxScroll: sessionMaxScroll },
        })

        const lastSeenAt = new Date(ts).toISOString()
        const startedAt = dayStart.toISOString()

        const totalClicks = events.filter(e => e.type === 'click').length

        await pool.query(
          `INSERT INTO sessions (project_id, session_id, visitor, started_at, last_seen_at, pageviews, total_clicks, max_scroll, event_count, browser, os, device, country, source, referrer_url, language, timezone, connection, utm_source, utm_medium, utm_campaign, load_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
          [proj.id, sessionId, visitor, startedAt, lastSeenAt, JSON.stringify(visitedPaths), totalClicks, sessionMaxScroll, events.length, profile.browser, profile.os, profile.device, country, source, referrer || '', language, timezone, connection, utm?.source || null, utm?.medium || null, utm?.campaign || null, loadTime]
        )

        await pool.query(
          `INSERT INTO events (project_id, session_id, visitor, received_at, payload)
           VALUES ($1, $2, $3, $4, $5)`,
          [proj.id, sessionId, visitor, startedAt, JSON.stringify(events)]
        )

        totalSessions++
        totalEvents += events.length
      }
    }
  }

  // Waitlist entries
  const emails = [
    'alice@example.com', 'bob@startup.io', 'carol@acme.co',
    'dave@indie.dev', 'eve@bigcorp.com', 'frank@freelancer.me',
  ]
  for (const email of emails) {
    const createdAt = new Date(now - randInt(0, 7) * 24 * 60 * 60 * 1000).toISOString()
    await pool.query(
      'INSERT INTO waitlist (email, created_at) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [email, createdAt]
    )
  }

  console.log(`\nSeeded successfully:`)
  console.log(`  ${PROJECTS.length} projects`)
  console.log(`  ${totalSessions} sessions`)
  console.log(`  ${totalEvents} events`)
  console.log(`  ${emails.length} waitlist entries`)

  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
