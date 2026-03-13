import { ref, computed } from 'vue'
import type { NodeTreeDTO, NodeDTO, NodeWithContentDTO } from '@/types'
import { NodeType } from '@/types'
import { nodeService } from '@/services/nodeService'

export function useExplorer() {
    const folderTree = ref<NodeTreeDTO[]>([])
    const selectedNode = ref<NodeTreeDTO | null>(null)
    const rightPanelItems = ref<NodeDTO[]>([])
    const searchResults = ref<NodeDTO[]>([])
    const searchQuery = ref('')
    const isSearching = ref(false)
    const isLoadingTree = ref(false)
    const isLoadingPanel = ref(false)
    const treeError = ref<string | null>(null)
    const panelError = ref<string | null>(null)
    const createError = ref<string | null>(null)
    const openFolderIds = ref<Set<string>>(new Set())

    // Preview
    const previewNode = ref<NodeWithContentDTO | null>(null)
    const isLoadingPreview = ref(false)

    // Rename
    const renamingNodeId = ref<string | null>(null)
    const renameError = ref<string | null>(null)

    const isInSearchMode = computed(() => searchQuery.value.trim().length > 0)

    async function loadFolderTree() {
        isLoadingTree.value = true
        treeError.value = null
        try {
            folderTree.value = await nodeService.getFolderTree()
        } catch (err) {
            treeError.value = err instanceof Error ? err.message : 'Failed to load folder tree'
        } finally {
            isLoadingTree.value = false
        }
    }

    async function selectFolder(node: NodeTreeDTO) {
        selectedNode.value = node
        isLoadingPanel.value = true
        panelError.value = null
        rightPanelItems.value = []
        try {
            rightPanelItems.value = await nodeService.getDirectChildren(node.id)
        } catch (err) {
            panelError.value = err instanceof Error ? err.message : 'Failed to load contents'
        } finally {
            isLoadingPanel.value = false
        }
    }

    function toggleFolder(nodeId: string) {
        if (openFolderIds.value.has(nodeId)) {
            openFolderIds.value.delete(nodeId)
        } else {
            openFolderIds.value.add(nodeId)
        }
    }

    async function search(query: string) {
        searchQuery.value = query
        if (!query.trim()) {
            searchResults.value = []
            return
        }
        isSearching.value = true
        try {
            searchResults.value = await nodeService.searchNodes(query)
        } catch {
            searchResults.value = []
        } finally {
            isSearching.value = false
        }
    }

    function clearSearch() {
        searchQuery.value = ''
        searchResults.value = []
    }

    async function createNode(name: string, type: NodeType, content: string | null = null, mimeType: string | null = null) {
        if (!selectedNode.value) return
        createError.value = null
        try {
            const newNode = await nodeService.createNode({
                name,
                type,
                parentId: selectedNode.value.id,
                content,
                mimeType,
            })
            rightPanelItems.value = [...rightPanelItems.value, newNode]
            if (type === NodeType.FOLDER) {
                await loadFolderTree()
                openFolderIds.value.add(selectedNode.value.id)
            }
        } catch (err) {
            createError.value = err instanceof Error ? err.message : 'Failed to create'
        }
    }

    async function openPreview(node: NodeDTO) {
        isLoadingPreview.value = true
        previewNode.value = null
        try {
            previewNode.value = await nodeService.getNodeContent(node.id)
        } catch (err) {
            console.error('Failed to load preview', err)
        } finally {
            isLoadingPreview.value = false
        }
    }

    function closePreview() {
        previewNode.value = null
    }

    function startRename(nodeId: string) {
        renamingNodeId.value = nodeId
        renameError.value = null
    }

    function cancelRename() {
        renamingNodeId.value = null
        renameError.value = null
    }

    async function confirmRename(nodeId: string, newName: string) {
        renameError.value = null
        try {
            const updated = await nodeService.renameNode(nodeId, newName)
            // Update in right panel
            rightPanelItems.value = rightPanelItems.value.map((item) =>
                item.id === nodeId ? { ...item, name: updated.name } : item
            )
            // Refresh tree if it's a folder
            const node = rightPanelItems.value.find((i) => i.id === nodeId)
            if (node?.type === NodeType.FOLDER) await loadFolderTree()
            renamingNodeId.value = null
        } catch (err) {
            renameError.value = err instanceof Error ? err.message : 'Failed to rename'
        }
    }

    async function deleteNode(nodeId: string) {
        try {
            await nodeService.deleteNode(nodeId)
            rightPanelItems.value = rightPanelItems.value.filter((i) => i.id !== nodeId)
            // Refresh tree
            await loadFolderTree()
        } catch (err) {
            console.error('Failed to delete', err)
        }
    }

    return {
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
    }
}