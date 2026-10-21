TACTICAL TRENDS — MY ORDERS ACCOUNT LAYOUT

Install AFTER tactical-trends-account-recipients-update.zip.
This is a small frontend patch containing only:
frontend/src/components/order/MyOrders.jsx
frontend/src/components/order/MyOrders.css

Merge the frontend folder into your existing OnlineStore project, preserving
its folder paths. Overwrite MyOrders.jsx and add MyOrders.css. Rebuild the
frontend and redeploy with your existing Render settings. No dependencies,
backend changes, environment changes, migration or seeder are required.

My Orders now uses the same My Account layout as Overview. Account navigation
stays visible with My Orders highlighted. It adds matching order summary cards,
recipient/product previews, category filters, payment filters, recipient/product
search, manual refresh, and clear loading/empty/error states.

Categories:
- In progress: orders not marked Delivered or Cancelled.
- Awaiting payment: those in-progress orders not marked Paid or Refunded.
  This includes receipts still Verifying; it does not confirm payment failure.
- Completed: Delivered orders.
- Cancelled: Cancelled orders.
Summary/category counts refer to all fetched orders; search and payment filters
combine with the selected category to determine the displayed results.

Existing order detail, continue-payment and invoice destinations/eligibility
are preserved. The backend, payment providers, stock, totals, cancellation
workflow, PayPal page, seasonal files/dropdown fix, pagination, favicon,
backend/app.js and environment files are not included or changed.
The build directory is intentionally excluded; deployment must rebuild it.

Verified: production frontend build passed (existing warnings remain), and
local desktop/mobile browser checks with mocked API data passed: account
navigation, each category, combined search/payment filters, clear/reset,
recipient details, correct action links, mobile fit, empty/error/retry states.
No live payments, backend changes or production deployment were performed.
