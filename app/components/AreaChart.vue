<template>
  <div class="bg-surface-1 border border-hairline rounded-lg p-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h3 class="text-body-lg font-semibold">{{ title }}</h3>
        <p class="text-caption text-ink-subtle mt-0.5">Last {{ data.length }} days</p>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-display-md">{{ total }}</span>
        <span v-if="trend !== 0" class="text-body-sm font-medium" :class="trend > 0 ? 'text-success' : 'text-[#eb5757]'">
          {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
        </span>
      </div>
    </div>
    <div class="relative" style="height: 180px;">
      <svg v-if="data.length" :viewBox="`0 0 ${width} ${height}`" class="w-full h-full" preserveAspectRatio="none">
        <!-- Grid lines -->
        <line v-for="i in 4" :key="'g'+i"
          :x1="0" :y1="height * i / 4" :x2="width" :y2="height * i / 4"
          stroke="currentColor" class="text-hairline" stroke-width="1" />
        <!-- Area gradient -->
        <defs>
          <linearGradient :id="'grad-'+uid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5e6ad2" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#5e6ad2" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <!-- Area fill -->
        <path :d="areaPath" :fill="`url(#grad-${uid})`" />
        <!-- Line -->
        <path :d="linePath" fill="none" stroke="#5e6ad2" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <!-- Dots on hover points -->
        <circle v-for="(pt, i) in points" :key="i"
          :cx="pt.x" :cy="pt.y" r="3"
          fill="#5e6ad2" class="opacity-0 hover:opacity-100 transition-opacity" />
      </svg>
    </div>
    <!-- X-axis labels -->
    <div class="flex justify-between mt-2 text-caption text-ink-subtle">
      <span>{{ formatLabel(data[0]?.date) }}</span>
      <span v-if="data.length > 7">{{ formatLabel(data[Math.floor(data.length / 2)]?.date) }}</span>
      <span>{{ formatLabel(data[data.length - 1]?.date) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  data: Array<{ date: string; value: number }>
}>()

const uid = Math.random().toString(36).slice(2, 8)
const width = 800
const height = 180
const padding = 4

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

const trend = computed(() => {
  const half = Math.floor(props.data.length / 2)
  const recent = props.data.slice(half).reduce((s, d) => s + d.value, 0)
  const prev = props.data.slice(0, half).reduce((s, d) => s + d.value, 0)
  if (!prev) return recent > 0 ? 100 : 0
  return Math.round(((recent - prev) / prev) * 100)
})

const points = computed(() => {
  const max = Math.max(...props.data.map(d => d.value), 1)
  const step = (width - padding * 2) / Math.max(props.data.length - 1, 1)
  return props.data.map((d, i) => ({
    x: padding + i * step,
    y: padding + (height - padding * 2) * (1 - d.value / max),
  }))
})

const linePath = computed(() => {
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  return `${line} L${pts[pts.length - 1].x},${height} L${pts[0].x},${height} Z`
})

function formatLabel(date?: string) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
