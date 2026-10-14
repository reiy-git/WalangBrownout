# Implementation Handoff

## Goal

Repair and improve the Dockerized Laravel/React inventory application by
resolving the Laravel log permission loop, the missing `Product::activeBatches()`
relationship, and the missing-database-table startup failure; improve measured
application responsiveness; and build defensible evidence toward an "Excellent
(4 pts)" score in each of the six rubric categories (24 total).

This is a durable execution record for the next session. It records completed
work, assumptions, files, attempts, verification, and outstanding risks.

## User approval, constraints, and score caveat

- The user approved the proposed implementation and specifically requested this
  handoff, then asked to continue.
- Preserve local database data. No `migrate:fresh`, destructive volume resets,
  or broad permission changes. Do not use `chmod 777`.
- Changes remain uncommitted; the user has not requested a commit.
- A perfect rubric score is a goal, not a guarantee. Collaboration points need
  genuine peer review and contribution evidence; they cannot be fabricated.
- Policy choices implemented after the user's approval to continue:
  - Seasonal demand uses an explicit manager-maintained multiplier from 0.1 to
    5. It is not automatic season scheduling or historical forecasting.
  - Overstock alerts require a manager-configured per-product maximum stock
    level; no threshold means no overstock alert.
  - A manager/admin may reconcile a batch to any non-negative physical count
    with a required reason. The signed delta and before/after quantities are
    retained in the inventory ledger.

## Current status

- Repository: `C:\Users\Reiy\Desktop\CCS112`; branch `develop`.
- Docker Compose services include MySQL, PHP-FPM, Nginx, and Vite frontend.
- Backend connects to local MySQL `app_db`. The initially empty database was
  initialized using the existing migrations, without resetting it; local demo
  seed data was loaded separately.
- The additive migration
  `backend/database/migrations/2026_10_14_000001_add_stock_control_audit_fields.php`
  is applied locally (batch 2). It adds product seasonal/overstock fields and
  ledger audit fields.
- `Product::activeBatches()` selects active batches with positive remaining
  quantity and expiry today or later (or no expiry). FIFO dispatch locks the
  product and eligible batches inside a transaction.
- Count adjustments are manager/admin-only and append ledger records. Direct
  batch update/delete API routes are unavailable to prevent unledgered edits.
- Laravel logs are sent to stderr in Compose; writable framework runtime data
  is on a PHP-FPM-owned Docker named volume. A runtime write test as `www-data`
  passed. No unsafe world-writable permissions were applied.
- Moving Composer `vendor/` dependencies off the Windows bind mount improved
  observed request times substantially. Recorded timings are samples, not a
  controlled benchmark.
- Worktree changes are uncommitted. Review `git status --short` before resuming.

## Failed attempts and diagnostic caveats

1. The user's container rebuild did not resolve the original report. A rebuild
   does not automatically apply pending Laravel migrations or correct
   host-backed volume permissions.
2. The initial in-container ownership diagnostic failed due to shell quoting;
   subsequent `id`, `stat`, and actual runtime write checks succeeded.
3. `ps` is not installed in the PHP container; no package was added just for
   process inspection.
4. Initial database inspection showed no migration repository or application
   tables. Existing migrations were applied successfully afterward.
5. Do not inspect or disclose `.env` secrets while troubleshooting DB settings.
6. `artisan db:table users` could not run because this PHP image lacks `intl`;
   this diagnostic limitation was separate from the application.
7. Browser automation rendered manager inventory and its Count controls, but
   timed out waiting for a stable click. Modal behavior is not verified through
   the browser, and no count was submitted or seeded stock changed during that
   check. The backend endpoint and authorization are covered by tests.

## Objectives and completion record

1. **Stop the logging exception loop:** configured stderr logging in Compose and
   relocated framework runtime write paths to a Docker-managed volume owned by
   PHP-FPM. Verified an actual write as `www-data`; avoided broad chmods.
