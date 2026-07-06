<template>
  <NuxtLayout>
    <ProjectView :project-id="String(route.params.id)" />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ path: '/project/:id' })
const route = useRoute()
</script>
