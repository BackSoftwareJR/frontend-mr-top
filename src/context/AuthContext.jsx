import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  getSession,
  logoutSession,
  patchSession,
  sendLoginCode,
  verifyLoginCode,
} from '../services/authService'
import {
  attachPendingLead,
  getPendingLeadUuid,
  LEAD_ATTACHED_EVENT,
} from '../services/leadService'
import { syncSentryUser } from '../services/sentryService'

const AuthContext = createContext(null)

function sessionFromAttach(session, attachResult) {
  const attachedUser = attachResult?.user
  if (!attachedUser) return session
  return (
    patchSession({
      name: attachedUser.name ?? session.name,
      phone: attachedUser.phone ?? session.phone ?? null,
    }) ?? session
  )
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())
  const pendingAttachStarted = useRef(false)

  /** Apply POST /user/leads user payload without a full reload (also fired via LEAD_ATTACHED_EVENT). */
  const applyLeadAttach = useCallback((attachResult) => {
    if (!attachResult?.user) return
    const current = getSession()
    if (current?.type !== 'consumer') return
    setSession((prev) => sessionFromAttach(prev ?? current, attachResult))
  }, [])

  useEffect(() => {
    function onLeadAttached(event) {
      applyLeadAttach(event.detail)
    }

    window.addEventListener(LEAD_ATTACHED_EVENT, onLeadAttached)
    return () => window.removeEventListener(LEAD_ATTACHED_EVENT, onLeadAttached)
  }, [applyLeadAttach])

  useEffect(() => {
    syncSentryUser(session)
  }, [session])

  useEffect(() => {
    if (pendingAttachStarted.current) return
    const current = getSession()
    if (current?.type !== 'consumer' || !getPendingLeadUuid()) return

    pendingAttachStarted.current = true
    let cancelled = false

    attachPendingLead().then(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, code) => {
    const result = await verifyLoginCode(email, code)
    if (result.ok) {
      let nextSession = result.session

      if (nextSession?.type === 'consumer') {
        const attachResult = await attachPendingLead()
        nextSession = sessionFromAttach(nextSession, attachResult)
      }

      setSession(nextSession)
      return { ...result, session: nextSession }
    }
    return result
  }, [])

  const requestCode = useCallback(async (email, captchaPayload, portal = 'consumer') => {
    return sendLoginCode(email, captchaPayload, portal)
  }, [])

  const logout = useCallback(async () => {
    await logoutSession()
    setSession(null)
  }, [])

  const refreshSession = useCallback(() => {
    setSession(getSession())
  }, [])

  const establishSession = useCallback((nextSession) => {
    setSession(nextSession ?? getSession())
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      userType: session?.type ?? null,
      userEmail: session?.email ?? null,
      userName: session?.name ?? null,
      userPhone: session?.phone ?? null,
      login,
      requestCode,
      logout,
      refreshSession,
      applyLeadAttach,
      establishSession,
    }),
    [session, login, requestCode, logout, refreshSession, applyLeadAttach, establishSession],
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
