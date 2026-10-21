TACTICAL TRENDS — MY ACCOUNT & DOMINICA RECIPIENTS UPDATE

Incremental patch: install AFTER your earlier promotions, seasonal themes and
seasonal dropdown fixes. Merge these files into your current working project;
do not replace the entire project directory with this update folder.

This patch contains 36 new/changed application and development test files,
plus this guide and CHANGED-FILES.txt. No npm dependencies have been added.

INSTALL / RENDER
1. Copy the CONTENTS of this folder into your existing OnlineStore project,
   preserving backend/, frontend/src/, and tests/ paths. Overwrite the matching
   files supplied here. Keep your remaining files and configuration.
2. Commit the changed files to your existing repository and deploy normally.
   Deploy backend and frontend together; the frontend must be rebuilt.
3. Keep your working Render web-service settings:
   Build Command:
   npm ci --legacy-peer-deps && npm ci --prefix frontend --legacy-peer-deps && npm run build --prefix frontend
   Start Command: npm start
   Root Directory: blank / repository root
4. Keep all existing Render environment variables, Mailtrap, Cloudinary and
   payment-provider credentials. No new credentials are required.
5. No seeder or manual database migration is needed. New MongoDB fields are
   additive and are stored when the customer saves details or creates an order.

EXCLUSIONS PRESERVED
- backend/app.js (including your existing CORS choices and body-size limit)
- All environment/config.env files, build folders, node_modules and git files
- PaymentMethod.jsx and PayPal provider controllers
- Pagination, favicons, seasonal theme files, and the dropdown CSS fix
The existing MyOrders page is also unchanged. Order details, the admin order
view, invoices and notification templates are updated only to present the
separate buyer/recipient information. Existing payment, tax, stock reservation,
order status, cancellation, receipt review and promotion workflows are retained.

MY ACCOUNT
Existing /me/profile now opens an account overview with recent orders, order
counts, current delivery default, personal details and useful completion links.
Navigation: Overview, My Orders, Personal Details, Delivery Details, Security.
On mobile the account navigation scrolls horizontally; the current tab is
brought into view on navigation. My Orders opens your existing order screen.

PERSONAL DETAILS
- Name and account email, your own international contact number, and country
  of residence. These are separate from a delivery address in Dominica.
- Changing the email address requires the current account password.
- Profile-photo selection, preview and save are on this same page. The previous
  /me/upload_avatar route redirects here so existing links still work.
- JPEG/PNG/WebP photos up to 10 MB are resized locally to a maximum dimension
  of 512 pixels and converted to JPEG under 450 KB before upload. The existing
  1 MB backend JSON limit is unchanged. Original large photos are not uploaded.
- Visible saved/error messages, disabled save buttons while busy, and a browser
  reload/close warning for unsaved edits. In-app navigation can discard edits.

SECURITY
- Current password, new password, confirmation, show/hide and clear feedback.
- Existing minimum length of 6 characters is preserved; a long unique password
  is encouraged. The backend awaits successful hashing/saving before success.
- Profile responses omit password and password-reset secrets.
- Deleted-account sessions are rejected. This update does not add email
  verification, two-factor authentication or multi-device session management.

DELIVERY DETAILS / SAVED RECIPIENTS
Customers can keep one personal delivery address in Dominica and up to 12
other saved recipients, such as Mum — Wesley or Sister — Roseau.
Each recipient has a label, full name, Dominica address/community, local phone,
optional postal code, landmark and delivery instructions.
- Add, edit and remove recipients; use a recipient or self as the default.
- Each customer's saved recipients are private to their own signed-in account.
- Concurrent/stale edits are rejected instead of silently losing another save.
- Removing the default recipient returns the default to self. It does not
  change any previous orders; the next checkout still requires valid details.
- Personal delivery address is optional if the customer buys only for others.
- A previous address outside Dominica is not silently relabelled as Dominica.

OVERSEAS CHECKOUT — EXAMPLE
1. Buyer registers/signs in from the USA, Canada, UK or elsewhere. Registration
   now asks for account/contact details, not a compulsory delivery address.
2. Under My Account > Personal Details, save country of residence and phone.
3. Under Delivery Details, add a recipient in Dominica and optionally make them
   the default. Or enter/save a new recipient directly during checkout.
4. At checkout, Purchased by shows the buyer's authenticated name/email, plus
   checkout country/contact number. The buyer can override their own contact
   details for this checkout without changing the saved profile.
