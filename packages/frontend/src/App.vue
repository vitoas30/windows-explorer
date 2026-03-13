<script setup lang="ts">
import { onMounted } from 'vue'
import { useExplorer } from '@/composables/useExplorer'
import { useResizable } from '@/composables/useResizable'
import FolderTree from '@/components/tree/FolderTree.vue'
import RightPanel from '@/components/panel/RightPanel.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import SearchResults from '@/components/search/SearchResults.vue'
import PreviewModal from '@/components/panel/PreviewModal.vue'

const {
  folderTree,
  selectedNode,
  rightPanelItems,
  searchResults,
  searchQuery,
  isSearching,
  isLoadingTree,
  isLoadingPanel,
  treeError,
  panelError,
  createError,
  isInSearchMode,
  openFolderIds,
  previewNode,
  isLoadingPreview,
  renamingNodeId,
  renameError,
  loadFolderTree,
  selectFolder,
  toggleFolder,
  search,
  clearSearch,
  createNode,
  openPreview,
  closePreview,
  startRename,
  cancelRename,
  confirmRename,
  deleteNode,
} = useExplorer()

const { width, isDragging, startDrag } = useResizable(256, 150, 600)

function getBreadcrumbs(path: string) {
  return path.split('/').filter(Boolean)
}

onMounted(() => loadFolderTree())
</script>

<template>
  <div
    class="flex flex-col h-screen bg-white text-[#1a1a1a] text-sm overflow-hidden"
    :class="isDragging ? 'select-none cursor-col-resize' : 'select-none'"
  >
    <!-- Navigation Bar (address bar row) -->
    <header class="flex items-center gap-1.5 px-2 py-1.5 bg-[#f3f3f3] border-b border-[#e0e0e0] flex-shrink-0">
      <!-- Nav buttons -->
      <div class="flex items-center gap-0.5 mr-1">
        <button class="w-8 h-8 flex items-center justify-center rounded-md text-[#6e6e6e] hover:bg-[#e0e0e0] transition-colors" title="Back">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded-md text-[#b0b0b0]" disabled title="Forward">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <button class="w-8 h-8 flex items-center justify-center rounded-md text-[#6e6e6e] hover:bg-[#e0e0e0] transition-colors" title="Refresh" @click="loadFolderTree">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <!-- Address bar / Breadcrumb -->
      <div class="flex-1 flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e0e0e0] rounded-[5px] hover:border-[#0067c0] transition-colors min-w-0 overflow-hidden">
        <svg class="w-4 h-4 text-[#0067c0] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span class="text-xs text-[#6e6e6e] flex-shrink-0">Home</span>
        <template v-if="selectedNode">
          <template v-for="(crumb, index) in getBreadcrumbs(selectedNode.path)" :key="index">
            <svg class="w-3 h-3 text-[#b0b0b0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" /></svg>
            <span
              class="text-xs truncate"
              :class="index === getBreadcrumbs(selectedNode.path).length - 1 ? 'text-[#1a1a1a] font-medium' : 'text-[#6e6e6e]'"
            >{{ crumb }}</span>
          </template>
        </template>
      </div>

      <!-- Search -->
      <div class="w-52 flex-shrink-0">
        <SearchBar v-model="searchQuery" :is-searching="isSearching" @search="search" @clear="clearSearch" />
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar -->
      <aside
        class="flex-shrink-0 bg-[#f3f3f3] flex flex-col overflow-hidden border-r border-[#e0e0e0]"
        :style="{ width: `${width}px` }"
      >
        <div class="px-4 pt-3 pb-1 flex-shrink-0">
          <span class="text-[11px] font-semibold text-[#6e6e6e] uppercase tracking-widest">
            {{ isInSearchMode ? 'Search' : 'Navigation' }}
          </span>
        </div>

        <SearchResults v-if="isInSearchMode" :results="searchResults" :query="searchQuery" />

        <FolderTree
          v-else
          :nodes="folderTree"
          :selected-id="selectedNode?.id ?? null"
          :open-ids="openFolderIds"
          :is-loading="isLoadingTree"
          :error="treeError"
          @select="selectFolder"
          @toggle="toggleFolder"
        />
      </aside>

      <!-- Resize Handle -->
      <div
        class="w-[3px] flex-shrink-0 cursor-col-resize hover:bg-[#0067c0]/60 transition-colors duration-150"
        :class="isDragging ? 'bg-[#0067c0]' : 'bg-[#e8e8e8]'"
        @mousedown="startDrag"
      />

      <!-- Right Panel -->
      <section class="flex-1 bg-white overflow-hidden min-w-0">
        <RightPanel
          :selected-folder="selectedNode"
          :items="rightPanelItems"
          :is-loading="isLoadingPanel"
          :error="panelError"
          :create-error="createError"
          :renaming-node-id="renamingNodeId"
          :rename-error="renameError"
          @select-folder="selectFolder"
          @create="(name, type, content, mimeType) => createNode(name, type, content, mimeType)"
          @preview="openPreview"
          @rename="startRename"
          @confirm-rename="confirmRename"
          @cancel-rename="cancelRename"
          @delete="deleteNode"
        />
      </section>
    </main>

    <!-- Status bar -->
    <footer class="flex items-center px-4 py-1 bg-[#f3f3f3] border-t border-[#e0e0e0] text-xs text-[#6e6e6e] flex-shrink-0">
      <span>{{ rightPanelItems.length }} item{{ rightPanelItems.length !== 1 ? 's' : '' }}</span>
      <span v-if="selectedNode" class="ml-6 truncate">{{ selectedNode.path }}</span>
    </footer>

    <!-- Preview Modal -->
    <PreviewModal :node="previewNode" :is-loading="isLoadingPreview" @close="closePreview" />
  </div>
</template>