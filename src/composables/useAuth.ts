import { reactive } from 'vue'
import { AuthService } from '../service/AuthService'
import type { CurrentUser, LoginPayload } from '../types'
import { clearAuthSession, getCurrentUser, isAuthenticated, saveAuthSession, saveCurrentUser } from '../lib/auth'

export const authState = reactive<{
  user: CurrentUser | null
  initialized: boolean
}>({
  user: getCurrentUser(),
  initialized: false,
})

export const initializeAuth = async () => {
  if (!isAuthenticated()) {
    authState.user = null
    authState.initialized = true
    return
  }

  if (authState.user) {
    authState.initialized = true
    return
  }

  try {
    const user = await AuthService.me()
    authState.user = user
    saveCurrentUser(user)
  } catch {
    clearAuthSession()
    authState.user = null
  } finally {
    authState.initialized = true
  }
}

export const login = async (payload: LoginPayload) => {
  const session = await AuthService.login(payload)
  saveAuthSession(session)
  const user = await AuthService.me()
  saveCurrentUser(user)
  authState.user = user
}

export const logout = () => {
  clearAuthSession()
  authState.user = null
}
