# Tactical Trends Marketplace — PayPal currency and confirmation update

Prepared 20 November 2026. Apply on top of the latest payment-gateway-controls update.

## What changes

- Main-store and Food, Convenience, Hardware, Ride and Delivery hub checkouts share one backend XCD-to-USD conversion.
- Complete totals (including delivery, applicable tax and discounts) remain recorded in XCD; PayPal is charged USD at XCD 2.70 per USD 1, rounded once to USD cents. Example: XCD 65.00 -> USD 24.07. The peg does not promise the customer's bank will apply no FX/card fees.
- PayPal receives a single aggregate order amount. We do not separately convert and round item/tax/shipping breakdowns, avoiding a breakdown that differs by a cent from the charge. Your store order still shows its original item, delivery and tax breakdown.
- Customer sees XCD and USD before payment. PayPal SDK and backend both use USD, regardless of older PAYPAL_CURRENCY / REACT_APP_PAYPAL_CURRENCY settings.
- Dedicated responsive result screen covers verified success, provider-confirmed failure, customer cancellation, pending confirmation, manual review and full refund. A URL parameter cannot claim payment success.
- Capture first checks PayPal for an existing payment. Interrupted requests reuse saved idempotency keys; unknown/pending outcomes do not start a second charge.
- Amount, currency, order identity and completed capture must match. Provider HTTP errors or a closed browser are not treated as proof of a decline.
- Repeated captures/webhooks do not duplicate paid timelines or stock allocations. Currency snapshots are retained in the new PayPalAttempt MongoDB collection.
- Full admin: Hub Operations -> Payment gateways -> PayPal payment checks. View recent attempts, XCD/ USD amounts, refunds, reported PayPal fee/net in USD, mode, webhook readiness and older main-store checkouts requiring review. Verify refreshes with the provider. It shows up to 50 recent attempts and up to 50 legacy records, not a complete historical statement.
- Signed, individually verified refunds are deduplicated and accumulated. Partial refunds retain Paid status while displaying refunded USD separately. Full refunds mark Refunded. Refunds should be initiated in PayPal; this update does not add a refund-execution button.
- Reversals place the payment under review and hold its paid status pending store reconciliation. Partner balances and settlement credits are not rewritten automatically; record any necessary adjustments in Commercial centre with supporting evidence.
- Main cart clears only after verified payment, only for the matching pending order and unchanged basket. New items added while payment was pending are retained.

## Install

1. Back up your source and database. Test this overlay in your development/staging copy first.
2. Extract this ZIP and copy the backend and frontend folders into the OnlineStore project root, merging folders and replacing only matching files. Keep README/manifest out of frontend/src.
3. No new npm dependency is required. MongoDB creates the new collection/indexes automatically using the app's existing permissions; verify index creation is allowed in your deployment.
4. From the project root, build the frontend:

   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

5. Deploy backend changes AND the newly built frontend together. Your existing app serves frontend/build in production. If Render builds from source, ensure its build process actually runs the frontend production build; npm install alone does not generate the updated frontend.
6. Restart/redeploy the backend. In full admin -> Hub Operations -> Payment gateways, enable PayPal, select it as primary and leave ShopDM disabled if that remains your preference. Existing saved admin settings are preserved, not forcibly replaced.
7. Follow the payment-account checks below before announcing checkout availability.

The ZIP intentionally excludes backend/app.js, all .env/config.env files, build folders, node_modules, lockfiles and test folders. PaymentMethod.jsx IS included, based on the latest gateway-controls version, preserving its direct PayPal buttons, loading retries and styling. It also includes new files: copy the entire overlay, not just the files you recognize.

## PayPal configuration — keep secrets in Render/server settings

Existing server variable names remain:

- PAYPAL_ENV: live for actual payments; sandbox for sandbox testing. Any value other than live uses sandbox, as in your existing app.
- PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET: matching credentials from that environment and merchant app.
- PAYPAL_WEBHOOK_ID: ID of the webhook registered for that same app/environment. It is not the URL and not the client ID.

