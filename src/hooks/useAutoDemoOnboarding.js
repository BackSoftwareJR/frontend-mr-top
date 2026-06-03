import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  approvePartner,
  clearAutoDemo,
  getOnboardingData,
  isAutoDemoEnabled,
  submitOnboardingForReview,
} from '../services/b2bOnboardingService'

const TOUR_STEP_KEY = 'wenando-b2b-tour-step'
const STEP_MS = 2000
const PENDING_MS = 2500

export function resetAutoDemoTour() {
  sessionStorage.removeItem(TOUR_STEP_KEY)
}

/**
 * Avanza automaticamente gli step onboarding (resistente a Strict Mode / remount).
 */
export function useAutoDemoOnboarding({
  email,
  status,
  setStepIndex,
  setData,
  setAutoDemoRunning,
  onStatusChange,
}) {
  const navigate = useNavigate()
  const tourTimerRef = useRef(null)
  const pendingTimerRef = useRef(null)

  useEffect(() => {
    if (tourTimerRef.current) {
      clearTimeout(tourTimerRef.current)
      tourTimerRef.current = null
    }
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }

    if (!email || !isAutoDemoEnabled()) return

    if (status === 'approved') {
      clearAutoDemo()
      resetAutoDemoTour()
      return
    }

    if (status === 'pending_review') {
      setAutoDemoRunning?.(true)
      pendingTimerRef.current = setTimeout(() => {
        approvePartner(email)
        clearAutoDemo()
        resetAutoDemoTour()
        setAutoDemoRunning?.(false)
        navigate('/pro/dashboard', { replace: true })
      }, PENDING_MS)
      return () => {
        if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current)
      }
    }

    if (status !== 'in_progress' && status !== null) return

    setData(getOnboardingData(email))
    setAutoDemoRunning?.(true)

    let step = Number.parseInt(sessionStorage.getItem(TOUR_STEP_KEY) ?? '0', 10)
    if (Number.isNaN(step) || step < 0) step = 0
    if (step > 3) step = 0

    setStepIndex(step)
    sessionStorage.setItem(TOUR_STEP_KEY, String(step))

    const scheduleNext = () => {
      tourTimerRef.current = setTimeout(() => {
        const next = step + 1

        if (next <= 3) {
          step = next
          sessionStorage.setItem(TOUR_STEP_KEY, String(step))
          setStepIndex(step)
          scheduleNext()
          return
        }

        sessionStorage.removeItem(TOUR_STEP_KEY)
        submitOnboardingForReview(email)
        onStatusChange?.()
      }, STEP_MS)
    }

    scheduleNext()

    return () => {
      if (tourTimerRef.current) {
        clearTimeout(tourTimerRef.current)
        tourTimerRef.current = null
      }
    }
  }, [email, navigate, onStatusChange, setAutoDemoRunning, setData, setStepIndex, status])
}
