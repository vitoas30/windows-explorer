<script setup lang="ts">
import { computed } from 'vue'
import type { NodeDTO, NodeTreeDTO } from '@/types'
import { NodeType } from '@/types'
import NodeItem from './NodeItem.vue'
import Toolbar from './Toolbar.vue'

const props = defineProps<{
  selectedFolder: NodeTreeDTO | null
  items: NodeDTO[]
  isLoading: boolean
  error: string | null
  createError: string | null
  renamingNodeId: string | null
  renameError: string | null
}>()

const emit = defineEmits<{
  selectFolder: [node: NodeTreeDTO]
  create: [name: string, type: NodeType, content: string | null, mimeType: string | null]
  preview: [node: NodeDTO]
  rename: [nodeId: string]
  confirmRename: [nodeId: string, newName: string]
  cancelRename: []
  delete: [nodeId: string]
}>()

// Folders first, then files
const sortedItems = computed(() => [
  ...props.items.filter((i) => i.type === NodeType.FOLDER),
  ...props.items.filter((i) => i.type === NodeType.FILE),
])

function handleDoubleClick(item: NodeDTO) {
  if (item.type !== NodeType.FOLDER) return
  emit('selectFolder', { ...item, children: [] } as NodeTreeDTO)
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-white">
    <!-- Toolbar -->
    <Toolbar
      :disabled="!selectedFolder"
      :error="createError"
      @create="(name, type, content, mimeType) => emit('create', name, type, content ?? null, mimeType ?? null)"
    />

    <!-- Body -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- No folder selected -->
      <div v-if="!selectedFolder" class="flex-1 flex items-center justify-center">
        <div class="text-center text-[#6e6e6e]">
          <svg class="w-16 h-16 mx-auto mb-3 opacity-20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <p class="text-sm">Select a folder to view its contents</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="isLoading" class="flex-1 flex items-center justify-center">
        <svg class="w-5 h-5 animate-spin text-[#6e6e6e]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center px-4">
        <p class="text-red-500 text-sm text-center">{{ error }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="flex-1 flex items-center justify-center">
        <p class="text-[#6e6e6e] text-sm italic">This folder is empty</p>
      </div>

      <!-- List view -->
      <template v-else>
        <!-- Column headers -->
        <div class="flex items-center px-4 py-1.5 border-b border-[#e0e0e0] bg-[#fafafa] flex-shrink-0 select-none">
          <div class="flex-1 text-xs font-semibold text-[#6e6e6e] flex items-center gap-1">
            Name
            <svg class="w-3 h-3 text-[#b0b0b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div class="w-36 text-xs font-semibold text-[#6e6e6e]">Type</div>
        </div>

        <!-- Items -->
        <div class="flex-1 overflow-y-auto">
          <NodeItem
            v-for="item in sortedItems"
            :key="item.id"
            :node="item"
            :is-renaming="renamingNodeId === item.id"
            :rename-error="renamingNodeId === item.id ? renameError : null"
            @dblclick="handleDoubleClick(item)"
            @preview="emit('preview', $event)"
            @rename="emit('rename', $event)"
            @confirm-rename="emit('confirmRename', $event[0], $event[1])"
            @cancel-rename="emit('cancelRename')"
            @delete="emit('delete', $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>