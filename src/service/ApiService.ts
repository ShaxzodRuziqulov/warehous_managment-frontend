import axios from '../axios'
import type { PaginatedRequest } from '../types'

const withLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

const getIdValue = (entity: Record<string, unknown>) => {
  return (entity.id ?? entity.userId ?? entity.businessId ?? entity.marketId ?? entity.roleId ?? entity.tagId) as
    | number
    | string
    | undefined
}

export const ApiService = {
  async list(path: string) {
    const { data } = await axios.get(withLeadingSlash(path))
    return Array.isArray(data) ? data : []
  },

  async detail(path: string, id: number | string) {
    const { data } = await axios.get(`${withLeadingSlash(path)}/${id}`)
    return data
  },

  async create(path: string, payload: Record<string, unknown>) {
    const { data } = await axios.post(`${withLeadingSlash(path)}/create`, payload)
    return data
  },

  async update(path: string, id: number | string, payload: Record<string, unknown>) {
    const { data } = await axios.put(`${withLeadingSlash(path)}/update/${id}`, payload)
    return data
  },

  async remove(path: string, id: number | string, deleteEndpoint = '/delete') {
    const { data } = await axios.delete(`${withLeadingSlash(path)}${deleteEndpoint}/${id}`)
    return data
  },

  async paging(path: string, payload: PaginatedRequest) {
    const { data } = await axios.post(`${withLeadingSlash(path)}/paging`, payload)
    if (Array.isArray(data)) {
      return { content: data, totalElements: data.length }
    }
    if (Array.isArray(data?.content)) {
      return data
    }
    if (Array.isArray(data?.data)) {
      return { content: data.data, totalElements: data.totalElements ?? data.data.length }
    }
    return { content: [], totalElements: 0 }
  },

  async count(path: string) {
    const { data } = await axios.get<number>(`${withLeadingSlash(path)}/count`)
    return typeof data === 'number' ? data : Number(data ?? 0)
  },

  async latestIncomes(limit = 5) {
    try {
      const { data } = await axios.get('/api/admin/income/latest', { params: { limit } })
      return Array.isArray(data) ? data : []
    } catch {
      const { data } = await axios.get('/api/admin/income/latest')
      return Array.isArray(data) ? data : []
    }
  },

  async productChart() {
    const { data } = await axios.get('/api/admin/product/chart')
    if (Array.isArray(data)) {
      return data
    }
    return Object.entries(data ?? {}).map(([label, value]) => ({ label, value }))
  },

  async workflow(path: string) {
    const { data } = await axios.get(withLeadingSlash(path))
    return data
  },

  async loadCollection(path: string, supportsPaging = true, search = '', page = 0, size = 10) {
    if (supportsPaging) {
      try {
        const paged = await this.paging(path, { page, size, search })
        if (paged.content.length > 0 || search || paged.totalElements > 0) {
          return paged
        }
      } catch {
      }
    }

    const fallback = await this.list(`${path}/all`)
    const normalizedSearch = search.trim().toLowerCase()
    const filtered = normalizedSearch
      ? fallback.filter((item: Record<string, unknown>) =>
          JSON.stringify(item).toLowerCase().includes(normalizedSearch),
        )
      : fallback

    return {
      content: filtered.slice(page * size, page * size + size),
      totalElements: filtered.length,
    }
  },

  getIdValue,
}
