TACTICAL TRENDS — COMMUNITY DELIVERY & FOOD AREA UPDATE

INSTALL
Apply over the latest Hub Payments / Shopfronts / Seasonal update and dropdown fix.
Extract into E:\Web Projects\OnlineStore, merging backend and frontend folders and replacing matching files. Copy ALL included source files together.
From the project root run:
  npm run build --prefix frontend
Restart/redeploy the backend and frontend using your existing workflow. No new packages, environment files or manual database commands are required.

1. SET YOUR COMMUNITY RATES
Admin > Hub Operations > Delivery areas & rates.
Add a route with a pickup community and destination community.
Enter customer delivery fee and driver payout separately for FOOD and GENERAL DELIVERY (XCD).
Routes are directional. Create reverse route copies the row in the opposite direction; review its prices before saving. Same-community routes only need one row.
Save delivery rates. No new prices are seeded automatically; enter your actual charges.
Leave BOTH amounts blank for a service requiring a manual quote. Zero is valid when you intentionally want a free fee or zero payout. Driver payout cannot exceed the customer fee.
A new route takes priority over matching older community rates. A blank service on a new row explicitly requires a quote. Removing a new row allows older community pricing to apply again. Ride pricing stays under Rates & settings.

2. SET EACH RESTAURANT'S DELIVERY POLICY
Admin > Hub Operations > Restaurants & menus > choose the restaurant.
Restaurant delivery area has an area label, preferred community list (one per line), and outside-area policy.
The default preferred list is Concord, Marigot, Wesley, Woodford Hill and Calibishie, labelled Concord to Calibishie. Review the list and add any other communities/hamlets your business serves. Other restaurants can have different preferred areas.
Policies:
- Show price and warning: display the saved route fee when available, require customer acknowledgement and explicit admin approval for extended delivery.
- Custom quote required: outside-area customers see Quote required rather than a saved automatic fee, and must acknowledge the longer journey.
- Do not allow: outside-area delivery requests are blocked. Collection remains available.
Save business details after editing. Existing requests keep their recorded delivery estimate and outside-area status.
Areas are checked against the selected community name, not GPS boundaries. Landmarks and actual delivery addresses still need review before dispatch. Common Calibishie spelling variants and Woodfordhill are matched to their canonical community keys.

3. CUSTOMER FOOD COSTING
As the delivery community changes, a server-calculated delivery fee and estimated food + delivery total appear automatically after a short typing pause.
The restaurant's saved pickup community is authoritative. Client-supplied prices and driver payouts are ignored.
For outside-area deliveries the customer sees the preferred area, pickup and requested destination, longer-journey warning, estimated fee when available, and an acknowledgement checkbox. Change location focuses the community field. Changing the destination resets acknowledgement.
No matching route = Quote required. Food delivery does not guess a straight-line or road-distance fare.
Collection shows zero delivery fee. Submitting a request does not charge the customer.

4. APPROVE & QUOTE
Open the food request from Dispatch / My Activity.
Admin can accept the food order using the existing Restaurant controls. For extended delivery, explicitly tick the extended-delivery approval checkbox before issuing the quote. The server enforces this step.
Use rate estimate copies the stored request fee and driver payout into the quotation when configured. You can review the final amounts before issuing it. Older rates without a stored driver payout require you to enter driver pay.
The customer must accept the final total before payment. Accepted quotes retain their original amounts even if rates are later changed.
General Delivery Hub's Calculate estimate button also uses the new general-delivery rates before older rates / optional road routing. Saved general delivery requests snapshot known community fees and payouts; they do not make an extra routing API call at submission.

5. UI IMPROVEMENTS
My Activity, All restaurants and the hub navigation have consistent styled buttons with mobile tap targets.
Restaurant opening hours now show Open now / Closed, today's hours, next opening/closing where available, and an expandable weekly timetable with Today highlighted. Times use Dominica time and the server clock, support overnight service, and retain the manual pause switch.
Opening-hour formatting reuses cached formatters to reduce repeated server work.
The latest header dropdown fix and seasonal navbar colours are preserved.

VALIDATION
Production frontend build passed (existing unrelated lint warnings remain).
124 backend tests passed; the 35 hub tests were rerun after the final server optimization and passed.
Browser checks passed for admin rates/reverse routes, restaurant policies, live food totals, acknowledgement reset, extended approval/customer acceptance, missing-route pricing, blocking/collection, general-delivery estimates, opening hours and button sizing at 320 / 390 / 1440 pixels.
All tests used disposable data. No real payment, notification or production database operation was performed.

PACKAGE
15 current source files plus this README. No backend/app.js, PaymentMethod.jsx, environment/config.env files, build folders, node_modules, git files or test folders are included.
