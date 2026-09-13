import { api } from './api'
import type { User } from '../types'

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { username, password })
  return data
}

export async function signup(name: string, email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/signup', { name, email, password })
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await api.post('/api/auth/logout')
}
