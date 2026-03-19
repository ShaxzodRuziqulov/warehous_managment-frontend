export interface AuthResponse {
  token: string
  expiresIn: number
  userId: number
  roles: string[]
}

export interface CurrentUser {
  userId: number
  businessId?: number
  username: string
  roles: string[]
}

export interface LoginPayload {
  username: string
  password: string
}

export interface PaginatedRequest {
  page: number
  size: number
  search?: string
  filters?: Record<string, unknown>
}

export interface ResourceField {
  key: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select'
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
}

export interface ResourceConfig {
  key: string
  label: string
  shortLabel: string
  route: string
  basePath: string
  deleteEndpoint?: string
  fields: ResourceField[]
  tableColumns: string[]
  description: string
  supportsPaging?: boolean
  actions?: Array<{
    key: string
    label: string
    endpoint: (id: number | string) => string
  }>
}
