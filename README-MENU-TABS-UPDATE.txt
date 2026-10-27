TACTICAL TRENDS — RESTAURANT MENU TABS & SWIPING

INSTALL
1. Back up the current source files.
2. Extract this ZIP into E:\Web Projects\OnlineStore and merge the frontend folder.
   Replace the included existing files and keep BOTH new components:
   RestaurantMenu.jsx and MenuSectionField.jsx.
3. From the OnlineStore project root run:
   npm run build --prefix frontend
4. Deploy through your existing process, then refresh the site.

This incremental update assumes your previous hub, delivery-area and mobile
basket updates (including the floating basket layering fix) are installed.
No new dependency, backend change or database migration is needed.
The build output is intentionally excluded from this ZIP.

BROWSING
- Dishes, Sides and Drinks are tabs with item counts.
- On touch devices, swipe left across the menu to move to the next section;
  swipe right to return. Tap tabs on any device.
- Scroll vertically through the active section using normal page scrolling.
- Tabs stay at the top while browsing the menu. Each section remembers its
  scroll position during this restaurant visit. Reloading starts a new visit.
- Empty sections show a message. Existing custom sections remain extra tabs.
- Singular/plural and case variations of Dish/Side/Drink use the standard tabs.
- The first populated standard section opens by default; an existing custom
  section opens if none of the standard sections contains items.
- Keyboard users can use Left/Right, Home and End in the tab bar.

ADDING SIDES
Admin: Admin Hubs > Restaurants & menus > choose the restaurant.
Partner: Business Centre > Your menu.
For a side sold separately, create a normal menu item, enter Sides in Menu
section, and give the item its own price. Drinks use Drinks; lunches use Dishes.
Both editors suggest these names and still allow custom section names.
Existing dish extras remain attached to their dish. They are NOT automatically
copied into standalone sides; add standalone menu items explicitly.

ORDER FLOW
All sections use the same food basket. Existing extras, quantities, delivery
fees, collection and all four payment arrangements remain available.
Payment still follows the existing final-quote approval process.

VERIFICATION
Production build passed (pre-existing unrelated lint warnings remain).
Automated browser checks passed for tap/swipe direction, gesture guards,
sticky tabs, category scroll restoration, keyboard navigation, custom and
empty sections, combined basket/extras, all four payment choices, side-only
and mixed collection requests against a disposable test database, admin side
creation, partner menu fields, and eight touch/desktop viewport combinations.
No live payments or production database operations were performed.

PACKAGE CONTENTS
Six frontend source files and this README only. No backend/app.js,
PaymentMethod.jsx, environment/config files, build output, node_modules,
.git or test folders are included.
