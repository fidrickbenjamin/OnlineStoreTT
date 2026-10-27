TACTICAL TRENDS — COMBINED SEASONAL & PRODUCT HOMEPAGE HERO

INSTALL
1. Back up the included source files in your project.
2. Extract this ZIP into E:\Web Projects\OnlineStore and merge the folders.
   Replace all included existing files and add HeroFeatureFields.jsx.
3. From the OnlineStore project root run:
   npm run build --prefix frontend
4. Deploy BOTH the backend source update and the rebuilt frontend through
   your normal process. Restart the backend if running it locally.
5. Refresh the site after deployment.

This is an incremental update for your existing upgraded OnlineStore.
No new dependency, environment setting or manual database migration is needed.
Existing products gain optional homepage fields with safe defaults.

DESIGN
The homepage now has one coordinated welcome/product hero, taking its colours,
message, title and seasonal link from the existing active seasonal settings.
The previous separate seasonal welcome banner is suppressed on the homepage.
Other seasonal pages, the calendar and appearance preview are unchanged.
The normal non-seasonal design uses a warm peach/orange palette.
The navbar and existing dropdown layering fixes are preserved.

The hero displays real product photos, names, effective sale prices and links.
Mobile supports horizontal product swipes plus visible previous/next controls
and selector dots. Products rotate every 6.5 seconds. Manual navigation pauses
rotation; the pause/play button controls it. Rotation also pauses while the
showcase is hovered, has keyboard focus, the page is hidden or a modal is open.
Reduced-motion users get manual controls without automatic rotation.
Normal vertical touch scrolling and pinch zoom remain available.

Food, Ride, Delivery and Property Hub shortcuts appear below, with a business
pickup request strip. These links use the existing hubs and request workflow.
The existing Latest Products catalogue, filters, promotions and splash remain.
The hero is hidden for active catalogue searches/filters as before.

ADMIN — CHOOSE FEATURED PRODUCTS
1. Open Admin > Products and edit a product (or create a new product).
2. Under Homepage showcase tick Feature this product on the homepage.
3. Set Homepage display order (whole number 0–999); lower numbers appear first.
4. Save the product. For new products, upload a photo using the existing
   image-upload screen after creation.

Up to five eligible selected products appear. Equal order values use the most
recent creation date, then ID, for a deterministic order. Unchecking the field
removes that product from the curated selection, but it may still appear in
recent-product fallback if no selected product is eligible.

ELIGIBILITY & FALLBACK
Only retail products with stock above zero and an HTTP(S) first photo URL are
eligible. Properties, sold-out products and products without a first photo are
excluded. If any eligible selected products exist, the hero uses those only;
it does not fill vacant slots with unrelated products. If none exist, up to
five recent eligible retail products appear. The feed refreshes every minute
while mounted, and on window focus. Sale expiry uses the existing sale-price
component; final purchase pricing and availability remain checked server-side.

When no eligible products exist or the feed fails, the welcome and service
links remain usable. A failed product-image download has a readable fallback.

VERIFICATION
Production build passed; existing unrelated lint warnings remain.
34 promotion/seasonal regression tests passed against a disposable database.
Browser/API checks passed for admin selection/order, invalid inputs and role
protection, product eligibility, latest-product fallback, five-product cap,
sale and expired-offer pricing, merged seasonal display, navigation, swiping,
vertical gesture guard, autoplay/pause, reduced motion, empty/error states,
and six themes at four viewport sizes (320, 390, 768 and 1440).
No live payments, outbound mail or production database operations were used.

PACKAGE
10 source files plus this README. No backend/app.js, PaymentMethod.jsx,
environment/config files, build output, node_modules, .git or tests included.
