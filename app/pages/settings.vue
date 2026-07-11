<template>
  <NuxtLayout>
    <div class="max-w-3xl">
      <header class="mb-8">
        <h2 class="text-headline">Settings</h2>
        <p class="text-body-sm text-ink-subtle mt-1">Manage your project</p>
      </header>

      <!-- Current project -->
      <section v-if="currentProject" class="space-y-8">

        <!-- Project info -->
        <UiCard>
          <div class="flex items-center gap-3 mb-1">
            <UiFavicon :domain="currentProject.domain" :name="currentProject.name" :size="40" framed />
            <div>
              <h4 class="text-body-lg font-semibold">{{ currentProject.name }}</h4>
              <p class="text-body-sm text-ink-subtle">{{ currentProject.domain }}</p>
            </div>
          </div>
        </UiCard>

        <!-- Tracking script -->
        <UiCard>
          <h3 class="text-body-lg font-semibold mb-1">Tracking Script</h3>
          <p class="text-body-sm text-ink-muted mb-4">Add this to your site's <code class="text-caption bg-surface-2 px-1.5 py-0.5 rounded-xs">&lt;head&gt;</code>:</p>
          <div class="bg-surface-2 border border-hairline rounded-md px-4 py-3 relative overflow-x-auto">
            <code v-text="snippet" class="text-body-sm text-ink-muted break-all"></code>
            <UiButton variant="secondary" size="sm" class="absolute top-2.5 right-2.5 !text-caption" @click="copySnippet">{{ copied ? 'Copied' : 'Copy' }}</UiButton>
          </div>
        </UiCard>

        <!-- Danger zone -->
        <UiCard class="!border-[#eb5757]/20">
          <h3 class="text-body-lg font-semibold text-[#eb5757] mb-1">Danger Zone</h3>
          <p class="text-body-sm text-ink-muted mb-4">Permanently delete this project and all its data (sessions, events). This cannot be undone.</p>
          <UiButton variant="danger" @click="confirmDelete = true">Delete project</UiButton>
        </UiCard>

        <!-- Add new project -->
        <div class="pt-4 border-t border-hairline">
          <UiButton variant="secondary" @click="showCreate = true">+ Add new project</UiButton>
        </div>

      </section>

      <!-- No project selected -->
      <UiEmptyState v-else>
        No project selected. Create one to get started.
        <div class="mt-4">
          <UiButton @click="showCreate = true">+ New Project</UiButton>
        </div>
      </UiEmptyState>

      <!-- Create modal -->
      <div v-if="showCreate" class="fixed inset-0 bg-overlay/60 flex items-center justify-center z-50 p-4" @click.self="showCreate = false">
        <UiCard padding="lg" class="w-full max-w-md !rounded-xl">
          <h3 class="text-card-title mb-6">Create Project</h3>
          <form @submit.prevent="createProject">
            <UiInput v-model="form.name" label="Project Name" placeholder="My Landing Page" required class="mb-4" />
            <UiInput v-model="form.domain" label="Domain" placeholder="example.com" required class="mb-4" />
            <div class="flex justify-end gap-2.5 mt-6">
              <UiButton variant="secondary" @click="showCreate = false">Cancel</UiButton>
              <UiButton type="submit">Create</UiButton>
            </div>
          </form>
        </UiCard>
      </div>

      <!-- Delete confirmation -->
      <div v-if="confirmDelete" class="fixed inset-0 bg-overlay/60 flex items-center justify-center z-50 p-4" @click.self="confirmDelete = false">
        <UiCard padding="lg" class="w-full max-w-md !rounded-xl">
          <h3 class="text-card-title mb-2">Delete "{{ currentProject?.name }}"?</h3>
          <p class="text-body-sm text-ink-muted mb-6">All sessions and events for this project will be permanently removed.</p>
          <div class="flex justify-end gap-2.5">
            <UiButton variant="secondary" @click="confirmDelete = false">Cancel</UiButton>
            <UiButton variant="danger" @click="deleteProject">Delete</UiButton>
          </div>
        </UiCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const projects = useState<any[]>('projects', () => [])
const selectedProjectId = useState<string>('selectedProjectId', () => '')

const showCreate = ref(false)
const confirmDelete = ref(false)
const copied = ref(false)
const form = ref({ name: '', domain: '' })

const currentProject = computed(() =>
  projects.value.find((p: any) => p.id === selectedProjectId.value)
)

const snippet = computed(() => {
  const base = import.meta.client ? window.location.origin : 'https://your-domain.com'
  const tag = 'scr' + 'ipt'
  return `<${tag} src="${base}/o.js" data-project-id="${selectedProjectId.value}" defer></${tag}>`
})

function copySnippet() {
  navigator.clipboard.writeText(snippet.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function refreshProjects() {
  const data = await $fetch('/api/projects')
  if (Array.isArray(data)) {
    projects.value = data
    if (!projects.value.find((p: any) => p.id === selectedProjectId.value)) {
      selectedProjectId.value = projects.value[0]?.id || ''
    }
  }
}

async function createProject() {
  await $fetch('/api/projects', { method: 'POST', body: form.value })
  form.value = { name: '', domain: '' }
  showCreate.value = false
  await refreshProjects()
}

async function deleteProject() {
  await $fetch('/api/projects/' + selectedProjectId.value, { method: 'DELETE' })
  confirmDelete.value = false
  await refreshProjects()
}
</script>
