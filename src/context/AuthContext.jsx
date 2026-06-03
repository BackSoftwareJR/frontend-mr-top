import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  clearSession,
  getSession,
  sendLoginCode,
  verifyLoginCode,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())

  const login = useCallback(async (email, code) => {
    const result = verifyLoginCode(email, code)
    if (result.ok) {
      setSession(result.session)
    }
    return result
  }, [])

  const requestCode = useCallback(async (email, captchaPayload) => {
    return sendLoginCode(email, captchaPayload)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      userType: session?.type ?? null,
      userEmail: session?.email ?? null,
      userName: session?.name ?? null,
      login,
      requestCode,
      logout,
    }),
    [session, login, requestCode, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
