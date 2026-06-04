# API observability

Every `/api/*` request emits one structured JSON line on the `json` log channel (`config/logging.php`), written by `LogApiRequest` middleware after the response is sent. Each record includes `level` (`info` / `warning` / `error` from HTTP status), `request_id` (from `AssignRequestId` / `X-Request-Id`), `route` (named route or path), `user_id` (authenticated id or null), `status`, and `duration_ms`. Unexpected 5xx responses also get an `event: exception` line from the API exception handler with the same base fields. Default stream is `php://stderr`; override with `LOG_JSON_STREAM` (e.g. `storage/logs/api.json`) and `LOG_JSON_LEVEL` in production. Human-readable stack traces remain on the default `stack` channel; ship stderr JSON to your log aggregator without changing API responses.

## Sentry (optional)

When `SENTRY_LARAVEL_DSN` is set in backend `.env`, `sentry/sentry-laravel` captures unhandled exceptions (sample rate 0.2, traces 0.1). Authenticated requests tag user id only (no email). `SetSentryContext` middleware adds `request_id` as a Sentry tag on API requests.

When `VITE_SENTRY_DSN` is set at SPA build time, `@sentry/react` initializes in `bootstrap.jsx` (same sample rates). `AuthContext` sets user id on login; `apiClient` attaches `request_id` from API error payloads and captures 5xx `ApiError`s.

PHPUnit sets `SENTRY_LARAVEL_DSN=` empty in `phpunit.xml` so tests never send events.
