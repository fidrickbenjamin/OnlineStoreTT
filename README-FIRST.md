# Tactical Trends — Commercial pricing and Service Hub subscription update

Incremental source update, 31 October 2026. Apply to the latest Service Hub / audit-fixes version of OnlineStore. No live deployment or production database changes have been performed.

## What is included

- Commercial Centre under Admin → Hub Operations: agreed purchase costs, full variant costs, additional extra costs, procurement versus prepaid inventory, supplier links for marketplace items, settlement terms, and order margin review.
- Existing customer selling-price editors remain the place to set selling prices. Cost changes apply to new orders; confirmed historical orders are never revalued.
- Food, Convenience and Hardware jobs capture private financial snapshots and owe the supplier the agreed purchase cost, rather than the customer selling subtotal. Prepaid stock has a purchase cost but creates no second supplier debt.
- Marketplace orders capture costs and supplier links privately at order creation. Supplier liabilities enter Business Accounts when processing begins; cancellations and customer refunds do not automatically erase that liability.
- Ride and Delivery use the existing customer fee and agreed driver cost. Commercial Centre separates delivery margin from goods margin. Automatic payout requests remain deferred.
- Business Accounts retain partial payments, allocation, opening balances, cancellation reviews, reversals and CSV statements, with supplier credits, due dates, overdue exposure and credit-limit flags added. Credits can create a visible business credit after an already-paid order. They do not initiate refunds or bank transfers.
- Restaurant/store owners can view their own statement in Business Centre. They cannot access internal cost collection, margins, or another business’s accounts.
- Service Subscriptions: monthly plans, invoices, verified payment references, explicit existing-business transition dates, suspension, and private business account access. Approved profiles appear publicly only while subscription access is current. Property listings are excluded.

## Read before deploying

1. Back up the project and MongoDB data. Test against a staging copy first.
2. Existing Service Hub businesses have no subscription dates. The new rule WILL hide them until you assign a documented transition paid-through date or verify a first invoice. There is no default grace period and no fabricated arrears.
3. To avoid a launch gap, use the optional dry-run transition utility below to assign explicitly agreed access dates before deploying the visibility rule. Alternatively, perform plan setup immediately after deployment during a planned maintenance window.
4. Configure agreed purchase costs before accepting new Food/Convenience/Hardware orders. Requests can be submitted with unknown costs, but a final quote is blocked until finance captures the agreed costs. Previously placed legacy orders retain their existing settlement amounts and unknown profit history.
5. Copy only the supplied backend/ and frontend/ files into matching project folders. This is an overlay, not a replacement project.
6. In frontend, run `npm run build`. Deploy that locally generated build using your existing production process, and restart/redeploy the backend as well. A frontend-only deployment is insufficient.
7. No dependencies or new environment variables are required. Retain your existing database, SMTP, PayPal and ShopDM configuration.
8. Check the launch scenarios in VALIDATION.md before accepting real orders.

## Exclusions preserved

The package does NOT contain backend/app.js, .env files or examples, .evn files, config.env, build folders, node_modules, tests, preview fixtures, or frontend/src/components/Cart/PaymentMethod.jsx. Your CORS changes and current payment-method page are preserved. No change was made to them.

## Set purchase costs

Admin → Hub Operations → Commercial Centre → choose an item.

- Enter costs in XCD. Blank means Unknown. Enter 0 only for a genuinely agreed zero cost.
- For a variant, enter its full purchase cost. For each paid extra, enter the additional purchase cost.
- Choose Purchased per order when Tactical Trends will owe the supplier. Choose Already paid / owned stock when the stock was paid for earlier.
- For marketplace procurement, select a supplier business; create that business using the existing store management first. Property cannot receive a procurement cost.
- Selling prices remain in the original product/menu editor. A newly added variant or extra needs its own cost before that order can be quoted.
- An unconfirmed request can explicitly Capture agreed costs from Commercial Centre. This resets business acceptance and any quote, so a fresh acceptance and customer quote are required. Confirmed orders cannot be recosted.

Example: 2 meals sell at XCD 25 each; each costs XCD 18. Goods revenue = 50, supplier charge = 36, gross profit = 14. Delivery charged = 12, driver cost = 10, delivery margin = 2; contribution after those recorded direct costs = 16. This is NOT net profit.

Unknown historical costs remain unknown. Reports label uncompleted orders as estimates; cancelled/refunded orders require reconciliation rather than showing their original margin as earned profit. Marketplace delivery contribution remains Unknown because the retail checkout has no captured driver cost. Fees, fuel, overhead and tax expenses are not invented or automatically deducted.

## Supplier settlement

Commercial Centre → choose a business under Business settlement agreements.

