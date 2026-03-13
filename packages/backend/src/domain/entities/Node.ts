export enum NodeType {
  FOLDER = 'FOLDER',
  FILE = 'FILE',
}

export interface Node {
  id: string
  name: string
  type: NodeType
  parentId: string | null
  path: string
  depth: number
  sortOrder: number
  content: string | null
  mimeType: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NodeWithChildren extends Node {
  children: NodeWithChildren[]
}

export interface CreateNodeProps {
  name: string
  type: NodeType
  parentId: string | null
  content?: string | null
  mimeType?: string | null
}

export interface UpdateNodeProps {
  name?: string
  content?: string | null
  mimeType?: string | null
}