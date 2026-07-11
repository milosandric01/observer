<template>
  <div v-if="project">
    <header class="mb-8">
      <NuxtLink to="/projects" class="text-body-sm text-ink-subtle no-underline inline-block mb-2 hover:text-ink-muted">Back to Projects</NuxtLink>
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <UiFavicon :domain="project.domain" :name="project.name" :size="40" />
          <div>
            <h2 class="text-headline">{{ project.name }}</h2>
            <p class="text-body-sm text-ink-subtle mt-1">{{ project.domain }}</p>
          </div>
        </div>
      </div>
    </header>

    <section class="mb-10">
      <h3 class="text-body-lg font-semibold mb-2">Tracking Script</h3>
      <p class="text-body-sm text-ink-muted mb-3">Add this before the closing body tag:</p>
      <div class="bg-surface-1 border border-hairline rounded-lg px-5 py-4 relative overflow-x-auto">
        <code v-text="snippet" class="text-body-sm text-ink-muted break-all"></code>
        <UiButton variant="secondary" size="sm" class="absolute top-3 right-3 !text-caption" @click="copySnippet">{{ copied ? 'Copied' : 'Copy' }}</UiButton>
      </div>
    </section>

    <SessionList :project-id="projectId" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  projectId: { type: String, required: true }
})
const apiUrl = computed(() => '/api/projects/' + props.projectId)
const { data: project } = await useFetch(apiUrl)
const copied = ref(false)
const snippet = computed(() => {
  const b = import.meta.client ? window.location.origin : 'https://your-domain.com'
  const tag = 'scr' + 'ipt'
  return `<${tag} src="${b}/o.js" data-project-id="${props.projectId}" defer></${tag}>`
})
function copySnippet() {
  navigator.clipboard.writeText(snippet.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
