<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Mobile -->
    <template v-if="type === 'Mobile'">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </template>
    <!-- Tablet -->
    <template v-else-if="type === 'Tablet'">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </template>
    <!-- Desktop (default) -->
    <template v-else>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </template>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: string
  size?: number
}>(), {
  size: 16,
})
</script>
