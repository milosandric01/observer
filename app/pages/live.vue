<template>
  <NuxtLayout>
    <div>
      <header class="mb-8 relative">
        <h2 class="text-headline">Live Activity</h2>
        <p class="text-body-sm text-ink-subtle mt-1">Real-time user actions as they happen</p>
        <span class="absolute top-1 right-0 text-success text-body-sm font-medium animate-pulse">● Live</span>
      </header>

      <div class="flex flex-col gap-1.5">
        <div v-for="event in events" :key="event.id" class="flex items-center gap-3 px-4 py-3 bg-surface-1 border border-hairline rounded-md text-body-sm">
          <span class="font-semibold text-eyebrow uppercase px-2 py-0.5 rounded-xs bg-surface-2 text-ink-subtle min-w-[80px] text-center" :class="{ 'text-primary': event.type === 'click', 'text-success': event.type === 'pageview' }">{{ event.type }}</span>
          <span class="text-ink-muted font-mono">{{ event.path }}</span>
          <span class="text-ink-subtle flex-1">{{ event.detail }}</span>
          <span class="text-caption text-ink-subtle">{{ event.time }}</span>
        </div>
        <p v-if="!events.length" class="text-body-sm text-ink-subtle text-center py-10 bg-surface-1 border border-dashed border-hairline-strong rounded-lg">
          Waiting for live events...
        </p>
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
