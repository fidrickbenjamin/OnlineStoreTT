TACTICAL TRENDS — UNPAID ORDERS & WELCOME SCREEN UPDATE

Apply this incremental patch over the latest project, including the earlier My Orders account layout update. Copy the backend, frontend and optional tests folders into the project root, preserving paths and replacing matching files. These are the complete updated versions of only the files changed for this task.

UNPAID ORDER DELETION
- Customers: My Account > My Orders, or an order’s detail page. Eligible pending/cancelled unpaid orders have “Delete unpaid order”. A confirmation explains permanent removal and stock restoration. “Keep order” leaves everything alone.
- Admins: Orders list and Manage Order page. Admins may also delete eligible unpaid Processing orders. Paid/refunded orders retain Archive/Restore instead.
- Ownership and eligibility are checked on the server again at deletion time. The same order lock used by checkout and staff updates prevents competing actions. Reserved product allocations are released idempotently before removing the order; a retry cannot inflate stock. An interrupted cancellation/release can be retried.
- Paid/refunded/shipped/delivered records, recorded payments, uploaded bank receipts (including rejected receipts) and started online provider checkouts are retained for reconciliation. An NBD order with no receipt and an unstarted PayPal/ShopDM order can be deleted. Card orders are retained because the legacy card checkout does not expose a reliable unstarted state. Contact the store or use the existing receipt review, reconciled cancellation and archive workflow for protected records. These protections are deliberate; a browser’s “unpaid” label alone cannot rule out an incoming payment.
- Older orders without tracked inventory require the existing admin stock reconciliation first. Customers cannot directly delete an order already being prepared; they can request cancellation, or an admin can handle it. Detailed pages explain why deletion is unavailable.
- Deletion removes the order and its invoice permanently from customer and admin history. It is distinct from Archive, and does not issue a refund or delete a provider transaction.

WELCOME / SPLASH
- Green-and-gold category chooser with a compact two-column mobile grid, search across all 19 canonical categories, and deals/property shortcuts.
- Appears once per browser session on a fresh unfiltered visit, and is available while the product request loads. It does not wake a sleeping Render backend faster.
- Search/filter/pagination/sort/deep links and existing carts bypass the automatic welcome. “Browse categories” in the home page toolbar reopens it at any time.
- Close, Escape, backdrop click and “Explore all products” dismiss it without clearing current filters. Category selection intentionally opens that category. Session storage failures fall back to memory for the current page session.
- Keyboard focus wraps within the dialog and returns on dismissal; mobile content scrolls while the header/footer remain available. Reduced-motion preferences are respected.

BUILD / DEPLOY
No new dependencies, credentials or environment settings are required. Backend changes and a new frontend build are both required. From the project root use the existing Render build command:
  npm ci --legacy-peer-deps && npm ci --prefix frontend --legacy-peer-deps && npm run build --prefix frontend
Start command stays:
  npm start
Rebuild/redeploy the service after copying the files. No live service has been changed by this patch.

EXCLUSIONS
The ZIP contains no backend/app.js, PaymentMethod.jsx, environment/config.env files, build folders, node_modules or git data. Your current CORS and payment-page setup remain in place. Previous pagination, account/order layout, favicon and seasonal files are preserved. Home.jsx and MyOrders.jsx include the latest account-layout work plus these additions.

VALIDATION
- 89 backend checks passed against a disposable local MongoDB database, including permission routes, payment/delete races, duplicate deletes, stock release and interrupted-delete retries, plus existing order, promotion, seasonal and account regressions.
- 1 existing frontend regression test passed.
- Production build passed with existing warnings in unrelated files.
- Browser checks passed for slow product loading, category search and navigation, once-per-session behaviour, filter preservation, unavailable session storage, keyboard focus/Escape, 390px/320px layouts, user/admin delete confirmations, Keep order, server rejection, list refresh and detail redirect. The earlier My Orders UI regression check also passed. No uncaught browser errors in these checks.
- Tests used mocked mail and mocked browser API/payment data. No live payment, email, deployment or external customer data was used. Real provider integrations were preserved, not charged or reconfigured.

OPTIONAL TEST FILES
The tests folder contains development checks; it is not a customer-facing page and is not required to run the store. Use only a disposable database named tt_upgrade_test via TEST_MONGO_URI. To guarantee regression tests cannot send mail, start Node with the included preload:
  node --import ./tests/helpers/offline-mail.mjs --test --test-concurrency=1 tests/*.test.mjs
Never point tests at the production database.
