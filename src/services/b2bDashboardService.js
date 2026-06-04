import {
  leadsTrendData,
  mockActivityFeed,
  mockNotifications,
} from '../data/mockB2B'
import apiClient, { unwrapApiData } from './apiClient'
import { b2bWithOfflineMock } from './b2bApiUtils'

function getMockDashboard() {
  return {
    stats: {
      walletBalanceCredits: 150,
      leadsUnlocked: 4,
      marketplaceAvailable: 1,
      conversionRate: '32%',
      monthlySpend: 705,
    },
    activityFeed: mockActivityFeed,
    leadsTrend: leadsTrendData,
    notificationsUnread: mockNotifications.filter((n) => !n.read).length,
  }
}

function getMockNotificationsPayload() {
  return {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter((n) => !n.read).length,
  }
}

/** @param {Record<string, unknown>} stats */
export function mapDashboardStats(stats) {
  const conversion = stats.conversion_rate ?? 0
  const conversionRate =
    typeof conversion === 'number'
      ? `${Math.round(conversion * 100)}%`
      : String(conversion)

  return {
    walletBalanceCredits: stats.wallet_balance_credits ?? 0,
    leadsUnlocked: stats.leads_unlocked ?? 0,
    marketplaceAvailable: stats.marketplace_available ?? 0,
    conversionRate,
    monthlySpend: stats.monthly_spend ?? 0,
  }
}

/** @param {Record<string, unknown>} point */
export function mapLeadsTrendPoint(point) {
  return {
    day: point.day ?? 0,
    date: point.date ?? '',
    leads: point.leads ?? 0,
  }
}

/** @param {Record<string, unknown>} item */
export function mapActivityItem(item) {
  return {
    id: item.id ?? `ACT-${item.created_at ?? Date.now()}`,
    type: item.type ?? 'status',
    text: item.text ?? item.message ?? '',
    time: item.time ?? item.created_at ?? '',
  }
}

function formatNotificationTime(value) {
  if (!value) return ''
  if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return 'Adesso'
  if (diffMin < 60) return `${diffMin} min fa`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} ore fa`

  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(date)
}

/** @param {Record<string, unknown>} n */
export function mapNotification(n) {
  const data = typeof n.data === 'object' && n.data !== null ? n.data : {}

  return {
    id: n.id,
    type: n.type ?? data.type ?? 'info',
    title: data.title ?? n.title ?? 'Notifica',
    message: data.message ?? data.body ?? n.message ?? '',
    time: formatNotificationTime(
      data.time ?? data.created_at ?? n.created_at ?? n.time ?? '',
    ),
    read: Boolean(n.read_at ?? n.read),
  }
}

/**
 * GET /b2b/dashboard
 */
export async function fetchB2bDashboard() {
  const response = await apiClient.get('/b2b/dashboard')
  const data = unwrapApiData(response)
  const stats = data.stats ?? {}

  return {
    stats: mapDashboardStats(stats),
    activityFeed: (Array.isArray(data.activity_feed) ? data.activity_feed : []).map(
      mapActivityItem,
    ),
    leadsTrend: (Array.isArray(data.leads_trend) ? data.leads_trend : []).map(
      mapLeadsTrendPoint,
    ),
    notificationsUnread: data.notifications_unread ?? 0,
  }
}

/**
 * GET /b2b/notifications
 */
export async function fetchB2bNotifications() {
  const response = await apiClient.get('/b2b/notifications')
  const data = unwrapApiData(response)

  return {
    notifications: (Array.isArray(data.notifications) ? data.notifications : []).map(
      mapNotification,
    ),
    unreadCount: data.unread_count ?? 0,
  }
}

/**
 * PATCH /b2b/notifications/{id}/read
 * @param {string} notificationId
 */
export async function markB2bNotificationRead(notificationId) {
  const response = await apiClient.patch(`/b2b/notifications/${notificationId}/read`)
  return unwrapApiData(response)
}

/** POST /b2b/notifications/read-all */
export async function markAllB2bNotificationsRead() {
  const response = await apiClient.post('/b2b/notifications/read-all')
  return unwrapApiData(response)
}

export function fetchB2bDashboardWithOfflineMock() {
  return b2bWithOfflineMock(fetchB2bDashboard, getMockDashboard)
}

export function fetchB2bNotificationsWithOfflineMock() {
  return b2bWithOfflineMock(fetchB2bNotifications, getMockNotificationsPayload)
}
