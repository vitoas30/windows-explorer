<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NodeDTO } from '@/types'
import { NodeType } from '@/types'

const props = defineProps<{
  node: NodeDTO
  isRenaming: boolean
  renameError: string | null
}>()

const emit = defineEmits<{
  preview: [node: NodeDTO]
  rename: [nodeId: string]
  confirmRename: [nodeId: string, newName: string]
  cancelRename: []
  delete: [nodeId: string]
  dblclick: []
}>()

const isFolder = computed(() => props.node.type === NodeType.FOLDER)
const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const renameValue = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

const fileExtension = computed(() => {
  if (isFolder.value) return null
  const parts = props.node.name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null
})

const fileTypeLabel = computed(() => {
  if (isFolder.value) return 'File folder'
  if (!fileExtension.value) return 'File'
  return `${fileExtension.value.toUpperCase()} File`
})

const fileIconColor = computed(() => {
  switch (fileExtension.value) {
    case 'pdf': return 'text-red-500'
    case 'docx': case 'doc': return 'text-blue-500'
    case 'xlsx': case 'xls': return 'text-green-600'
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': return 'text-purple-500'
    case 'mp3': case 'flac': return 'text-pink-500'
    case 'txt': case 'md': return 'text-gray-500'
    default: return 'text-[#6e6e6e]'
  }
})

function openMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  const menuWidth = 160
  const menuHeight = isFolder.value ? 100 : 130
  menuX.value = Math.min(e.clientX, window.innerWidth - menuWidth - 8)
  menuY.value = Math.min(e.clientY, window.innerHeight - menuHeight - 8)
  showMenu.value = true
}

function closeMenu() { showMenu.value = false }

function handleRename() {
  closeMenu()
  renameValue.value = props.node.name
  emit('rename', props.node.id)
  setTimeout(() => renameInputRef.value?.focus(), 50)
}

function handleConfirmRename() {
  if (renameValue.value.trim()) emit('confirmRename', props.node.id, renameValue.value.trim())
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') handleConfirmRename()
  if (e.key === 'Escape') emit('cancelRename')
}
</script>

<template>
  <!-- List row -->
  <div
    class="flex items-center px-4 py-1.5 hover:bg-[#e5f3ff] cursor-default border-b border-[#f5f5f5] transition-colors relative group"
    :title="node.path"
    @contextmenu="openMenu"
    @dblclick="isFolder ? emit('dblclick') : emit('preview', node)"
  >
    <!-- Icon + Name -->
    <div class="flex-1 min-w-0 flex items-center gap-2.5">
      <svg v-if="isFolder" class="w-4 h-4 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
      <svg v-else class="w-4 h-4 flex-shrink-0" :class="fileIconColor" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
      </svg>

      <!-- Rename input or name -->
      <input
        v-if="isRenaming"
        ref="renameInputRef"
        v-model="renameValue"
        type="text"
        class="flex-1 bg-white border border-[#0067c0] rounded text-sm text-[#1a1a1a] px-1.5 py-0.5 focus:outline-none"
        @keydown="handleKeydown"
        @blur="emit('cancelRename')"
        @click.stop
      />
      <span v-else class="text-sm text-[#1a1a1a] truncate select-none">{{ node.name }}</span>
    </div>

    <!-- Type column -->
    <div class="w-36 text-xs text-[#6e6e6e] flex-shrink-0 select-none">{{ fileTypeLabel }}</div>
  </div>

  <!-- Context menu via Teleport -->
  <Teleport to="body">
    <template v-if="showMenu">
      <div class="fixed inset-0 z-40" @click="closeMenu" @contextmenu.prevent="closeMenu" />
      <div
        class="fixed z-50 min-w-[160px] bg-white border border-[#e0e0e0] rounded-lg shadow-xl py-1 overflow-hidden"
        :style="{ top: menuY + 'px', left: menuX + 'px' }"
      >
        <!-- Filename label -->
        <div class="px-3 py-1.5 border-b border-[#e0e0e0] mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-widest text-[#6e6e6e] truncate block max-w-[140px]">
            {{ node.name }}
          </span>
        </div>

        <button
          v-if="!isFolder"
          class="w-full text-left px-3 py-1.5 text-xs text-[#1a1a1a] hover:bg-[#e5f3ff] flex items-center gap-2.5 transition-colors"
          @click="emit('preview', node); closeMenu()"
        >
          <svg class="w-3.5 h-3.5 text-[#0067c0]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          Preview
        </button>

        <button
          class="w-full text-left px-3 py-1.5 text-xs text-[#1a1a1a] hover:bg-[#e5f3ff] flex items-center gap-2.5 transition-colors"
          @click="handleRename"
        >
          <svg class="w-3.5 h-3.5 text-[#6e6e6e]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Rename
        </button>

        <div class="border-t border-[#e0e0e0] my-1" />

        <button
          class="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          @click="emit('delete', node.id); closeMenu()"
        >
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Delete
        </button>
      </div>
    </template>
  </Teleport>
</template>