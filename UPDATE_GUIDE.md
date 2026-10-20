# Tactical Trends Marketplace — major update

This is an incremental update for the uploaded `online store tt.zip`, covering improvements 2–10. It is not a complete replacement project.

## Install on your Windows development project

1. Stop the frontend and backend. Keep a copy of your current project and back up its MongoDB database before applying the schema and stock changes.
2. Extract this ZIP. Copy the contents of `tactical-trends-update` into `E:\Web Projects\OnlineStore`, merging the `backend`, `frontend`, and `tests` folders and replacing only matching files. Do not delete the existing project folders.
3. Install the locked dependencies in PowerShell:

```powershell
cd "E:\Web Projects\OnlineStore"
npm ci --legacy-peer-deps
cd frontend
npm ci --legacy-peer-deps
```

4. Initialise the new order indexes and perform maintenance, using your existing development configuration:

```powershell
cd "E:\Web Projects\OnlineStore"
npm run orders:maintenance
```

This uses `backend/config/config.env` for development and your existing MongoDB URI. In production set `NODE_ENV=PRODUCTION`; the script then uses your existing `.env.production` and `DB_URI`. No environment file is supplied by this update. If your environment was already configured as production, switch it to your normal development settings before working locally.

5. Start the backend and frontend in separate PowerShell terminals:

```powershell
# Terminal 1 — project root
cd "E:\Web Projects\OnlineStore"
npm start
```

```powershell
# Terminal 2 — frontend
cd "E:\Web Projects\OnlineStore\frontend"
npm start
```

6. Open the store, sign in, and follow the verification checklist below. When ready for production, build it locally:

```powershell
cd "E:\Web Projects\OnlineStore\frontend"
npm run build
```

The build folder is deliberately absent from this ZIP. Generate it from your current environment so your own frontend settings are used.

## Files deliberately excluded

- `backend/app.js`: your CORS removal is preserved.
- `.env.production`, `.env.development`, `config.env`, and other environment files.
- All `build`, `node_modules`, and `.git` folders.
- Unchanged application files, images, and the original project ZIP.

`PaymentMethod.jsx` IS included. Its starting version exactly matches the latest automatic-retry file you uploaded. Its PayPal buttons, styling, SDK loading, retry timers and create/capture logic are retained. The only changes clear the cart once a cash/Mobanking order is recorded and open that specific order's confirmation page; confirmed PayPal checkout also opens its specific order. The PayPal provider controller and credentials are not replaced. Payment routes now check order ownership, cancellation and stock before invoking the existing provider logic.

## What changed

### 2. Continue an existing unpaid order

My Orders opens an order detail page with an existing-order payment action for PayPal and ShopDM. It passes the existing order ID rather than creating another order. Matching unpaid checkouts are reused on the backend using a unique fingerprint per customer, item quantities, shipping details and payment method. Once the order is paid or cancelled, the same contents can form a new order. A concurrent attempt may receive “being updated”; retry shortly.

### 3. Clear confirmations and working email content

The confirmation shows the order reference, payment status, fulfilment status, item totals, delivery details and customer-visible history. “Order received” does not claim that payment is complete. Order emails now supply the expected HTML field; the mail utility also accepts older HTML/text calls and creates its transport after configuration loads. Customer names and product text are escaped in HTML emails. Mailtrap continues to use your existing settings. Live delivery is not verified without your credentials.

Direct refreshes of protected pages now wait for the initial account lookup instead of immediately redirecting a signed-in user to Login.

### 4. Mobanking proof and review

Customers upload JPEG, PNG or WebP receipt images from Order Details. The browser compresses images; the backend accepts a maximum of 450 KB with format/header checks. This fits under your unchanged 1 MB request limit. Receipts are stored privately in MongoDB, not at a public image URL. Only the order owner or an administrator may retrieve them; normal order JSON omits the image bytes.

Administrators can approve or reject the current receipt in Manage Order. Rejection requires a reason, which the customer can see. Approval records Paid, preserves stock allocation, and moves a pending order to Processing. The store must check the transfer against its bank account before approving.

### 5. Delivery and collection

The shipping page keeps your existing charges: pickup XCD 0; Roseau XCD 15; Portsmouth XCD 15. It adds community/village, landmark, delivery notes, contact autofill and collection instructions. Postal code is optional for the customer and stored as N/A when absent. Delivery/collection times are confirmed by the store; no unapproved delivery promise or additional community rate has been invented.

These are service-area choices, not geocoded address verification. Review addresses before accepting delivery outside the listed service areas. Delivery prices are held in `backend/utils/orderRules.js`; update the corresponding frontend fallback/helper prices if changing them later.

### 6. Stock allocation and order lifecycle

New orders reserve stock before the browser receives a successful order response. The backend groups repeated product rows, validates quantities and uses database prices and stock. Conditional product updates and an order allocation ledger prevent the same order from deducting stock repeatedly. If one item cannot be allocated, earlier allocations are compensated. Admin status edits no longer subtract every item again.

Available stock shown in admin/product pages excludes active allocations. Set this value as the number of additional units available to sell. Products with stock allocations cannot be deleted; set their available stock to zero to remove purchase availability while retaining order history.

An unstarted, unpaid Pending order expires after 24 hours. Expiry releases stock once. Customer order views, admin order views and new checkout sweep expired orders in batches of 50. You can also run `npm run orders:maintenance` periodically (for example, every 15 minutes using your hosting scheduler). Provider-started orders and receipts awaiting review are deliberately not automatically released: the provider may complete payment after the customer leaves. Review these orders in admin before cancelling them. Paid orders do not expire.

