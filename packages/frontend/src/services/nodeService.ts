import axios from 'axios'
import type { ApiResponse, NodeTreeDTO, NodeDTO, NodeWithContentDTO } from '@/types'
import { NodeType } from '@/types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Unknown error'
    return Promise.reject(new Error(message))
  }
)

export const nodeService = {
  async getFolderTree(): Promise<NodeTreeDTO[]> {
    const { data } = await api.get<ApiResponse<NodeTreeDTO[]>>('/nodes/tree')
    return data.data
  },

  async getDirectChildren(nodeId: string): Promise<NodeDTO[]> {
    const { data } = await api.get<ApiResponse<NodeDTO[]>>(`/nodes/${nodeId}/children`)
    return data.data
  },

  async getNodeContent(nodeId: string): Promise<NodeWithContentDTO> {
    const { data } = await api.get<ApiResponse<NodeWithContentDTO>>(`/nodes/${nodeId}/content`)
    return data.data
  },

  async searchNodes(query: string): Promise<NodeDTO[]> {
    const { data } = await api.get<ApiResponse<NodeDTO[]>>('/nodes/search', {
      params: { q: query },
    })
    return data.data
  },

  async createNode(payload: {
    name: string
    type: NodeType
    parentId: string | null
    content?: string | null
    mimeType?: string | null
  }): Promise<NodeDTO> {
    const { data } = await api.post<ApiResponse<NodeDTO>>('/nodes', payload)
    return data.data
  },

  async renameNode(nodeId: string, name: string): Promise<NodeDTO> {
    const { data } = await api.patch<ApiResponse<NodeDTO>>(`/nodes/${nodeId}/rename`, { name })
    return data.data
  },

  async deleteNode(nodeId: string): Promise<void> {
    await api.delete(`/nodes/${nodeId}`)
  },
}