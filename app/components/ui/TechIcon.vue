<template>
  <!-- Windows: inline SVG (no Simple Icons entry due to trademark) -->
  <svg
    v-if="isWindows"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="#00A4EF"
    class="shrink-0"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
  >
    <path d="M3 5.1 10.4 4v7.3H3V5.1Zm0 13.8 7.4 1v-7.2H3v6.2Zm8.2 1.1L21 21v-8.6h-9.8v7.6Zm0-16.2v7.7H21V3l-9.8 1.8Z" />
  </svg>
  <!-- Browsers: full-color logos -->
  <img
    v-else-if="browserLogo && !failed"
    :src="browserLogo"
    :alt="name"
    :width="size"
    :height="size"
    class="object-contain shrink-0"
    :style="{ width: size + 'px', height: size + 'px' }"
    @error="failed = true"
  />
  <!-- OS: brand-colored Simple Icons -->
  <img
    v-else-if="osIcon && !failed"
    :src="osIcon"
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

// Full-color browser logos from the browser-logos project
const BROWSER_LOGOS: Record<string, string> = {
  'Chrome': 'chrome',
  'Safari': 'safari',
  'Firefox': 'firefox',
  'Edge': 'edge',
  'Opera': 'opera',
  'Samsung Browser': 'samsung-internet',
  'Brave': 'brave',
  'Vivaldi': 'vivaldi',
}

// OS Simple Icons slug + brand colour that stays visible on a dark surface
const OS_ICONS: Record<string, { slug: string; color: string }> = {
  'Mac OS': { slug: 'apple', color: 'ffffff' },
  'iOS': { slug: 'apple', color: 'ffffff' },
  'Android': { slug: 'android', color: '3DDC84' },
  'Linux': { slug: 'linux', color: 'ffffff' },
  'Chrome OS': { slug: 'googlechrome', color: '4285F4' },
}

const browserLogo = computed(() => {
  if (props.type !== 'browser' || !props.name) return ''
  const slug = BROWSER_LOGOS[props.name]
  if (!slug) return ''
  return `https://cdn.jsdelivr.net/gh/alrra/browser-logos@main/src/${slug}/${slug}_64x64.png`
})

const osIcon = computed(() => {
  if (props.type !== 'os' || !props.name) return ''
  const entry = OS_ICONS[props.name]
  if (!entry) return ''
  return `https://cdn.simpleicons.org/${entry.slug}/${entry.color}`
})
</script>
