import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExplorer } from '@/composables/useExplorer'
import { nodeService } from '@/services/nodeService'
import { NodeType } from '@/types'
import type { NodeTreeDTO } from '@/types'

vi.mock('@/services/nodeService', () => ({
  nodeService: {
    getFolderTree: vi.fn(),
    getDirectChildren: vi.fn(),
    searchNodes: vi.fn(),
  },
}))

const mockTree: NodeTreeDTO[] = [
  {
    id: '1',
    name: 'Documents',
    type: NodeType.FOLDER,
    parentId: null,
    path: '/Documents',
    depth: 0,
    sortOrder: 0,
    children: [
      {
        id: '2',
        name: 'Work',
        type: NodeType.FOLDER,
        parentId: '1',
        path: '/Documents/Work',
        depth: 1,
        sortOrder: 0,
        children: [],
      },
    ],
  },
]

describe('useExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadFolderTree', () => {
    it('should load folder tree successfully', async () => {
      vi.mocked(nodeService.getFolderTree).mockResolvedValue(mockTree)

      const { folderTree, isLoadingTree, loadFolderTree } = useExplorer()
      await loadFolderTree()

      expect(folderTree.value).toEqual(mockTree)
      expect(isLoadingTree.value).toBe(false)
    })

    it('should set error when loading fails', async () => {
      vi.mocked(nodeService.getFolderTree).mockRejectedValue(new Error('Network error'))

      const { treeError, loadFolderTree } = useExplorer()
      await loadFolderTree()

      expect(treeError.value).toBe('Network error')
    })

    it('should set isLoadingTree to false after loading', async () => {
      vi.mocked(nodeService.getFolderTree).mockResolvedValue([])

      const { isLoadingTree, loadFolderTree } = useExplorer()
      await loadFolderTree()

      expect(isLoadingTree.value).toBe(false)
    })
  })

  describe('selectFolder', () => {
    it('should set selectedNode and load children', async () => {
      const children = [
        { id: '2', name: 'Work', type: NodeType.FOLDER, parentId: '1', path: '/Documents/Work', depth: 1, sortOrder: 0 },
      ]
      vi.mocked(nodeService.getDirectChildren).mockResolvedValue(children)

      const { selectedNode, rightPanelItems, selectFolder } = useExplorer()
      await selectFolder(mockTree[0])

      expect(selectedNode.value).toEqual(mockTree[0])
      expect(rightPanelItems.value).toEqual(children)
    })

    it('should set panelError when loading children fails', async () => {
      vi.mocked(nodeService.getDirectChildren).mockRejectedValue(new Error('Failed'))

      const { panelError, selectFolder } = useExplorer()
      await selectFolder(mockTree[0])

      expect(panelError.value).toBe('Failed')
    })
  })

  describe('toggleFolder', () => {
    it('should open a closed folder', () => {
      const { openFolderIds, toggleFolder } = useExplorer()

      toggleFolder('1')

      expect(openFolderIds.value.has('1')).toBe(true)
    })

    it('should close an open folder', () => {
      const { openFolderIds, toggleFolder } = useExplorer()

      toggleFolder('1')
      toggleFolder('1')

      expect(openFolderIds.value.has('1')).toBe(false)
    })
  })

  describe('search', () => {
    it('should return search results', async () => {
      const results = [
        { id: '1', name: 'Documents', type: NodeType.FOLDER, parentId: null, path: '/Documents', depth: 0, sortOrder: 0 },
      ]
      vi.mocked(nodeService.searchNodes).mockResolvedValue(results)

      const { searchResults, search } = useExplorer()
      await search('Documents')

      expect(searchResults.value).toEqual(results)
    })

    it('should clear results for empty query', async () => {
      const { searchResults, search } = useExplorer()
      await search('')

      expect(searchResults.value).toHaveLength(0)
    })
  })

  describe('clearSearch', () => {
    it('should clear search query and results', async () => {
      vi.mocked(nodeService.searchNodes).mockResolvedValue([])

      const { searchQuery, searchResults, search, clearSearch } = useExplorer()
      await search('test')
      clearSearch()

      expect(searchQuery.value).toBe('')
      expect(searchResults.value).toHaveLength(0)
    })
  })

  describe('isInSearchMode', () => {
    it('should be true when query is not empty', async () => {
      vi.mocked(nodeService.searchNodes).mockResolvedValue([])

      const { isInSearchMode, search } = useExplorer()
      await search('test')

      expect(isInSearchMode.value).toBe(true)
    })

    it('should be false when query is empty', () => {
      const { isInSearchMode } = useExplorer()

      expect(isInSearchMode.value).toBe(false)
    })
  })
})