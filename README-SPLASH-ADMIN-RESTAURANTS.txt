TACTICAL TRENDS — SPLASH & ADMIN RESTAURANTS UPDATE

Apply AFTER the Food / Ride / Delivery Hubs update and header dependency fix.

INSTALL
1. Extract into E:\Web Projects\OnlineStore (the project root).
2. Merge backend and frontend folders, replacing matching files. Copy ALL included files together.
3. From the project root run:
   npm run build --prefix frontend
4. Restart the backend / redeploy using your existing workflow.

SPLASH
The welcome/category splash appears on a fresh homepage load, even with items in the cart and even if an old session flag exists. It stays dismissed while browsing within the app. Browse categories reopens it. Filtered/search links do not interrupt shopping with an automatic popup.

ADMIN
Open Admin > Hub Operations > Restaurants & menus.
Choose + Create a restaurant or bar, complete the business and pickup details, and save.
Add dishes/drinks, menu sections, prices, photos (public HTTPS links), extras and availability.
Leave Accept food orders off until the menu is ready; turn it on and Save business details when ready.
Approved restaurants appear in Food Hub. Pending, rejected and suspended restaurants are hidden.
Choose an existing restaurant to edit its details or menu, including partner-owned restaurants.
Admin-created restaurants do not require a separate partner account; admin can create multiple storefronts.
List your restaurant / Business Centre applications remain available and retain their existing ownership.
Inside each food request admin also has Restaurant controls to accept/decline orders and mark food ready. Existing quote, customer acceptance, payment verification and completion rules still apply.
Mark dishes unavailable to hide them from new orders; existing order prices and item snapshots remain intact.
Opening hours are displayed information; the Accept food orders switch controls ordering.

VALIDATION
Production frontend build passed (existing unrelated lint warnings remain).
20 hub integration tests passed, including restaurant/menu permissions, multiple admin restaurants, preservation of unique partner ownership, stale edits and payment guards.
Browser checks passed for restaurant creation, menu add/edit, storefront visibility, desktop/mobile fit and splash behaviour with existing cart/session data, reopen and refresh.
No real payments, messages or production database were used in testing.

PACKAGE
10 current source files plus this readme. No backend/app.js, PaymentMethod.jsx, environment/config.env files, build folders, node_modules or git files.
No dependency installation or manual database commands are required for this patch.
