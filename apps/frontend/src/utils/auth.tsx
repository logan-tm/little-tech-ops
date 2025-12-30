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

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const isAuthenticated = !!user

  const login = async (token: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate a delay

    // Simulate login failure for a specific token
    if (token === 'incorrect@login.com') {
      throw new Error('Invalid credentials')
    }
    localStorage.setItem('token', token)
    setUser({ token })
    return Promise.resolve()
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setUser(null)
    return Promise.resolve()
  }

  useEffect(() => {
    ;(() => {
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
