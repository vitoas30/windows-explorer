import { Elysia, t } from 'elysia'
import {
  GetFolderTreeUseCase,
  GetDirectChildrenUseCase,
  GetNodeContentUseCase,
  SearchNodesUseCase,
  CreateNodeUseCase,
  RenameNodeUseCase,
  DeleteNodeUseCase,
} from '../../application/use-cases/NodeUseCases'
import { PrismaNodeRepository } from '../../infrastructure/repositories/PrismaNodeRepository'
import { prisma } from '../../infrastructure/database/prismaClient'
import type { ApiResponse } from '../../application/dtos/NodeDTO'

const repository = new PrismaNodeRepository(prisma)
const getFolderTreeUseCase = new GetFolderTreeUseCase(repository)
const getDirectChildrenUseCase = new GetDirectChildrenUseCase(repository)
const getNodeContentUseCase = new GetNodeContentUseCase(repository)
const searchNodesUseCase = new SearchNodesUseCase(repository)
const createNodeUseCase = new CreateNodeUseCase(repository)
const renameNodeUseCase = new RenameNodeUseCase(repository)
const deleteNodeUseCase = new DeleteNodeUseCase(repository)

const ok = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
})

const fail = (message: string): ApiResponse<null> => ({
  success: false,
  data: null,
  message,
})

export const nodeRoutes = new Elysia({ prefix: '/api/v1/nodes' })
  .get('/tree', async ({ set }) => {
    try {
      const tree = await getFolderTreeUseCase.execute()
      return ok(tree, 'Folder tree fetched successfully')
    } catch {
      set.status = 500
      return fail('Failed to fetch folder tree')
    }
  })
  .get(
    '/search',
    async ({ query: { q }, set }) => {
      try {
        const results = await searchNodesUseCase.execute(q ?? '')
        return ok(results, `Found ${results.length} result(s)`)
      } catch {
        set.status = 500
        return fail('Search failed')
      }
    },
    { query: t.Object({ q: t.Optional(t.String()) }) }
  )
  .get(
    '/:id/children',
    async ({ params: { id }, set }) => {
      try {
        const children = await getDirectChildrenUseCase.execute(id)
        return ok(children, 'Children fetched successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          set.status = 404
          return fail(error.message)
        }
        set.status = 500
        return fail('Failed to fetch children')
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    '/:id/content',
    async ({ params: { id }, set }) => {
      try {
        const node = await getNodeContentUseCase.execute(id)
        return ok(node, 'Node content fetched successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          set.status = 404
          return fail(error.message)
        }
        set.status = 500
        return fail('Failed to fetch content')
      }
    },
    { params: t.Object({ id: t.String() }) }
  )
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const node = await createNodeUseCase.execute(body)
        set.status = 201
        return ok(node, 'Node created successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          set.status = 404
          return fail(error.message)
        }
        if (error instanceof Error && error.message.includes('already exists')) {
          set.status = 409
          return fail(error.message)
        }
        set.status = 500
        return fail('Failed to create node')
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        type: t.Union([t.Literal('FOLDER'), t.Literal('FILE')]),
        parentId: t.Nullable(t.String()),
        content: t.Optional(t.Nullable(t.String())),
        mimeType: t.Optional(t.Nullable(t.String())),
      }),
    }
  )
  .patch(
    '/:id/rename',
    async ({ params: { id }, body, set }) => {
      try {
        const node = await renameNodeUseCase.execute(id, body.name)
        return ok(node, 'Node renamed successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          set.status = 404
          return fail(error.message)
        }
        if (error instanceof Error && error.message.includes('already exists')) {
          set.status = 409
          return fail(error.message)
        }
        set.status = 500
        return fail('Failed to rename node')
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ name: t.String({ minLength: 1 }) }),
    }
  )
  .delete(
    '/:id',
    async ({ params: { id }, set }) => {
      try {
        await deleteNodeUseCase.execute(id)
        return ok(null, 'Node deleted successfully')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          set.status = 404
          return fail(error.message)
        }
        set.status = 500
        return fail('Failed to delete node')
      }
    },
    { params: t.Object({ id: t.String() }) }
  )