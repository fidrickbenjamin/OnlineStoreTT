# Tactical Trends — Product variants upgrade

Apply this incremental source update to the latest project version, after the Admin / Google Mail upgrade. It retains those improvements and adds variants to Food, Convenience and Hardware products. Back up your project and database, then copy the backend/ and frontend/ files into their matching folders, preserving paths. Review independent edits you made to the same files before replacing them.

## What customers can do

- Choose a required size, flavour or product option before adding a variant product.
- Add Small and Large meals as separate basket lines, with separate quantities and existing side/extra selections.
- Choose a local drink flavour such as Lime or Orange. Sold-out choices remain labelled and cannot be purchased.
- See the chosen variant and price in the basket and submitted order. Kitchen/customer activity uses the saved variant name. New hub notification emails include the item names, selected variants, extras and line totals.
- Continue ordering ordinary products that have no variants as before.

## Configure restaurant sizes and flavours

1. Open **Hub Operations → Restaurants & menus** and select the restaurant.
2. Edit an item or create a dish/drink.
3. Under **Sizes, flavours & variants (optional)** choose **Add variant**.
4. Enter a unique name, its full selling price in XCD, and whether that variant is available.
5. Add the other choices, then **Save item**.

Example configuration only — these are not published automatically:

| Product | Variant | Full price XCD |
|---|---|---:|
| Baked Chicken Lunch | Small | 20 |
| Baked Chicken Lunch | Large | 30 |
| Local Juice | Lime | 8 |
| Local Juice | Orange | 8 |
| Local Juice | Grapefruit | 8 |

A variant's price REPLACES the regular item price. It is not a surcharge. Existing extras are added on top. For example, Small at 20 plus extra plantain at 3 costs 23 per portion. Extras on a basket line apply to every portion on that line, as before.

The regular item-price field is disabled while variants exist. Remove all variants to return to ordinary pricing, then review the regular price before saving. If an old size choice is currently an “extra”, move it into the variants list and remove that size extra to avoid offering both size mechanisms on the same product. Keep actual sides/extras.

## Convenience and Hardware

Select the store under **Convenience stores** or **Hardware stores**, then **Products**. The same optional variant editor is in the product form. Category assignment, spotlight rules, image upload and product preview still apply. Approved partners can edit variants on their own items in Business Centre.

Examples: rice pack size; paint colour/container size; different drink flavours. This version uses one list of choices per product. For multiple attributes use combined labels such as “Lime — Large” or “White — 1 gallon”. There are at most 40 choices per product.

The product's purchase-unit label, delivery class and per-unit handling charge apply to all its variants. If variants need different vehicles or handling prices, use separate products or set that product to require a delivery quote. This release adds variant availability switches, not numerical stock inventory or per-variant images. The existing CSV template continues creating ordinary products; add variants in the editor after import.

## Order and payment integrity

The backend validates the chosen variant, availability and price. Client-supplied names/prices are ignored. Each order stores the chosen variant name, price, quantity and extras at submission. Renaming, repricing, selling out or removing variants does not rewrite existing orders or accepted quotes.

Meal/goods subtotals and business liabilities include the actual selected variant prices. Delivery charges remain separate. Admin store availability adjustments target the exact order line, so reducing a Large pack does not accidentally reduce a Small pack of the same product. Existing payment methods and quote acceptance remain in place.

If a variant is removed or becomes unavailable while a customer is browsing, the basket asks them to remove the affected selection and choose again. Backend validation also catches changes that occur before the page refreshes. Existing editors that do not understand variants cannot silently erase a saved variant list; reload the updated site before editing.

## Install and build

No npm dependencies or environment changes are required. Restart the backend after updating the source. Rebuild the frontend from your project root:

```powershell
cd frontend
npm run build
cd ..
```

Deploy the rebuilt frontend and updated backend together using your existing process. No destructive database migration is needed; legacy items have an empty variant list and old orders retain their snapshots.

This ZIP deliberately excludes backend/app.js and its CORS configuration, all environment files, config.env, build output, node_modules, test folders and Cart/PaymentMethod.jsx. Preserve your own versions of those files. The rebuilt frontend is deliberately not bundled.

## Validation

Production build passed with existing unrelated lint warnings. Backend checks include the existing 134-test regression suite and 37 admin/store/category/variant integration tests. Nine new variant tests cover required selection, prices, sold-out choices, stable IDs, ownership, mixed-size rows, extras, duplicate prevention, historical orders and exact-line store reductions.

Browser checks cover the actual admin variant editor, size/flavour selection, sold-out choices, basket quantities/extras/subtotals, order submission, Convenience/Hardware variants and responsive layouts at 320, 390, 768 and 1440 px. Catalogue/spotlight, legacy category imports, partner access, mobile basket, delivery/payment choices and food-menu regression checks also passed. Tests use disposable data and do not send live mail or charge live payments.
