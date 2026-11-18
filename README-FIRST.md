# Tactical Trends — community-based marketplace checkout

Incremental source overlay, prepared 18 November 2026. Apply after the flexible markup / fees and business banners releases. This is not a full project. Back up your current code and database, then merge these folders into your project root. Compare any files you edited after those releases before overwriting.

## Install and enable

1. Apply BOTH backend/ and frontend/ source folders.
2. Build the frontend: `npm run build --prefix frontend` and deploy the generated output using your existing process.
3. Restart the backend. No new dependencies, environment variables or manual database migration are required. Mongoose creates the optional settings and quote collection through your existing connection.
4. In **Hub Operations > Marketplace delivery**, choose the actual **Main marketplace stock dispatch community**. Do not assume Roseau: use Wesley if that is where the stock is collected.
5. Enter clear collection location/contact instructions.
6. Review your existing **Delivery areas & rates**: use **Store / general delivery customer fee** and the separate **driver payout** for the actual pickup/destination pair. A food-only route does not automatically price marketplace delivery.
7. Optionally configure zone fallback rates below the directory (instructions next).
8. Enable **community-based checkout**, then **Save community checkout settings**. Test a priced village, an unpriced village, collection and a quote request in staging before live use.

**The new checkout is disabled by default.** Your existing Pickup/Roseau/Portsmouth configuration remains in use until you explicitly enable it. No live rates were changed and no example prices are automatically loaded.

Excluded: backend/app.js / your CORS changes, all .env/.evn/config.env files, build folders, dependencies, tests and QA fixtures. **PaymentMethod.jsx is included from the latest recovered version with one delivery-label change**, so customers see “Community delivery” or “Approved delivery quote” rather than an internal quote identifier. Existing payment handling, PayPal retries and button styling are preserved. Keep any newer local edits when merging it.

## What customers see

The recipient form offers searchable village/town/neighbourhood suggestions with 111 seeded locations and alternative spellings. It remains possible to enter an unlisted location and request assistance. Street, landmark and access instructions remain separate from the community.

The customer selects **Collect my order** or **Deliver to my community**. Delivery pricing is checked on the server from the basket's dispatch community to the chosen destination. The screen shows the route fee, item subtotal, configured tax and order total before payment-provider customer fees. Promotions and totals are checked again at Review order. Existing ShopDM full-order fee handling continues through the payment page.

A missing price produces **Request delivery quote**, never a zero or guessed delivery charge. Temporarily unavailable destinations cannot use automatic or manual delivery checkout; collection remains available. The delivery quote request does not reserve stock or create a paid order.

## Rate priority

1. Exact community route from the existing shared Hub Operations rates, using the Store / general service. Direction matters: Wesley → Roseau does not imply Roseau → Wesley.
2. A configured marketplace zone for the same pickup community and destination.
3. A manual quote if neither prices the route.

An exact route intentionally left unpriced for the Store / general service requires a quote; a zone will not silently override it. Existing legacy hub route rows are still consulted when no newer exact row exists. Review them too.

Each zone has a pickup community, selected destination communities, customer fee and driver payout. Use the search and checkboxes to select many destinations. Overlapping zones for the same pickup/destination are rejected. Zero is valid for an explicitly free delivery or unpaid allocation; blanks must not be used as a substitute for zero.

Zones apply to the main product cart. Restaurant, convenience and hardware business baskets retain their existing policies, handling surcharges and final-quote workflow. Those hubs share the broad community suggestions and established spelling aliases, but marketplace zone settings and destination availability overrides do not replace their individual business delivery policies. Taxi fares are unchanged.

## Configure the directory

Use **Find community or alias** to edit a location. Each has a stable ID, display name, aliases and marketplace delivery mode:
- **Use configured route / zone**: price automatically only when a route or zone actually exists.
- **Always require a quote**: bypass automatic pricing for access, distance or operational concerns.
- **Temporarily unavailable**: prevent delivery checkout to that destination.

You can add locations (up to 500). Keep aliases unique across communities. Renaming a location keeps its ID and retains the old name as an alias so old saved addresses and shared route names remain usable. Existing saved addresses are read in place; there is no destructive bulk address rewrite. Historical orders remain unchanged. The seed is a practical delivery directory, not a guarantee of complete official settlement coverage or road access. Review local names and use aliases for your preferred spelling. Parish classification is not asserted.

Seed reference sources:
- https://www.electoraloffice.gov.dm/constituencies/list-of-constituencies
- https://www.communitydevelopment.gov.dm/dominica-s-local-government-system

## Additional stock pickup groups

All marketplace products use your main dispatch location unless explicitly assigned to another stock pickup group. Add a named group, choose its pickup community, search products and tick those collected from that location. A product can belong to only one group. Unassigned products retain the main location.

The checkout prices **one leg per distinct pickup community** and shows each leg before payment. If any leg lacks a rate, the whole delivery requires a quote instead of charging a partial total. Collection instructions refer to Tactical Trends' collection arrangement, not automatically to a business's door.

This is not route optimisation or automatic multi-stop pricing. Multiple business stops in the same community, bulky loads and unusual access may need a manual quote. Use a quote-only destination / an unpriced Store route when automatic fees would not be appropriate. Supplier accounting groups do not automatically determine stock locations: configure the actual dispatch arrangements here. These groups apply to the main marketplace cart; hub business baskets already use their own pickup points.

## Manual quote workflow

1. Customer completes address and phone, then requests a delivery quote. The checkout draft is saved on that browser so they can return.
2. A full admin or staff with **settings** permission opens **Marketplace delivery > Checkout delivery quote requests**. The latest 100 requests appear.
3. Review the items, pickup communities, full address and access instructions. Approve or decline with a customer-visible note. Approval requires customer delivery fee, driver payout and validity (1–168 hours, default 24).
4. Customer returns to checkout with the same basket/address and selects **Use this delivery quote**. Requests refresh about every 15 seconds while checkout is open; admin refreshes about every 30 seconds.
5. Review order recalculates current product prices and tax before payment. Creating the order validates the quote again and captures its delivery amount/instructions.

The server binds an approved quote to the account, product quantities, address, landmarks/instructions and pickup communities. Changing those, quote expiry or an unavailable destination prevents reuse. A changed recipient phone/name alone does not change a community delivery price; review operational details where needed. Changing a normal route fee does not alter an already accepted manual quote within its validity.

Customers see their latest 30 quote requests, filtered to the current basket/address. To continue on another browser, recreate the same basket/address. No new quote email, SMS or push notification is sent in this release: use the visible inbox, polling and your usual customer contact. Approving a delivery quote does not approve payment or reserve products.

Driver payouts are planning amounts recorded in rates / quote decisions. They do not dispatch a driver, create an earnings credit or transfer funds. Existing order fulfilment and finance reconciliation still apply; record actual delivery cost in the commercial settlement workflow. Driver amounts and internal quote audit/context data are excluded from customer responses.

## Existing orders and rollback

Placed orders retain their stored delivery snapshot, price, tax and payment-fee information. New checkout rates do not recalculate them. Existing unpaid orders continue through their existing order/payment flow.

To revert the checkout selection, disable community checkout and save. The prior legacy options remain available under the collapsed legacy section. Do not delete new quote records or overwrite historical order snapshots. In-progress new-mode carts should return to delivery details and select a currently supported option.

See VALIDATION.md for checks and limits. No live deployment, production-data writes, real payments, driver transfers or outgoing notifications were performed.
