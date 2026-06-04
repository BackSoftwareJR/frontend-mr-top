# Continuous integration (GitHub Actions)

Workflow: **CI** (`.github/workflows/ci.yml`). Jobs run in parallel on `push` / `pull_request` to `main` or `master`.

| Job | Command | Working dir |
|-----|---------|-------------|
| Backend Lint | `./vendor/bin/pint --test` | `backend/` |
| Frontend Lint | `npm run lint` (`eslint .`) | repo root |
| Backend Tests | `php artisan test` | `backend/` |
| Playwright E2E | `npm run test:e2e` | repo root |
| Playwright E2E (API) | `npm run test:e2e` with `E2E_API_URL` | repo root + `backend/` |

## Backend Lint

| Item | Value |
|------|--------|
| Tool | [Laravel Pint](https://laravel.com/docs/pint) (`laravel/pint` in `backend/composer.json` dev deps) |
| Command | `./vendor/bin/pint --test` |
| Auto-fix locally | `./vendor/bin/pint` |

### Run locally

```bash
cd backend
composer install
./vendor/bin/pint --test   # check only
./vendor/bin/pint          # fix in place
```

## Frontend Lint

| Item | Value |
|------|--------|
| Tool | ESLint 10 (flat config: `eslint.config.js`) |
| Command | `npm run lint` → `eslint .` |
| Scope | Frontend JS/JSX; `backend/**` and `dist/` are ignored |

Plugins: `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.

### Run locally

```bash
npm ci
npm run lint
```

`eslint.config.js` ignores `backend/**` and sets Node globals for `*.config.js`. Context/onboarding shared exports are listed in `allowExportNames` for `react-refresh/only-export-components`.

## API structured logs

See [OBSERVABILITY.md](./OBSERVABILITY.md) for the `json` log channel, per-request fields, and `LOG_JSON_STREAM` / `LOG_JSON_LEVEL` env vars.

## Backend Tests

| Item | Value |
|------|--------|
| PHP | 8.3 (`composer.json` requires `^8.3`) |
| Install | `composer install` in `backend/` |
| Database | SQLite `:memory:` via `backend/phpunit.xml` (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`) |
| Command | `php artisan test` (**232** PHPUnit tests) |
| Secrets | None — no `.env` file; env vars come from `phpunit.xml` |

Extensions enabled in CI: `dom`, `curl`, `libxml`, `mbstring`, `zip`, `pcntl`, `pdo`, `sqlite`, `pdo_sqlite`.

### Run locally

```bash
cd backend
composer install
php artisan test
```

## Playwright E2E

See [E2E.md](./E2E.md) for smoke specs, env vars, and backlog for API-backed flows.

## Backlog

- Optional: lint only changed paths (`pint --dirty`, ESLint `--cache`)
- Optional MySQL service job if tests move off in-memory SQLite
