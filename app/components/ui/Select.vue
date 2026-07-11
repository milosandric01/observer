<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 bg-surface-2 border border-hairline rounded-md pl-3 pr-3 py-2.5 text-body-sm text-ink font-medium cursor-pointer hover:border-hairline-strong outline-none transition-colors"
      :class="{ 'border-primary': open }"
      @click="open = !open"
    >
      <span class="flex items-center gap-2 min-w-0">
        <UiFavicon v-if="selectedOption?.domain" :domain="selectedOption.domain" :name="selectedOption.label" :size="18" framed />
        <span class="truncate">{{ selectedLabel || placeholder }}</span>
      </span>
      <span class="text-ink-subtle text-caption shrink-0 transition-transform" :class="{ 'rotate-180': open }">▾</span>
    </button>

    <div
      v-if="open"
      class="absolute left-0 right-0 top-full mt-1.5 bg-surface-2 border border-hairline rounded-md shadow-xl shadow-black/40 overflow-hidden z-20 p-1"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded text-body-sm text-left transition-colors"
        :class="opt.value === modelValue ? 'bg-primary/15 text-ink' : 'text-ink-subtle hover:bg-surface-3 hover:text-ink'"
        @click="select(opt.value)"
      >
        <span class="flex items-center gap-2 min-w-0">
          <UiFavicon v-if="opt.domain" :domain="opt.domain" :name="opt.label" :size="18" framed />
          <span class="truncate">{{ opt.label }}</span>
        </span>
        <span v-if="opt.value === modelValue" class="text-primary shrink-0">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  options: Array<{ value: string; label: string; domain?: string }>
  placeholder?: string
}>(), {
  placeholder: 'Select…',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue)
)

const selectedLabel = computed(() => selectedOption.value?.label)

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
