# Validation — 18 November 2026

44 automated checks passed, 0 failed, 0 skipped. The suite includes the existing pricing/fees/banner/community checkout coverage plus three new checks for default fee override/fallback, collection-order creation without a customer delivery address, and invalid/incomplete/duplicate default fees. Tests used a disposable MongoDB 7.0.14 database and synthetic accounts/products with the mail worker disabled.

Backend syntax checks passed. Production React build succeeded with existing unrelated warnings. No new component-specific warnings remained.

Code review covered removal of cart selection/deferred totals, saved address selection and deduplication, per-order address editing, optional save-as-new, delivery-versus-collection switching, hidden duplicate service dropdown, collector validation, quote draft persistence and order-review collection instructions.

Visual browser QA could not be completed for this revision: the local preview first refused the connection, and the browser then blocked access to its error page. No visual verification is claimed. Run the staging acceptance checks in README-FIRST.md before release. The preceding community checkout release tested the underlying route and manual-quote browser flow; this revision's new address-card UI needs staging confirmation.

No production source deployment, real payment-provider transaction, driver transfer or email was performed. Source tests, build output and local QA fixtures are excluded from this ZIP.
