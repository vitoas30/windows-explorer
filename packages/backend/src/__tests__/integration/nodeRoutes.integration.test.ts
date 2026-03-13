import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import { nodeRoutes } from '../../presentation/routes/nodeRoutes'
import { prisma } from '../../infrastructure/database/prismaClient'

// Spin up a test app instance
const app = new Elysia().use(nodeRoutes)

// Test data
let seededFolderId: string
let seededChildId: string

beforeAll(async () => {
  // Clean up and seed test data
  await prisma.node.deleteMany()

  const root = await prisma.node.create({
    data: {
      name: 'TestRoot',
      type: 'FOLDER',
      parentId: null,
      path: '/TestRoot',
      depth: 0,
      sortOrder: 0,
    },
  })
  seededFolderId = root.id

  const child = await prisma.node.create({
    data: {
      name: 'TestChild',
      type: 'FOLDER',
      parentId: root.id,
      path: '/TestRoot/TestChild',
      depth: 1,
      sortOrder: 0,
    },
  })
  seededChildId = child.id

  await prisma.node.create({
    data: {
      name: 'test-file.txt',
      type: 'FILE',
      parentId: root.id,
      path: '/TestRoot/test-file.txt',
      depth: 1,
      sortOrder: 1,
    },
  })
})

afterAll(async () => {
  await prisma.node.deleteMany()
  await prisma.$disconnect()
})

describe('GET /api/v1/nodes/tree', () => {
  it('should return 200 with folder tree', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/tree')
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('should return folders with children nested', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/tree')
    )

    const body = await response.json()
    const root = body.data.find((n: any) => n.name === 'TestRoot')

    expect(root).toBeDefined()
    expect(root.children).toHaveLength(1)
    expect(root.children[0].name).toBe('TestChild')
  })

  it('should not include files in tree', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/tree')
    )

    const body = await response.json()
    const allNodes = flattenTree(body.data)
    const hasFile = allNodes.some((n: any) => n.type === 'FILE')

    expect(hasFile).toBe(false)
  })
})

describe('GET /api/v1/nodes/:id/children', () => {
  it('should return 200 with direct children', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/v1/nodes/${seededFolderId}/children`)
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2) // 1 folder + 1 file
  })

  it('should include both folders and files', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/v1/nodes/${seededFolderId}/children`)
    )

    const body = await response.json()
    const types = body.data.map((n: any) => n.type)

    expect(types).toContain('FOLDER')
    expect(types).toContain('FILE')
  })

  it('should return 404 for non-existent node', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/non-existent-id/children')
    )

    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.success).toBe(false)
  })

  it('should return empty array for node with no children', async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/v1/nodes/${seededChildId}/children`)
    )

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(0)
  })
})

describe('GET /api/v1/nodes/search', () => {
  it('should return matching nodes', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/search?q=Test')
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('should be case-insensitive', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/search?q=testroot')
    )

    const body = await response.json()
    expect(body.data.some((n: any) => n.name === 'TestRoot')).toBe(true)
  })

  it('should return empty array for no matches', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/search?q=zzznomatch')
    )

    const body = await response.json()
    expect(body.data).toHaveLength(0)
  })

  it('should return empty array for empty query', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/v1/nodes/search?q=')
    )

    const body = await response.json()
    expect(body.data).toHaveLength(0)
  })
})

describe('GET /health', () => {
  it('should return ok status', async () => {
    const healthApp = new Elysia().get('/health', () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }))

    const response = await healthApp.handle(
      new Request('http://localhost/health')
    )

    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.version).toBe('1.0.0')
  })
})

// Helper: flatten tree for assertions
function flattenTree(nodes: any[]): any[] {
  return nodes.reduce((acc, node) => {
    return [...acc, node, ...flattenTree(node.children ?? [])]
  }, [])
}