The checkout now takes its client ID from existing backend public payment settings and forces USD. No new conversion variable is required. Do not set XCD as the PayPal transaction currency. Never put the secret key into REACT_APP variables or send it in chat.

Production webhook URL:

https://www.tactrendsshop.com/api/v2/payment/paypal-webhook

Subscribe in the matching PayPal app to PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.PENDING, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED and PAYMENT.CAPTURE.REVERSED. Pending/denied events refresh provider status; they do not prove success. Keep capture/webhook handling available even if you pause new PayPal payments in admin.

Result screen routes are internal app routes, not the webhook URL:

- /payment/paypal/retail/<orderId>
- /payment/paypal/hub/<jobId>

The SDK approves in context; the frontend opens the relevant result screen after capture/cancellation/error and the server verifies status. No new external return URL is required for this flow.

## Existing checkouts and safe retries

Older main-store PayPal references have no reliable USD snapshot. This update blocks their automatic capture and shows a review message rather than silently charging or converting them. Historical Paid records are preserved and labelled legacy in checks; any old mislabelled amount fields are not rewritten based on guesses.

For each affected old order, compare actual PayPal currency, gross charge, capture ID, refund status and order's XCD amount. Resolve any overcharge/refund in PayPal with the customer. After proving an old unpaid checkout is no longer chargeable, use your existing admin cancellation/archive controls and recreate the order as needed. Do not simply erase payment references or tell a customer to pay again while status is uncertain.

Existing hub checkouts may be adopted only where their stored XCD amount and USD 2.70 conversion match exactly. Some older/expired provider checkouts require manual reconciliation. Unresolved creation attempts beyond the safe five-hour retry window are held rather than risking a new provider charge.

A provider-confirmed decline can create a new attempt on the same order. Pending or unknown payments cannot. Alternative payment on an existing order needs store coordination; this update does not silently switch an in-flight PayPal order to cash or another gateway.

## Verification completed and remaining

Validation: 74 backend/regression checks and 8 frontend component checks passed (82 total). Backend syntax checks passed.

Automated checks use an isolated disposable MongoDB and simulated PayPal API responses. They cover currency conversion; all five hub kinds; duplicate and concurrent starts; captures; changed amounts; declined, pending and interrupted payments; idempotency; ownership; paused gateways; signed-webhook handling; refunds; reversals; legacy holds; admin access; pricing, community delivery and gateway regressions. Result-screen component tests cover server authority, cancellation, network failure, basket preservation and USD display. The production React build succeeds with existing unrelated lint warnings.

These are NOT completed real PayPal sandbox or live card transactions. No production account settings, payments, refunds or emails were changed during preparation. Browser/device visual checks on the live deployment remain to be done.

Before treating this as production-verified:

1. Use sandbox merchant/buyer accounts to complete a main-store order and each hub flow. Confirm XCD total/2.70 equals USD charge to the cent.
2. Exercise cancellation and decline; close/refresh during confirmation; confirm only one capture and no duplicate order.
3. Confirm verified webhooks reach your service and return HTTP 200. A delayed webhook must not change a pending payment into a false failure.
4. Check a partial/full sandbox refund in both PayPal and admin; reconcile commercial adjustments separately.
5. On mobile and desktop, inspect the payment button, result screen and links to the correct order/activity.
6. With live settings confirmed, make a controlled genuine purchase using an eligible buyer (not the merchant account), verify the gross USD charge, XCD order amount, capture ID, fee/net and receipt in PayPal/admin. Follow the applicable provider rules for your buyer/merchant accounts.

If you roll back the source, pause PayPal first. An older version contains the original currency defect. Preserve the PayPalAttempt collection and transaction evidence for reconciliation; do not drop it to make an old checkout look unpaid.
