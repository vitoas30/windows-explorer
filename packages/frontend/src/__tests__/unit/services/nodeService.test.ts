import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NodeType } from '@/types'

const mockGet = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      interceptors: {
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('nodeService', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  describe('getFolderTree', () => {
    it('should return folder tree', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { id: '1', name: 'Documents', type: NodeType.FOLDER, parentId: null, path: '/Documents', depth: 0, sortOrder: 0, children: [] },
          ],
        },
      })

      const { nodeService } = await import('@/services/nodeService')
      const result = await nodeService.getFolderTree()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Documents')
    })
  })

  describe('getDirectChildren', () => {
    it('should return children for a given node id', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { id: '2', name: 'Work', type: NodeType.FOLDER, parentId: '1', path: '/Documents/Work', depth: 1, sortOrder: 0 },
          ],
        },
      })

      const { nodeService } = await import('@/services/nodeService')
      const result = await nodeService.getDirectChildren('1')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Work')
      expect(result[0].parentId).toBe('1')
    })
  })

  describe('searchNodes', () => {
    it('should return search results', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { id: '1', name: 'Documents', type: NodeType.FOLDER, parentId: null, path: '/Documents', depth: 0, sortOrder: 0 },
          ],
        },
      })

      const { nodeService } = await import('@/services/nodeService')
      const result = await nodeService.searchNodes('Documents')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Documents')
    })
  })
})