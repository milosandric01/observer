<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :class="classes"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  tag?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  tag: 'button',
})

const base = 'inline-flex items-center justify-center gap-2 rounded-md text-button font-medium transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed'

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
}

const variants: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface-2 text-ink-muted border border-hairline hover:border-hairline-strong hover:text-ink',
  ghost: 'text-ink-subtle hover:text-ink hover:bg-surface-2',
  danger: 'bg-[#eb5757] text-white hover:bg-[#d94848]',
}

const classes = computed(() => [base, sizes[props.size], variants[props.variant]])
</script>
