<script setup lang="ts">
import type { NodeDTO } from '@/types'
import { NodeType } from '@/types'

defineProps<{
  results: NodeDTO[]
  query: string
}>()
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div v-if="results.length === 0" class="flex items-center justify-center h-32">
      <p class="text-explorer-muted text-xs">No results for "{{ query }}"</p>
    </div>

    <ul v-else class="py-1">
      <li
        v-for="result in results"
        :key="result.id"
        class="flex items-center gap-2 px-3 py-1.5 hover:bg-explorer-hover cursor-default"
      >
        <svg v-if="result.type === NodeType.FOLDER" class="w-4 h-4 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
        <svg v-else class="w-4 h-4 text-explorer-muted flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
        </svg>

        <div class="flex-1 min-w-0">
          <p class="text-xs text-explorer-text truncate">{{ result.name }}</p>
          <p class="text-xs text-explorer-muted truncate">{{ result.path }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>