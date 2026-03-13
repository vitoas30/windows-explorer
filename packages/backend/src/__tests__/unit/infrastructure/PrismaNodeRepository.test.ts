import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { PrismaNodeRepository } from '../../../infrastructure/repositories/PrismaNodeRepository'
import { NodeType } from '../../../domain/entities/Node'

// Mock Prisma Client
const mockPrisma = {
  node: {
    findMany: mock(async () => []),
    findUnique: mock(async () => null),
    create: mock(async () => ({})),
    delete: mock(async () => ({})),
  },
}

const mockPrismaFolder = {
  id: '1',
  name: 'Documents',
  type: 'FOLDER' as const,
  parentId: null,
  path: '/Documents',
  depth: 0,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockPrismaFile = {
  id: '3',
  name: 'resume.pdf',
  type: 'FILE' as const,
  parentId: '1',
  path: '/Documents/resume.pdf',
  depth: 1,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PrismaNodeRepository', () => {
  let repository: PrismaNodeRepository

  beforeEach(() => {
    repository = new PrismaNodeRepository(mockPrisma as any)
  })

  describe('findAllFolders', () => {
    it('should return folders as tree structure', async () => {
      const childFolder = {
        ...mockPrismaFolder,
        id: '2',
        name: 'Work',
        parentId: '1',
        depth: 1,
      }

      mockPrisma.node.findMany.mockImplementation(async () => [
        mockPrismaFolder,
        childFolder,
      ])

      const result = await repository.findAllFolders()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Documents')
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children[0].name).toBe('Work')
    })

    it('should return empty array when no folders', async () => {
      mockPrisma.node.findMany.mockImplementation(async () => [])

      const result = await repository.findAllFolders()

      expect(result).toHaveLength(0)
    })

    it('should map FOLDER type correctly', async () => {
      mockPrisma.node.findMany.mockImplementation(async () => [mockPrismaFolder])

      const result = await repository.findAllFolders()

      expect(result[0].type).toBe(NodeType.FOLDER)
    })
  })

  describe('findDirectChildren', () => {
    it('should return direct children', async () => {
      mockPrisma.node.findMany.mockImplementation(async () => [mockPrismaFile])

      const result = await repository.findDirectChildren('1')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('resume.pdf')
      expect(result[0].type).toBe(NodeType.FILE)
    })

    it('should return empty array when no children', async () => {
      mockPrisma.node.findMany.mockImplementation(async () => [])

      const result = await repository.findDirectChildren('1')

      expect(result).toHaveLength(0)
    })
  })

  describe('findById', () => {
    it('should return node when found', async () => {
      mockPrisma.node.findUnique.mockImplementation(async () => mockPrismaFolder)

      const result = await repository.findById('1')

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Documents')
      expect(result?.type).toBe(NodeType.FOLDER)
    })

    it('should return null when not found', async () => {
      mockPrisma.node.findUnique.mockImplementation(async () => null)

      const result = await repository.findById('999')

      expect(result).toBeNull()
    })
  })

  describe('searchByName', () => {
    it('should return matching nodes', async () => {
      mockPrisma.node.findMany.mockImplementation(async () => [mockPrismaFolder])

      const result = await repository.searchByName('Documents')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Documents')
    })
  })

  describe('buildTree (via findAllFolders)', () => {
    it('should correctly build multi-level tree', async () => {
      const level2 = { ...mockPrismaFolder, id: '3', name: 'Projects', parentId: '2', depth: 2 }
      const level1 = { ...mockPrismaFolder, id: '2', name: 'Work', parentId: '1', depth: 1 }

      mockPrisma.node.findMany.mockImplementation(async () => [
        mockPrismaFolder,
        level1,
        level2,
      ])

      const result = await repository.findAllFolders()

      expect(result).toHaveLength(1)
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children[0].children).toHaveLength(1)
      expect(result[0].children[0].children[0].name).toBe('Projects')
    })
  })
})