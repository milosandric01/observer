<template>
  <div class="bg-surface-1 border border-hairline rounded-lg px-6 pt-6 pb-5">
    <!-- Metrics strip -->
    <div class="flex flex-wrap gap-x-9 gap-y-4 pb-5 mb-6 border-b border-hairline">
      <div v-for="m in metrics" :key="m.label">
        <div class="text-caption text-ink-subtle mb-2">{{ m.label }}</div>
        <div class="text-[24px] font-semibold tracking-tight leading-none mb-1.5" :class="m.accent ? 'text-success' : 'text-ink'">
          {{ m.value }}
        </div>
        <div v-if="m.trend != null" class="flex items-center gap-1 text-caption font-medium"
          :class="m.trend >= 0 ? 'text-success' : 'text-[#eb5757]'">
          {{ m.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(m.trend) }}%
        </div>
      </div>
    </div>

    <!-- Chart header -->
    <div class="flex items-baseline justify-between mb-4">
      <div class="text-caption text-ink-tertiary">Sessions &amp; pageviews · Last {{ sessions.length }} days</div>
      <div class="flex items-center gap-4 text-caption text-ink-subtle">
        <span class="flex items-center gap-1.5">
          <span class="inline-block rounded-sm" style="width:9px;height:2.5px;background:#7b85dd;" />Sessions
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block rounded-sm" style="width:9px;height:9px;background:rgba(94,106,210,0.35);" />Pageviews
        </span>
      </div>
    </div>

    <!-- Chart -->
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="230" preserveAspectRatio="none" style="display:block;overflow:visible;">
      <line v-for="gy in gridLines" :key="gy" :x1="0" :y1="gy" :x2="W" :y2="gy" stroke="currentColor" class="text-hairline" stroke-width="1" />

      <rect v-for="(bar, i) in bars" :key="'b'+i"
        :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" rx="3" fill="rgba(94,106,210,0.30)" />

      <polyline :points="linePoints" fill="none" stroke="#7b85dd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      <circle v-for="(pt, i) in points" :key="'p'+i" :cx="pt.x" :cy="pt.y" r="3.5" fill="#0b0c0e" stroke="#7b85dd" stroke-width="2" />
    </svg>

    <!-- Date axis -->
    <div class="flex items-center justify-between mt-3 text-caption text-ink-tertiary">
      <span>{{ formatDate(sessions[0]?.date) }}</span>
      <span v-if="sessions.length > 6">{{ formatDate(sessions[Math.floor(sessions.length / 2)]?.date) }}</span>
      <span>{{ formatDate(sessions[sessions.length - 1]?.date) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Point { date: string; value: number }
interface Metric { label: string; value: string; accent?: boolean; trend?: number | null }

const props = defineProps<{
  metrics: Metric[]
  sessions: Point[]
  pageviews: Point[]
}>()

const W = 600
const H = 210
const baseline = 205
const chartH = 165 // max drawable height for bars/line

const gridLines = [20, 85, 150]

const maxPageviews = computed(() => Math.max(...props.pageviews.map(p => p.value), 1))
const maxSessions = computed(() => Math.max(...props.sessions.map(s => s.value), 1))

const bars = computed(() => {
  const n = props.pageviews.length
  if (!n) return []
  const slot = W / n
  const width = Math.min(slot * 0.62, 26)
  return props.pageviews.map((p, i) => {
    const height = (p.value / maxPageviews.value) * chartH
    return {
      x: i * slot + (slot - width) / 2,
      y: baseline - height,
      width,
      height: Math.max(height, 1),
    }
  })
})

const points = computed(() => {
  const n = props.sessions.length
  if (!n) return []
  const step = n > 1 ? W / (n - 1) : 0
  return props.sessions.map((s, i) => ({
    x: i * step,
    y: 15 + (1 - s.value / maxSessions.value) * (baseline - 15 - 5),
  }))
})

const linePoints = computed(() => points.value.map(p => `${p.x},${p.y}`).join(' '))

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
