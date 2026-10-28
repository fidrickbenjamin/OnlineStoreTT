TACTICAL TRENDS — MAPS, FOOD OPERATIONS & RESTAURANT CASH ACCOUNTS

INSTALL
1. Back up your current source and database before applying the upgrade.
2. Extract this ZIP into E:\Web Projects\OnlineStore, merge the folders,
   and replace all included files. Keep the new hub component/module files.
3. From the OnlineStore project root run:
   npm install --prefix frontend
   npm run build --prefix frontend
4. Deploy the updated backend AND rebuilt frontend through your normal process.
   Restart the backend if working locally. Refresh after deployment.
5. See MAPS-SETUP.txt to configure Geoapify. Food progress and restaurant
   accounts work without map keys; communities/landmarks remain available.

This incremental ZIP assumes your earlier hub, community delivery rates,
mobile basket, menu-tab and homepage updates are already installed.
The package includes frontend/package.json and package-lock.json to add only
Leaflet 1.9.4 and its dependency records. No new backend dependency is needed.
No manual database migration, data wipe or replacement database is required.
Existing orders are not rewritten or automatically marked paid.

FOOD ORDER OPERATIONS
New orders: Received > Restaurant accepted > Preparing > Ready > Picked up
> Delivered. Collection orders end at Collected and do not require a driver.
The customer progress panel includes actual timestamps, a kitchen readiness
estimate in Dominica time and any customer-visible delay message.
Estimates never automatically mark food ready or orders delivered.
Updates refresh while the activity page is open (about every 10 seconds).

Restaurant or admin:
- Accept the food order. Admin issues the final quote as before.
- Customer accepts the final quote. Online/bank orders need verified payment
  before preparation; cash orders follow the agreed cash arrangement.
- Start preparing and enter 5–240 minutes. Update the estimate and enter a
  short customer-visible message if delayed. Mark ready when actually ready.
- New orders must enter preparation before they can be marked ready.
Older orders can continue through their existing readiness flow.

Admin dispatch:
- Use the Kitchen stage filter to find received, accepted, preparing or
  ready food jobs. Activity cards now show meaningful food-stage labels.
- To deliver personally, open a confirmed delivery and select Handle delivery
  myself. No driver application is needed for admin-managed delivery.
- After food is ready, Mark order picked up. Confirm delivery using the
  customer's completion PIN; the existing recorded admin override is retained.
- Optional GPS sharing works while the active job page stays open. Device
  background restrictions, signal and hosting sleep can delay updates.
The kitchen readiness estimate does not include delivery travel time.

RESTAURANT CASH ACCOUNTS
Admin > Hub Operations > Restaurant accounts.
Choose the restaurant and statement date (Dominica time).

NEW orders snapshot the full food subtotal including paid extras as owed to
that restaurant; delivery fees are excluded. New restaurant commission is
zero under this release's operating arrangement. Existing jobs keep their
original commission and meal amounts.

The restaurant amount enters the ledger when preparation begins. This is a
commitment to prepared food, independent of the customer's payment method,
customer payment verification and delivery completion. New unprepared orders
do not yet add a restaurant liability.

Record cash only after actually handing it to the restaurant:
- Enter Amount, Cash received by, and a reference/receipt number.
- Select orders to allocate a partial, per-order or combined payment.
- With none selected, pay oldest outstanding meals first, then opening debt.
- Payment cannot exceed the current account balance or selected-order balance.
- A single payment may cover multiple meals; delivery is never added to it.
- Customer funds received and restaurant cash paid remain separate records.
  A PayPal receipt is not automatically treated as available physical cash.

Opening balance: enter only pre-existing unpaid meal debt NOT already
represented by the app's orders. It is carried in just before the selected
statement date. Use this once, or correct it by reversing the original entry.

