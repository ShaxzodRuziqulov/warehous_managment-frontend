import axios from '../axios'
import type { AuthResponse, CurrentUser, LoginPayload } from '../types'

export const AuthService = {
  async login(payload: LoginPayload) {
    const { data } = await axios.post<AuthResponse>('/auth/login', payload)
    return data
  },
  async me() {
    const { data } = await axios.get<CurrentUser>('/auth/me')
    return data
  },
}
