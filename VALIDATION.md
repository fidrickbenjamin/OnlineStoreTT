# Validation results

## Passed

- Production React build, including lazy-loaded account/admin routes.
- 23 backend tests: 9 rules tests and 14 real MongoDB integration tests, using an isolated temporary database. These cover duplicate rows and checkout, competing buyers, stock allocation idempotence, compensation after partial allocation, cancellation/restoration, paid-order expiry protection, owner-only order/receipt access, approval of only the current receipt, cancelled/unpayable order guards, server totals, confirmed-payment sales and Dominica date boundaries.
- The existing frontend product-card regression test.
- React dependency check: React and React DOM 18.3.1 are deduplicated, including the PayPal package.
- Automated Chromium checks of the production build: customer order list/details, admin order list/manage/dashboard, invoice, mobile delivery form and mobile product filters. The browser API responses were mocked; no application runtime errors occurred in those checks.
- Visual inspection of the mobile delivery form and desktop admin order screen.
- The latest automatic-retry component logic in PaymentMethod.jsx was compared with the uploaded baseline and retained; only confirmation navigation and offline cart clearing changed in that page.
- Patch contents compared with the uploaded project: only new or changed files are included; backend/app.js, environment files, build directories and dependencies are excluded.

## Limits and remaining local checks

- Live PayPal/ShopDM payments, webhook delivery, actual bank transfers and Mailtrap email delivery were not exercised. Existing provider controllers and secrets are retained.
- Browser checks use representative mocked data, not the user's production account or database.
- MongoDB tests use newly created orders. Historical stock discrepancies require the administrator's explicit reconciliation decision.
- The current Create React App project still reports non-blocking lint/deprecation warnings in original files; this update does not migrate the whole framework.
- Stock uses conditional per-product updates and compensation. Run the maintenance command if a process interruption leaves an unallocated order, and inspect any reported exception before adjusting stock.
- No production deployment or production data mutation was performed.