Corrections: record a debit/credit adjustment with a reason. Reverse a wrong
entry rather than deleting it. Payment allocations reverse together with the
entry. Every account action keeps its actor, time, reference and audit record.
Reversing a cancellation review requires reversing linked cash payments first.
A negative account balance is shown as a restaurant credit requiring review.

Cancelled prepared food: the original meal amount remains owed pending
review. Agree the amount with the restaurant and use Review cancelled prepared
food (zero is allowed). The agreed amount adjusts this account only; customer
refunds still require their existing separate refund workflow. Cancelled food
must be reviewed before it can be paid, or explicitly exclude it by selecting
other payable orders. No silent write-off or automatic refund occurs.

Daily totals show opening balance, food entering preparation, restaurant cash
payments, adjustments/reversals and closing balance for the date. The current
balance and order rows include ALL activity to date, including activity after
an older selected statement date. Entries are recorded now; opening balances
are effective immediately before the chosen date. Current order balances are
not a reconstruction of every historical order state.

Legacy completed/ready orders use their preserved food-minus-commission
amount; old merchantSettled flags are recognized as already paid. When no
precise historic preparation/settlement date exists, the original available
order/timeline date supplies the opening baseline; this cannot reconstruct
unrecorded historical cash handovers. Do not re-enter those as new payments.
The old flag-only Record business settlement action is replaced by accounts.

Use Export statement CSV or Print statement. The CSV includes references,
allocated order IDs, signed entries, delivery exclusions and reversals.
The account screen is admin-only. Restaurants can see their own order meal
amounts but cannot access other restaurants' accounts or record cash entries.

PAYOUTS DEFERRED
New payout requests and automatic wallet credits are disabled by default.
Existing wallet balances, credits and payout history are preserved. Admin can
resolve previously recorded payout requests from Historical payouts when any
exist. New food delivery fees and optional driver pay remain separate quote
records; this release does not automate transfers, restaurant banking or cash
collection. The existing optional HUB_ENABLE_PAYOUTS=true compatibility switch
is for explicitly resuming the old flow later; leave it unset now.

MAPS
Google's embedded SDK and road-routing calls have been replaced with Leaflet
and Geoapify. Existing Google environment values are not edited and are no
longer used by these hub maps. Leaflet is bundled locally, without a CDN loader.

Ride/Delivery customers can search within Dominica, choose or drag pins, or use
phone GPS. Food checkout can select the delivery destination while the
restaurant pickup stays fixed. A GPS reading outside Dominica never overwrites
the recipient's location; overseas buyers can choose the Dominica location.

Show road route is explicit. Cached road routes show real provider geometry,
distance and estimated driving time. Moving driver markers does NOT repeatedly
recalculate routes. Fixed community rates take priority; a route preview does
not reprice a quote. Missing keys, service failures and unavailable allowances
leave the landmark/community/manual-quotation workflow usable. Straight-line
fares or fabricated routes are not used as fallback.

VERIFICATION
Production build passed with pre-existing unrelated lint warnings.
134 backend regression/integration checks passed. The final CSV refinement
also passed the focused 10-test operations suite. Checks cover cash/payment
separation, several-order allocations, partial payments, duplicate and concurrent
submissions, overpayment protection, reversals, cancellations/credits, old
commission/settlement history, dates, roles, route caching and failure handling.
Browser checks covered customer refreshes, kitchen delays, admin self-delivery,
GPS/PIN completion, ledger payments and cancellation review, CSV/print, deferred
payout UI, map search/pins/routes/attribution, fixed-rate priority, foreign GPS,
missing browser-key fallback, and phone/tablet/desktop layouts at 320/390/768/1440.
External map responses/tiles were mocked: actual Geoapify keys and real Dominica
road accuracy were not tested. Verify local roads after activating your keys.
No live payments, outbound email or production database writes were performed.

PACKAGE CONTENTS
20 source/dependency files + this README + MAPS-SETUP.txt.
No backend/app.js, Cart/PaymentMethod.jsx, environment/config files, build output,
node_modules, .git, tests, screenshots or customer data are included.
