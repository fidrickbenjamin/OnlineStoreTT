TACTICAL TRENDS — PROMOTIONS UPDATE

This is an incremental patch for the most recent working major update, not a
complete project. It contains 38 changed/new source and test files, plus this
guide and a file manifest. Merge its contents into your existing OnlineStore
project, preserving the backend/, frontend/, and tests/ folder paths. Do not
replace your entire project directory with this folder.

Your excluded files are NOT included:
- backend/app.js (your CORS setup stays as it is)
- All environment/config.env files
- frontend/build and every other build folder
- PaymentMethod.jsx and PayPal provider controllers
- Pagination, favicon, existing branding assets, node_modules, and git files

WHAT IS INCLUDED
- Admin > Promotions (/admin/promotions): campaign editor, searchable product
  selection, category campaigns, draft/enabled/paused/ended status, scheduled
  start/end, preview, duplicate, pause/resume/end controls, and paid-only metrics.
- Discounts: percentage off, fixed XCD amount off each item, or one target sale
  price for every selected item. The lowest eligible offer wins; offers do not
  stack. Regular product prices remain stored unchanged. Property listings are
  excluded. Offers producing zero/negative prices or price increases are skipped.
- Admin > Products > Edit: separately saved Individual item sale section,
  optional start/end, badge and sale price. Save regular product form changes
  before editing/saving a sale; the sale is validated against the stored price.
- Storefront: home banners, /deals, sale badges, crossed-out regular prices,
  savings and countdowns, and filtering/sorting by the actual effective price.
- Confirm Order: current server-priced quote with item discounts, tax and total.
  When a price/offer changes before a new order is created, checkout asks the
  customer to return to Confirm Order and review the current amount. Refreshing
  the payment page clears the in-memory quote; return to Confirm Order to reload.
- Order details, invoices and confirmation emails show saved item discounts.
  Existing orders retain their original amounts even after offers change/end.
- Campaign metrics count paid order lines attributed to the winning campaign;
  they exclude refunded orders, shipping and tax. They are campaign lifetime
  metrics, and are not a measure of how many sales the campaign caused.

INSTALL AND DEPLOY
1. Back up your project and database as you normally do before an update.
2. Copy the CONTENTS of this folder into your existing project, merging folders.
   Overwrite only the matching source files supplied in this patch. Refer to
   CHANGED-FILES.txt for the exact list. Keep your environment files and app.js.
3. No npm dependencies or credentials have been added. Commit the supplied
   backend, frontend/src and root package.json changes to your existing Git repo.
   The tests folder contains development verification only and is not a website
   page; tests are not run by npm start or by the production build.
4. Keep the working Render web service settings:
   Build Command:
   npm ci --legacy-peer-deps && npm ci --prefix frontend --legacy-peer-deps && npm run build --prefix frontend
   Start Command: npm start
   Root Directory: leave blank (repository root)
   Keep all your existing Render environment variables.
5. Deploy the backend and frontend together using that build command. A frontend
   rebuild is required even though the build folder is intentionally not in ZIP.
   Do not run the database seeder or delete existing products/orders.

MongoDB creates the new promotions collection/index when first used. New product
and order fields are additive; no manual data migration or replacement is needed.
This update uses the existing mounted product/order routes, so app.js is untouched.

CREATE YOUR FIRST BLACK FRIDAY CAMPAIGN
1. Sign in as admin and open Promotions.
2. Name: Black Friday Deals. Badge: Black Friday. Add a short banner message.
3. Choose e.g. 20% off, then choose selected products or one retail category.
4. Enter start/end in Dominica time (UTC-4), regardless of your computer timezone.
5. Leave status Draft and click Preview prices. Preview calculates the proposed
   offer as if active now, alongside other currently active offers. It changes no
   prices or settings. Up to 200 rows are displayed; full scope still applies.
6. Review the prices, then choose Enabled and save to start on schedule. Use a
   future end date. An enabled campaign starts automatically when its start time
   arrives, and stops applying at its end time. Pause or End now stops it sooner.
7. Check the home banner, /deals, a product page and Confirm Order. No sample
   campaigns are enabled by installing this patch.

Selected-product campaigns support up to 500 product IDs. Category campaigns
also cover future retail products added to that category during the campaign.
All currency amounts are XCD. Existing tax and delivery rules are preserved;
tax is calculated on the discounted item subtotal.

SCHEDULING ON RENDER FREE
Schedules are evaluated against server time on each relevant request, so no cron
job, timer service, or paid scheduler is needed. The public home/deals/product
screens refresh data about every 60 seconds while open. An idle free instance
can still take time to wake. Checkout always verifies prices again server-side.
Already-created unpaid orders keep their saved prices and reservation policy;
customers should continue them through My Orders rather than creating another.

VERIFICATION PERFORMED
- 37 backend tests passed, including real disposable MongoDB integration tests:
  pricing, schedule boundaries, precedence, stale-quote rejection, unchanged
  historical orders, stock/idempotency, route authorization, preview and metrics.
- Existing frontend ProductItem regression test passed.
- Production frontend build passed (existing lint/deprecation warnings remain).
- Local browser checks with mocked API responses passed: admin preview/save,
  desktop/mobile offers, product pricing, quote/refresh, payment-page navigation.
- No live payment-provider transactions or live-site deployment were performed.

OPTIONAL DEVELOPMENT CHECKS
From the repository root: npm run test:orders
Pure rules tests run without MongoDB. Integration tests skip unless TEST_MONGO_URI
is set to a DISPOSABLE database named tt_upgrade_test. Never point these tests
at your live database: they delete their test collections. The script runs files
serially so the integration suites do not interfere with each other.
Frontend: npm test --prefix frontend -- --watchAll=false --runInBand
Production build: npm run build --prefix frontend

ROLLBACK
Restore only the source files listed in CHANGED-FILES.txt from your pre-update
backup and rebuild/redeploy. Existing saved order amounts are never recalculated.
New collections/fields need not be removed when restoring the prior application.
