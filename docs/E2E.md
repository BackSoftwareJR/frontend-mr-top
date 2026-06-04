# End-to-end (Playwright) smoke

Minimal Playwright setup for B2B/B2C/Admin UI smoke checks and API-backed flows.

## Prerequisites

```bash
npm install
npx playwright install chromium
```

## Mock smoke (default — no backend)

Tests run against the Vite preview build **without** `VITE_API_URL`, so the SPA uses localStorage/mock fallbacks (no Laravel or seeded DB required).

```bash
npm run test:e2e
```

Against an already-running preview (faster local iteration):

```bash
npm run build && npm run preview -- --host 127.0.0.1 --port 4173
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
```

### What is covered (mock)

| Spec | Assertion |
|------|-----------|
| `e2e/b2b-smoke.spec.js` | `/pro` portal copy visible |
| | `/pro/accedi` login heading visible |
| | `/pro/marketplace` redirects to `/pro` when unauthenticated |

Without `E2E_API_URL`, the 9 API-backed specs are **skipped** (3 mock specs run).

## API-backed smoke (local reproduction)

Requires a running Laravel API with dev seed. OTP admin/consumer tests need `APP_ENV=local` (returns `dev_code` in OTP responses). See [backend/docs/DEV_SEED.md](../backend/docs/DEV_SEED.md).

### 1. Backend — SQLite + migrate + seed

From repo root:

```bash
cd backend
composer install
cp .env.e2e.local .env          # or: cp .env.e2e .env and adjust APP_URL/port
touch database/e2e-local.sqlite   # path must match DB_DATABASE in .env
php artisan migrate --force
php artisan db:seed --force
php artisan serve --host=127.0.0.1 --port=8001
```

Wait until health check succeeds:

```bash
curl -s http://127.0.0.1:8001/api/v1/health
# → "success": true
```

**Notes**

- `.env.e2e` / `.env.e2e.local` set `APP_ENV=local`, SQLite, `QUEUE_CONNECTION=sync`, `MAIL_MAILER=array` — suitable for CI and local E2E.
- OTP `dev_code` is returned when `APP_ENV=local` or `testing` (`OtpAuthService`).
- Bank transfer recharge uses default `WENANDO_BANK_IBAN` from config; no Stripe key required.
- Do **not** reuse a preview server started without `VITE_API_URL` — Playwright rebuilds when `E2E_API_URL` is set (see `playwright.config.js`).

### 2. Frontend — run Playwright with API env

From repo root (Playwright builds preview with `VITE_API_URL` when `E2E_API_URL` is set):

```bash
E2E_API_URL=http://127.0.0.1:8001/api/v1 npm run test:e2e
```

Expected: **12 passed** (3 mock + 9 API specs). API specs run **serially** (`workers: 1`) because OTP login shares per-email state.

API-only subset:

```bash
E2E_API_URL=http://127.0.0.1:8001/api/v1 npm run test:e2e:api
```

With preview already running (must be built with `VITE_API_URL`):

```bash
VITE_API_URL=http://127.0.0.1:8001/api/v1 npm run build
npm run preview -- --host 127.0.0.1 --port 4173
E2E_API_URL=http://127.0.0.1:8001/api/v1 PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
```

### What is covered (API)

| Spec | Assertion |
|------|-----------|
| `e2e/api-smoke.spec.js` | B2B password login → dashboard with API session |
| `e2e/admin-impersonate.spec.js` | Admin impersonates Care Partner (API + ManagePartners UI) |
| `e2e/admin-lead-assign.spec.js` | Admin assigns Giulia lead (API + Lead Router UI) |
| `e2e/admin-search.spec.js` | Admin spotlight search navigates to partners |
| `e2e/bank-transfer-settle.spec.js` | Partner bonifico recharge → admin settle → wallet credit |
| `e2e/consumer-wizard-attach.spec.js` | Consumer OTP login, searches list, attach orphan lead |

Seeded credentials: `partner@care.it` / `password`, `admin@wenando.test` (OTP), `consumer@wenando.test` (OTP).

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `PLAYWRIGHT_BASE_URL` | No | Default `http://127.0.0.1:4173` |
| `PLAYWRIGHT_SKIP_WEBSERVER` | No | Set `1` if preview is already running |
| `E2E_API_URL` | For API smoke | Laravel API base, e.g. `http://127.0.0.1:8001/api/v1`. When set, `playwright.config.js` passes it as `VITE_API_URL` for the preview build and runs API specs serially |
| `VITE_API_URL` | No for mock smoke | Omit for mock/localStorage mode; set manually only if you build outside Playwright |
| `CI` | Set in GHA | Retries, `forbidOnly`, GitHub reporter |

No secrets are needed for smoke specs. API smoke uses documented dev credentials from `DEV_SEED.md` (local only).

## CI (GitHub Actions)

Workflow: **CI** (`.github/workflows/ci.yml`). Overview: [CI.md](./CI.md).

| Job | Purpose |
|-----|---------|
| **Backend Tests** | Laravel PHPUnit (`php artisan test`, SQLite in-memory) |
| **Playwright E2E** | SPA mock smoke (no `E2E_API_URL`) |
| **Playwright E2E (API)** | `backend/.env.e2e` → migrate + seed → `artisan serve` → **12/12** E2E |

API job steps: checkout → PHP 8.3 → `composer install` → copy `.env.e2e` + touch SQLite → `php artisan migrate --force && php artisan db:seed --force` → background `php artisan serve` on port 8000 → `npm ci` → Playwright → `E2E_API_URL=http://127.0.0.1:8000/api/v1 npm run test:e2e`.

Mock job: `npm ci` → `npx playwright install --with-deps chromium` → `npm run build` → `npm run test:e2e`.
