import type { INodeRepository } from '../../domain/repositories/INodeRepository'
import type { NodeDTO, NodeTreeDTO, NodeWithContentDTO } from '../dtos/NodeDTO'
import type { Node, NodeWithChildren } from '../../domain/entities/Node'
import { NodeType } from '../../domain/entities/Node'

const toNodeDTO = (node: Node): NodeDTO => ({
  id: node.id,
  name: node.name,
  type: node.type,
  parentId: node.parentId,
  path: node.path,
  depth: node.depth,
  sortOrder: node.sortOrder,
  mimeType: node.mimeType,
})

const toNodeWithContentDTO = (node: Node): NodeWithContentDTO => ({
  ...toNodeDTO(node),
  content: node.content,
})

const toNodeTreeDTO = (node: NodeWithChildren): NodeTreeDTO => ({
  ...toNodeDTO(node),
  children: node.children.map(toNodeTreeDTO),
})

export class GetFolderTreeUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(): Promise<NodeTreeDTO[]> {
    const folders = await this.nodeRepository.findAllFolders()
    return folders.map(toNodeTreeDTO)
  }
}

export class GetDirectChildrenUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(parentId: string): Promise<NodeDTO[]> {
    const parent = await this.nodeRepository.findById(parentId)
    if (!parent) throw new Error(`Node with id "${parentId}" not found`)
    const children = await this.nodeRepository.findDirectChildren(parentId)
    return children.map(toNodeDTO)
  }
}

export class GetNodeContentUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(id: string): Promise<NodeWithContentDTO> {
    const node = await this.nodeRepository.findById(id)
    if (!node) throw new Error(`Node with id "${id}" not found`)
    return toNodeWithContentDTO(node)
  }
}

export class SearchNodesUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(query: string): Promise<NodeDTO[]> {
    if (!query || query.trim().length < 1) return []
    const nodes = await this.nodeRepository.searchByName(query.trim())
    return nodes.map(toNodeDTO)
  }
}

export class CreateNodeUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(props: {
    name: string
    type: 'FOLDER' | 'FILE'
    parentId: string | null
    content?: string | null
    mimeType?: string | null
  }): Promise<NodeDTO> {
    const trimmedName = props.name.trim()
    if (!trimmedName) throw new Error('Name cannot be empty')
    if (/[/\\:*?"<>|]/.test(trimmedName)) throw new Error('Name contains invalid characters')

    if (props.parentId) {
      const siblings = await this.nodeRepository.findDirectChildren(props.parentId)
      const duplicate = siblings.find(
        (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (duplicate) throw new Error(`"${trimmedName}" already exists in this folder`)
    }

    const node = await this.nodeRepository.create({
      name: trimmedName,
      type: props.type === 'FOLDER' ? NodeType.FOLDER : NodeType.FILE,
      parentId: props.parentId,
      content: props.content ?? null,
      mimeType: props.mimeType ?? null,
    })

    return toNodeDTO(node)
  }
}

export class RenameNodeUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(id: string, newName: string): Promise<NodeDTO> {
    const trimmedName = newName.trim()
    if (!trimmedName) throw new Error('Name cannot be empty')
    if (/[/\\:*?"<>|]/.test(trimmedName)) throw new Error('Name contains invalid characters')

    const node = await this.nodeRepository.findById(id)
    if (!node) throw new Error(`Node with id "${id}" not found`)

    // Check for duplicate in same folder
    if (node.parentId) {
      const siblings = await this.nodeRepository.findDirectChildren(node.parentId)
      const duplicate = siblings.find(
        (s) => s.id !== id && s.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (duplicate) throw new Error(`"${trimmedName}" already exists in this folder`)
    }

    const updated = await this.nodeRepository.update(id, { name: trimmedName })
    return toNodeDTO(updated)
  }
}

export class DeleteNodeUseCase {
  constructor(private readonly nodeRepository: INodeRepository) {}

  async execute(id: string): Promise<void> {
    const node = await this.nodeRepository.findById(id)
    if (!node) throw new Error(`Node with id "${id}" not found`)
    await this.nodeRepository.delete(id)
  }
}