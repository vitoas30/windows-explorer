<script setup lang="ts">
import { computed } from 'vue'
import type { NodeWithContentDTO } from '@/types'

const props = defineProps<{
  node: NodeWithContentDTO | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Fallback: guess mime type from file extension when mimeType is not stored
const effectiveMimeType = computed(() => {
  if (props.node?.mimeType) return props.node.mimeType
  const name = props.node?.name ?? ''
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    json: 'application/json',
    js: 'text/javascript',
    ts: 'text/typescript',
    html: 'text/html',
    css: 'text/css',
  }
  return mimeMap[ext] ?? null
})

const isImage = computed(() =>
  effectiveMimeType.value?.startsWith('image/') ?? false
)

const isPdf = computed(() =>
  effectiveMimeType.value === 'application/pdf'
)

const isText = computed(() =>
  effectiveMimeType.value?.startsWith('text/') ||
  effectiveMimeType.value === 'application/json'
)

const dataUrl = computed(() => {
  if (!props.node?.content || !effectiveMimeType.value) return null
  return `data:${effectiveMimeType.value};base64,${props.node.content}`
})

const textContent = computed(() => {
  if (!props.node?.content) return ''
  try {
    return atob(props.node.content)
  } catch {
    return props.node.content
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="node || isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      @click.self="emit('close')"
    >
      <div class="bg-explorer-panel border border-explorer-border rounded-lg shadow-2xl w-3/4 max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-explorer-border flex-shrink-0">
          <span class="text-sm font-semibold text-explorer-text truncate flex-1">
            {{ node?.name ?? 'Loading...' }}
          </span>
          <span v-if="node?.mimeType" class="text-xs text-explorer-muted">
            {{ node.mimeType }}
          </span>
          <button
            class="text-explorer-muted hover:text-explorer-text transition-colors ml-2"
            @click="emit('close')"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-auto p-4 flex items-center justify-center">
          <!-- Loading -->
          <div v-if="isLoading" class="flex flex-col items-center gap-2 text-explorer-muted">
            <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span class="text-xs">Loading preview...</span>
          </div>

          <!-- Image -->
          <img
            v-else-if="isImage && dataUrl"
            :src="dataUrl"
            :alt="node?.name"
            class="max-w-full max-h-full object-contain rounded"
          />

          <!-- PDF -->
          <iframe
            v-else-if="isPdf && dataUrl"
            :src="dataUrl"
            class="w-full h-96 rounded border border-explorer-border"
          />

          <!-- Text -->
          <pre
            v-else-if="isText"
            class="w-full text-xs text-explorer-text bg-explorer-bg p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap"
          >{{ textContent }}</pre>

          <!-- No content / unsupported -->
          <div v-else class="text-center text-explorer-muted">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-30" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-sm">No preview available</p>
            <p class="text-xs mt-1">{{ node?.mimeType ?? 'Unknown file type' }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>