5. Choose Deliver to me or Someone else in Dominica. Select a saved recipient
   or enter a new one. Delivery country is fixed to Dominica.
6. Choose a supported delivery service or pickup. Select who the store should
   contact about delivery: buyer or recipient. This is an instruction for staff;
   it does not send automatic WhatsApp/SMS messages or recipient emails.
7. Review the buyer and recipient separately, check the server-confirmed amount,
   and continue through the existing payment-method page.

The server takes buyer name/email from the authenticated account, not a name
or email supplied in a checkout request. Buyer country/phone can differ from
the recipient's. Dominica recipient phone numbers normalize to +1 767 format;
local seven-digit numbers are accepted. Include the buyer's international
country code when buying from abroad.

DELIVERY COVERAGE HAS NOT EXPANDED
Existing options and fees stay: Roseau delivery XCD 15, Portsmouth delivery
XCD 15, pickup XCD 0. Selecting a service does NOT make every community eligible.
The new form requires confirmation that the address is within the chosen
service area. This is a customer acknowledgement, not map/geocoding validation.
For other communities, choose pickup if someone can collect, or contact the
store before ordering. A saved Wesley address does not automatically add a
Wesley delivery service or fee. No international shipping is enabled.
Existing payment-provider country/card restrictions still apply.

GIFTS, INVOICES & PACKING SLIPS
- Optional gift checkbox and message (up to 300 characters) at checkout.
- The admin order screen clearly separates Purchased by and Deliver to, shows
  the requested contact person and gift message, and links a printable packing
  slip without price columns, totals, buyer email or payment credentials.
- Packing slip URL: /packing-slip/order/ORDER_ID. It is protected by the same
  order ownership/admin checks as order details. It is not a public gift link.
- Buyer invoices and buyer/admin notification emails retain the full amounts.
- The store must use the packing-slip print action when packing a gift; this
  update does not automatically print, wrap gifts or email the recipient.
- A packing slip lists contents and does not confirm that payment was made.

HISTORICAL ORDERS & CHECKOUT STATE
New orders save buyer/recipient/contact/gift details as snapshots. Later profile
edits, recipient removal, and default changes do not rewrite existing orders.
Buyer notification emails use the stored buyer email for these new orders.
Old orders retain their stored prices/details; missing historical buyer names
continue to use the existing account fallback because they were not previously
snapshotted. No historical identities are invented or backfilled.

Recipient identity and gift instructions are part of duplicate-checkout identity,
so changing recipients cannot accidentally resume another recipient's order.
Equivalent retries still reuse their existing unpaid order and reserve once.
Legacy unpaid self orders are recognized with their original fingerprint even
when the new checkout normalizes a local phone number.

Saved checkout details are associated with the current account. Another account's
cached delivery details are ignored. Clearing the cart after an order or logout
also clears transient checkout delivery details; saved account recipients remain.
Return to Delivery / Confirm Order when a checkout needs reviewing, as before.
For an already-created unpaid order, continue it through My Orders.

VALIDATION PERFORMED
- 77 backend tests passed, including the 57 previous order/promotion/seasonal
  checks and 20 new account/recipient validation and MongoDB integration checks.
- Existing frontend ProductItem regression test passed.
- Production frontend build passed with pre-existing lint/deprecation warnings.
- Browser checks used real local HTTP routes and disposable MongoDB: overseas
  registration without an address, profile edit, a large photo resized before
  a mocked upload, saved recipients/defaults, account-scoped checkout state,
  mobile form/card layout, delivery-area acknowledgement, gift checkout through
  the unchanged CASH payment page, price/stock snapshots, buyer receipt routing,
  admin contacts, invoice/packing slip and password change.
- Email and image services were mocked. No live PayPal/ShopDM transactions,
  real emails/photo uploads, production database writes or site deployment were
  performed. Keep and verify your existing service credentials after deployment.

The tests/ folder is development verification only, not a website page. It is
not executed by npm start or the frontend production build.
Optional local checks from repository root:
npm run test:orders
npm test --prefix frontend -- --watchAll=false --runInBand
npm run build --prefix frontend
Integration tests run only when TEST_MONGO_URI points to a DISPOSABLE database
named tt_upgrade_test. They delete that database's test collections. Never use
the live database for tests. The existing root test script runs suites serially.

ROLLBACK
Restore only the source files listed in CHANGED-FILES.txt from your pre-update
backup, then rebuild/redeploy. Existing stored order amounts are not recalculated.
New account/order fields can remain in MongoDB when restoring older source.
