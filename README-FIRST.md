# Tactical Trends — Convenience & Hardware Hubs

This is an incremental source update for the current project, including the earlier maps, food operations, restaurant cash accounts and responsive hub updates. Apply it to that latest project, not an older copy.

## Installation

1. Back up your current project and database.
2. Extract this ZIP to a temporary folder. Copy its `backend` and `frontend` folders into the OnlineStore project root, merging folders and replacing the included files only.
3. From `E:\Web Projects\OnlineStore\frontend`, run `npm run build`.
4. Deploy the updated backend source and your newly generated frontend production build using your existing deployment process, then restart the backend. Source changes alone will not update a frontend served from an old build.

There are no new dependencies or environment variables. Keep your existing payment and map configuration.

Excluded from this ZIP: backend/app.js, all .env/.evn files, config.env, frontend/src/components/Cart/PaymentMethod.jsx, build folders, node_modules, tests and Git files. Existing backend CORS configuration is not changed. Header.jsx is included to add navigation links; the latest seasonal and dropdown styling remains in your existing Header.css.

## First-time admin setup

Open **Hub Operations**. New sections are **Convenience stores**, **Hardware stores** and **Business accounts**. Restaurants & menus remains available.

1. Select the appropriate business section and choose Create store. Enter the name, phone, pickup address/contact/community, opening hours and delivery area. Leave Accept orders off until products are ready.
2. Add products with a category, image URL, price inclusive of applicable taxes, purchase unit and delivery class. Price is for one complete purchase unit. Examples: each, 1 kg bag, 25 kg bag, pack of 100, 20 ft length.
3. Configure **Delivery areas & rates**. Stores use the **Store / general delivery** columns, while restaurant food keeps its separate food rates. Routes are directional; use Create reverse route where required. Explicitly blank service rates require a manual quote. Existing older community rates remain a fallback when no newer route exists.
4. Review each store's preferred delivery communities and outside-area policy. The initial default is the existing Concord–Calibishie area; change it for stores serving another area. Warn, custom quote and block policies are supported. These use the customer's chosen community, not a GPS geofence.
5. Enable Accept orders for an approved store. Weekly schedules use Dominica time; closed shops remain browseable.

Public pages: `/convenience-hub` and `/hardware-hub`. Each storefront has its own product categories, delivery/collection checkout and mobile floating basket. Existing Food/Ride/Delivery Hub pages remain available.

## Product delivery classes

- **Standard:** configured community delivery fee.
- **Large / heavy:** community fee plus the product's extra handling fee multiplied by quantity, added across the basket. Handling belongs to delivery, not the store's product balance.
- **Quote required:** a suitable vehicle, access and delivery fee must be confirmed manually. The customer sees Quote required, not a standard delivery total. Admin's automatic rate-estimate button is disabled for these baskets.

Collection has zero delivery and handling fees. Admin confirms the final delivery fee before customer acceptance; it must include any recorded handling charges. Accepted quotes keep their totals even if catalogue prices or community rates change later.

## Ordering and payment

This release uses **one store per basket** and **stock confirmation before payment**. It does not claim real-time warehouse stock or reserve quantities automatically. Availability switches hide products temporarily. Quantities are whole purchase units, 1–30 per product, with up to 30 product rows per request.

1. Customer builds a basket, chooses delivery or collection and selects PayPal, ShopDM, Mobanking or cash.
2. A linked order/delivery request appears in Hub Operations and My activity. Submitting it does not charge the customer.
3. Admin or the partner confirms availability. Before a quote is issued, admin can reduce unavailable quantities or remove rows under Check store availability. The explanation is visible to the customer; business acceptance resets until the revised basket is checked. Product prices, units and handling values retain their request-time snapshots. A replacement product requires a new request; no silent substitutions are made.
4. Admin issues the final quote. Customer reviews the revised basket and complete total, then accepts it. Online checkout becomes available at this stage. Existing provider verification and Mobanking receipt review remain in place; choosing a method is not confirmation of payment.
5. The business starts picking & packing and marks the goods ready. Noncash orders require verified payment before this starts. Cash orders follow your agreed cash arrangement.
6. Admin can handle delivery directly or offer it to an approved driver. Pickup requires readiness; delivery/collection completion uses the customer PIN or a recorded admin override. Customer progress and timeline refresh while the page is open. Existing map and active-driver tracking are reused.

There is no new standalone payment confirmation/return page in this update. It retains the current shared hub payment flow and My activity pages. Existing ShopDM merchant return URL limitations are not changed here. Driver payout requests remain deferred.

## Business accounts and cash paid to stores

**Business accounts** includes restaurants, convenience stores and hardware stores, with a business-type filter, named accounts, daily statements, current balances, order allocations, CSV export and printing.

- Restaurants: existing rule remains — the meal subtotal becomes payable when preparation starts.
- Stores: the full product subtotal becomes payable when the order is marked ready for collection. Picking & packing alone does not create a payable store charge.
- Delivery and handling fees are excluded from the business's product balance. This release has no new store commission or negotiated wholesale-price feature. Historical restaurant commission snapshots and settlement records are preserved.
- Record cash actually paid to the business, the recipient and a reference. Partial and combined payments can be allocated to selected orders or oldest outstanding orders. These entries do not transfer money or change the customer's payment status.
- Use opening balances only for debt not already represented by app orders. Corrections use adjustments or reversals; history is retained.
- A cancellation after goods become ready keeps its product liability pending review. Record the store's agreed amount after checking returns or supplier charges; zero is allowed if all goods were accepted back without charge. Customer refunds are separate.
- Daily statements use Dominica dates. Current balances include all recorded activity, even when viewing an earlier statement date. Financial accounts remain admin-only.

## Quick business selection and removals

Restaurants & menus and both new store sections retain the dropdown and add searchable buttons showing each business name and optional logo. Select a business to edit its details and add, edit or remove menu items/products.

Remove archives the catalogue item, hiding it from new sales and preserving historical orders. Turn availability off instead when an item is only temporarily sold out. Archive business hides its storefront and disables new orders; Restore business makes its settings available again but leaves ordering paused until explicitly enabled. Accounts and existing orders remain accessible. A business with order history cannot be changed to a different business type.

Admin can manage multiple storefronts. A partner login retains the existing limit of one owned business application; partners can maintain their approved business's catalogue and hours. Automatic multi-store checkout, numerical stock synchronisation and automated supplier payouts are not part of this release.

## Validation

Production build completed with existing unrelated lint warnings. Nine new database-backed store integration tests and 134 existing regression tests passed. Browser checks exercised actual disposable-database workflows, mobile basket and category navigation, delivery totals, all four payment selections, stock reductions, final quote acceptance, readiness, supplier cash records, named selectors plus dropdowns, editing and archiving, and responsive layouts at 320/390/768/1440 widths.

Payment credentials, provider routing/tiles and production data were not used for real transactions. Browser checks ran in Chromium with mobile emulation; they were not physical iPhone/Safari tests. No production deployment or real money movement was performed.
