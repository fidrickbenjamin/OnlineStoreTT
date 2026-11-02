# Validation — 2 November 2026

29 automated checks passed; 0 failed; 0 skipped. Tests used disposable MongoDB and synthetic data with email disabled. No production database, real payment, refund, transfer or email was used.

Coverage: cent rounding, full-order fees, markup versus margin, unset defaults, per-option overrides, SKU, tax applicability/versioning, discounted checkout, cash exemptions, private financial fields, immutable order snapshots, stale previews, publication idempotency, price audit, partner safeguards, stable extra IDs, batch publication/conflicts, finance permissions, settlement/reference uniqueness, partial refunds, credits, expenses, reversals and completed-only actual contribution. A stubbed ShopDM checkout verified total_xcd='65.00', not '66.95'.

Production React build succeeded with existing unrelated warnings. Backend JavaScript syntax checks passed. Dependencies and test fixtures are not included in this overlay.

Browser checks used the production frontend with a synthetic local API fixture, separately from the backend integration tests. Confirmed: saving 20% partner markup; recommendations of XCD 12.00, 18.00 and 2.40 for costs 10, 15 and 2; explicit publication with confirmation; customer display of 65.00 + 1.95 = 66.95. The mobile fixture's content and viewport widths both measured 382px, with no horizontal page overflow; fields and buttons displayed in a narrow layout. An initial browser connection interruption recovered successfully.

No live provider contract/rounding validation or production deployment was performed. Complete staging checks against your own provider terms and existing source before release.