2. **Initialize the database safely:** added MySQL health/readiness handling and
   Docker DB defaults; applied the existing migrations and the later additive
   migration without dropping or resetting the database.
3. **Fix the missing relation and inventory flow:** introduced eligible
   `activeBatches()` semantics, locked transactional FIFO dispatch, and
   ledger-preserving receipt/count operations.
4. **Improve control logic:** exposed manager-configurable seasonal factors and
   optional overstock thresholds; added count reconciliation with actor, reason,
   signed difference, and before/after audit quantities.
5. **Improve runtime responsiveness:** moved `vendor/` into a named volume,
   aggregated dashboard stock calculation, removed a redundant dashboard
   request, and lazy-loaded routes/layout/login in the frontend.
6. **Validate UX and documentation:** verified seeded manager login and
   dashboard/inventory navigation. Updated README and this handoff. Count modal
   browser interaction remains a known validation gap.
7. **Preserve future evidence:** tests, lint, formatting, build, Compose config,
   migration, browser limitation, and performance observations are recorded
   below. No rubric score is claimed.

## Technical behavior and assumptions

- Eligible available stock: `status=active`, `quantity_remaining > 0`, and
  `expiry_date >= today`.
- FIFO dispatch: oldest receipt first, then batch ID as a stable tie-breaker;
  product and batches are locked within a DB transaction.
- Reorder point: annual demand / 365 × configured seasonal multiplier ×
  seven-day lead time + safety stock (see `ReorderPointService`). New products
  default to multiplier 1. Existing Category A products are migrated to 1.50
  to preserve the legacy effective reorder-point behavior.
- Overstock: only reported if `max_stock_level` is set and eligible stock is
  above it; dashboard includes excess quantity.
- Count reconciliation: quantity is non-negative, reason is 3–1000 characters,
  and any difference (including zero) is written as `count_adjustment`. Count
  operation updates `active`/`depleted`/`expired` status based on quantity and
  expiry.
- `inventory_ledgers.quantity` is signed for count adjustments. The
  `quantity_before`, `quantity_after`, and `notes` fields are nullable for
  ordinary receipt/dispatch movements.
- Batch update/delete routes were removed. Product deletion remains constrained
  by inventory-ledger foreign keys.
- Local seeded manager login was used only for local verification. Do not seed
  production.

## Key files

### Docker and setup

- `docker-compose.yml` — service mounts, MySQL health/readiness, stderr logging,
  runtime and vendor named volumes.
- `docker/php/DOCKERFILE` — PHP-FPM image and writable volume targets.
- `backend/.env.example` — Docker-local DB defaults.
- `Makefile` — safe setup, service, migration, and seed commands.
- `README.md` — application setup, API, schema, and inventory documentation.

### Backend

- `backend/app/Models/Product.php` — eligible batch relationship.
- `backend/app/Models/InventoryLedger.php` — ledger audit fields/relationships.
- `backend/app/Services/ReorderPointService.php` — seasonal ROP calculation.
- `backend/app/Http/Controllers/InventoryLedgerController.php` — receiving,
  FIFO dispatch, transaction listing, and count reconciliation.
- `backend/app/Http/Controllers/DashboardController.php` — aggregate dashboard,
  reorder, expiry, and overstock alerts.
- `backend/app/Http/Controllers/ProductController.php` — product validation,
  manager-configurable seasonal multiplier and max stock.
- `backend/routes/api.php` — endpoint and role restrictions.
- `backend/database/migrations/2026_10_14_000001_add_stock_control_audit_fields.php`
  — additive schema changes.
- `backend/tests/Feature/InventoryBatchTest.php` — domain/API regression tests.

### Frontend

- `frontend/src/api.js` — shared API request/cache behavior and available stock.
- `frontend/src/App.jsx` — lazy-loaded routes/layout/login.
- `frontend/src/components/DashboardLayout.jsx` and
  `frontend/src/components/common/AuthCard.jsx` — shared application layout and
  authentication UI.
