import apiClient, { isApiConfigured, unwrapApiData } from './apiClient'

/**
 * GET /b2b/integrations/google/connect
 */
export async function fetchGoogleCalendarConnectUrl() {
  if (!isApiConfigured()) {
    throw new Error('Google Calendar richiede API configurata.')
  }

  const response = await apiClient.get('/b2b/integrations/google/connect')
  const data = unwrapApiData(response)

  return {
    authorizationUrl: data.authorization_url ?? data.authorizationUrl ?? '',
    state: data.state ?? '',
  }
}

/**
 * GET /b2b/integrations/google/status
 */
export async function fetchGoogleCalendarStatus() {
  if (!isApiConfigured()) {
    return {
      connected: false,
      syncEnabled: false,
      calendarId: null,
      connectedAt: null,
      connectedByUserId: null,
      scopes: [],
    }
  }

  const response = await apiClient.get('/b2b/integrations/google/status')
  const data = unwrapApiData(response)

  return {
    connected: Boolean(data.connected),
    syncEnabled: Boolean(data.sync_enabled ?? data.syncEnabled),
    calendarId: data.calendar_id ?? data.calendarId ?? null,
    connectedAt: data.connected_at ?? data.connectedAt ?? null,
    connectedByUserId: data.connected_by_user_id ?? data.connectedByUserId ?? null,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
  }
}

/**
 * POST /b2b/integrations/google/disconnect
 */
export async function disconnectGoogleCalendar() {
  if (!isApiConfigured()) {
    throw new Error('Google Calendar richiede API configurata.')
  }

  const response = await apiClient.post('/b2b/integrations/google/disconnect')
  unwrapApiData(response)

  return { disconnected: true }
}

/**
 * POST /b2b/integrations/google/sync
 */
export async function syncGoogleCalendar() {
  if (!isApiConfigured()) {
    throw new Error('Google Calendar richiede API configurata.')
  }

  const response = await apiClient.post('/b2b/integrations/google/sync')
  const data = unwrapApiData(response)

  return {
    pulled: data.pulled ?? 0,
  }
}
