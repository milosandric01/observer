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
        <h3 class="text-body-lg font-semibold mb-4">Recent Sessions</h3>
        <div v-if="sessions.length" class="flex flex-col gap-2">
          <UiCard v-for="session in sessions" :key="session.sessionId" padding="none" class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-4 py-3.5">
            <div class="flex items-center gap-3">
              <span class="font-mono text-body-sm text-primary">{{ session.visitor?.slice(0, 8) }}</span>
              <span class="text-body-sm text-ink-muted">{{ session.pageviews?.length || 0 }} pages</span>
            </div>
            <div class="flex items-center gap-4 text-body-sm text-ink-subtle">
              <span>{{ session.totalClicks }} clicks</span>
              <span>↓ {{ session.maxScroll }}%</span>
              <span>{{ timeAgo(session.lastSeenAt) }}</span>
            </div>
          </UiCard>
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

// Shared project state (set by the layout sidebar selector)
const projects = useState<any[]>('projects', () => [])
const selectedProjectId = useState<string>('selectedProjectId', () => '')

const currentProjectName = computed(() =>
  projects.value.find((p: any) => p.id === selectedProjectId.value)?.name || ''
)

async function loadProjectData() {
  const projectId = selectedProjectId.value
  if (!projectId) return

  try {
    const projectData = await $fetch('/api/projects/' + projectId)
    if (projectData) {
      sessions.value = (projectData as any).sessions || []
      stats.value.totalSessions = (projectData as any).totalSessions || 0

      const now = Date.now()
      const fiveMinAgo = now - 5 * 60 * 1000
      stats.value.activeNow = sessions.value.filter(
        (s: any) => new Date(s.lastSeenAt).getTime() > fiveMinAgo
      ).length

      const today = new Date().toISOString().slice(0, 10)
      stats.value.pageviewsToday = sessions.value
        .filter((s: any) => s.startedAt?.startsWith(today))
        .reduce((sum: number, s: any) => sum + (s.pageviews?.length || 0), 0)

      const scrolls = sessions.value.filter((s: any) => s.maxScroll > 0)
      stats.value.avgScroll = scrolls.length
        ? Math.round(scrolls.reduce((sum: number, s: any) => sum + s.maxScroll, 0) / scrolls.length)
        : 0
    }

    const dailyData = await $fetch('/api/stats/daily', { query: { pid: projectId, days: 14 } })
    if (dailyData && Array.isArray(dailyData)) {
      chartSessions.value = dailyData.map((d: any) => ({ date: d.date, value: d.sessions }))
      chartPageviews.value = dailyData.map((d: any) => ({ date: d.date, value: d.pageviews }))
    }
  } catch (_e) {
    // Failed to load project data
  }
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

// Initial load (selectedProjectId is set by the layout)
if (selectedProjectId.value) {
  await loadProjectData()
}
</script>
