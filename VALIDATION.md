# Validation and launch checks

## Completed in the isolated development environment

- 62 backend/unit/integration regression checks passed; 0 failed, 0 skipped.
- Coverage includes unknown and zero costs, variant/extra cost calculation, prepaid inventory, immutable order costs, supplier versus customer totals, root marketplace supplier accrual, refund independence, payment allocation/reversal, supplier credit, financial privacy, expiry boundaries, monthly clamping, subscription evidence/verification, stale/concurrent renewal protection, cross-business payment-reference reuse prevention, membership isolation and finance/full-admin permission boundaries.
- Existing store fulfilment, catalogue variants, service directory, marketplace order creation, quote acceptance and operational payment checks passed with explicit cost/subscription fixtures for the new rules.
- CRA production build completed. Existing unrelated ESLint warnings remain; no new warning points to the added Commercial Centre, Partner Statement or Subscription Billing components.
- Local browser fixture checks: desktop commercial editor and subscription controls render; 390px mobile frame checks show forms contained within the viewport, with horizontal tables isolated in their scroll container. The browser check caught and verified a fix for request-ID generation without crypto.randomUUID support.
- UI fixture checks verify presentation only. Real backend behavior was tested separately using a disposable MongoDB database, offline email stubs and synthetic accounts. No live payments, outgoing messages or production writes were made.
- JavaScript syntax checks passed for changed backend modules, including the optional transition utility. The transition utility has not been run against production.

## Before launch

1. Back up source/database, apply this overlay to a staging copy, build frontend and restart backend.
2. Assign documented subscription transition dates before exposing the new visibility rule. Check one approved/current listing appears and one expired listing is absent from both list and detail routes.
3. Set costs for one restaurant meal, its variants and extras; place a test order and verify the supplier charge, customer subtotal and contribution against a hand calculation.
4. Repeat with a convenience/hardware product and prepaid marketplace stock. Verify prepaid items create no second supplier debt.
5. For an unconfirmed request with missing costs, verify quoting is blocked; set and capture agreed costs, then repeat business acceptance and quotation. A later product price edit must not change an already-confirmed order.
6. In Business Accounts, record a small partial settlement, check allocation, then reverse the test entry. Keep customer payment and supplier payment separate.
7. Test a manual service renewal using a synthetic reference on staging: evidence alone must not activate access; only verified funds do. Do not reuse real transaction references for test records.
8. Link a staging business account after verifying identity/authority; confirm it sees only its own listings/billing and can renew while inactive. A manager cannot verify payments or grant access.
9. Verify PayPal/ShopDM customer checkout still behaves normally using your existing test/sandbox process. The subscription payment-reference form is not a provider checkout integration.
10. Check your actual mobile browser, desktop browser, hosting build path, deployed API and SMTP logs before reopening normal operations.
