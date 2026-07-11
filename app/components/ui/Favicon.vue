<template>
  <span
    class="inline-flex items-center justify-center shrink-0 rounded-sm overflow-hidden"
    :class="framed ? 'bg-surface-2 border border-hairline' : ''"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="domain && !failed"
      :src="`https://icons.duckduckgo.com/ip3/${domain}.ico`"
      :alt="domain"
      :width="framed ? size - 8 : size"
      :height="framed ? size - 8 : size"
      class="object-contain"
      @error="failed = true"
    />
    <span
      v-else
      class="flex items-center justify-center w-full h-full text-ink-subtle font-semibold rounded-sm"
      :class="framed ? '' : 'bg-surface-2'"
      :style="{ fontSize: Math.round(size * 0.5) + 'px' }"
    >
      {{ letter }}
    </span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  domain?: string
  name?: string
  size?: number
  framed?: boolean
}>(), {
  size: 24,
  framed: false,
})

const failed = ref(false)

watch(() => props.domain, () => { failed.value = false })

const letter = computed(() => (props.name || props.domain || '?').charAt(0).toUpperCase())
</script>
