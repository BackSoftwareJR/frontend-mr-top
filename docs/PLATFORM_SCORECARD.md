# Wenando — Platform Scorecard (Agent #42)

**Data audit:** 4 giugno 2026 · **Workspace:** motore di ricerca top  
**Ambito:** valutazione onesta post-agenti 1–42 per il primo deploy.

---

## Verdetto esecutivo

| Ambiente | Esito | Nota |
|----------|-------|------|
| **Staging** | **GO** | API ~96% roadmap, **237** PHPUnit verdi, E2E mock **3/3**, lint/Pint CI verdi. Deploy su ambiente isolato con `VITE_API_URL` e seed controllato. |
| **Produzione pubblica** | **GO-with-checklist** | Codice e CI pronti (captcha + Sentry **integrati**, E2E API **12/12** in CI); cutover solo dopo segreti live, DSN Sentry, chiavi captcha e verifica ops Hostinger — vedi [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md). |

**Raccomandazione:** promuovere a **staging** subito; produzione dopo checklist pre-deploy (segreti PSP/SMTP/DB, `HCAPTCHA_SECRET` + `VITE_HCAPTCHA_SITE_KEY`, `SENTRY_LARAVEL_DSN` + `VITE_SENTRY_DSN`, queue/cron su Hostinger verificati, smoke E2E su URL staging reale).

---

## Readiness per modulo

| Modulo | % | Stato |
|--------|--:|-------|
| Admin | 97 | Lead router, bonifici, impersonation, search, risk, webhook log |
| B2B | 90 | Onboarding, marketplace, CRM, wallet, Stripe + bonifico |
| B2C | 92 | Wizard, OTP, area utente, autocomplete città API |
| Payments | 82 | Stripe + bonifico + webhook log; settlement manuale; Mollie assente |
| Security | 90 | Sanctum, CORS, rate limit, audit; **OTP captcha gate quando secret set** |
| Observability | 85 | Log JSON per request; **Sentry BE+FE quando DSN set** |

---

## Test baseline (4 giu 2026 — Agent #42)

| Suite | Risultato | Dettaglio |
|-------|-----------|-----------|
| `php artisan test` | ✅ | **237** test, **237** pass (~2,6 s) |
| `npm run test:e2e` (mock) | ✅ | **3** pass, **9** skip, **12** totali |
| `npm run test:e2e` + `E2E_API_URL` | ✅ | **12** pass, **0** skip (Agent #40–41, CI job) |
| `npm run lint` | ✅ | exit **0** (Agent #37) |
| `./vendor/bin/pint --test` | ✅ | exit **0** (Agent #37) |
| CI GitHub Actions | 5 job | Lint BE/FE, PHPUnit, E2E mock, E2E API |

---

## Top 5 punti di forza

1. **Copertura API** — ~96% del roadmap implementato con test feature estesi (237 PHPUnit).
2. **Admin operativo** — lead assign, bonifici pending/settle, impersonation, search, risk indicators.
3. **Pagamenti B2B** — Stripe PaymentIntent + webhook firmato + bonifico con coda admin.
4. **Sicurezza base solida** — Sanctum SPA, CORS strict, rate limiting, idempotency su mutazioni finanziarie; captcha OTP integrato.
5. **CI + osservabilità** — lint/Pint/E2E API verdi; Sentry Laravel + React pronti al DSN; runbook Hostinger documentato.

---

## Top 5 blocker produzione (solo ops)

1. **Segreti live** — `APP_KEY`, DB, SMTP, `STRIPE_*`, `WENANDO_WEBHOOK_SECRET`, `WENANDO_BANK_IBAN` / beneficiario: provisionare e smoke-testare.
2. **Captcha chiavi live** — integrazione completa; serve `HCAPTCHA_SECRET` + `VITE_HCAPTCHA_SITE_KEY` in deploy.
3. **Ops Hostinger** — queue worker `database` + cron `schedule:run` + `migrate --force`: seguire e **verificare su server** — [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md) (Agent #41).
4. **Sentry DSN live** — SDK integrato; provisionare `SENTRY_LARAVEL_DSN` + `VITE_SENTRY_DSN` e regole alert.
5. **Smoke su staging reale** — `E2E_API_URL=<staging-hostinger> npm run test:e2e` (12/12) + health/mail OTP prima del cutover prod.

---

## Prossimi passi (ordine)

1. Deploy staging: backend Hostinger + frontend static — [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md).
2. `E2E_API_URL=<staging> npm run test:e2e` — **12/12** su URL staging reale.
3. Provisionare captcha, Sentry, Stripe live (importo minimo), IBAN reale.
4. Verificare queue/cron/schedule su Hostinger; runbook settlement bonifici e backup DB.

Dettaglio completo: [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)
