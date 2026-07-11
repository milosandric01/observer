<template>
  <span
    class="inline-flex items-center justify-center shrink-0 rounded-sm overflow-hidden bg-surface-2 border border-hairline"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="domain && !failed"
      :src="`https://icons.duckduckgo.com/ip3/${domain}.ico`"
      :alt="domain"
      :width="size - 8"
      :height="size - 8"
      class="object-contain"
      @error="failed = true"
    />
    <span v-else class="text-ink-subtle font-semibold" :style="{ fontSize: Math.round(size * 0.5) + 'px' }">
      {{ letter }}
    </span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  domain?: string
  name?: string
  size?: number
}>(), {
  size: 24,
})

const failed = ref(false)

watch(() => props.domain, () => { failed.value = false })

const letter = computed(() => (props.name || props.domain || '?').charAt(0).toUpperCase())
</script>
