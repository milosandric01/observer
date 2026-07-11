<template>
  <NuxtLayout>
    <div>
      <header class="mb-8">
        <h2 class="text-headline">Overview</h2>
        <p class="text-body-sm text-ink-subtle mt-1">{{ currentProjectName || 'Real-time user behavior' }}</p>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <UiCard class="flex flex-col gap-2">
          <span class="text-caption font-medium text-ink-subtle uppercase tracking-wide">Total Sessions</span>
          <span class="text-display-md">{{ stats.totalSessions }}</span>
        </UiCard>
        <UiCard class="flex flex-col gap-2">
          <span class="text-caption font-medium text-ink-subtle uppercase tracking-wide">Active Now</span>
          <span class="text-display-md text-success">{{ stats.activeNow }}</span>
        </UiCard>
        <UiCard class="flex flex-col gap-2">
          <span class="text-caption font-medium text-ink-subtle uppercase tracking-wide">Pageviews Today</span>
          <span class="text-display-md">{{ stats.pageviewsToday }}</span>
        </UiCard>
        <UiCard class="flex flex-col gap-2">
          <span class="text-caption font-medium text-ink-subtle uppercase tracking-wide">Avg. Scroll Depth</span>
          <span class="text-display-md">{{ stats.avgScroll }}%</span>
        </UiCard>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <AreaChart title="Sessions" :data="chartSessions" />
        <AreaChart title="Pageviews" :data="chartPageviews" />
      </div>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-body-lg font-semibold">Recent Sessions</h3>
          <span class="text-caption text-ink-subtle">{{ sessionTotal }} total</span>
        </div>

        <div v-if="sessions.length" class="border border-hairline rounded-lg overflow-hidden bg-surface-1">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-hairline">
                <th class="px-5 py-3 text-caption font-medium text-ink-subtle uppercase tracking-wide">Visitor</th>
                <th class="px-5 py-3 text-caption font-medium text-ink-subtle uppercase tracking-wide">Source</th>
                <th class="px-5 py-3 text-caption font-medium text-ink-subtle uppercase tracking-wide text-center">Device</th>
                <th class="px-5 py-3 text-caption font-medium text-ink-subtle uppercase tracking-wide text-right">Last seen</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="session in sessions"
                :key="session.sessionId"
                class="border-b border-hairline last:border-b-0 hover:bg-surface-2/40 transition-colors"
              >
                <!-- Visitor -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <UiAvatar :visitor-id="session.visitor" :size="44" />
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-body-sm text-ink font-medium capitalize truncate">{{ visitorName(session.visitor) }}</span>
                        <span v-if="session.country" class="shrink-0 leading-none text-[16px]" :title="session.country">{{ countryFlag(session.country) }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-caption text-ink-subtle">
                        <template v-if="session.os">
                          <UiTechIcon :name="session.os" type="os" :size="13" />
                          <span>{{ session.os }}</span>
                        </template>
                        <span v-if="session.os && session.browser" class="text-ink-tertiary">·</span>
                        <template v-if="session.browser">
                          <UiTechIcon :name="session.browser" type="browser" :size="13" />
                          <span>{{ session.browser }}</span>
                        </template>
                        <span v-if="!session.os && !session.browser">—</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Source -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <UiFavicon v-if="session.source && session.source !== 'Direct' && sourceHost(session.referrerUrl)" :domain="sourceHost(session.referrerUrl)" :size="16" />
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-ink-subtle shrink-0">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
                    </svg>
                    <span class="text-body-sm truncate" :class="session.source === 'Direct' ? 'text-ink-subtle' : 'text-ink-muted'">{{ session.source || 'Direct' }}</span>
                  </div>
                </td>

                <!-- Device -->
                <td class="px-5 py-3">
                  <div class="flex items-center justify-center gap-1.5 text-ink-muted" :title="session.device">
                    <UiDeviceIcon :type="session.device" :size="17" />
                  </div>
                </td>

                <!-- Last seen -->
                <td class="px-5 py-3 text-right whitespace-nowrap">
                  <span class="text-caption text-ink-subtle">{{ timeAgo(session.lastSeenAt) }}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-hairline">
            <span class="text-caption text-ink-subtle">Page {{ page }} of {{ totalPages }}</span>
            <div class="flex items-center gap-2">
              <UiButton variant="secondary" size="sm" :disabled="page <= 1" @click="goToPage(page - 1)">Previous</UiButton>
              <UiButton variant="secondary" size="sm" :disabled="page >= totalPages" @click="goToPage(page + 1)">Next</UiButton>
            </div>
          </div>
        </div>

        <UiEmptyState v-else>
          No sessions yet. Add the tracking script to start collecting data.
        </UiEmptyState>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const stats = ref({
  totalSessions: 0,
  activeNow: 0,
  pageviewsToday: 0,
  avgScroll: 0
})

const sessions = ref<any[]>([])
const chartSessions = ref<Array<{ date: string; value: number }>>([])
const chartPageviews = ref<Array<{ date: string; value: number }>>([])

// Sessions pagination
const page = ref(1)
const pageSize = 20
const totalPages = ref(1)
const sessionTotal = ref(0)

// Shared project state (set by the layout sidebar selector)
const projects = useState<any[]>('projects', () => [])
const selectedProjectId = useState<string>('selectedProjectId', () => '')

const currentProjectName = computed(() =>
  projects.value.find((p: any) => p.id === selectedProjectId.value)?.name || ''
)

async function loadStats() {
  const projectId = selectedProjectId.value
  if (!projectId) return

  const projectData = await $fetch('/api/projects/' + projectId) as any
  if (projectData) {
    const recent = projectData.sessions || []
    stats.value.totalSessions = projectData.totalSessions || 0

    const now = Date.now()
    const fiveMinAgo = now - 5 * 60 * 1000
    stats.value.activeNow = recent.filter(
      (s: any) => new Date(s.lastSeenAt).getTime() > fiveMinAgo
    ).length

    const today = new Date().toISOString().slice(0, 10)
    stats.value.pageviewsToday = recent
      .filter((s: any) => s.startedAt?.startsWith(today))
      .reduce((sum: number, s: any) => sum + (s.pageviews?.length || 0), 0)

    const scrolls = recent.filter((s: any) => s.maxScroll > 0)
    stats.value.avgScroll = scrolls.length
      ? Math.round(scrolls.reduce((sum: number, s: any) => sum + s.maxScroll, 0) / scrolls.length)
      : 0
  }
}

async function loadSessions() {
  const projectId = selectedProjectId.value
  if (!projectId) return

  const data = await $fetch('/api/sessions', {
    query: { pid: projectId, page: page.value, pageSize },
  }) as any
  if (data) {
    sessions.value = data.sessions || []
    totalPages.value = data.totalPages || 1
    sessionTotal.value = data.total || 0
  }
}

async function loadChart() {
  const projectId = selectedProjectId.value
  if (!projectId) return

  const dailyData = await $fetch('/api/stats/daily', { query: { pid: projectId, days: 14 } }) as any
  if (Array.isArray(dailyData)) {
    chartSessions.value = dailyData.map((d: any) => ({ date: d.date, value: d.sessions }))
    chartPageviews.value = dailyData.map((d: any) => ({ date: d.date, value: d.pageviews }))
  }
}

async function loadProjectData() {
  page.value = 1
  try {
    await Promise.all([loadStats(), loadSessions(), loadChart()])
  } catch (_e) {
    // Failed to load project data
  }
}

function goToPage(p: number) {
  page.value = p
  loadSessions()
}

// React to project switches from the sidebar
watch(selectedProjectId, () => {
  loadProjectData()
})

function timeAgo(date: string) {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago'
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago'
  return Math.floor(seconds / 86400) + 'd ago'
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CA: '🇨🇦', AU: '🇦🇺',
  NL: '🇳🇱', SE: '🇸🇪', JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳', PL: '🇵🇱',
  ES: '🇪🇸', KR: '🇰🇷', IT: '🇮🇹', PT: '🇵🇹', CH: '🇨🇭', AT: '🇦🇹',
  MX: '🇲🇽', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', CN: '🇨🇳', RU: '🇷🇺',
  TW: '🇹🇼', SG: '🇸🇬', HK: '🇭🇰', IE: '🇮🇪', NO: '🇳🇴', DK: '🇩🇰',
  FI: '🇫🇮', BE: '🇧🇪', NZ: '🇳🇿', ZA: '🇿🇦', IL: '🇮🇱', TR: '🇹🇷',
}

function countryFlag(code: string) {
  return COUNTRY_FLAGS[code] || code
}

function sourceHost(url: string) {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch { return '' }
}

function visitorName(id: string) {
  return visitorIdentity(id).name
}

// Initial load (selectedProjectId is set by the layout)
if (selectedProjectId.value) {
  await loadProjectData()
}
</script>
