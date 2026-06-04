import apiClient, { unwrapApiData } from './apiClient'
import { userWithOfflineMock } from './userApiUtils'
import { mockAdvisor } from '../data/mockMatches'

/** @param {Record<string, unknown>} [apiAdvisor] */
export function mapAdvisor(apiAdvisor) {
  if (!apiAdvisor || typeof apiAdvisor !== 'object') {
    return { ...mockAdvisor }
  }

  return {
    name: apiAdvisor.name ?? mockAdvisor.name,
    role: apiAdvisor.role ?? mockAdvisor.role,
    story: apiAdvisor.story ?? mockAdvisor.story,
    ctaLabel: apiAdvisor.cta_label ?? apiAdvisor.ctaLabel ?? mockAdvisor.ctaLabel,
    avatarUrl: apiAdvisor.avatar_url ?? apiAdvisor.avatarUrl ?? null,
    calendlyUrl: apiAdvisor.calendly_url ?? apiAdvisor.calendlyUrl ?? null,
  }
}

/**
 * GET /b2c/advisor — default peer advisor profile.
 */
export async function fetchAdvisor() {
  const response = await apiClient.get('/b2c/advisor')
  return mapAdvisor(unwrapApiData(response))
}

export function fetchAdvisorWithFallback() {
  return userWithOfflineMock(() => fetchAdvisor(), () => ({ ...mockAdvisor }))
}

/**
 * POST /user/advisor-bookings — book a peer advisor call.
 * @param {{ name: string, scheduledDate: string, scheduledTime: string, leadUuid?: string }} payload
 */
export async function createAdvisorBooking({ name, scheduledDate, scheduledTime, leadUuid }) {
  const body = {
    name,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
  }
  if (leadUuid) {
    body.lead_uuid = leadUuid
  }
  const response = await apiClient.post('/user/advisor-bookings', body)
  return unwrapApiData(response)
}

/** @param {Record<string, unknown>} booking */
function mapAdvisorBooking(booking) {
  return {
    id: booking.id,
    scheduledDate: booking.scheduled_date ?? booking.scheduledDate ?? '',
    scheduledTime: booking.scheduled_time ?? booking.scheduledTime ?? '',
    name: booking.name ?? '',
    leadTitle: booking.lead_title ?? booking.leadTitle ?? null,
  }
}

/**
 * GET /user/advisor-bookings — upcoming and past advisor calls.
 */
export async function fetchAdvisorBookings() {
  const response = await apiClient.get('/user/advisor-bookings')
  const data = unwrapApiData(response)

  return {
    upcoming: (Array.isArray(data.upcoming) ? data.upcoming : []).map(mapAdvisorBooking),
    past: (Array.isArray(data.past) ? data.past : []).map(mapAdvisorBooking),
  }
}

export function fetchAdvisorBookingsWithFallback() {
  return userWithOfflineMock(() => fetchAdvisorBookings(), () => ({ upcoming: [], past: [] }))
}

/**
 * PATCH /user/advisor-bookings/{id} — reschedule an upcoming advisor call.
 * @param {{ bookingId: number|string, scheduledDate: string, scheduledTime: string }} payload
 */
export async function rescheduleAdvisorBooking({ bookingId, scheduledDate, scheduledTime }) {
  const response = await apiClient.patch(`/user/advisor-bookings/${bookingId}`, {
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
  })
  return unwrapApiData(response)
}

/**
 * DELETE /user/advisor-bookings/{id} — cancel an upcoming advisor call.
 * @param {number|string} bookingId
 */
export async function cancelAdvisorBooking(bookingId) {
  const response = await apiClient.delete(`/user/advisor-bookings/${bookingId}`)
  return unwrapApiData(response)
}
