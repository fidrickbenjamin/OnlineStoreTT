# Tactical Trends — address-first checkout upgrade

Apply AFTER the community checkout update (tactical-trends-community-checkout-update.zip). This overlay supersedes the separate cart-selector follow-up: Cart.jsx is included here in its new form. It requires the preceding community directory, delivery quote and route-pricing source. Merge custom local changes rather than blindly replacing newer edits.

## What changes

- Cart has NO delivery dropdown or Roseau/Portsmouth selector. It shows items/subtotal and Continue to checkout. Delivery, applicable tax and the final total are determined at checkout.
- Checkout is the single decision point: Deliver to an address or Self collection, shown as selectable cards.
- Delivery displays only the customer's existing personal delivery address and saved recipient addresses, with duplicate address/contact entries consolidated. No stock village/service options appear in an address list.
- Add delivery address / someone else opens the address form. The community directory appears only in that form. Overseas buyers can deliver to a recipient in Dominica.
- Edit for this order changes the order address, not the saved account record. Use profile address management to permanently edit an existing saved address. Save as a new address is optional (the existing 12-recipient limit applies).
- Self collection hides delivery-address fields and asks only for collector name and a Dominica contact number. The backend does not require or copy a home address for collection. Collection instructions are displayed on review and order details.
- The duplicate delivery/collection dropdown and coverage-confirmation checkbox have been removed. A selected delivery address drives pricing automatically.
- The admin marketplace delivery screen now shows the community-based controls rather than the old editable service-option list. Legacy stored data remains for historical compatibility, but those options no longer appear in the new customer UI.

## Install

1. Back up source and database. Apply the supplied backend/ and frontend/ folders to the existing project root.
2. Build the frontend with `npm run build --prefix frontend` and deploy your generated output as usual.
3. Restart the backend as well. Do not deploy this as a frontend-only change: collection validation and default fees need the updated backend.
4. Follow the pricing setup below and stage the address/collection checks before public release.

No new dependencies, environment variables or manual database migration. Optional community fees use the existing settings document. Placed orders and financial snapshots are not recalculated.

Excluded: backend/app.js / your CORS changes, PaymentMethod.jsx, all .env/.evn/config.env files, builds, dependencies, tests and QA fixtures. The latest payment page from the preceding community update remains in place.

## Default community fees

Open Hub Operations > Marketplace delivery.

1. Choose the actual main stock dispatch community and enter collection location/contact instructions. Save first if changing the dispatch location.
2. Find Default community delivery fees. Its searchable table includes the community directory. Set the customer delivery fee and separate driver payout for each destination you want to price.
3. Import existing agreed route rates into blank defaults can copy your already-configured Store / general fees and payouts for the selected pickup community. It never replaces an existing default. Save/reload after changing the dispatch community before using this import.
4. Review, adjust and save the table using Save community checkout settings.
5. Enable automatic/community delivery pricing when the configuration is ready.

No arbitrary island-wide prices or unverified starter amounts are installed. This release provides editable per-community defaults and imports existing agreed rates. Destinations with no default may still use a valid shared route or zone; if none exists, the customer requests a quote before payment. Set a destination to quote-only or unavailable when you need an explicit override.

Pricing priority for each distinct pickup community:
1. Explicit default community fee for that pickup/destination pair.
2. Existing shared Store / general community route.
3. Configured zone fallback.
4. Manual quote.

Quote-only and unavailable destination modes override automatic pricing. An approved manual quote remains subject to its account, basket, address and expiry checks. Existing Food/Convenience/Hardware business order pricing is not changed by main-shop defaults.

A blank table row is a fallback, not free delivery. Enter zero explicitly for an agreed zero fee or payout. Enter both fields for each configured default; driver payout cannot exceed the customer delivery fee. Clear default removes only that override and exposes the shared route/zone/quote fallback again. Fees are directional and tied to the pickup community: changing your dispatch location does not reuse the old origin's default fees.

Other stock pickup groups retain the earlier community checkout workflow. Multiple distinct pickup communities produce separate delivery legs; exceptional loads/multiple business stops may still need a manual quote. Default driver payouts do not create an automatic driver dispatch, earnings credit or money transfer.

## Disabled delivery pricing

The old three-option selector is NOT restored when delivery pricing is disabled. New checkout allows self collection and explains that delivery setup is pending. Configure and enable community-based pricing in admin for automatic delivery and quote requests. Existing placed/unpaid orders keep their stored delivery/payment flow.

## Staging acceptance checks

- Cart: no service dropdown; Continue to checkout works.
- Account with a personal address and saved recipients: only those addresses appear. Select another saved address and confirm the destination/fee changes.
- Account with no saved address: add a complete recipient/address, price delivery, and optionally save it.
- Change a saved address for this order; verify the saved account entry stays unchanged.
- Choose Self collection: delivery fields disappear; collector details, collection instructions and zero fee are shown. Review order and create a staging cash order without entering a home address.
- Enter/import a default community fee and verify it overrides a lower shared route for the main marketplace, while the partner hub's own rate remains unchanged.
- Verify unpriced and unavailable destinations, and the existing request/approve/select quote path.
- Check mobile radio/address cards, scrollable admin fee table, keyboard navigation and validation messages.

See VALIDATION.md. No live deployment, production-data writes, real payment or outgoing notification was performed.
