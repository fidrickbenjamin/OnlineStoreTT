TACTICAL TRENDS — RESPONSIVE RIDE / DELIVERY & MAP POLISH

INSTALL
This incremental update requires the previous Maps, Food Operations &
Restaurant Cash Accounts upgrade to be installed (including Leaflet).

1. Back up the four included source files.
2. Extract this ZIP into E:\Web Projects\OnlineStore, merge the folders
   and replace ALL FOUR source files together.
3. From the OnlineStore project root run:
   npm run build --prefix frontend
4. Deploy the rebuilt frontend through your existing process, then refresh.

No backend change, new dependency, database migration or environment change
is needed. Existing Geoapify keys remain in your backend configuration.
Build output is intentionally excluded from the ZIP.

LAYOUT
Ride Hub and Delivery Hub now share a dedicated responsive booking layout:
- Wide desktop: aligned pickup/destination cards, map below the locations,
  and a booking/details panel alongside.
- Tablet: booking details flow below the location/map section.
- Phones and coarse-pointer tablets: pickup, destination, map and details
  stack vertically with full-width controls and readable inputs.
- Advanced coordinates/access notes are collapsed in these two booking forms.
- Required address, community, contact name and phone remain visible.
- P (green) / D (gold) badges match the map pins and route summary.
- Choose pickup/destination on map selects the matching target and moves
  keyboard focus to its map control.
- Hub mobile inputs use 16px text to avoid unwanted input-focus zoom on iOS.
- Service partner applications remain available through a quieter link below
  the booking form. Existing hub navigation and My activity remain available.

MAP VIEW / STYLE
- Default starts near Wesley/northeast Dominica at zoom 12.
- A selected single pin/GPS reading zooms closer (zoom 15).
- Two selected points automatically fit in view; road previews fit their
  returned route geometry.
- Island view zooms out. Show selected points returns to the pins/route.
- Contact edits, switching map targets, driver updates and normal rerenders
  no longer refit the map or destroy a manually panned view.
- Repeated GPS readings at the same pin do not override a later destination
  view. GPS outside Dominica remains rejected.
- Map controls wrap cleanly. Touch buttons and zoom controls are enlarged.
- Pin artwork no longer mixes its shape transform with Leaflet positioning.
- Tile image resets and attribution remain scoped to the map.
- Map/marker layers remain below the existing header dropdowns and basket.
These view controls do not change community fees or accepted quote totals.
Map movement can still load provider map tiles under your existing allowance;
view changes do not make additional road-routing calculations.

OTHER UX IMPROVEMENTS
- Signed-in customer contact details populate pickup; ride destination contact
  defaults to the same passenger and can be edited. Delivery recipient details
  remain blank so a sender's details are not mistaken for the recipient.
- A late login/user-data response can populate still-empty contact fields.
- Ride and Delivery drafts are separate; switching hubs starts a fresh draft.
- Enter in location search searches instead of submitting the request.
- A delayed estimate response cannot overwrite a subsequently edited route.
- Optional schedule times explicitly use the device's time zone, as before.
- Clearer estimate/request loading states, estimate validation and final-quote
  explanation. Submitting a request does not automatically charge the customer.
- Guest sign-in button works without completing a booking form first.

PRESERVED
All four existing payment arrangements, final quote acceptance, server pricing,
community rates, food basket/menu tabs, restaurant accounts, food stages,
seasonal theme colours and dropdown layering fixes are preserved.
Food checkout still fixes the restaurant pickup and edits only destination.
Shared PointFields keeps its previous expanded layout outside these two
booking forms. Existing coordinate and access-note editing remains available.
No payment, financial-ledger or order-status backend logic is changed.

VALIDATION
Production build passed with existing unrelated lint warnings.
Automated browser checks passed for both hubs across 18 touch/desktop/landscape
cases (320, 390, 414, 768, 1024, 1440 and 844x390), field/card alignment, map
controls/default zoom, repeated GPS, stable panning, selector focus, Enter
search, stale estimates, all payment choices, real requests to a disposable
database, clean service drafts, food fixed-pickup checkout, no-key fallback
and guest sign-in. Mapping responses and map imagery were mocked; these were
browser layout checks, not physical iPhone/Safari or live Geoapify route tests.
No live payments, production writes or outbound mail were performed.

PACKAGE
Four frontend source files and this README only. No backend/app.js,
PaymentMethod.jsx, environment/config files, build folders, node_modules,
.git, tests or screenshots are included.
