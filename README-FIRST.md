# Tactical Trends — payment gateway controls

Incremental source update prepared 19 November 2026. Apply after the address-checkout upgrade. Back up your current source and database, then merge the supplied backend/ and frontend/ folders into your project root. Compare any newer local edits before replacing files.

## Initial behaviour

When no saved gateway settings exist:
- PayPal is enabled and is the primary/recommended method.
- ShopDM Pay is paused.
- Cash and Mobanking remain enabled.

No live configuration was changed by preparing this ZIP. This behaviour takes effect after you install and restart the updated application. No records or historical ShopDM fees are removed. Saved settings take priority over the initial defaults on subsequent deployments.

## Install

1. Apply both backend and frontend source changes.
2. Build the frontend: `npm run build --prefix frontend` and deploy the output through your usual process.
3. Restart the backend.
4. Sign in as a full administrator and open **Hub Operations > Payment gateways**.
5. Confirm PayPal enabled, ShopDM disabled and PayPal selected as Primary / recommended payment method. Review the customer notice and save.
6. Check main checkout and a food/store/ride/delivery request in staging before release.

No new dependency, environment variable or manual database migration is required. PayPal uses your existing PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET server settings; its public client ID is made available at runtime. Existing currency/conversion handling is preserved. Never put the secret in frontend variables. If PayPal credentials are not configured, the customer UI will not offer PayPal just because its switch is on; admin shows configuration readiness.

Excluded: backend/app.js / CORS changes, all .env/.evn/config.env files, builds, dependencies, tests and QA fixtures. **PaymentMethod.jsx is included from the latest address/community checkout baseline** because hiding paused gateways requires updating that page. Direct PayPal buttons, automatic retry handling, current totals and styling remain in place.

## Admin controls

The Payment gateways tab is available only to full administrators. Enable/disable PayPal, ShopDM Pay, Cash and Mobanking separately. Choose an enabled primary method and enter an optional customer-facing notice. At least one method must remain enabled. The screen distinguishes enabled settings from detected credentials: an enabled but unconfigured online gateway is not offered to customers.

Hub request forms initially select the available primary method, falling back to another available method if necessary. Customers can choose any enabled/available alternative. Main checkout keeps PayPal's direct-button experience and marks it recommended when primary. Primary does not force payment, move money or change an existing order's method.

Settings use revision checks and before/after history in the settings record, in addition to the existing admin action audit. Customer screens refresh gateway settings about every 30 seconds / on focus. Server checks enforce the latest setting even if a customer's page is stale.

## What pausing does

Paused methods are hidden from new marketplace checkout and hub payment choices. New orders/requests using a paused method are rejected by the backend. New ShopDM/PayPal checkout creation is also blocked, including direct attempts against existing unpaid orders. Marketplace start guards run before inventory-readiness side effects. Resume-payment screens explain a paused provider instead of offering a new checkout button.

Webhooks and existing PayPal capture endpoints are intentionally not disabled. A customer may already have approved or completed a provider payment when a gateway is paused; those confirmations must still be reconciled. Paid/refunded orders, totals, supplier liabilities, payment records and financial snapshots are not rewritten. Recording actual historical payment evidence remains possible, including service subscription evidence and admin reconciliation.

## Existing unpaid ShopDM orders

They retain ShopDM as their recorded method. They are NOT silently converted into new PayPal orders. Contact the customer, verify ShopDM/provider activity and reconcile any in-flight or completed transaction before arranging an alternative. The customer sees a contact-store message. This release does not provide automatic gateway switching for existing orders, automatic refunds or migration of payment sessions. Do not collect a second payment until the first payment status is established.

The new controls cover the four supported marketplace/hub customer methods. Dormant legacy Stripe/Fiserv integrations are not added to the admin control panel or newly exposed on customer screens.

## Re-enable ShopDM later

Complete the provider setup using your existing server configuration. In Payment gateways, confirm configuration readiness, enable ShopDM, choose the desired primary method, update/remove the temporary notice and save. Its existing integration and fee settings are preserved. Validate the provider integration in staging before making it available to customers. Disabling/re-enabling does not change its 3% fee profile or any past order.

Business pricing recommendation fee profiles are separate from gateway visibility: review those independently if switching your margin estimates to verified PayPal merchant fees. This update does not invent PayPal fees or change negotiated partner prices.

## Validation and staging checklist

49 automated checks passed, with 0 failures or skips. These include the existing commerce/checkout/banner suite plus new checks for initial ShopDM pause/PayPal primary defaults, full-admin permissions, stale settings writes, invalid primary/all-off configurations, private-secret exclusion, blocked shop/hub starts and order creation, reachable capture handling, and re-enabling without changing stored order totals. A disposable MongoDB database and synthetic accounts were used; no real provider transaction or email was made.

Production frontend build and backend syntax checks passed. Existing unrelated build warnings remain. New controls were not visually browser-tested in this revision; the earlier local preview had an access limitation. Before release, verify on desktop/mobile: default PayPal availability; no ShopDM button or ShopDM fee breakdown; cash/bank alternatives; admin toggle persistence; blocked direct retry on an old ShopDM order; and a completed provider callback in your provider's test environment.

No live deployment or production payment-setting mutation was performed.