- Immediate: due when the order’s business charge accrues under the existing preparation/readiness workflow.
- Fortnightly: enter the first agreed settlement date; periods repeat every 14 days.
- Monthly: due on the first day after the accrual calendar month, using Dominica time.
- Reference: record the signed agreement or written arrangement reference.
- Credit limit: optional exposure warning for admin; it does not automatically block customer orders.

New orders preserve these agreed terms. Historical due dates are not fabricated. Business Accounts → record actual payments and recipients; select orders to allocate a partial or combined payment. Supplier credit reduces an order’s business charge; customer refunds are still a separate operation. Entries are reversed rather than deleted.

Restaurant charges continue to accrue when preparation begins; store goods accrue when ready/picked up. Do not interpret “Immediate” as an automatic transfer. Follow your signed agreement when paying.

## Service Hub subscription workflow

1. Admin → Hub Operations → Service subscriptions → choose a business.
2. Set monthly fee, plan and agreement reference. For an existing listing without billing history, optionally set its explicitly agreed transition paid-through date.
3. Create a monthly renewal invoice. A business can also create its own invoice while inactive.
4. The business pays through the agreed arrangement and submits its actual Cash, Mobanking, PayPal or ShopDM transaction reference.
5. Finance checks actual receipt of the exact invoice amount, selects the actual method, enters a unique verified transaction reference and confirms verification. Only then is access extended.
6. A payment reference is reserved to one invoice across all service businesses; it cannot be reused to activate another listing. Retry a stale verification against the SAME invoice/reference after refreshing.
7. Expiry is checked on public list, detail and enquiry requests. Render sleeping or a missed background job cannot keep expired profiles publicly available. Public pages are sent with no-store caching.
8. An expired business can log in, access invoices and submit renewal evidence. Renewal after a lapse starts a new prepaid access period; no automatic arrears are created. Void an expired unpaid invoice and issue a current one rather than accepting payment against an obsolete period.
9. Billing suspension and profile approval are independent. Payment does not approve a rejected/pending/suspended profile or reactivate a paused category. Editing a profile returns it to review without erasing billing history.

These are verified/manual renewals. Selecting PayPal or ShopDM here DOES NOT open checkout or create an automatic recurring debit. Do not tell businesses the platform automatically charges their account. Customer product checkout is unchanged.

To stop public access after an invoice correction, suspend the subscription, preserve its audit history, and reconcile any money separately. Paid invoices are not silently editable or deletable.

## Business account access

Businesses register through the existing login system. A full administrator then verifies the person’s authority and account email through the established business contact, records that verification reference and links the account as Owner or Manager under Service subscriptions. This is not automated email verification or a public claim link.

One account can manage several service businesses. Owners and managers can edit their assigned profiles, access their billing and request renewal; only admin can approve profiles, verify funds or grant/revoke linked access. Original applicant ownership remains attached to its original account; this screen revokes additional linked memberships. No medical or clinical records are added.

## Optional pre-deployment transition utility

File: backend/scripts/serviceSubscriptionTransition.js

Create your own private JSON file with the actual Service Hub business IDs and the access dates agreed with each business. Do not invent payment receipts. Example shape:

```json
[
  {
    "business": "REPLACE_WITH_ACTUAL_24_CHARACTER_ID",
    "plan": "Monthly business listing",
    "monthlyFee": 50,
    "paidThrough": "2026-12-01T04:00:00Z",
    "reference": "Documented launch transition agreed with business"
  }
]
```

Choose a FUTURE date appropriate to the actual deployment. The sample is a format example, not an instruction to grant that period.

Run from the project root using your existing database environment. Node 20.15 supports loading an existing environment file if needed:

```text
node --env-file=backend/config/config.env backend/scripts/serviceSubscriptionTransition.js --input service-transition.json
```

Without `--apply`, this only validates and reports changes. After checking the dry-run against your backup/staging data and agreed records:

```text
node --env-file=backend/config/config.env backend/scripts/serviceSubscriptionTransition.js --input service-transition.json --apply
```

If your environment is already loaded (for example in your configured hosting shell), omit `--env-file`. The utility follows existing NODE_ENV/DB_URI/DB_LOCAL_URI settings. It refuses to overwrite billing history, is repeatable for identical transition records, and never creates fake invoices/payments. Keep transition files and credentials out of Git and public folders. It is not a blanket migration of every business.

## Operational limits

- Commercial catalogue selector shows up to 1,000 items per catalogue type; the margin table shows the 500 most recent orders per type. Business statement balances use the full matching order history.
- Unit costs are manually agreed/specified costs, not a FIFO or batch inventory valuation system.
- Driver payout execution, recurring provider billing, subscription refund automation and complete statutory accounting remain outside this release. Existing historical driver payout records are preserved.
- Test locally/staging before production: real credentials, actual provider settlement, DNS and your production database were not accessed during validation.
