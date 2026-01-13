import { createContext, useContext, useEffect, useState } from 'react'

export interface UserData {
  token: string
}

export interface AuthContext {
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  user: UserData | null
}

const AuthContext = createContext<AuthContext>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  user: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const isAuthenticated = !!user

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    setUser({ token })
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    ;(async () => {
      const data = localStorage.getItem('token')
      if (data) {
        setUser({ token: data })
      }
    })()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
