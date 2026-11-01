# Tactical Trends — Business-first pricing update

Apply this focused overlay AFTER tactical-trends-commercial-subscriptions-update.zip. This ZIP contains only the next pricing-navigation changes; it is not the full commercial/subscription release.

## New workflow

Admin → Hub Operations → Commercial centre → Hub → Business → Category → Item → Pricing & costs.

- Food, Convenience and Hardware have quick business-selection cards plus the dropdown.
- Categories use the sections/categories already assigned to those products. No categories or products are recreated.
- Search matches item names, sizes and flavours within the selected scope. “Only items needing cost review” identifies missing ownership, supplier, variant, extra or regular costs. Confirmed zero costs remain valid.
- Marketplace groups distinguish Tactical Trends-owned stock, partner suppliers, and unassigned products needing review. A product with no recorded cost/ownership is not silently classified as owned stock.
- “All businesses” remains available for cross-business cost review. The order-margin review below remains across all businesses, independently of the item filters.
- Restaurant/store management now includes a “Pricing & costs” shortcut that opens the selected business in Commercial Centre. This appears only to administrators with finance access.
- Selecting an item brings its editor into view. Variants and extras show the selling price, editable purchase cost and projected gross profit per unit together.
- Switching hubs, businesses, categories or items prompts before discarding unsaved cost/settlement edits. Drafts are retained during normal data refreshes so stale revisions can be rejected by the existing API rather than silently discarding edits.
- Saving a marketplace product whose ownership/supplier group changed moves the pricing view to its new group.

Selling prices are still edited in the original menu/product editors. Gross-profit previews exclude delivery, fees and overhead. Existing order snapshots, supplier debts, settlement history, subscription rules and payment integrations retain the previous release's behavior.

## Installation

1. Back up your project. Confirm the previous commercial/subscription update is already applied.
2. Copy the supplied backend/ and frontend/ folders over the matching folders in your OnlineStore project, keeping the directory structure.
3. From the project root, run:

```text
npm run build --prefix frontend
```

4. Deploy the newly generated frontend build through your existing process and restart/redeploy the backend. The backend catalogue response now includes category metadata, so both sides need the update.
5. Hard-refresh the admin page if the browser is showing an older cached frontend bundle.

No dependency installation, database migration or environment-variable change is required for this overlay. Do not rerun the previous subscription transition utility merely because you are installing this navigation update.

## Included source files

- backend/commercial/controllers.js
- frontend/src/components/hubs/AdminRestaurants.jsx
- frontend/src/components/hubs/CommercialCentre.jsx
- frontend/src/components/hubs/CommercialCostForms.jsx
- frontend/src/components/hubs/commercialCatalogue.mjs
- frontend/src/components/hubs/commercialPricing.css

Include all six files: CommercialCentre imports the new form, grouping and styling files.

## Exclusions preserved

No backend/app.js, environment files or examples (.env*, .evn*, config.env*), PaymentMethod.jsx, build directories, node_modules, tests or preview fixtures are included. Your CORS configuration and payment page remain outside this update.

## Validation

- 17 targeted unit/integration checks passed, 0 failed, 0 skipped. These cover business/category isolation, owned versus supplier versus unassigned stock, zero/unknown/variant/extra costs, category metadata, finance permissions and the existing commercial/subscription safeguards.
- CRA production build succeeded. Existing unrelated ESLint warnings remain; the changed pricing components introduced no reported warnings.
- Local browser checks verified restaurant category filtering, the business-management shortcut, cost saving while retaining the selected business/category, and a discard prompt that preserves an unsaved draft when cancelled.
- A 390px mobile frame verified variant/extra cost inputs and profit previews. Page width stayed within the viewport.
- Browser presentation checks used synthetic local fixture data. API/integration checks used disposable MongoDB data. No live deployment, real payments, outgoing messages or production data changes were performed.

## Launch checks

1. In Restaurants & menus, select a restaurant and click Pricing & costs. Confirm it opens that business's items.
2. Select Dishes, Sides and Drinks in turn and check no other business's items appear.
3. Try the Hardware and Convenience business selectors and their existing categories.
4. In Marketplace, check owned stock, supplier stock and unassigned items separately.
5. Edit a cost and switch category; cancel the discard prompt and confirm the draft remains. Save the cost and check the item summary refreshes.
6. Confirm a catalogue-only staff account cannot see the finance shortcut or access Commercial Centre's API.
7. Check a confirmed order still has its original financial snapshot after a product cost edit.

The existing catalogue cap of 1,000 items per type remains. Counts and missing-cost notices refer to loaded items; this release adds grouping, not server-side catalogue pagination. The order review retains the previous cap of 500 orders per type. Service and Property Hub remain outside product purchase-cost browsing.
