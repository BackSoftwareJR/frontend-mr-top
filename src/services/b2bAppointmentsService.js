import apiClient, { unwrapApiData } from './apiClient'

/** @param {Record<string, unknown>} row */
function mapAppointment(row) {
  return {
    id: row.id,
    clientId: row.client_id ?? row.clientId,
    cliente: row.cliente ?? '',
    date: row.date ?? '',
    time: row.time ?? '',
    note: row.note ?? '',
  }
}

/**
 * GET /b2b/appointments
 */
export async function fetchAppointments(params = {}) {
  const response = await apiClient.get('/b2b/appointments', {
    params: {
      from: params.from,
      to: params.to,
    },
  })
  const data = unwrapApiData(response)
  const appointments = Array.isArray(data.appointments) ? data.appointments : []
  return appointments.map(mapAppointment)
}

/**
 * POST /b2b/appointments
 * @param {{ clientId: string, date: string, time: string, note?: string, idempotencyKey?: string }} params
 */
export async function createAppointment({ clientId, date, time, note, idempotencyKey }) {
  const headers = {}
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }

  const response = await apiClient.post(
    '/b2b/appointments',
    {
      client_id: clientId,
      date,
      time,
      note: note ?? undefined,
    },
    { headers },
  )
  const data = unwrapApiData(response)

  return {
    appointment: data.appointment ? mapAppointment(data.appointment) : null,
    client: data.client ?? null,
  }
}
