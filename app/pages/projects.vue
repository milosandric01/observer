<template>
  <NuxtLayout>
    <div>
      <header class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h2 class="text-headline">Projects</h2>
          <p class="text-body-sm text-ink-subtle mt-1">Manage your tracked sites</p>
        </div>
        <button class="bg-primary text-white px-4 py-2.5 rounded-md text-button hover:bg-primary-hover transition-colors" @click="showCreate = true">+ New Project</button>
      </header>

      <div v-if="showCreate" class="fixed inset-0 bg-overlay/60 flex items-center justify-center z-50" @click.self="showCreate = false">
        <div class="bg-surface-1 border border-hairline rounded-xl p-8 w-full max-w-md">
          <h3 class="text-card-title mb-6">Create Project</h3>
          <form @submit.prevent="createProject">
            <div class="mb-4">
              <label class="block text-body-sm font-medium text-ink-muted mb-1.5">Project Name</label>
              <input v-model="form.name" placeholder="My Landing Page" required class="w-full bg-surface-2 border border-hairline rounded-md px-3.5 py-2.5 text-body text-ink outline-none focus:border-primary transition-colors" />
            </div>
            <div class="mb-4">
              <label class="block text-body-sm font-medium text-ink-muted mb-1.5">Domain</label>
              <input v-model="form.domain" placeholder="example.com" required class="w-full bg-surface-2 border border-hairline rounded-md px-3.5 py-2.5 text-body text-ink outline-none focus:border-primary transition-colors" />
            </div>
            <div class="flex justify-end gap-2.5 mt-6">
              <button type="button" class="bg-surface-2 text-ink-muted border border-hairline px-4 py-2.5 rounded-md text-button" @click="showCreate = false">Cancel</button>
              <button type="submit" class="bg-primary text-white px-4 py-2.5 rounded-md text-button hover:bg-primary-hover transition-colors">Create</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="projectList?.length" class="flex flex-col gap-3">
        <div v-for="project in projectList" :key="project.id" class="bg-surface-1 border border-hairline rounded-lg p-5 cursor-pointer hover:border-hairline-strong transition-colors" @click="navigateTo('/project/' + project.id)">
          <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-3">
            <h4 class="text-body-lg font-semibold">{{ project.name }}</h4>
            <span class="text-body-sm text-ink-subtle">{{ project.domain }}</span>
          </div>
          <div class="bg-surface-2 px-3 py-2 rounded-sm overflow-x-auto">
            <code v-text="snippetFor(project)" class="text-caption text-ink-subtle"></code>
          </div>
        </div>
      </div>

      <div v-else class="text-body-sm text-ink-subtle text-center py-10 bg-surface-1 border border-dashed border-hairline-strong rounded-lg">
        <p>No projects yet. Create one to get your tracking script.</p>
      </div>
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
  return `<${tag} src="${base}/t.js?pid=${project.id}" defer></${tag}>`
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
