<template>
  <section>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-body-lg font-semibold">Sessions ({{ total }})</h3>
      <button class="flex items-center justify-center bg-surface-1 text-ink-muted border border-hairline w-9 h-9 rounded-md hover:bg-surface-2 hover:text-ink hover:border-hairline-strong transition-colors disabled:opacity-50" :disabled="status === 'pending'" :title="status === 'pending' ? 'Refreshing…' : 'Reload'" aria-label="Reload sessions" @click="refresh()">
        <ActionIcon name="reload" class="w-4 h-4" :class="{ 'animate-spin': status === 'pending' }" />
      </button>
    </div>
    <div v-if="sessions?.length" class="flex flex-col gap-2">
      <div v-for="session in sessions" :key="session.sessionId" class="bg-surface-1 border border-hairline rounded-md overflow-hidden">
        <div class="flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-surface-2 transition-colors" @click="toggle(session)">
          <div class="flex items-center gap-3">
            <span class="text-ink-subtle text-caption w-3">{{ open === session.sessionId ? '▾' : '▸' }}</span>
            <span class="font-mono text-body-sm text-primary">{{ session.visitor?.slice(0, 8) }}</span>
            <span class="flex gap-1 flex-wrap">
              <span v-for="(page, i) in session.pageviews" :key="i" class="text-eyebrow bg-surface-2 border border-hairline px-2 py-0.5 rounded-xs text-ink-subtle">{{ page }}</span>
            </span>
          </div>
          <div class="flex items-center gap-4 text-body-sm text-ink-subtle">
            <span>{{ session.eventCount }} events</span>
            <span>{{ formatTime(session.lastSeenAt) }}</span>
          </div>
        </div>

        <div v-if="open === session.sessionId" class="border-t border-hairline px-4 py-3">
          <p v-if="loading" class="text-body-sm text-ink-subtle py-2">Loading journey…</p>
          <div v-else-if="journey.length" class="flex flex-col">
            <div v-for="(node, i) in journey" :key="i" class="flex gap-3">
              <!-- rail -->
              <div class="flex flex-col items-center shrink-0 w-6">
                <span
                  v-if="node.kind === 'page'"
                  class="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-canvas mt-1.5"
                />
                <span
                  v-else-if="node.ev?.type === 'section_view' && node.ev?.data?.engaged"
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 border border-primary text-primary"
                  title="Engaged section"
                >
                  <ActionIcon name="section_view" class="w-3 h-3" />
                </span>
                <span
                  v-else-if="node.ev?.type === 'section_view'"
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-surface-1 border border-hairline-strong/50 text-ink-subtle/50"
                  title="Skimmed section"
                >
                  <ActionIcon name="section_view" class="w-3 h-3 opacity-50" />
                </span>
                <span
                  v-else-if="node.ev?.type === 'away'"
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-surface-1 border border-dashed border-hairline-strong/50 text-ink-subtle/50"
                  title="User was away"
                >
                  <ActionIcon name="away" class="w-3 h-3 opacity-60" />
                </span>
                <span
                  v-else
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-surface-2 border border-hairline text-ink-subtle"
                  :title="node.ev.type"
                >
                  <ActionIcon :name="node.ev.type" class="w-3 h-3" />
                </span>
                <span v-if="i < journey.length - 1" class="w-px grow bg-hairline my-1" />
              </div>
              <!-- content -->
              <div class="flex-1 min-w-0 pb-4">
                <div v-if="node.kind === 'page'" class="flex justify-between items-baseline gap-3 pt-0.5">
                  <span class="text-body-sm font-medium text-ink break-all">{{ node.path }}</span>
                  <span class="text-caption text-ink-subtle font-mono shrink-0">
                    {{ node.duration }}<template v-if="node.maxScroll != null"> · ↓{{ node.maxScroll }}%</template>
                  </span>
                </div>
                <div v-else-if="node.ev?.type === 'section_view'" class="flex justify-between items-baseline gap-3 pt-1">
                  <span class="text-body-sm break-all" :class="node.ev.data?.engaged ? 'text-ink' : 'text-ink-subtle/70'">{{ describe(node.ev) }}</span>
                  <span class="text-caption text-ink-subtle font-mono shrink-0">{{ clock(node.ev.timestamp) }}</span>
                </div>
                <div v-else-if="node.ev?.type === 'away'" class="flex justify-between items-baseline gap-3 pt-1">
                  <span class="text-body-sm italic text-ink-subtle/60">{{ describe(node.ev) }}</span>
                  <span class="text-caption text-ink-subtle font-mono shrink-0">{{ clock(node.ev.timestamp) }}</span>
                </div>
                <div v-else class="flex justify-between items-baseline gap-3 pt-1">
                  <span class="text-body-sm text-ink-muted break-all">{{ describe(node.ev) }}</span>
                  <span class="text-caption text-ink-subtle font-mono shrink-0">{{ clock(node.ev.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-body-sm text-ink-subtle py-2">No detailed events recorded.</p>
        </div>
      </div>
    </div>
    <p v-else class="text-body-sm text-ink-subtle text-center py-10 bg-surface-1 border border-dashed border-hairline-strong rounded-lg">
      No sessions recorded yet. Data appears once users visit your site.
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({
  projectId: { type: String, default: '' }
})

const { data, refresh, status } = await useFetch('/api/sessions', {
  query: computed(() => ({ pid: props.projectId }))
})
const sessions = computed<any[]>(() => (data.value as any)?.sessions ?? [])
const total = computed<number>(() => (data.value as any)?.total ?? 0)

const open = ref<string | null>(null)
const loading = ref(false)
const timeline = ref<any[]>([])

// Gaps shorter than this (tab flicks) are merged silently without a marker.
const AWAY_GAP_MS = 60_000

const pages = computed(() => {
  const groups: any[] = []
  let current: any = null

  function finalize() {
    if (!current) return
    // Skip empty groups produced by stray page_leave events.
    if (current.events.length || current.hasPageview) groups.push(current)
    current = null
  }

  function startGroup(path: string, ts: number) {
    current = {
      path,
      start: ts,
      end: ts,
      ms: null as number | null,
      maxScroll: null as number | null,
      leftAt: null as number | null,
      hasPageview: false,
      events: [] as any[]
    }
  }

  // If activity resumes after the user was away a while (e.g. switched tabs
  // and came back), show an inline "away" marker instead of a silent gap.
  function markReturn(ts: number) {
    if (!current?.leftAt) return
    const gap = ts - current.leftAt
    if (gap >= AWAY_GAP_MS) {
      current.events.push({ type: 'away', timestamp: ts, data: { duration: gap } })
    }
    current.leftAt = null
  }

  for (const ev of timeline.value) {
    if (ev.type === 'page_leave') {
      // Checkpoint, not a boundary: update duration/scroll on the open group.
      if (!current) continue
      const t = ev.data?.timeOnPage
      if (t != null) current.ms = t
      const scroll = ev.data?.maxScroll
      if (scroll != null) current.maxScroll = Math.max(current.maxScroll ?? 0, scroll)
      current.leftAt = ev.timestamp
      current.end = ev.timestamp
      continue
    }
    // Skip scroll events — maxScroll is shown on page header via page_leave
    if (ev.type === 'scroll') continue

    if (ev.type === 'pageview') {
      // Every pageview is a real page load — start a fresh visit.
      finalize()
      startGroup(ev.path || ev.url || '/', ev.timestamp)
      current.hasPageview = true
      current.end = ev.timestamp
      continue
    }

    if (!current) startGroup(ev.path || ev.url || '/', ev.timestamp)
    markReturn(ev.timestamp)
    current.events.push(ev)
    current.end = ev.timestamp
  }
  finalize()

  return groups.map((g) => ({
    path: g.path,
    events: g.events,
    duration: fmtDuration(g.ms ?? (g.end - g.start)),
    maxScroll: g.maxScroll
  }))
})

// Flatten grouped pages into a single stream of timeline nodes so one
// continuous rail runs through page milestones and their interactions.
const journey = computed(() => {
  const nodes: any[] = []
  for (const pg of pages.value) {
    nodes.push({ kind: 'page', path: pg.path, duration: pg.duration, maxScroll: pg.maxScroll })
    for (const ev of pg.events) nodes.push({ kind: 'event', ev })
  }
  return nodes
})

function fmtDuration(ms: number) {
  if (!ms || ms < 0) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

async function toggle(session: any) {
  if (open.value === session.sessionId) {
    open.value = null
    return
  }
  open.value = session.sessionId
  timeline.value = []
  loading.value = true
  try {
    const data = await $fetch(`/api/sessions/${session.sessionId}`, { query: { pid: props.projectId } })
    timeline.value = (data as any).events || []
  } finally {
    loading.value = false
  }
}

function describe(ev: any) {
  if (ev.type === 'away') return `away for ${fmtDuration(ev.data?.duration)}`
  if (ev.type === 'pageview') return ev.path || ev.url
  if (ev.type === 'click') {
    const el = ev.data?.element
    return el ? `${el.tag}${el.id ? '#' + el.id : ''}${el.text ? ' — "' + el.text + '"' : ''}` : 'click'
  }
  if (ev.type === 'scroll') return `scrolled ${ev.data?.depth ?? ev.data?.maxDepth ?? 0}%`
  if (ev.type === 'form_focus') {
    const el = ev.data?.element
    return el ? `focused ${fieldLabel(el)}` : 'focused a field'
  }
  if (ev.type === 'form_submit') {
    const el = ev.data?.element
    const id = elementId(el)
    if (id) return `submitted form ${id}`
    const text = el?.text?.trim()
    if (text) return `submitted "${text}" form`
    if (ev.data?.action) {
      const method = (ev.data.method || 'get').toUpperCase()
      return `submitted form → ${urlPath(ev.data.action)} (${method})`
    }
    return 'submitted a form'
  }
  if (ev.type === 'section_view') {
    const name = ev.data?.section || 'unknown'
    const dur = ev.data?.duration
    const engaged = ev.data?.engaged
    const time = dur != null ? fmtDuration(dur) : ''
    if (engaged) return `${name} · ${time}`
    return `${name} · ${time || '0s'} · skimmed`
  }
  return JSON.stringify(ev.data || {})
}

// Most identifying handle for an element: name, then #id, then .class.
function elementId(el: any) {
  if (!el) return ''
  if (el.name) return el.name
  if (el.id) return '#' + el.id
  if (el.classes?.length) return '.' + el.classes[0]
  return ''
}

function urlPath(url: string) {
  try {
    return new URL(url).pathname || url
  } catch {
    return url
  }
}

function fieldLabel(el: any) {
  const kind = el.type || (el.tag === 'textarea' ? 'textarea' : el.tag === 'select' ? 'select' : 'text')
  // Prefer a human-readable handle: label, placeholder, name/#id/.class.
  const name = el.label || el.placeholder || elementId(el)
  return name ? `${name} (${kind})` : `${kind} field`
}

function clock(ts: number) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString()
}

function formatTime(date: string) {
  if (!date) return ''
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}
</script>
