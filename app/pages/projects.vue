<template>
  <NuxtLayout>
    <div>
      <header class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h2 class="text-headline">Projects</h2>
          <p class="text-body-sm text-ink-subtle mt-1">Manage your tracked sites</p>
        </div>
        <UiButton @click="showCreate = true">+ New Project</UiButton>
      </header>

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

      <div v-if="projectList?.length" class="flex flex-col gap-3">
        <UiCard v-for="project in projectList" :key="project.id" interactive @click="navigateTo('/project/' + project.id)">
          <div class="flex items-center gap-3 mb-3">
            <UiFavicon :domain="project.domain" :name="project.name" :size="32" />
            <div class="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 min-w-0">
              <h4 class="text-body-lg font-semibold truncate">{{ project.name }}</h4>
              <span class="text-body-sm text-ink-subtle truncate">{{ project.domain }}</span>
            </div>
          </div>
          <div class="bg-surface-2 px-3 py-2 rounded-sm overflow-x-auto">
            <code v-text="snippetFor(project)" class="text-caption text-ink-subtle"></code>
          </div>
        </UiCard>
      </div>

      <UiEmptyState v-else>
        No projects yet. Create one to get your tracking script.
      </UiEmptyState>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const showCreate = ref(false)
const form = ref({ name: '', domain: '' })

const { data: projectList, refresh } = await useFetch('/api/projects')

const snippetFor = (project: any) => {
  const base = import.meta.client ? window.location.origin : ''
  const tag = 'scr' + 'ipt'
  return `<${tag} src="${base}/o.js" data-project-id="${project.id}" defer></${tag}>`
}

async function createProject() {
  await $fetch('/api/projects', {
    method: 'POST',
    body: form.value
  })
  form.value = { name: '', domain: '' }
  showCreate.value = false
  await refresh()
}
</script>
