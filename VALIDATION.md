# Validation — 18 November 2026

41 automated checks passed; 0 failed; 0 skipped. Disposable MongoDB 7.0.14 and synthetic accounts/products were used, with the mail worker disabled. No production database or provider transaction was used.

The suite includes the existing pricing/fees/banner tests and nine new community-checkout tests covering:
- Broad directory, aliases, administrator permissions and stale configuration revisions.
- Shared exact route priority over zones and hidden driver cost fields.
- Summed fees for distinct pickup communities and no partial automatic charge for a missing leg.
- Manual requests, repeat-request reuse, staff approval permissions, private audit data, quote account/cart/address/expiry binding.
- Quote-only / unavailable destinations and free collection.
- New orders with frozen route or manual-quote snapshots, unchanged by later rate edits.
- Ambiguous aliases, overlapping zones and excessive driver payouts.
- Stable directory IDs, retained old-name aliases and explicit zero-cost delivery.

Backend JavaScript syntax checks passed. Production frontend build succeeded with existing unrelated warnings. No new component warnings remained in the validated build.

Browser checks used the production frontend against the actual checkout API and a disposable synthetic database, not the live store:
- A Roseau destination selected a configured XCD 40 zone fee and showed the same XCD 97.50 total on checkout and Review order (synthetic XCD 50 goods plus the preserved 15% retail tax setting). These are QA prices, not installed rates or tax advice.
- An unpriced Concord destination prevented order review and allowed a quote request.
- Admin saw the request and approved a synthetic XCD 28 delivery fee / XCD 20 driver payout.
- The customer returned, selected the approved quote and reviewed XCD 85.50 total. Quote-draft persistence was checked by reloading checkout.
- Mobile collection switching and layout were checked in a 390px iframe (382px inner viewport); body width equalled viewport width. No horizontal page overflow was observed.

A final presentation-only adjustment uses the delivery snapshot label on the existing payment page rather than the internal quote key, and loads checkout styling directly. Quote matching also recognises directory aliases. The production build includes those adjustments. No real payment button was used.

Limits: this is a source overlay, not a deployed release; run the setup steps and stage your own rates. There is no external map/distance pricing, route optimisation, parish assignment, quote notification delivery, automatic driver dispatch/payout or guarantee that the seed includes every local name. Preserve custom local source edits when merging.
