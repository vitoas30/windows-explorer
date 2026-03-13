<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
  isSearching: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  clear: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('search', value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}
</script>

<template>
  <div class="relative flex items-center">
    <!-- Search icon -->
    <svg
      class="absolute left-2.5 w-3.5 h-3.5 text-[#6e6e6e] pointer-events-none"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>

    <input
      ref="inputRef"
      type="text"
      placeholder="Search"
      :value="modelValue"
      class="w-full bg-white border border-[#e0e0e0] rounded-md text-sm text-[#1a1a1a] placeholder-[#6e6e6e] pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0]/20 transition-all"
      @input="handleInput"
    />

    <!-- Spinner / Clear -->
    <div class="absolute right-2 flex items-center">
      <svg v-if="isSearching" class="w-3.5 h-3.5 text-[#6e6e6e] animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <button v-else-if="modelValue" class="text-[#6e6e6e] hover:text-[#1a1a1a] transition-colors" @click="handleClear">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>