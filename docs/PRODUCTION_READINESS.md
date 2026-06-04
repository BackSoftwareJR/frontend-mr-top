# Production readiness — Wenando

Last audit: **2026-06-04** (Agent #42 — post Agents 37–41: CI lint/Pint, captcha, Sentry, E2E API 12/12, [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)). Use this checklist before first production deploy and before each release.

Executive summary (stakeholder): [PLATFORM_SCORECARD.md](./PLATFORM_SCORECARD.md)

---

## DEV / mock bypass audit

| Pattern | Count | Notes |
|---------|------:|-------|
| `withDevMockFallback(` call sites | **0** | Removed from `src/services/apiClient.js` (Agent #25) |
| `import.meta.env.DEV` (API-adjacent) | **7** | All intentional — see below |

**Remaining `import.meta.env.DEV` usages (expected):**

| File | Purpose |
|------|---------|
| `src/services/authApiUtils.js` (×2) | `shouldShowOtpDevHint` — show OTP hint in dev when offline or API returns `dev_code` |
| `src/services/authService.js` (×3) | Offline mock: console OTP, `devCode` in response, dev mock token |
| `src/pages/admin/AdminLogin.jsx` (×1) | Dev-only demo email hint in UI |
| `src/pages/b2b/ProAccedi.jsx` (×1) | Dev-only password-login error copy |

**Offline-only mock path:** when `VITE_API_URL` is unset, `isApiConfigured()` is false and services use localStorage mocks via `authWithOfflineMock` / `*ApiUtils` — required for local UI work and Playwright mock smoke. Production builds **must** set `VITE_API_URL`.

---

## Environment variables checklist

### Frontend (build-time — `.env` / CI secrets)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `VITE_API_URL` | **Yes** | `https://api.wenando.com/api/v1` — must include `/api/v1` |
| `VITE_HCAPTCHA_SITE_KEY` | Optional | Production captcha on OTP forms |
| `VITE_RECAPTCHA_SITE_KEY` | Optional | Alternative captcha provider |
| `VITE_WALLET_INSTANT_RECHARGE` | Dev only | `true` — pairs with backend `WENANDO_WALLET_INSTANT_RECHARGE` for instant wallet credit in UI |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For card recharge | `pk_live_...` — enables Stripe Elements in B2B recharge modal |

Template: [`.env.example`](../.env.example)

### Backend (runtime — `backend/.env`)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `APP_KEY` | **Yes** | `php artisan key:generate` — never commit |
| `APP_ENV` | **Yes** | `production` |
| `APP_DEBUG` | **Yes** | `false` |
| `APP_URL` | **Yes** | `https://api.wenando.com` |
| `DB_*` | **Yes** | Hostinger MySQL credentials |
| `SESSION_DOMAIN` | **Yes** | `.wenando.com` (Sanctum SPA cookie) |
| `SESSION_SECURE_COOKIE` | **Yes** | `true` |
| `SANCTUM_STATEFUL_DOMAINS` | **Yes** | `wenando.com,www.wenando.com` |
| `FRONTEND_URL` | **Yes** | `https://wenando.com` — OTP links, mail templates |
| `MAIL_*` | **Yes** | SMTP (Hostinger): OTP delivery |
| `WENANDO_WEBHOOK_SECRET` | **Yes** (prod recharge) | Shared secret; PSP sends `X-Wenando-Webhook-Secret` |
| `WENANDO_WALLET_INSTANT_RECHARGE` | Dev only | `true` — skip payment intent flow (never in prod) |
| `STRIPE_SECRET_KEY` | For card recharge | Creates real Stripe PaymentIntents; omit to keep mock `client_secret` |
| `STRIPE_WEBHOOK_SECRET` | For card recharge | Verifies `Stripe-Signature` on `POST /webhooks/payments/stripe` |
| `WENANDO_BANK_IBAN` | **Yes** (bank transfer recharge) | Real IBAN shown in B2B bonifico UI — never use placeholder in prod |
| `WENANDO_BANK_BENEFICIARY` | **Yes** (bank transfer recharge) | Beneficiary name on bank transfer instructions |
| `LOG_JSON_STREAM` | Recommended | `php://stderr` — ship to log aggregator |
| `LOG_JSON_LEVEL` | Optional | Default `info`; use `warning` to reduce volume |
| `LOG_CHANNEL` / `LOG_LEVEL` | Recommended | `stack` + `warning` in production |
| `QUEUE_CONNECTION` | **Yes** | `database` (no Redis on Hostinger) |
| `CACHE_STORE` | **Yes** | `file` |
| `HCAPTCHA_SECRET` | Prod recommended | Server-side hCaptcha verify on `POST /auth/otp/request`; omit in dev/staging |
| `RECAPTCHA_SECRET` | Alternative | reCAPTCHA verify (used only if `HCAPTCHA_SECRET` unset) |
| `SENTRY_LARAVEL_DSN` | Optional | Error tracking |

CORS is configured in [`backend/config/cors.php`](../backend/config/cors.php) — production origins: `https://wenando.com`, `https://www.wenando.com` (plus localhost for dev). No env var; verify file before deploy.

Template: [`backend/.env.production.example`](../backend/.env.production.example)

Structured API logs: [OBSERVABILITY.md](./OBSERVABILITY.md)

---

## CI jobs summary

Full detail: **[CI.md](./CI.md)** (`.github/workflows/ci.yml`)

| Job | Command | Gate (2026-06-04) |
|-----|---------|-------------------|
| Backend Lint | `./vendor/bin/pint --test` | ✅ pass |
| Frontend Lint | `npm run lint` | ✅ pass |
| Backend Tests | `php artisan test` | ✅ **237** tests |
| Playwright E2E (mock) | `npm run test:e2e` | ✅ **3** smoke (**9** API specs skipped without backend) |
| Playwright E2E (API) | `npm run test:e2e` + `E2E_API_URL` | ✅ **12/12** in CI (`APP_ENV=local`, SQLite seed) |

---

## Module readiness (honest)

Percentages = **API-backed end-to-end readiness** with `VITE_API_URL` set in production. UI exists for all modules; gaps are backend integration, payment plumbing, ops, or computed metrics.

| Module | Ready | What works | Gaps |
|--------|------:|------------|------|
| **B2C** | **~92%** | Wizard intake, lead results, OTP auth, user home/searches/profile, saved matches, advisor bookings, privacy export/erase, **API-backed location autocomplete** (70 curated Italian cities) | Offline wizard still uses static subset in `wizardConfig`; matching quality depends on seeded partners; no consumer payment flows |
| **B2B** | **~90%** | Register, onboarding + documents, dashboard, marketplace unlock, CRM, appointments, wallet read/history, notifications, **payment intent + webhook recharge**, **Stripe card checkout**, **bank transfer (IBAN + WEN reference + poll)** | Password login dev/E2E-only; transfer settlement manual (admin queue) |
| **Admin** | **~97%** | OTP auth, dashboard stats, partner approve/reject/suspend, **lead router assign/reroute + E2E + load error retry**, transactions, **pending bank transfers queue + settle**, **dashboard bonifici badge**, settings/sectors, privacy erasure queue, advisor bookings, **global spotlight search**, **partner impersonation**, **portfolio risk indicators**, **portfolio partner trend sparklines**, **webhook event log (read-only)** | AUM from completed transactions only |
| **Payments** | **~82%** | `payment_intents` table, `POST /b2b/wallet/recharge`, Stripe PI + signed webhook, generic webhook + `WENANDO_WEBHOOK_SECRET`, bank transfer with `WEN-{id}` causale, admin settle, webhook event audit log | Mollie not implemented; bonifico requires manual ops; live Stripe/IBAN secrets not verified; mock `client_secret` when `STRIPE_SECRET_KEY` unset |
| **Security** | **~90%** | Sanctum SPA cookies, strict CORS, portal separation (403 cross-portal), OTP + rate limits, idempotency keys on financial mutations, audit logs + impersonation audit, **hCaptcha/reCAPTCHA on OTP when secrets set** (inline challenge when unset) | No WAF/CDN rules documented; B2B password login should stay disabled in prod UI |
| **Observability** | **~85%** | Per-request JSON logs (`LogApiRequest`), `request_id` / `X-Request-Id`, 5xx exception lines, webhook event log in admin, deploy env for `LOG_JSON_STREAM`, **Sentry wired (backend + SPA) when DSN set** | Provision `SENTRY_LARAVEL_DSN` + `VITE_SENTRY_DSN` in deploy env; no dashboards/alerts/runbook for log shipping; queue job failures need manual DB inspection |

Backend route coverage is strong (~96% of [API roadmap](../backend/docs/3_API_ROUTES_ROADMAP.md)); frontend `isApiConfigured()` gates are in place across pages. Remaining work is mostly **live PSP + ops**, and **monitoring** (lint/Pint CI gates green as of Agent #37).

---

## Remaining deferred

| Item | Status | Impact |
|------|--------|--------|
| Mollie PSP | Not implemented | Card uses Stripe; transfer uses manual bank + ops webhook/admin |
| `notification_templates` table | Deferred ([§4.11](../backend/docs/10_SQL_REVIEW_&_GAPS.md)) | Admin/B2B notifications use inline copy today |

**Completed in Agent #25:** `payment_intents` table, `POST /b2b/wallet/recharge` (pending intent), `GET /b2b/wallet/recharge/{id}`, `POST /webhooks/payments/{provider}`.

**Completed in Agent #26:** `stripe/stripe-php`, Stripe PaymentIntent on recharge (when `STRIPE_SECRET_KEY` set), `POST /webhooks/payments/stripe` with signature verification, `@stripe/stripe-js` + Elements in `B2BRechargeModal`, poll after `confirmPayment`.

**Completed in Agent #27:** Bank transfer recharge (`transfer` / `bank_transfer`), `WEN-{id}` causale, `bank_transfer` payload on recharge GET/POST, `POST /admin/wallet/complete-transfer`, `B2BRechargeModal` bonifico UI + poll.

**Completed in Agent #28:** `GET /admin/wallet/pending-transfers`, Admin `/admin/wallet/pending` UI (table + "Segna come ricevuto"), nav link, strict offline mock in `adminService.js`, `WENANDO_BANK_IBAN` / `WENANDO_BANK_BENEFICIARY` in deploy checklist.

**Completed in Agent #29:** `pending_bank_transfers_count` on `GET /admin/metrics`, AdminHome "Bonifici in attesa" card → `/admin/wallet/pending`, E2E `bank-transfer-settle.spec.js` (partner recharge → admin settle → wallet credit).

**Completed in Agent #30:** Admin spotlight polish (loading skeleton, empty state, keyboard nav), feature tests for `/admin/search` validation + partner/lead hits, E2E `admin-search.spec.js`.

**Completed in Agent #31:** `ImpersonationBanner` on B2B layout, E2E `admin-impersonate.spec.js` (API + ManagePartners popup), Admin portfolio subtitle (“AUM da transazioni completate”), impersonate end audit covered in `AdminOperationsTest` (`test_impersonation_end_audit_on_token_revocation`).

**Completed in Agent #32:** `GET /admin/risk-indicators` wired to vetting, unassigned leads, suspended partners, low wallet, pending bonifici; `AdminOperationsTest::test_admin_risk_indicators_returns_domain_signals`; E2E `admin-lead-assign.spec.js` (API + Lead Router UI); Lead Router success toast when API configured.

**Completed in Agent #33:** `portfolioPartners()` returns 6-month `trend[]` (completed transaction sum per calendar month, oldest first); `AdminOperationsTest::test_admin_portfolio_partners_with_real_aum_and_exposure` asserts non-empty trend; `AdminPortfolio` subtitle + `PartnerSparkline` consume API trend; `LeadRouter` `AdminLoadError` + retry parity with `ManagePartners`.

**Completed in Agent #34:** Curated Italian cities list (`backend/resources/data/italian_cities.json`, 70 cities); `GET /b2c/locations/autocomplete` prefix search returns `{ suggestions: [{ label, city, province, region }] }`; `ItalianCitiesAutocompleteService`; wizard `LocationStep` debounced API via `locationService.js` with offline fallback (`wizardOfflineLocations`); `B2cLocationsAutocompleteTest` + existing rate-limit test.

**Completed in Agent #38:** OTP captcha gate — `CaptchaVerificationService` (hCaptcha/reCAPTCHA siteverify when `HCAPTCHA_SECRET` / `RECAPTCHA_SECRET` set); `OtpRequestRequest` requires `captcha_token`; SPA `HumanVerification` renders hCaptcha when `VITE_HCAPTCHA_SITE_KEY` set; `OtpCaptchaTest` (skip / pass / fail with `Http::fake`).

**Completed in Agent #40:** E2E API CI — `playwright-e2e-api` uses `backend/.env.e2e`, serial workers for OTP, cookie-consent + consent-hash test helpers; fixed `B2BRechargeModal` Stripe hook crash when API configured without `VITE_STRIPE_PUBLISHABLE_KEY`; **12/12** Playwright pass locally.

**Completed in Agent #41:** [`docs/DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md) — runbook Hostinger (document root, deploy SSH, queue worker, Supervisor template, cron `schedule:run`, health checks).

**Completed in Agent #39:** Sentry Laravel + SPA (`sentry/sentry-laravel`, `@sentry/react`); id-only user context; `request_id` on API errors — provision DSN at deploy.

---

## Go / No-Go (Agent #42)

### STAGING — **GO**

- **237/237** PHPUnit tests pass (`php artisan test`, verified Agent #42).
- **3/3** mock E2E smoke tests pass (`npm run test:e2e` without backend).
- **12/12** E2E API tests pass in CI with `E2E_API_URL` + `backend/.env.e2e` (Agents #40–41).
- Lint + Pint CI **green** (Agent #37).
- API roadmap ~96% implemented; admin/B2B/B2C flows API-backed when `VITE_API_URL` is set.
- Deploy runbooks: [`backend/DEPLOY.md`](../backend/DEPLOY.md), [`backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md`](../backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md), **[`docs/DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md)** (queue + cron, Agent #41).

**Staging gate:** deploy to Hostinger staging, then `E2E_API_URL=https://api.staging.wenando.com/api/v1 npm run test:e2e` — expect **12/12** on the real staging URL (not only local CI).

### PRODUCTION — **GO-with-checklist**

Code, CI, captcha integration, Sentry wiring, and E2E API suite are **ready**. Production cutover is blocked only by **ops provisioning and server verification** — not by missing application features or failing CI gates.

| # | Ops blocker (must complete before prod) | Owner |
|---|----------------------------------------|-------|
| 1 | **Production secrets** — `APP_KEY`, DB, SMTP, `STRIPE_*`, `WENANDO_WEBHOOK_SECRET`, real `WENANDO_BANK_IBAN` / beneficiary | Deploy |
| 2 | **Captcha live keys** — `HCAPTCHA_SECRET` + `VITE_HCAPTCHA_SITE_KEY` (integration done Agent #38; keys not in repo) | Security |
| 3 | **Sentry DSN** — `SENTRY_LARAVEL_DSN` + `VITE_SENTRY_DSN` + alert rules (integration done Agent #39) | Ops |
| 4 | **Hostinger queue + cron** — confirm per [`docs/DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md): worker running, `schedule:run` cron, `schedule:list`, health `queue:true`, OTP mail | Ops |
| 5 | **Staging smoke on real URL** — **12/12** E2E API + payment/bonifico smoke on staging Hostinger before prod promote | QA |

**Resolved (no longer production blockers):** frontend lint CI, backend Pint CI, captcha *code*, Sentry *SDK*, E2E API *suite in CI* (12/12).

**Deferred / non-blocking for first cutover:** Mollie PSP; `notification_templates` table; manual bank transfer settlement (documented ops process via `/admin/wallet/pending`).

---

## Pre-deploy checklist (ordered)

1. ~~**Fix CI lint**~~ — ✅ done (Agent #37): `npm run lint` and `./vendor/bin/pint --test` both exit 0.
2. **Secrets** — fill `backend/.env` from [`.env.production.example`](../backend/.env.production.example); `php artisan key:generate` (first deploy); frontend `VITE_API_URL`, **`VITE_HCAPTCHA_SITE_KEY`** + backend **`HCAPTCHA_SECRET`**, optional Stripe keys in build env.
3. **Backend deploy** — `composer install --no-dev`, `migrate --force`, `storage:link`, `config:cache`, `route:cache`, `view:cache`.
4. **Queue + cron** — start database queue worker; `* * * * * php artisan schedule:run` — see [`docs/DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md).
5. **Frontend build** — `npm ci && npm run lint && npm run build`; deploy `dist/` to static host.
6. **Smoke** — `curl …/api/v1/health`; mock E2E (`npm run test:e2e`).
7. **Staging E2E API** — `E2E_API_URL=<staging-api> npm run test:e2e` → 12/12 pass.
8. **Payments smoke** — test card recharge (Stripe test mode) + bonifico flow + admin settle on staging.
9. **Observability** — set `LOG_JSON_STREAM=php://stderr`; ship logs; set `SENTRY_LARAVEL_DSN` (backend) and `VITE_SENTRY_DSN` (SPA build) for error tracking.
10. **Security pass** — `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, CORS origins in `cors.php`, **`HCAPTCHA_SECRET` + `VITE_HCAPTCHA_SITE_KEY` live**.
11. **Skip seed on prod** — do not run `db:seed` with demo users on real data.
12. **Post-deploy monitor** — webhook event log in admin, failed jobs table, error rate first 24h.

## Pre-deploy commands

Run from repo root unless noted.

### 1. Backend — on server (`backend/`)

```bash
composer install --no-dev --optimize-autoloader
cp .env.production.example .env   # first deploy only; fill secrets
php artisan key:generate          # first deploy only
php artisan migrate --force
php artisan db:seed --force       # optional — demo/dev users only; skip on prod with real data
php artisan test                  # run in CI or staging before promote
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Cron (Hostinger): `* * * * * php artisan schedule:run` + queue worker for `database` queue — full steps: [`docs/DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md).

See also: [`backend/DEPLOY.md`](../backend/DEPLOY.md), [`backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md`](../backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md)

### 2. Frontend — build artifact

```bash
npm ci
npm run lint
npm run test:e2e                  # mock smoke (no backend)
VITE_API_URL=https://api.wenando.com/api/v1 npm run build
# deploy dist/ to wenando.com static host
```

### 3. Post-deploy smoke

```bash
# API health
curl -s https://api.wenando.com/api/v1/health

# Full E2E against staging/production API (optional)
E2E_API_URL=https://api.wenando.com/api/v1 npm run test:e2e
```

---

## Test baseline (2026-06-04 — Agent #42)

| Suite | Result | Count |
|-------|--------|------:|
| `php artisan test` | ✅ Pass | **237** tests, **237** passed (~2.6 s, re-verified Agent #42) |
| `npm run test:e2e` (mock, no `E2E_API_URL`) | ✅ Pass | **3** passed, **9** skipped, **12** total |
| `npm run test:e2e` + `E2E_API_URL` | ✅ Pass | **12** passed, **0** skipped, **12** total (Agents #40–41) |
| `npm run lint` | ✅ Pass | exit **0** |
| `./vendor/bin/pint --test` | ✅ Pass | exit **0** |

**CI jobs** (`.github/workflows/ci.yml`): Backend Lint · Frontend Lint · Backend Tests · Playwright E2E (mock) · Playwright E2E (API). All gates **green** on this workspace snapshot.

No PHPUnit regressions. Mock E2E **3/3**. E2E API **12/12** in CI. Remaining production work is **ops-only**: secrets, captcha/Sentry keys, Hostinger worker/cron verification ([DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md)), staging smoke on live URL.
