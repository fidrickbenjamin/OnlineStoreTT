# Tactical Trends — Managed Store Categories & Spotlight Products

This incremental source update goes on top of the latest Convenience & Hardware Hubs upgrade. Keep the splash-screen navigation update already installed.

## Install

1. Back up your current project and database.
2. Extract this ZIP into a temporary folder. Merge its backend and frontend folders into your OnlineStore project root, replacing only the included files.
3. From `E:\Web Projects\OnlineStore\frontend`, run `npm run build`.
4. Deploy the updated backend source and the newly generated frontend production build using your existing deployment process. Restart the backend. An old frontend build will not show these source changes.

No new dependencies or environment variables are needed. The ZIP excludes backend/app.js, all .env/.evn files, config.env, PaymentMethod.jsx, build folders, node_modules, test folders and Git files. Header, splash-screen and map files are not replaced.

## Bring existing store products across

For EACH existing convenience or hardware store:

1. Open Hub Operations, select Convenience stores or Hardware stores, then select the store using its name button or dropdown.
2. In its catalogue area, click **Preview category import**. Review the existing names and counts.
3. Click **Import existing categories**. Names differing only by spacing or capitalisation become the same shared category within that hub. The new category is selected for that store and existing products receive its managed reference. Existing prices, units, delivery handling, stock availability, images and order/financial snapshots are preserved.
4. Under Products, use **Product list category → Needs categorisation** to find products without a usable category. Edit each product and choose a required category before publication.

The import is explicit; deploying this ZIP does not run a production migration. Existing named legacy listings remain browseable until their store's import runs, avoiding an unexpected empty storefront during rollout. Products without a category name are hidden. After import, publication and new product requests require a valid active category assigned to the store. New stores use these managed rules immediately.

You can repeat the import if interrupted. It resumes missing assignments rather than duplicating categories. Archived category names are not silently revived: restore the category, then retry, or assign another active category in the product editor. The import reports these conflicts. An item with an invalid or missing managed reference stays in the review queue until corrected.

This migration applies only to convenience/hardware store catalogues. Restaurant Dishes/Sides/Drinks and extras keep their existing behaviour.

## Categories

Each hub has its own shared list. Convenience categories are separate from hardware categories; the same name may exist once in each hub.

Under a selected store's **Categories** tab:

- Admin can create or edit a shared category with a name, icon, optional HTTPS image link and display order. Lower order numbers appear first, followed by name.
- **Add starter categories** creates missing defaults without overwriting existing names, customisations or archived entries. Convenience defaults: Groceries, Drinks, Household, Personal Care. Hardware defaults: Tools, Plumbing, Electrical, Building Materials, Paint.
- Select the categories used by this store and click **Save store categories** before creating products.
- Renaming a category updates its displayed name across stores using it on their next refresh. It does not change product prices or past orders.
- A category containing non-archived products cannot be archived. Reassign or archive those products first. Products must also be reassigned or archived before their category can be removed from a store's selection.
- Empty categories can be archived and restored. No category is permanently deleted.

Approved partners can select existing categories from their own hub in Business Centre; shared-category creation and editing remain admin-only.

## Products

Open the **Products** tab. Every new or edited store product must have a category chosen from that store's active selected categories. Free typing cannot create accidental duplicate categories.

Use product search, All products, a named category or Needs categorisation to manage the list. Existing image, description, purchase unit, inclusive price, delivery class, extra handling, availability and archive controls are retained. Product removal preserves order history.

Products in inactive, unassigned or missing managed categories are hidden from storefronts and rejected for new purchase requests. Existing orders retain their original details and financial records.

Customers see All products and populated category tabs with counts, category icons/images and a store search field. Empty categories do not clutter the public tabs. Product counts reflect currently available listings.

## Five spotlight positions per store

Open **Spotlight items** in the selected store's catalogue.

1. Choose up to five available, categorised products belonging to that store.
2. Use the up/down controls to arrange them.
3. Click **Save spotlight picks**.

Zero to five picks are allowed; duplicates and products from another store are rejected. Closed stores can still show spotlight products for browsing, but ordering remains paused.

Customers see Spotlight picks above category browsing. Cards show photos or a placeholder, prices, purchase units, relevant delivery-handling labels and Add to order. Mobile uses a swipeable horizontal row. Spotlight and regular product cards add to the SAME store basket.

Sold-out, archived or uncategorised picks disappear from the public spotlight without being replaced automatically. The editor marks affected saved positions as Hidden. Remove those picks or make them eligible again before saving a revised selection. Empty positions remain empty; there are no invented or random featured products.

Approved partners can curate their own store's spotlight picks. They cannot modify another store's catalogue.

## Delivery, payments and accounts

The existing one-store basket, availability confirmation, community delivery fees, heavy-item handling, quote-required goods, collection, all four payment methods, customer quote acceptance, fulfilment tracking and business cash accounts remain connected. Spotlight placement does not change prices, delivery charges or the amount owed to the store. Driver payouts remain deferred.

## Validation

Production build passed with existing unrelated lint warnings and no new hub lint warnings. Seven new catalogue tests, nine store-hub regression tests and 134 existing application tests passed: 150 total database-backed checks.

Chromium browser checks passed for category import/create/assign/rename, required product categories, the review queue, five spotlight selections and ordering, sold-out hiding, public tabs/search, shared basket and delivery/payment calculations, partner catalogue access, restaurant menu regression, and responsive layouts at 320/390/768/1440 widths. Phone checks used emulation rather than physical iPhone/Safari testing.

Testing used a disposable database and mocked provider services. No production migration, deployment, live payment, email or supplier money transfer was performed.
