import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

let enabled = false

export function isSentryEnabled() {
  return enabled
}

export function initSentry() {
  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    sampleRate: 0.2,
    tracesSampleRate: 0.1,
  })

  enabled = true
}

/** Tag authenticated user by id only — no email or other PII. */
export function syncSentryUser(session) {
  if (!enabled) {
    return
  }

  if (session?.userId != null) {
    Sentry.setUser({ id: String(session.userId) })
    return
  }

  Sentry.setUser(null)
}

/**
 * Attach API correlation id and optionally report server errors.
 * @param {import('./apiClient').ApiError} apiError
 * @param {import('axios').InternalAxiosRequestConfig | undefined} config
 */
export function captureApiError(apiError, config) {
  if (!enabled) {
    return
  }

  Sentry.withScope((scope) => {
    if (apiError.traceId) {
      scope.setTag('request_id', apiError.traceId)
    }

    if (apiError.code) {
      scope.setTag('api_error_code', apiError.code)
    }

    if (config?.method) {
      scope.setExtra('api_method', config.method.toUpperCase())
    }

    if (config?.url) {
      scope.setExtra('api_url', config.url)
    }

    if (apiError.status >= 500) {
      Sentry.captureException(apiError)
      return
    }

    Sentry.addBreadcrumb({
      category: 'api',
      message: apiError.message,
      level: 'warning',
      data: {
        code: apiError.code,
        status: apiError.status,
        request_id: apiError.traceId ?? undefined,
      },
    })
  })
}

export { Sentry }
