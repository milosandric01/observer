<template>
  <span
    class="inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="!failed"
      :src="identity.avatar"
      :alt="identity.name"
      :width="size"
      :height="size"
      class="w-full h-full object-cover"
      @error="failed = true"
    />
    <span v-else class="text-caption font-semibold text-ink-subtle">{{ identity.initials }}</span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  visitorId?: string
  size?: number
}>(), {
  size: 32,
})

const failed = ref(false)
watch(() => props.visitorId, () => { failed.value = false })

const identity = computed(() => visitorIdentity(props.visitorId))
</script>
