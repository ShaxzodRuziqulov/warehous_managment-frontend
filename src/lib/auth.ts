import type { AuthResponse, CurrentUser } from '../types'

const TOKEN_KEY = 'warehouse.token'
const SESSION_KEY = 'warehouse.session'
const USER_KEY = 'warehouse.user'

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
export const isAuthenticated = () => Boolean(getAccessToken())

export const saveAuthSession = (payload: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
}

export const saveCurrentUser = (user: CurrentUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getCurrentUser = (): CurrentUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    return null
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(USER_KEY)
}