- `frontend/src/pages/Dashboard.jsx` and
  `frontend/src/pages/LoginRoleSelection.jsx` — staff dashboard and login flow.
- `frontend/src/pages/ManagerDashboard.jsx` — dashboard metrics and alerts.
- `frontend/src/pages/ManagerInventoryList.jsx` — manager count UI.
- `frontend/src/pages/ManagerReorderManagement.jsx` — ROP and stock thresholds.
- `frontend/src/pages/ManagerReports.jsx` — transaction/report display.
- `frontend/src/pages/ManagerUserManagement.jsx` — manager user management.
- `frontend/src/utils/format.js` — shared UI formatters.

`Makefile` and the root `README.md` are also modified.

## Test, build, and performance record

Latest reported verification:

| Check | Result |
| --- | --- |
| Backend feature suite | 13 tests passed, 49 assertions |
| Laravel Pint | 10 changed PHP files passed |
| Frontend lint | 0 warnings, 0 errors |
| Frontend production build | Passed; largest entry chunk ~486.10 kB, no >500 kB warning |
| Additive migration | Applied successfully locally; no reset/drop |
| Route review | Count endpoint present; direct batch update/delete routes absent |
| Browser | Manager login/dashboard/inventory rendered; Count modal interaction not verified |
| Compose and whitespace | `docker compose config --quiet` and `git diff --check` passed |

Indicative single-run API timing observations:

| Flow | Before moving `vendor/` | After |
| --- | ---: | ---: |
| Successful login | ~14.19 s | ~3.22 s |
| Authenticated API calls | ~3.94–10.17 s | ~0.147–1.182 s |

These measurements are not controlled, repeated benchmarks and are affected by
warm-up/cache state. Repeat with comparable requests before claiming a
statistically reliable improvement.

## Rubric plan and evidence still needed

- **Problem Analysis & Requirements:** document acceptance criteria and edge
  cases for roles, stock movements, FIFO, expiry, seasonal multiplier,
  overstock, and counts; reconcile to the exact instructor rubric.
- **Program Functionality & Reliability:** existing coverage includes stock
  eligibility, FIFO, count audit and role checks, seasonal ROP, overstock, and
  unavailable direct batch mutations. Consider tests for concurrency, broader
  validation, and failure responses.
- **Inventory Data Management:** migrations, foreign keys, batch expiry, and
  append-only movement trail exist; assess production backup/retention and
  persistent MySQL storage before deployment.
- **Inventory Control Logic & Alerts:** seasonal/overstock rules are implemented
  as explicitly configured factors/thresholds. Historical forecasting and
  season calendars remain outside scope.
- **Usability & Code Quality:** lint/build/formatting pass. Complete browser
  validation of Count modal, role-specific forms, validation/error states, and
  mobile layout.
- **Collaboration & Contribution:** request authentic peer review and record
  real contributions; do not fabricate collaboration evidence.

Suggested next order: (1) complete UI interaction and acceptance-case
validation, (2) broaden focused backend tests, (3) repeat controlled performance
measurements, (4) production persistence/security review, and (5) gather peer
review and rubric evidence.

## Open production follow-ups

- Configure and document a persistent MySQL volume with a backup/restore plan;
  preserve existing local DB data during any mapping change.
- Review registration, server-side authorization, token lifecycle, credentials,
  debug configuration, and operational logging for production.
- Run a safe real browser test of the Count modal; never submit against seeded
  inventory unless a deliberate disposable test record is used.
- Do not claim seasonal forecasts, automatic season detection, or guaranteed
  24/24 rubric results.

## Resume instructions

1. Review `git status --short` and existing diffs; do not discard unrelated
   changes.
2. Preserve the existing local DB volume and data. Avoid `migrate:fresh`, volume
   deletion, or storage remapping without a safe migration plan.
3. Run the smallest targeted validation needed after any edits; current
   full-suite and build results are above.
4. Update this file and README if code, policy, or validation status changes.
5. Do not commit unless the user requests it.
