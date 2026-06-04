# Deploy Wenando su Hostinger

Runbook operativo per l’API Laravel su Hostinger (shared o VPS). Complementa [`backend/DEPLOY.md`](../backend/DEPLOY.md) e [`backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md`](../backend/docs/9_DEPLOYMENT_&_OPERATIONS_RUNBOOK.md).

**Checklist env e blocker produzione:** [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)

---

## 1. Requisiti

| Voce | Valore |
|------|--------|
| PHP | **8.3+** (estensioni: `mbstring`, `openssl`, `pdo_mysql`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`) |
| Composer | 2.x |
| Database | MySQL 8+ / MariaDB 10.6+ (hPanel) |
| Redis | **Non usato** — `QUEUE_CONNECTION=database`, `CACHE_STORE=file` |
| Dominio API | `api.wenando.com` |

---

## 2. Document root e layout (sicurezza)

### 2.1 Principio

Il web server deve esporre **solo** ciò che sta in `public/` di Laravel (equivalente Hostinger: **`public_html`**). Tutto il resto dell’applicazione resta **fuori** dalla document root, così non sono raggiungibili via URL:

| Fuori da `public_html` (mai servito dal web) | Dentro `public_html` (solo questo è pubblico) |
|---------------------------------------------|-----------------------------------------------|
| `.env`, `vendor/`, `app/`, `bootstrap/`, `config/`, `database/`, `routes/`, `artisan` | `index.php` (front controller) |
| `storage/` (log, cache, upload non linkati) | `.htaccess` (rewrite verso `index.php`) |
| Segreti, chiavi, codice sorgente | `robots.txt`, eventuali asset statici (`favicon.ico`, CSS/JS buildati in `public/`) |
| | Symlink `storage` → `../api/storage/app/public` (solo file **già** destinati al download pubblico) |

**Regola d’oro:** se un file non andrebbe in `backend/public/` in locale, **non** va in `public_html` in produzione.

### 2.2 Hostinger Cloud — `public_html` fisso

Su **Hostinger Cloud** per `api.wenando.com` la document root è **`…/api.wenando.com/public_html`** e **non si può** spostarla su `backend/public`. Layout consigliato:

```text
~/domains/api.wenando.com/
├── public_html/          ← document root (fissa)
│   ├── index.php         ← bootstrap; punta a ../api
│   ├── .htaccess
│   ├── robots.txt
│   └── storage → ../api/storage/app/public
└── api/                  ← clone repo Laravel (NON nella docroot)
    ├── .env
    ├── vendor/
    ├── app/
    └── ...
```

Su Hostinger, di norma **solo** `public_html` è mappato sul dominio: la cartella sorella `api/` non è servita dal web server. Aggiungere comunque `api/.htaccess` con `Require all denied` è difesa in profondità se un giorno la root venisse configurata male.

### 2.3 `index.php` in `public_html` (ponte verso Laravel)

Laravel standard usa `public/index.php` con percorsi `__DIR__.'/../…'`. Con app in `../api`, sostituire il contenuto di `public_html/index.php` con:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$laravelRoot = dirname(__DIR__) . '/api';

if (file_exists($maintenance = $laravelRoot.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravelRoot.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravelRoot.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
```

Copiare anche `public/.htaccess` → `public_html/.htaccess`.

### 2.4 Cosa **non** fare (rischi)

| Errore | Rischio |
|--------|---------|
| Clonare tutto il repo **dentro** `public_html` | `.env` e `vendor/` scaricabili se il server non blocca |
| Symlink `public_html` → intera cartella progetto | Esposizione totale del codice |
| `APP_DEBUG=true` in produzione | Stack trace con path e query |
| `storage:link` che punta fuori da `public_html` senza symlink in docroot | Upload 404 o path errati |

### 2.5 Variante VPS / docroot modificabile

Se il pannello permette di impostare la document root su `public/`:

| Layout | Document root |
|--------|----------------|
| Monorepo in `~/wenando` | `~/wenando/backend/public` |
| Solo backend in `~/wenando-api` | `~/wenando-api/public` |

In quel caso **non** serve il `index.php` personalizzato: usare quello del repo così com’è.

Forza HTTPS dal pannello Hostinger.

---

## 3. Deploy iniziale (SSH)

### 3.1 Hostinger Cloud (`public_html` fisso)

```bash
ssh USER@HOSTINGER_HOST

export DOMAIN_DIR="$HOME/domains/api.wenando.com"   # verificare con: ls ~/domains/
export WEBROOT="$DOMAIN_DIR/public_html"
export API_DIR="$DOMAIN_DIR/api"

cd "$DOMAIN_DIR"
git clone https://github.com/BackSoftwareJR/backend-mr-top.git api
cd "$API_DIR"

composer install --no-dev --optimize-autoloader --no-interaction
cp .env.production.example .env
# Compila DB_*, MAIL_*, segreti — vedi §7
php artisan key:generate --force
php artisan migrate --force
# db:seed — SOLO staging / DB vuoto (§4)

# Web: solo file pubblici in public_html
cp public/.htaccess "$WEBROOT/.htaccess"
test -f public/robots.txt && cp public/robots.txt "$WEBROOT/robots.txt"
# Creare public_html/index.php come in §2.3 (cat o editor)

rm -f "$WEBROOT/storage"
ln -sfn "$API_DIR/storage/app/public" "$WEBROOT/storage"

# Bloccare accesso web diretto alla cartella app (Apache)
printf '%s\n' 'Require all denied' > "$API_DIR/.htaccess"

chmod -R 775 storage bootstrap/cache

php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Verifica: `curl -sS https://api.wenando.com/up` e `curl -sS https://api.wenando.com/api/v1/health`.

**Nota:** non usare `php artisan storage:link` qui: creerebbe il link in `api/public/`, non in `public_html`. Il symlink manuale sopra è l’equivalente corretto.

### 3.2 VPS / docroot = `backend/public`

```bash
ssh USER@HOSTINGER_HOST
cd ~
git clone <REPO_URL> wenando
cd wenando/backend

composer install --no-dev --optimize-autoloader
cp .env.production.example .env
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
```

Script opzionale (dalla cartella `backend/`):

```bash
chmod +x deploy/hostinger-post-deploy.sh
./deploy/hostinger-post-deploy.sh
# --fresh-seed + ALLOW_DESTRUCTIVE=yes solo su DB vuoto staging
```

---

## 4. Database: migrate e seed

| Ambiente | `migrate` | `db:seed` |
|----------|-----------|-----------|
| **Produzione** | `php artisan migrate --force` | **Non eseguire** — niente utenti demo su dati reali |
| **Staging** | `php artisan migrate --force` | `php artisan db:seed --force` (DB vuoto / greenfield) |
| **Staging distruttivo** | `migrate:fresh --seed` solo con DB vuoto e conferma esplicita | |

```bash
# Produzione
php artisan migrate --force

# Staging (dopo primo deploy su DB vuoto)
php artisan db:seed --force
```

---

## 5. Queue worker

La coda usa il driver **database** (`QUEUE_CONNECTION=database`). Job critici: mail OTP (`OtpMail`), notifiche, elaborazioni asincrone.

### 5.1 Comando worker (produzione)

```bash
php artisan queue:work database --sleep=3 --tries=3
```

Su shared hosting senza Supervisor, in alternativa un cron ogni minuto con `--stop-when-empty --max-time=50` (vedi [`backend/DEPLOY.md`](../backend/DEPLOY.md) §7).

### 5.2 Template Supervisor (VPS / accesso root)

File `/etc/supervisor/conf.d/wenando-queue.conf`:

```ini
[program:wenando-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /home/USER/wenando/backend/artisan queue:work database --sleep=3 --tries=3
directory=/home/USER/wenando/backend
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=USER
numprocs=1
redirect_stderr=true
stdout_logfile=/home/USER/wenando/backend/storage/logs/queue-worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start wenando-queue:*
```

### 5.3 Verifica ops (blocker #6)

Dopo il deploy, confermare sul server:

1. Worker attivo (Supervisor **oppure** cron `queue:work`).
2. `GET https://api.wenando.com/api/v1/health` → `"queue": true`.
3. Tabella `jobs` / `failed_jobs` — nessun accumulo anomalo dopo invio OTP di test.
4. Mail OTP ricevuta entro pochi secondi (job in coda elaborato).

---

## 6. Cron e scheduler

Laravel registra i task in [`backend/routes/console.php`](../backend/routes/console.php). Sul server serve **un solo** cron che invoca lo scheduler ogni minuto; i comandi sotto vengono eseguiti automaticamente da `schedule:run`.

### 6.1 Cron obbligatorio (Hostinger hPanel → Cron)

```cron
# Cloud: sostituire il path con .../domains/api.wenando.com/api
* * * * * cd /home/USER/domains/api.wenando.com/api && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/USER/domains/api.wenando.com/api && /usr/bin/php artisan queue:work database --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

VPS / monorepo:

```cron
* * * * * cd /home/USER/wenando/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

Sostituire `USER` e il percorso con quelli reali del server. Usare il binario PHP 8.3 indicato in hPanel se diverso da `/usr/bin/php`.

### 6.2 Comandi schedulati (da `routes/console.php`)

| Comando Artisan | Espressione cron effettiva | Fuso | Descrizione |
|-----------------|----------------------------|------|-------------|
| `leads:anonymize-stale` | `0 3 1 * *` | Europe/Rome | Anonimizza lead inattivi (retention GDPR) — giorno **1** del mese alle **03:00** |
| `consent-logs:anonymize-retention` | `0 4 1 * *` | Europe/Rome | Anonimizza log consensi oltre retention — giorno **1** del mese alle **04:00** |

**Nota:** non aggiungere righe cron separate per questi due comandi; `schedule:run` li lancia in base alla definizione Laravel (`monthlyOn(1, 'HH:MM')` + `timezone('Europe/Rome')`).

### 6.3 Verifica ops scheduler

```bash
cd /home/USER/wenando/backend
php artisan schedule:list
```

Output atteso: entrambi i comandi con prossima esecuzione in fuso `Europe/Rome`.

Test manuale (staging):

```bash
php artisan leads:anonymize-stale --dry-run
php artisan consent-logs:anonymize-retention --dry-run
```

---

## 7. Variabili d’ambiente

Elenco completo, priorità e note: **[PRODUCTION_READINESS.md § Environment variables checklist](./PRODUCTION_READINESS.md#environment-variables-checklist)**.

Template: [`backend/.env.production.example`](../backend/.env.production.example)

Minimo da compilare prima del go-live:

- `APP_KEY`, `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`
- `DB_*` (MySQL Hostinger)
- `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`
- `MAIL_*` (SMTP Hostinger — OTP)
- `QUEUE_CONNECTION=database`, `CACHE_STORE=file`
- `WENANDO_WEBHOOK_SECRET`, `WENANDO_BANK_IBAN`, `WENANDO_BANK_BENEFICIARY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (ricarica carta)
- `HCAPTCHA_SECRET` (+ `VITE_HCAPTCHA_SITE_KEY` nel build frontend)
- Opzionale: `SENTRY_LARAVEL_DSN`, `LOG_JSON_STREAM`

---

## 8. Integrazione frontend, Sanctum e CORS

### 8.1 URL API e build SPA

| Impostazione | Produzione |
|--------------|------------|
| Base API | `https://api.wenando.com/api/v1` |
| Build Vite | `VITE_API_URL=https://api.wenando.com/api/v1` |
| SPA routing | `public/.htaccess` → copiato in `dist/` — rewrite verso `index.html` (fix refresh su `/accedi`, ecc.) |

### 8.2 Sanctum (cookie SPA)

In `.env`:

```env
SESSION_DOMAIN=.wenando.com
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=wenando.com,www.wenando.com
FRONTEND_URL=https://wenando.com
```

Flusso browser: `GET https://api.wenando.com/sanctum/csrf-cookie` (con credenziali) prima delle richieste mutanti.

### 8.3 CORS

Origini consentite in [`backend/config/cors.php`](../backend/config/cors.php) (non variabile env):

- `https://wenando.com`
- `https://www.wenando.com`

Prima del deploy in produzione, verificare che non servano altri host (staging va aggiunto esplicitamente se necessario).

`FRONTEND_URL` governa link OTP e template mail, non le intestazioni CORS.

### 8.4 Webhook Stripe

| Provider | URL endpoint | Secret `.env` |
|----------|--------------|---------------|
| Stripe | `https://api.wenando.com/api/v1/webhooks/payments/stripe` | `STRIPE_WEBHOOK_SECRET` |
| Generico (mock / PSP custom) | `https://api.wenando.com/api/v1/webhooks/payments/{provider}` | `WENANDO_WEBHOOK_SECRET` (header `X-Wenando-Webhook-Secret`) |

In Stripe Dashboard → Webhooks → aggiungere l’endpoint sopra; eventi minimi: `payment_intent.succeeded` (e configurazione allineata al controller).

Dopo configurazione: ricarica test su staging e verifica voce in Admin → log webhook.

---

## 9. Smoke post-deploy

```bash
curl -sS https://api.wenando.com/api/v1/health
# Atteso: success, db:true, queue:true

php artisan wenando:mail-test your-inbox@example.com
# Verifica SMTP + coda
```

Checklist completa: [PRODUCTION_READINESS.md § Pre-deploy checklist](./PRODUCTION_READINESS.md#pre-deploy-checklist-ordered).

---

## 10. Aggiornamento release (senza seed)

```bash
# Cloud
cd /home/USER/domains/api.wenando.com/api
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
# Riavviare worker Supervisor se usato: supervisorctl restart wenando-queue:*
```

---

## 11. Stato blocker ops

| Blocker | Stato |
|---------|--------|
| Runbook queue + cron | ✅ Questo documento |
| Verifica su server Hostinger | ⏳ Manuale — Supervisor/cron attivi, `schedule:list`, health `queue:true`, OTP mail |

Aggiornare [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) blocker **#6** quando la verifica sul server è completata.
