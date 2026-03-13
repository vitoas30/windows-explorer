<script setup lang="ts">
import { computed } from 'vue'
import type { NodeTreeDTO } from '@/types'
import TreeNode from './TreeNode.vue'

defineProps<{
  nodes: NodeTreeDTO[]
  selectedId: string | null
  openIds: Set<string>
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  select: [node: NodeTreeDTO]
  toggle: [nodeId: string]
}>()
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center h-32">
      <svg class="w-5 h-5 animate-spin text-[#6e6e6e]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="px-4 py-3">
      <p class="text-red-500 text-xs">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="nodes.length === 0" class="px-4 py-3">
      <p class="text-[#6e6e6e] text-xs">No folders found</p>
    </div>

    <!-- Tree -->
    <ul v-else class="py-1 px-2 flex flex-col gap-0.5">
      <TreeNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
        :open-ids="openIds"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </div>
</template>