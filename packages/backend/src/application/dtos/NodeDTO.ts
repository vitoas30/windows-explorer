import type { NodeType } from '../../domain/entities/Node'

export interface NodeDTO {
  id: string
  name: string
  type: NodeType
  parentId: string | null
  path: string
  depth: number
  sortOrder: number
  mimeType: string | null
}

export interface NodeWithContentDTO extends NodeDTO {
  content: string | null
}

export interface NodeTreeDTO extends NodeDTO {
  children: NodeTreeDTO[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}