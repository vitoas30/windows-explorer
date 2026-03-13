import { describe, it, expect, mock, beforeEach } from 'bun:test'
import {
  GetFolderTreeUseCase,
  GetDirectChildrenUseCase,
  SearchNodesUseCase,
} from '../../../application/use-cases/NodeUseCases'
import type { INodeRepository } from '../../../domain/repositories/INodeRepository'
import { NodeType } from '../../../domain/entities/Node'
import type { NodeWithChildren } from '../../../domain/entities/Node'

// Mock repository
const mockRepository: INodeRepository = {
  findAllFolders: mock(async () => []),
  findDirectChildren: mock(async () => []),
  findById: mock(async () => null),
  searchByName: mock(async () => []),
  create: mock(async () => ({ id: '1', name: 'test', type: NodeType.FOLDER, parentId: null, path: '/test', depth: 0, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() })),
  delete: mock(async () => {}),
}

const mockFolder = {
  id: '1',
  name: 'Documents',
  type: NodeType.FOLDER,
  parentId: null,
  path: '/Documents',
  depth: 0,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockFolderWithChildren: NodeWithChildren = {
  ...mockFolder,
  children: [
    {
      id: '2',
      name: 'Work',
      type: NodeType.FOLDER,
      parentId: '1',
      path: '/Documents/Work',
      depth: 1,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
    },
  ],
}

describe('GetFolderTreeUseCase', () => {
  beforeEach(() => {
    (mockRepository.findAllFolders as ReturnType<typeof mock>).mockImplementation(async () => [mockFolderWithChildren])
  })

  it('should return folder tree as DTOs', async () => {
    const useCase = new GetFolderTreeUseCase(mockRepository)
    const result = await useCase.execute()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Documents')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children[0].name).toBe('Work')
  })

  it('should return empty array when no folders', async () => {
    (mockRepository.findAllFolders as ReturnType<typeof mock>).mockImplementation(async () => [])
    const useCase = new GetFolderTreeUseCase(mockRepository)
    const result = await useCase.execute()

    expect(result).toHaveLength(0)
  })
})

describe('GetDirectChildrenUseCase', () => {
  beforeEach(() => {
    (mockRepository.findById as ReturnType<typeof mock>).mockImplementation(async () => mockFolder)
    ;(mockRepository.findDirectChildren as ReturnType<typeof mock>).mockImplementation(async () => [
      { ...mockFolder, id: '2', name: 'Work', parentId: '1' },
    ])
  })

  it('should return direct children as DTOs', async () => {
    const useCase = new GetDirectChildrenUseCase(mockRepository)
    const result = await useCase.execute('1')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Work')
    expect(result[0].parentId).toBe('1')
  })

  it('should throw error when node not found', async () => {
    (mockRepository.findById as ReturnType<typeof mock>).mockImplementation(async () => null)
    const useCase = new GetDirectChildrenUseCase(mockRepository)

    expect(useCase.execute('999')).rejects.toThrow('not found')
  })
})

describe('SearchNodesUseCase', () => {
  beforeEach(() => {
    (mockRepository.searchByName as ReturnType<typeof mock>).mockImplementation(async () => [mockFolder])
  })

  it('should return search results', async () => {
    const useCase = new SearchNodesUseCase(mockRepository)
    const result = await useCase.execute('Documents')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Documents')
  })

  it('should return empty array for empty query', async () => {
    const useCase = new SearchNodesUseCase(mockRepository)
    const result = await useCase.execute('')

    expect(result).toHaveLength(0)
  })

  it('should return empty array for whitespace query', async () => {
    const useCase = new SearchNodesUseCase(mockRepository)
    const result = await useCase.execute('   ')

    expect(result).toHaveLength(0)
  })
})