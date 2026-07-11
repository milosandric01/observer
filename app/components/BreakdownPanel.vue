<template>
  <div class="border border-hairline rounded-lg bg-canvas overflow-hidden flex flex-col px-2 pt-2 pb-3">
    <!-- Header: tabs (or single heading) + Visitors -->
    <div class="flex items-center justify-between gap-2 px-3.5 pt-3 pb-3.5">
      <!-- Multiple tabs -->
      <div v-if="tabs.length > 1" class="flex items-center gap-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-3.5 py-1.5 rounded-md text-[13.5px] whitespace-nowrap transition-colors"
          :class="tab.key === activeKey ? 'bg-white/[0.06] text-ink font-semibold' : 'text-ink-subtle font-medium hover:text-ink'"
          @click="activeKey = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <!-- Single tab renders as a heading -->
      <span v-else class="text-[15px] font-semibold text-ink">{{ tabs[0]?.label }}</span>

      <span class="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider shrink-0 pr-1.5">Visitors</span>
    </div>

    <!-- Rows -->
    <div class="flex-1 px-1.5">
      <div v-if="allItems.length" class="flex flex-col gap-1.5 min-h-[254px]">
        <div
          v-for="item in activeItems"
          :key="item.label"
          class="relative shrink-0 w-full h-[46px] rounded-[10px] overflow-hidden flex items-center"
        >
          <!-- Bar background (full row height) -->
          <div
            class="absolute inset-0 left-0 bg-primary/[0.22] rounded-[10px] transition-all"
            :style="{ width: barWidth(item.value) + '%' }"
          />
          <!-- Content -->
          <div class="relative flex items-center justify-between w-full px-4 gap-3">
            <span class="flex items-center gap-2.5 min-w-0 text-[14.5px] text-ink">
              <UiFavicon v-if="activeTab.icon === 'favicon' && item.domain" :domain="item.domain" :size="18" />
              <span v-else-if="activeTab.icon === 'flag' && item.country" class="text-[18px] leading-none">{{ item.country }}</span>
              <UiTechIcon v-else-if="activeTab.icon === 'browser'" :name="item.label" type="browser" :size="16" />
              <UiTechIcon v-else-if="activeTab.icon === 'os'" :name="item.label" type="os" :size="16" />
              <UiDeviceIcon v-else-if="activeTab.icon === 'device'" :type="item.label" :size="16" class="text-ink-subtle" />
              <svg v-else-if="activeTab.icon === 'path'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-ink-subtle shrink-0">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M9 13h6M9 17h4" />
              </svg>
              <span class="truncate" :class="{ 'font-mono text-[13px]': activeTab.icon === 'path' }">{{ item.label }}</span>
            </span>
            <span class="text-[15px] font-semibold text-ink shrink-0">{{ formatValue(item.value) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="min-h-[254px] flex items-center justify-center text-caption text-ink-subtle">No data yet</div>
    </div>

    <!-- Pagination (space always reserved to keep height consistent) -->
    <div class="flex items-center justify-between px-4 pt-3 mt-1 h-[40px]">
      <template v-if="totalPages > 1">
        <span class="text-[11px] text-ink-tertiary">Page {{ page }} of {{ totalPages }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-md border border-hairline text-ink-subtle hover:text-ink hover:border-hairline-strong disabled:opacity-40 disabled:hover:text-ink-subtle disabled:hover:border-hairline transition-colors"
            :disabled="page <= 1"
            aria-label="Previous"
            @click="page--"
          >‹</button>
          <button
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded-md border border-hairline text-ink-subtle hover:text-ink hover:border-hairline-strong disabled:opacity-40 disabled:hover:text-ink-subtle disabled:hover:border-hairline transition-colors"
            :disabled="page >= totalPages"
            aria-label="Next"
            @click="page++"
          >›</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Item {
  label: string
  value: number
  domain?: string
  country?: string
}
interface Tab {
  key: string
  label: string
  icon: 'favicon' | 'flag' | 'browser' | 'os' | 'device' | 'path' | 'none'
  items: Item[]
}

const props = defineProps<{
  tabs: Tab[]
}>()

const PAGE_SIZE = 5

const activeKey = ref(props.tabs[0]?.key || '')
const page = ref(1)

const activeTab = computed(() =>
  props.tabs.find(t => t.key === activeKey.value) || props.tabs[0]
)
const allItems = computed(() => activeTab.value?.items || [])

const totalPages = computed(() => Math.max(1, Math.ceil(allItems.value.length / PAGE_SIZE)))

const activeItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return allItems.value.slice(start, start + PAGE_SIZE)
})

// Scale bars against the top value across all pages, so widths stay comparable
const maxValue = computed(() =>
  Math.max(...allItems.value.map(i => i.value), 1)
)

// Reset to first page when switching tabs
watch(activeKey, () => { page.value = 1 })

function setTab(key: string) {
  activeKey.value = key
}

function barWidth(value: number) {
  return Math.max((value / maxValue.value) * 100, 2)
}

function formatValue(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(value)
}
</script>
