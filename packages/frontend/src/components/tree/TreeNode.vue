<script setup lang="ts">
import { computed } from 'vue'
import type { NodeTreeDTO } from '@/types'

const props = defineProps<{
  node: NodeTreeDTO
  selectedId: string | null
  openIds: Set<string>
}>()

const emit = defineEmits<{
  select: [node: NodeTreeDTO]
  toggle: [nodeId: string]
}>()

const isOpen = computed(() => props.openIds.has(props.node.id))
const isSelected = computed(() => props.selectedId === props.node.id)
const hasChildren = computed(() => props.node.children.length > 0)

function handleClick() {
  emit('toggle', props.node.id)
  emit('select', props.node)
}
</script>

<template>
  <li class="select-none">
    <button
      class="flex items-center w-full gap-1.5 py-1 px-2 text-sm rounded-md transition-all duration-150 text-left"
      :class="[
        isSelected
          ? 'bg-[#cce4f7] text-[#1a1a1a] font-medium'
          : 'text-[#1a1a1a] hover:bg-[#e0e0e0]',
      ]"
      :style="{ paddingLeft: `${node.depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- Chevron -->
      <span class="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        <svg
          v-if="hasChildren"
          class="w-3 h-3 transition-transform duration-200 text-[#6e6e6e]"
          :class="isOpen ? 'rotate-90' : 'rotate-0'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </span>

      <!-- Folder icon -->
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          v-if="isOpen"
          d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          class="text-yellow-500"
        />
        <path
          v-else
          d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          class="text-yellow-400"
        />
      </svg>

      <!-- Name -->
      <span class="truncate text-sm leading-tight">{{ node.name }}</span>
    </button>

    <!-- Animated children -->
    <Transition
      name="tree-expand"
      @enter="(el: Element) => { (el as HTMLElement).style.maxHeight = el.scrollHeight + 'px' }"
      @after-enter="(el: Element) => { (el as HTMLElement).style.maxHeight = 'none' }"
      @leave="(el: Element) => { (el as HTMLElement).style.maxHeight = '0px' }"
    >
      <ul v-if="hasChildren && isOpen" class="overflow-hidden flex flex-col gap-0.5 mt-0.5">
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          :open-ids="openIds"
          @select="emit('select', $event)"
          @toggle="emit('toggle', $event)"
        />
      </ul>
    </Transition>
  </li>
</template>

<style scoped>
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: max-height 0.2s ease, opacity 0.15s ease;
  overflow: hidden;
}
.tree-expand-enter-from,
.tree-expand-leave-to {
  max-height: 0 !important;
  opacity: 0;
}
.tree-expand-enter-to,
.tree-expand-leave-from {
  opacity: 1;
}
</style>