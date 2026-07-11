<template>
  <!-- Windows has no Simple Icons entry (trademark) — use inline SVG -->
  <svg
    v-if="isWindows"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="#8a8f98"
    class="shrink-0"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
  >
    <path d="M3 5.1 10.4 4v7.3H3V5.1Zm0 13.8 7.4 1v-7.2H3v6.2Zm8.2 1.1L21 21v-8.6h-9.8v7.6Zm0-16.2v7.7H21V3l-9.8 1.8Z" />
  </svg>
  <img
    v-else-if="slug && !failed"
    :src="`https://cdn.simpleicons.org/${slug}/8a8f98`"
    :alt="name"
    :width="size"
    :height="size"
    class="object-contain shrink-0"
    :style="{ width: size + 'px', height: size + 'px' }"
    @error="failed = true"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  name?: string
  type: 'browser' | 'os'
  size?: number
}>(), {
  size: 14,
})

const failed = ref(false)
watch(() => props.name, () => { failed.value = false })

const isWindows = computed(() => props.type === 'os' && props.name === 'Windows')

const BROWSER_SLUGS: Record<string, string> = {
  'Chrome': 'googlechrome',
  'Safari': 'safari',
  'Firefox': 'firefoxbrowser',
  'Edge': 'microsoftedge',
  'Opera': 'opera',
  'Samsung Browser': 'samsung',
  'Brave': 'brave',
  'Vivaldi': 'vivaldi',
}

const OS_SLUGS: Record<string, string> = {
  'Mac OS': 'apple',
  'iOS': 'apple',
  'Android': 'android',
  'Linux': 'linux',
  'Chrome OS': 'googlechrome',
}

const slug = computed(() => {
  if (!props.name) return ''
  return props.type === 'browser'
    ? BROWSER_SLUGS[props.name] || ''
    : OS_SLUGS[props.name] || ''
})
</script>
