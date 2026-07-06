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
                  <span class="text-caption text-ink-subtle font-mono shrink-0">{{ node.duration }}</span>
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

const pages = computed(() => {
  const groups: any[] = []
  let current: any = null

  function finalize(end: number, ms: number | null) {
    if (!current) return
    current.end = end
    current.ms = ms
    // Skip empty sections produced by consecutive page_leave events.
    if (current.events.length || current.hasPageview) groups.push(current)
    current = null
  }

  for (const ev of timeline.value) {
    if (ev.type === 'page_leave') {
      // page_leave ends the current page visit. Don't list it as an event;
      // the next activity (or pageview) starts a fresh section.
      const t = ev.data?.timeOnPage
      finalize(ev.timestamp, t != null ? t : null)
      continue
    }
    if (!current) {
      current = {
        path: ev.path || ev.url || '/',
        start: ev.timestamp,
        end: ev.timestamp,
        ms: null as number | null,
        hasPageview: false,
        events: [] as any[]
      }
    }
    if (ev.type === 'pageview') {
      current.path = ev.path || ev.url || current.path
      current.hasPageview = true
    } else {
      current.events.push(ev)
    }
    current.end = ev.timestamp
  }
  finalize(current?.end ?? 0, null)

  return groups.map((g) => ({
    path: g.path,
    events: g.events,
    duration: fmtDuration(g.ms ?? (g.end - g.start))
  }))
})

// Flatten grouped pages into a single stream of timeline nodes so one
// continuous rail runs through page milestones and their interactions.
const journey = computed(() => {
  const nodes: any[] = []
  for (const pg of pages.value) {
    nodes.push({ kind: 'page', path: pg.path, duration: pg.duration })
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
