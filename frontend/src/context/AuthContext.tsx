import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { fetchCurrentUser, login as loginRequest, signup as signupRequest } from '../services/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('vy_access_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    fetchCurrentUser()
      .then((u) => {
        setUser(u)
        localStorage.setItem('vy_user', JSON.stringify(u))
      })
      .catch(() => {
        localStorage.removeItem('vy_access_token')
        localStorage.removeItem('vy_user')
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const { access_token, user: loggedInUser } = await loginRequest(username, password)
    localStorage.setItem('vy_access_token', access_token)
    localStorage.setItem('vy_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  async function signup(name: string, email: string, password: string) {
    const { access_token, user: newUser } = await signupRequest(name, email, password)
    localStorage.setItem('vy_access_token', access_token)
    localStorage.setItem('vy_user', JSON.stringify(newUser))
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('vy_access_token')
    localStorage.removeItem('vy_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin: user?.role === 'ADMIN', login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
