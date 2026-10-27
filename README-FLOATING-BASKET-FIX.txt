TACTICAL TRENDS — FLOATING FOOD BASKET LAYER FIX

Apply over the latest Mobile Food Basket update.
Extract into E:\Web Projects\OnlineStore, merging the frontend folder.
Replace BOTH included files together:
- frontend/src/components/hubs/FoodOrderSheet.jsx
- frontend/src/components/hubs/hubs.css
From the project root run:
  npm run build --prefix frontend
Redeploy using your existing workflow and refresh the live site.

The floating plate button is rendered outside the seasonal content stacking context, so the footer trim cannot cover its icon, quantity badge or subtotal. Its layer remains below the account dropdown and modal/backdrop layers. The existing order sheet, selections, safe-area position and desktop side panel are preserved.

Validation: production frontend build passed (existing unrelated warnings remain). Browser checks passed across 24 theme/touch viewport combinations, testing the basket at the top, middle and bottom of the page. A seasonal strip was deliberately positioned through the subtotal to verify that it stays behind the button. Sheet opening/closing, focus return, payment choices, account-menu priority and desktop cleanup also passed.

Two frontend source files plus this README only. No backend, environment/config.env, PaymentMethod.jsx, build, node_modules, git or test files are included. The header dropdown fix remains unchanged.
