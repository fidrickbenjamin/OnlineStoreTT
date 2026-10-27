TACTICAL TRENDS — MOBILE FOOD BASKET UPDATE

INSTALL
Apply over the latest Community Delivery update (including the existing dropdown fix).
Extract into E:\Web Projects\OnlineStore, merging the frontend folder and replacing matching files. Copy all THREE source files together.
From the project root run:
  npm run build --prefix frontend
Redeploy the frontend/build using your existing deployment workflow, then refresh the site.
No new dependencies, environment settings or backend changes are required.

MOBILE FLOW
A floating plate-of-food button at the bottom right shows the total quantity and food subtotal for the current restaurant. Two lunches plus one drink count as three items; extras do not add to the badge quantity.
Adding food shows a brief confirmation and leaves the menu open. The sheet does not interrupt browsing automatically.
Tap View order to open the bottom sheet:
1. Review dishes and drinks, change quantities, select extras or remove items. Continue browsing closes the sheet without losing selections while this restaurant page remains open.
2. Continue to delivery & payment opens delivery/collection details, the delivery fee estimate and payment arrangement. Edit food order returns to basket review; the form choices stay selected.
Payment choices remain Cash, Mobanking, PayPal and ShopDM Pay. Choosing a method or submitting a request does not charge the customer. Online checkout remains available after admin confirms the final quotation and the customer accepts it.
Food selections and delivery/form choices remain in the page's memory while the sheet is closed or resized. Existing sign-in and navigation behaviour is retained; this is not a cross-restaurant or server-stored basket.

LAYOUT & USABILITY
The desktop menu retains its side-by-side order panel. Phones and touch tablets use the sheet. Resizing preserves quantities, extras, address fields and payment choices.
The floating button respects safe-area spacing. The modal is rendered above the seasonal/header layers, traps focus using the existing modal library, restores focus after closing, supports Escape and scrolls its contents on short screens.
Empty baskets cannot proceed. Closed restaurants pause requests while keeping selections reviewable. Changed/unavailable menu items must be removed and chosen again before continuing.
Extras apply to every portion in that item row, matching the existing server ordering model.

VALIDATION
Production build passed; existing unrelated lint warnings remain, with no new hub warnings.
Browser checks passed for multiple lunches/drink/extras and badge arithmetic; editing/removing/empty state; scroll and selection retention; all four payment arrangements; delivery estimates and extended-area acknowledgement; a real disposable-database cash collection request; focus/Escape cleanup; guest sign-in prompt; touch phone/tablet/landscape layouts; and desktop/resizing layouts.
No real payment, email or production database operation was made. No backend source changed.

PACKAGE
Three current frontend source files plus this README. No backend/app.js, PaymentMethod.jsx, environment/config.env files, build folders, node_modules, git or test folders are included. The existing seasonal colours, dropdown fix and community-delivery rules are preserved.
