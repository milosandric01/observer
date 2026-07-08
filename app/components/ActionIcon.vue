<template>
  <svg
    :viewBox="'0 0 16 16'"
    fill="none"
    stroke="currentColor"
    stroke-width="1.3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  name: { type: String, default: 'default' }
})

// Inline, hardcoded SVG path markup keyed by action name. Content is static
// (never user-supplied), so v-html here is safe.
const ICONS: Record<string, string> = {
  pageview:
    '<path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"/><circle cx="8" cy="8" r="1.8"/>',
  click:
    '<path d="M3 2.5l3 9 1.6-3.6 3.6-1.6-8.2-3.8Z"/>',
  scroll:
    '<path d="M5.5 6L8 3.5 10.5 6M5.5 10L8 12.5 10.5 10"/>',
  form_submit:
    '<path d="M14 2 7 9M14 2l-4.3 12-2.7-5.3L2 6 14 2Z"/>',
  form_focus:
    '<path d="M8 3v10M5.5 3H10M5.5 13H10"/>',
  section_view:
    '<rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M5 8h6M5 10h4"/>',
  away:
    '<circle cx="8" cy="8" r="5.5"/><path d="M6.5 5.5v5M9.5 5.5v5"/>',
  reload:
    '<path d="M13.5 7a5.5 5.5 0 1 0-1.3 4.3"/><path d="M13.5 3.5V7H10"/>'
}

const paths = computed(() => ICONS[props.name] ?? '<circle cx="8" cy="8" r="2.4"/>')
</script>
