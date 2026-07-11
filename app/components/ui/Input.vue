<template>
  <div>
    <label v-if="label" class="block text-body-sm font-medium text-ink-muted mb-1.5">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="w-full bg-surface-2 border border-hairline rounded-md px-3.5 py-2.5 text-body text-ink outline-none focus:border-primary transition-colors"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
}>(), {
  type: 'text',
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
