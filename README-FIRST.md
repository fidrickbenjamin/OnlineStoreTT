# Tactical Trends — negotiated pricing and payment fees upgrade

This is an incremental source overlay for the latest commercial subscriptions and business pricing navigation releases. It is not a complete project. Back up your current source and database before installation. Use a staging copy first.

## Installation

1. Extract the backend/ and frontend/ folders into your existing project root, merging folders and replacing the supplied files.
2. Build the frontend with `npm run build --prefix frontend` using your normal dependencies and deploy the generated frontend through your existing process.
3. Restart the backend as well. This release needs both frontend and backend changes.
4. Open Hub Operations > Commerce / pricing, choose the hub, business, category and item, and review the settings below before enabling customer use.

No new dependencies, environment variables or manual database migration are required. Mongoose creates the added collections through the existing connection.

Excluded: backend/app.js (your CORS changes), all environment/config.env files, builds, dependencies and tests. PaymentMethod.jsx IS included from the latest recovered baseline because it adds the customer fee explanation. Its direct PayPal loading, retry handling and payment styling are retained. Compare this file before replacing any newer local edits.

## Negotiated partner pricing

Each business can have its own optional negotiated percentage and agreement reference. There is no compulsory target. Blank means no target / inherit; zero is an explicit zero-percent target. Set supplier purchase costs separately: these remain the amounts owed to the business, irrespective of TT's selling price or payment fees.

Choose either:
- Markup on cost: XCD 10 cost with 20% markup suggests XCD 12 selling price.
- Contribution margin on selling price after merchant percentage: a different calculation that accounts for the selected payment fee profile and applicable retail tax fee base.

Item, variant and extra overrides take precedence over the business default. SKU references are searchable. Service subscriptions and Property Hub remain separate from resale pricing.

Saving costs or an agreement does not automatically reprice the catalogue. Review current and suggested prices, warnings and estimated contribution, enter a change reference, then explicitly publish a recommendation or a manual price. Batch review supports up to 30 selected items and reports individual conflicts; it is not an all-or-nothing transaction. Refresh conflicted items before retrying. Confirmed orders preserve their original financial snapshots.

Publication uses revision checks, preview tokens, idempotency protection and price history. Partner content and availability edits remain possible, but active TT negotiated / published prices cannot be bypassed through partner price edits. Existing variant and extra identities are preserved where matched.

## ShopDM: full-order calculation

The default profile reflects your confirmed 3% customer surcharge and 3% merchant deduction on the complete order base, including delivery and applicable tax.

| Description | XCD |
|---|---:|
| Order base sent to ShopDM | 65.00 |
| Customer surcharge added by ShopDM | 1.95 |
| Customer pays | 66.95 |
| Merchant deduction from the order base | 1.95 |
| TT receives before supplier/driver costs | 63.05 |

The integration sends 65.00, never 66.95 in this example. ShopDM adds the customer charge once. TT absorbs the merchant deduction; the supplier's agreed cost is not reduced. Nearest-cent rounding is configured; reconcile actual provider receipts, which remain authoritative.

Cash and Mobanking do not inherit ShopDM fees. PayPal's merchant fee is unknown until configured, rather than estimated using an invented rate. Full administrators can create versioned fee profiles with effective dates and verification references. Customer add-on fees in this release are restricted to ShopDM's provider-added model. Existing orders retain their captured profile. Legacy orders without a snapshot remain unknown.

## Review retail tax before launch

The existing retail checkout's hard-coded enabled 15% tax has been preserved as the legacy default, and is now configurable by a full administrator with an audit reference. Review applicability and rate before launch. This release does not determine tax registration or obligations. Food/store hub prices retain their existing inclusive handling. Retail recommendations account for merchant fees charged on applicable tax. Order fees are rounded on the full order, not independently on each item.

Fixed transaction fees are recorded at order level. A per-unit margin recommendation is unavailable when it would require an unknown allocation of a fixed fee; use manual review instead.

## Actual receipts, refunds and contribution

Finance users can record actual merchant deductions, receipts, retail delivery costs, additional expenses, partial/full refunds and reversals, with references and revision protection. Customer payment must already be verified Paid or Refunded before reconciliation. A provider settlement reference cannot be reused for a different order.

These entries record evidence: they do not transfer money, issue a provider refund, or mark a customer paid. Supplier payments and credits remain in Business accounts. Do not record the same supplier or driver cost again as an additional expense.

Reports separate estimated contribution from actual completed contribution. Actual contribution needs a completed/delivered, paid order, known captured costs and settlement evidence; retail delivery cost must also be known unless collection is free. Supplier credits adjust actual completed contribution. Refund/cancel profit remains under review rather than inventing a settled profit. Contribution is not net profit: unrecorded overhead and other costs are not included.

## Initial acceptance check

- Pick a business, enter agreed purchase costs and a negotiated percentage, and preview each size/extra.
- Publish a reviewed price and verify the customer sees the new price while an existing confirmed order stays unchanged.
- Confirm the ShopDM 65.00 example against your provider agreement and receipt. Do not add its customer fee in TT again.
- Check cash/Mobanking orders have no ShopDM surcharge; configure PayPal only from verified terms.
- Review retail tax and administrator access permissions.
- Record a sample settlement in staging and compare receipts, supplier balances and contribution.

## Scope and practical limits

No unattended repricing, provider settlement import, batch bank-payout allocation, driver payout execution or live deployment is included. Catalogue loading retains the existing 1,000-per-type cap; order reports cover the most recent 500 per type; price history shows the latest 100 changes. Use evidence and Business accounts for older or exceptional cases. This overlay adds the requested pricing and fee controls; it does not replace your unrelated hub features.
