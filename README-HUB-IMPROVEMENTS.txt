TACTICAL TRENDS — HUB PAYMENTS, SHOPFRONTS & SEASONAL NAVBAR

INSTALL
Apply over the Food / Ride / Delivery Hubs and admin restaurants updates.
Extract into E:\Web Projects\OnlineStore, merging backend and frontend folders.
Replace all included files together. From the project root run:
  npm run build --prefix frontend
Restart/redeploy the backend and frontend using your existing workflow.
No new packages or manual database commands are required.

PAYMENTS
All three hubs offer Cash, Mobanking, PayPal and ShopDM Pay.
Customers choose their arrangement when requesting a job. Online checkout appears in My Activity > request details after the final quote is accepted. The server charges the accepted total, including food and delivery; browser-supplied prices are not used.
Cash and Mobanking retain their existing workflow. Non-cash requests require confirmed payment before food readiness / driver pickup.
PayPal uses USD, converting the XCD quote at 2.70 XCD per USD and rounding to cents. The exact USD amount is shown before checkout. Existing store checkout is unchanged.
Hubs reuse PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET and existing ShopDM merchant settings. The public PayPal client ID can be read from the server config; no new frontend env file is included.
Keep the existing /api/v2/payment/paypal-webhook and /api/v2/payment/shopdm-webhook URLs. Hub invoices have a HUB- prefix. PayPal closed-browser recovery also needs the existing PAYPAL_WEBHOOK_ID and PAYMENT.CAPTURE.COMPLETED subscription.
ShopDM notifications that authenticate the full payment data confirm payment automatically. The legacy signature format that omits nested data places the payment in Review. Admin must check actual merchant funds, then verify payment with a reference in the request. Returning from ShopDM never marks a request paid.
Starting online checkout prevents customer cancellation until admin reconciles it. Refunds remain manual; recording a refund does not send money. If a checkout becomes stale or uncertain, contact admin to check the provider account rather than creating a replacement booking.
Provider fees do not automatically change agreed driver pay or merchant commissions.

SHOPFRONTS & OPENING HOURS
Food Hub now shows illustrated shopfront cards: business signboard, striped awning, window/logo and door with a green OPEN or red CLOSED sign. Cards retain business names, type tags and communities. An Open now filter helps customers find available restaurants.
Admin > Hub Operations > Restaurants & menus > choose a restaurant.
Enable Use weekly hours in Dominica time, choose each open day, and set opening/closing times. Save business details.
Partners can set the same weekly schedule from Business Centre > Automatic opening hours > Save weekly hours.
Accept food orders must also be ON. This switch acts as a manual pause even during opening hours. Without automatic hours, existing businesses keep their manual open/closed control; old free-text hours are not guessed or parsed.
Times use America/Dominica. Closing earlier than opening means the following day (e.g. Friday 18:00–02:00). Equal opening and closing times are not accepted; unchecked days are closed.
Cards/menu refresh status every 30 seconds while open. The server independently checks opening hours when accepting a food request, so a stale card cannot bypass closure. Existing food requests continue through their agreed workflow after closing.
Weekly hours are visible in the restaurant menu. Menus can still be browsed while closed.

SEASONAL NAVIGATION
The main header and category navigation use the active season's colours again, including on hub pages. Seasonal labels and artwork remain in place. Dropdown layering is preserved. Admin pages remain neutral. Turning seasonal appearance off restores the regular header.

CHECKS
Production frontend build passed; existing unrelated lint warnings remain.
116 backend tests passed, including payments, permissions, duplicate confirmation, currency/amount validation, webhook recovery, legacy ShopDM review, opening boundaries and existing store regressions.
Browser checks use mocked payment providers: shop signs, schedules, filters, four choices on each hub, PayPal button/capture flow, ShopDM redirect, seasonal colours and mobile layouts.
No real payment was made. Live PayPal/ShopDM account behaviour must still be checked in sandbox with your configured merchant accounts before accepting live hub payments.

EXCLUSIONS
No backend/app.js, PaymentMethod.jsx, environment/config.env files, build folders, node_modules, git files or test folders are supplied. Existing PayPal checkout page and the previous splash update are preserved.