Customer cancellation is now a valid cancellation REQUEST, not an invalid fulfilment status. Admin confirms cancellation. Shipping/delivery requires confirmed payment. Cancellation does not issue or imply a payment refund.

#### Existing orders require a stock decision

The previous admin implementation deducted stock on every edit, so historical quantities cannot be inferred reliably. Existing orders are identified as legacy. Before changing their fulfilment or resuming payment, open Manage Order and choose:

- **Stock was already deducted:** record the allocation without reducing stock again.
- **Stock was not deducted — allocate now:** allocate from the available stock before fulfilment or payment.

Check actual stock first. This update does not silently recalculate historical inventory. Already-paid/delivered orders and financial history remain stored.

Multi-product operations use conditional updates with compensation, not a multi-document MongoDB transaction. The maintenance command can complete interrupted, unallocated new orders; if it reports an order requiring review, check that order and its physical stock before resolving it.

### 7. Admin organisation and invoices

Order search includes customer name, email and reference. Filter by payment, fulfilment, payment method or archived records. Manage Order includes private staff notes, customer-visible status history, receipt review, cancellation requests and legacy stock reconciliation. Payment method is fixed once an order exists; online Paid status comes from the provider rather than manual admin editing.

Archive/Restore preserves stock and financial history. The old delete-order endpoint now archives, and the order list uses explicit Archive/Restore controls.

Invoices distinguish outstanding, paid and cancelled orders and show accurate line totals, tax, shipping and balance. Print / save as PDF uses the browser print dialog. The old unsupported late-payment finance-charge statement has been removed. A cancelled paid order still requires separate refund handling.

### 8. Faster mobile shopping

Routes load on demand rather than bundling every admin and account page into the initial screen. Product listings query a page of lightweight data and a count instead of loading every matching full product document. Product thumbnails use lazy loading, fixed dimensions, async decoding and Cloudinary's size/quality transformation when applicable. Product search treats keywords as literal text.

Customers can sort by newest, price or rating, filter in-stock products, open filters on mobile, clear filters and access a floating cart when their cart has items. A page-wrapper width issue at intermediate mobile/tablet sizes was corrected. Property listings continue to use their separate inquiry flow.

### 9. Dependency cleanup

The obsolete `mdbreact`, `react-star-ratings` and `react-js-pagination` dependencies were replaced with local React components. Unused frontend React/payment wrappers were removed from the backend package. Frontend React and React DOM are pinned to 18.3.1, and PayPal remains in the frontend package. Updated lockfiles are included. `npm ls react react-dom @paypal/react-paypal-js` was checked successfully: one React version is used across the frontend.

This is targeted cleanup, not a Create React App framework migration. Existing non-blocking lint/deprecation warnings in unrelated original files remain.

### 10. Sales reporting

The dashboard reports confirmed paid revenue, paid orders, average order value, unpaid order counts, cancellation counts, best-selling products and CSV export. Revenue uses the payment date (falling back to creation date for legacy records); status counts use order creation date. Date-only filters use Dominica's UTC-4 calendar day. Product revenue excludes tax and delivery; total revenue includes them. Refunded records are excluded; cancelled records that remain Paid are counted until their payment status is reconciled. Legacy records without payment dates are labelled by the fallback rule.

## Verification after installation

1. Sign in, refresh My Orders directly, and confirm your session is retained.
2. Place a small cash order: verify its reference, correct totals and next steps, then check the email logs.
3. Attempt the same unpaid checkout again: verify the existing order is reused and stock does not fall twice.
4. Open an unpaid online order from My Orders and verify payment uses that same order ID. Confirm your existing PayPal/ShopDM environment and currency configuration before taking real payments.
5. Submit a Mobanking receipt; reject it with a reason, upload a replacement, then approve after checking the bank. Confirm a customer cannot view another customer's receipt.
6. Change a new order from Pending to Processing several times: available stock must not change again. Confirm payment before marking delivery complete.
7. Cancel an order in admin and verify its reservation returns once. Reconcile the provider first for online orders. Refunds remain a separate operation.
8. Review an existing legacy order and choose its stock-accounting option before processing it.
9. Filter/archive/restore orders, save an internal note, and print an invoice.
10. Check the dashboard against known paid orders; test mobile product filters and delivery inputs.

## Automated validation

- Production frontend build: passed with existing unrelated lint warnings.
- Existing frontend product-card test: passed.
- Backend rules and real temporary MongoDB integration tests: 23 passed, no skips in the full validation run.
- React dependency tree: checked; React/React DOM 18.3.1 deduplicated.
- Browser rendering checks: see VALIDATION.md for the final results.
- No real payment, email, bank transfer, production database or external deployment was performed.

Basic backend tests:

```powershell
cd "E:\Web Projects\OnlineStore"
npm run test:orders
```

Database integration tests run only when TEST_MONGO_URI points to a disposable database named `tt_upgrade_test`. They delete test orders/products in that database. Do not point this at business data:

```powershell
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/tt_upgrade_test"
npm run test:orders
Remove-Item Env:\TEST_MONGO_URI
```

Frontend test/build:

```powershell
cd "E:\Web Projects\OnlineStore\frontend"
$env:CI = "true"
npm test -- --watchAll=false --runInBand
Remove-Item Env:\CI
npm run build
```

See CHANGED_FILES.md for every included application file. Files absent from this patch remain your existing versions.
