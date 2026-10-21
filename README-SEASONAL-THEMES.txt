TACTICAL TRENDS — AUTOMATIC SEASONAL THEMES

INSTALL THIS AFTER tactical-trends-promotions-update.zip.
This incremental patch builds on that promotions update. It contains only 15
new/changed application and test files, plus this guide and a manifest.
It is not a complete replacement project.

1. Merge the CONTENTS of this folder into your existing OnlineStore project.
   Preserve the backend/, frontend/src/, and tests/ paths.
2. Commit the supplied files to your existing repository and deploy as usual.
   No new npm dependencies, environment variables, credentials, or manual
   database migration are required. Do not run the seeder.
3. Keep your Render web service settings:
   Build Command:
   npm ci --legacy-peer-deps && npm ci --prefix frontend --legacy-peer-deps && npm run build --prefix frontend
   Start Command: npm start
   Root Directory: blank / repository root
4. A frontend rebuild is required. The build directory is intentionally excluded.
5. Sign in as admin and open Appearance, or visit /admin/appearance.

EXCLUSIONS PRESERVED
No backend/app.js, environment files, config.env, build folders, node_modules,
PaymentMethod.jsx, PayPal provider controllers, pagination files, or favicon
assets are included. Your existing CORS/payment/environment changes are kept.
frontend/src/App.js IS included: it mounts the seasonal storefront wrapper.
The existing Promotions sidebar entry and routes are preserved.

WHAT YOU GET
- Original lightweight vector artwork for Carnival (mask, feathers, confetti,
  ribbons), Dominican madras (woven fabric pattern, fabric rosette, cultural
  accents), Christmas (trees, lights, ornaments, gifts), New Year (gold clock,
  fireworks), and optional Easter (pastel eggs and foliage).
- Seasonal welcome banner, header colours, patterned trims, product card/button
  accents, desktop edge artwork and a seasonal footer message.
- Mobile layouts with still artwork; brief desktop entrance animation can be
  disabled. Reduced-motion visitors receive no animation. There is no endless
  snowfall, flashing, sound, third-party image loading or animation library.
- Account, cart, checkout, payment, invoice and other utility pages get only
  a slim trim. Full artwork/banner is shown on home, deals, product detail,
  and property hub pages. Admin screens keep normal storefront branding.

DEFAULTS ON FIRST DEPLOY
Automatic mode is ON by default, even before the first settings save.
- Carnival Monday: theme starts 14 days before; Carnival Tuesday is also enabled.
- Independence: madras theme from October 1 through November 4.
- Christmas: theme from December 1 through December 26.
- New Year: theme from December 31 through January 3.
- Good Friday, Easter Monday, Labour Day, Whit Monday, Emancipation Day,
  Community Service Day and Boxing Day appear as separate calendar entries,
  initially unchecked. Their artwork can be enabled individually.
The Independence default means madras styling appears immediately if deployed
inside its seasonal window. Change preferences in Appearance before saving if
needed. Installation does not change prices, discounts, stock, or existing orders.

ADMIN CONTROLS
Display mode:
- Automatic follows the enabled calendar entries, every year.
- Manual temporarily selects a theme until a required expiry (within one year),
  then resumes the automatic calendar.
- Off restores your normal appearance and preserves calendar preferences.
The Turn off themes button saves Off immediately using the saved calendar;
unsaved edits are discarded by that action.

Uncheck any holiday you do not observe, then click Save appearance. This choice
persists in later years. Related holidays are separate entries: to remove all
Carnival decoration, uncheck BOTH Monday and Tuesday. Christmas and Boxing Day
are also separate entries; default Boxing Day is unchecked, while the Christmas
window itself extends through December 26. Adjust days-after if you prefer.

Each holiday has a collapsible settings section:
- Select its visual theme and priority (higher priority wins overlaps).
- Choose how many days before/after the holiday to show decorations.
- Change its date for the selected year only, for special/substitute dates.
  Clear that override to restore the normal annual rule.
- Set optional heading/message and internal shop link, such as /deals.
  Leave the shop link empty to hide the banner button.
- Select a different calendar year to review dates without resetting your draft.
The holiday day and all configured surrounding days are included, using
Dominica local midnight. A window ends at midnight after its final display day.
Ties use the more recently started window, then a stable event ID.

Add custom events for a special holiday, anniversary, Creole event, or Black
Friday. Choose a date, name, artwork, enabled checkbox and optional annual repeat.
Black Friday is not treated as a Dominica public holiday; add its date yourself
for each year (annual repeat repeats a month/day, not the fourth Friday rule).
Up to 30 custom events are supported. Higher-priority custom events can override
another season. Removing a custom event takes effect when you save.

PREVIEW
Choose Follow calendar and a date, then Preview appearance to see which unsaved
holiday settings win on that date. Or select an artwork chip to inspect that
theme's standard design regardless of its date. Show mobile switches the preview
width. The preview uses illustrative products and never changes live settings.
Calendar preview uses your custom banner text; artwork-chip preview uses defaults.
Two Save appearance buttons save the SAME settings; use either one.
Stale saves are rejected so another admin's changes cannot be silently lost.
Use Reload saved settings to load the latest version and discard local edits.

CALENDAR AND RENDER FREE
The backend computes annual dates and evaluates the theme when requested.
It uses Dominica time (UTC-4), handles the December/January crossover, and
calculates Carnival/Easter-related dates, the first Monday in May for Labour
Day, and the first Monday in August for Emancipation Day. Fixed dates repeat.
No paid scheduler or external calendar API key is required. The active theme
refreshes about every 60 seconds and at the next known boundary while open;
a free Render instance may still have its normal cold-start delay.
If the appearance API fails, the storefront falls back to normal branding.

This is NOT a live government-calendar sync. Government-declared extra holidays
and substitute/in-lieu dates cannot be inferred reliably from annual rules.
Review official announcements and enter those dates in admin. The calendar
sets storefront decoration, not store opening hours or delivery availability.
Reference calendars used during implementation:
https://www.dominica.gov.dm/about-dominica/public-holidays
https://www.timeanddate.com/holidays/dominica/2026
Government Carnival orders and Discover Dominica cultural information were also
consulted. The official web calendar does not provide an API integration here.

Promotions remain separate: a seasonal banner can link to /deals or a campaign
path, but selecting a theme never creates or enables a discount.

VALIDATION
- 57 backend tests passed, including all previous order/promotion checks and
  20 new seasonal unit/integration tests against disposable MongoDB.
- Existing frontend ProductItem regression test passed.
- Production build passed; pre-existing lint/deprecation warnings remain.
- Local browser checks with mocked APIs passed: saved checkboxes/reload,
  next-year date preview, non-persistent artwork preview, manual save,
  five storefront themes, desktop/mobile layouts, no horizontal overflow,
  restrained checkout, Off mode, and reduced-motion preference.
- No live-site deployment, live payments, or production database changes made.
The tests folder is development-only; it is not a public site section.

Optional checks from repository root:
npm run test:orders
npm test --prefix frontend -- --watchAll=false --runInBand
npm run build --prefix frontend
Integration tests run only with TEST_MONGO_URI pointing to a DISPOSABLE MongoDB
database named tt_upgrade_test. They delete that test database's collections.
Never use your production database for tests.

ROLLBACK
For immediate normal appearance, save Off in Admin > Appearance.
For code rollback, restore the files listed in CHANGED-FILES.txt from your
pre-update backup and rebuild/redeploy. No product/order data is rewritten
by this feature, and the seasonal settings collection can remain in MongoDB.
