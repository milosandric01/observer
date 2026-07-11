<template>
  <NuxtLayout>
    <div>
      <header class="mb-8 relative">
        <h2 class="text-headline">Live Activity</h2>
        <p class="text-body-sm text-ink-subtle mt-1">Real-time user actions as they happen</p>
        <span class="absolute top-1 right-0 text-success text-body-sm font-medium animate-pulse">● Live</span>
      </header>

      <div class="flex flex-col gap-1.5">
        <div v-for="event in events" :key="event.id" class="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 bg-surface-1 border border-hairline rounded-md text-body-sm">
          <div class="flex items-center gap-3">
            <span class="font-semibold text-eyebrow uppercase px-2 py-0.5 rounded-xs bg-surface-2 text-ink-subtle min-w-[80px] text-center" :class="{ 'text-primary': event.type === 'click', 'text-success': event.type === 'pageview' }">{{ event.type }}</span>
            <span class="text-ink-muted font-mono truncate">{{ event.path }}</span>
          </div>
          <div class="flex items-center gap-3 sm:flex-1 pl-0 sm:pl-0">
            <span class="text-ink-subtle flex-1 truncate">{{ event.detail }}</span>
            <span class="text-caption text-ink-subtle shrink-0">{{ event.time }}</span>
          </div>
        </div>
        <UiEmptyState v-if="!events.length">
          Waiting for live events...
        </UiEmptyState>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const events = ref<any[]>([])

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  interval = setInterval(() => {
    // Future: implement real-time feed via SSE or WebSocket
  }, 2000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
