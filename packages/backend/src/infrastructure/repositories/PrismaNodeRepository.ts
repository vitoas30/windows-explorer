import type { PrismaClient } from '@prisma/client'
import type { INodeRepository } from '../../domain/repositories/INodeRepository'
import type { Node, NodeWithChildren, CreateNodeProps, UpdateNodeProps } from '../../domain/entities/Node'
import { NodeType } from '../../domain/entities/Node'

type PrismaNode = {
  id: string
  name: string
  type: 'FOLDER' | 'FILE'
  parentId: string | null
  path: string
  depth: number
  sortOrder: number
  content: string | null
  mimeType: string | null
  createdAt: Date
  updatedAt: Date
}

const toDomainNode = (prismaNode: PrismaNode): Node => ({
  ...prismaNode,
  type: prismaNode.type === 'FOLDER' ? NodeType.FOLDER : NodeType.FILE,
})

export class PrismaNodeRepository implements INodeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllFolders(): Promise<NodeWithChildren[]> {
    const folders = await this.prisma.node.findMany({
      where: { type: 'FOLDER' },
      orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    })
    return this.buildTree(folders.map(toDomainNode))
  }

  async findDirectChildren(parentId: string): Promise<Node[]> {
    const children = await this.prisma.node.findMany({
      where: { parentId },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    })
    return children.map(toDomainNode)
  }

  async findById(id: string): Promise<Node | null> {
    const node = await this.prisma.node.findUnique({ where: { id } })
    return node ? toDomainNode(node) : null
  }

  async searchByName(query: string): Promise<Node[]> {
    const nodes = await this.prisma.node.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      take: 100,
    })
    return nodes.map(toDomainNode)
  }

  async create(props: CreateNodeProps): Promise<Node> {
    let path: string
    let depth: number

    if (props.parentId) {
      const parent = await this.prisma.node.findUnique({ where: { id: props.parentId } })
      if (!parent) throw new Error(`Parent node "${props.parentId}" not found`)
      path = `${parent.path}/${props.name}`
      depth = parent.depth + 1
    } else {
      path = `/${props.name}`
      depth = 0
    }

    const node = await this.prisma.node.create({
      data: {
        name: props.name,
        type: props.type,
        parentId: props.parentId,
        path,
        depth,
        content: props.content ?? null,
        mimeType: props.mimeType ?? null,
      },
    })
    return toDomainNode(node)
  }

  async update(id: string, props: UpdateNodeProps): Promise<Node> {
    // If renaming, update path too
    let updateData: any = {}
    if (props.name) {
      const node = await this.prisma.node.findUnique({ where: { id } })
      if (!node) throw new Error(`Node "${id}" not found`)
      const parentPath = node.path.substring(0, node.path.lastIndexOf('/'))
      updateData.name = props.name
      updateData.path = `${parentPath}/${props.name}`
    }
    if (props.content !== undefined) updateData.content = props.content
    if (props.mimeType !== undefined) updateData.mimeType = props.mimeType

    const node = await this.prisma.node.update({
      where: { id },
      data: updateData,
    })
    return toDomainNode(node)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.node.delete({ where: { id } })
  }

  private buildTree(nodes: Node[]): NodeWithChildren[] {
    const nodeMap = new Map<string, NodeWithChildren>()
    const roots: NodeWithChildren[] = []

    for (const node of nodes) {
      nodeMap.set(node.id, { ...node, children: [] })
    }

    for (const node of nodes) {
      const nodeWithChildren = nodeMap.get(node.id)!
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(nodeWithChildren)
      } else {
        roots.push(nodeWithChildren)
      }
    }

    return roots
  }
}