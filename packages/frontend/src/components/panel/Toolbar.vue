<script setup lang="ts">
import { ref } from 'vue'
import { NodeType } from '@/types'

defineProps<{
  disabled: boolean
  error: string | null
}>()

const emit = defineEmits<{
  create: [name: string, type: NodeType, content?: string | null, mimeType?: string | null]
}>()

const isCreating = ref<NodeType | null>(null)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

async function startCreate(type: NodeType) {
  isCreating.value = type
  inputValue.value = ''
  setTimeout(() => inputRef.value?.focus(), 50)
}

function cancelCreate() {
  isCreating.value = null
  inputValue.value = ''
}

function confirmCreate() {
  if (!inputValue.value.trim() || !isCreating.value) return
  const name = inputValue.value.trim()
  const type = isCreating.value
  isCreating.value = null
  inputValue.value = ''
  emit('create', name, type, null, null)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') confirmCreate()
  if (e.key === 'Escape') cancelCreate()
}

function triggerUpload() { fileInputRef.value?.click() }

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploading.value = true
  try {
    const content = await readFileAsBase64(file)
    emit('create', file.name, NodeType.FILE, content, file.type)
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<template>
  <div class="flex-shrink-0 border-b border-[#e0e0e0] bg-[#fafafa]">
    <!-- Main toolbar row -->
    <div class="flex items-center gap-0.5 px-3 py-1.5">
      <!-- New Folder -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#1a1a1a] transition-colors"
        :class="disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e0e0e0] cursor-default'"
        :disabled="disabled"
        @click="startCreate(NodeType.FOLDER)"
      >
        <svg class="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
        New Folder
      </button>

      <!-- New File -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#1a1a1a] transition-colors"
        :class="disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e0e0e0] cursor-default'"
        :disabled="disabled"
        @click="startCreate(NodeType.FILE)"
      >
        <svg class="w-4 h-4 text-[#6e6e6e]" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
        </svg>
        New File
      </button>

      <div class="w-px h-5 bg-[#e0e0e0] mx-1" />

      <!-- Upload -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[#1a1a1a] transition-colors"
        :class="disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e0e0e0] cursor-default'"
        :disabled="disabled || isUploading"
        @click="triggerUpload"
      >
        <svg v-if="!isUploading" class="w-4 h-4 text-[#0067c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin text-[#0067c0]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ isUploading ? 'Uploading...' : 'Upload' }}
      </button>

      <input ref="fileInputRef" type="file" class="hidden" accept="image/*,.pdf,.txt,.md,.csv" @change="handleFileUpload" />

      <span v-if="disabled" class="text-xs text-[#6e6e6e] ml-2 italic">Select a folder first</span>
    </div>

    <!-- Inline create input -->
    <div v-if="isCreating" class="flex items-center gap-2 px-4 py-1.5 bg-[#e5f3ff] border-t border-[#e0e0e0]">
      <svg v-if="isCreating === NodeType.FOLDER" class="w-4 h-4 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
      <svg v-else class="w-4 h-4 text-[#6e6e6e] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
      </svg>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="isCreating === NodeType.FOLDER ? 'Folder name...' : 'File name...'"
        class="flex-1 bg-white border border-[#0067c0] rounded text-sm text-[#1a1a1a] px-2 py-0.5 focus:outline-none"
        @keydown="handleKeydown"
      />
      <button class="text-green-600 hover:text-green-700 transition-colors" @click="confirmCreate">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      </button>
      <button class="text-red-500 hover:text-red-600 transition-colors" @click="cancelCreate">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="px-4 py-1 bg-red-50 border-t border-red-100">
      <p class="text-red-500 text-xs">{{ error }}</p>
    </div>
  </div>
</template>