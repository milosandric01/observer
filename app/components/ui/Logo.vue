<template>
  <span class="inline-flex items-center gap-2">
    <span
      class="inline-flex items-center justify-center rounded-full border-2 border-primary shrink-0"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <span
        class="rounded-full bg-[#8b93e8]"
        :style="{
          width: Math.round(size * 0.32) + 'px',
          height: Math.round(size * 0.32) + 'px',
          boxShadow: '0 0 8px rgba(139,147,232,0.9)',
        }"
      />
    </span>
    <span v-if="showText" class="text-body-lg font-semibold tracking-tight text-ink">Observer</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  showText?: boolean
}>(), {
  size: 22,
  showText: true,
})
</script>
