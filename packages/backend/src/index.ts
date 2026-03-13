import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { nodeRoutes } from './presentation/routes/nodeRoutes'

const PORT = Number(process.env.PORT) || 3000

const app = new Elysia()
  .use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:4173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Window Explorer API',
          version: '1.0.0',
          description: 'REST API for the Window Explorer web app',
        },
      },
    })
  )
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }))
  .use(nodeRoutes)
  .listen(PORT)

console.log(`🦊 Backend running at http://localhost:${PORT}`)
console.log(`📖 Swagger docs at http://localhost:${PORT}/swagger`)