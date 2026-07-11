<template>
  <div class="flex min-h-screen">
    <!-- Mobile header -->
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-surface-1 border-b border-hairline lg:hidden">
      <UiLogo :size="20" />
      <button class="text-ink-subtle p-2" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-overlay/60 z-40 lg:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside :class="['w-60 bg-surface-1 border-r border-hairline p-6 fixed top-0 left-0 bottom-0 overflow-y-auto z-50 transition-transform duration-200', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
      <div class="px-3 mb-5">
        <UiLogo :size="22" />
      </div>

      <!-- Project selector -->
      <div v-if="projects.length" class="mb-6">
        <UiSelect
          :model-value="selectedProjectId"
          :options="projectOptions"
          placeholder="Select project"
          @update:model-value="selectProject"
        />
      </div>

      <nav class="flex flex-col gap-1">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2" @click="sidebarOpen = false">
          <span class="text-base opacity-70">◉</span>
          Overview
        </NuxtLink>
        <NuxtLink to="/live" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2" @click="sidebarOpen = false">
          <span class="text-base opacity-70">●</span>
          Live
        </NuxtLink>
        <NuxtLink to="/settings" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2" @click="sidebarOpen = false">
          <span class="text-base opacity-70">⚙</span>
          Settings
        </NuxtLink>
      </nav>
    </aside>
    <main class="flex-1 lg:ml-60 p-5 pt-20 lg:p-8 lg:pt-8 lg:px-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)

// Shared project state across the app
const projects = useState<any[]>('projects', () => [])
const selectedProjectId = useState<string>('selectedProjectId', () => '')

const projectOptions = computed(() =>
  projects.value.map((p: any) => ({ value: p.id, label: p.name, domain: p.domain }))
)

function selectProject(id: string) {
  selectedProjectId.value = id
}

// Load projects once for the selector
const { data: projectsData } = await useFetch('/api/projects')
if (projectsData.value?.length) {
  projects.value = projectsData.value
  if (!selectedProjectId.value) {
    selectedProjectId.value = projectsData.value[0].id
  }
}
</script>
