<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}>(), {
  padding: 'md',
  interactive: false,
})

const paddings: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-8',
}

const classes = computed(() => [
  'bg-canvas border border-hairline rounded-lg',
  paddings[props.padding],
  props.interactive ? 'cursor-pointer hover:border-hairline-strong transition-colors' : '',
])
</script>
