import type { Node, NodeWithChildren, CreateNodeProps, UpdateNodeProps } from '../entities/Node'

export interface INodeRepository {
  findAllFolders(): Promise<NodeWithChildren[]>
  findDirectChildren(parentId: string): Promise<Node[]>
  findById(id: string): Promise<Node | null>
  searchByName(query: string): Promise<Node[]>
  create(props: CreateNodeProps): Promise<Node>
  update(id: string, props: UpdateNodeProps): Promise<Node>
  delete(id: string): Promise<void>
}