# Tactical Trends — business card banners

Incremental source update for Food, Convenience and Hardware Hub business cards. Apply after the flexible markup / fees release. Includes only eight changed/new source files and this guide. If you have edited any supplied source since that release, merge those edits instead of overwriting them blindly.

## Install

1. Back up your current source and database.
2. Merge the supplied backend/ and frontend/ folders into the project root.
3. Build the frontend: `npm run build --prefix frontend`.
4. Deploy the frontend using your usual process AND restart the backend.

No new dependencies or environment variables. The existing Cloudinary image-upload configuration is reused. If uploads are not configured, an HTTPS image URL can be used. No manual database migration is needed; the optional fields are backward-compatible. Existing businesses keep the default shop design until a banner is explicitly saved.

Excluded: backend/app.js and CORS changes, all .env/.evn/config.env files, build folders, dependencies, tests, and PaymentMethod.jsx.

## Admin: add a banner

In Hub Operations > Restaurants & menus (or the relevant store management section), select the business. Under Business details, find Card banner.

- Upload JPG, PNG or WebP (up to 8 MB before resizing), or paste a public HTTPS image link.
- Recommended image: 1600 × 1000, with the main subject near the middle. Card images crop to fill a consistent area on desktop/mobile.
- Select Top, Centre or Bottom under Banner image position and review the crop preview.
- Click Save business details. Uploading alone does not publish the banner.
- Remove photo or Use default shop illustration, then save, to restore the shop design.

Approved, active business owners can do the same in Business Centre > Business card appearance > Save business banner. The existing logo / storefront image remains a separate field and is not overwritten. Applications can receive their banner after approval; admin can also set it while creating a business.

## Opening status

A solid, readable badge sits above either the banner or the default shop scene:
- Open now / Closed follows the existing weekly schedule in Dominica time.
- Orders paused appears when Accept orders is switched off. Use that existing control for temporary closure or a busy kitchen.
- Hours unavailable appears when weekly hours have not been configured. The existing order-acceptance policy is unchanged: a business without weekly scheduling may still accept orders when its switch is on.

The existing status text and next opening/closing summary remain below the image. Public business listings refresh about every 30 seconds while open. Keep business opening hours correct; a banner never controls availability.

Missing banners and failed image loads automatically show the shop illustration. Removing a banner detaches it from the card; it does not delete the original image from Cloudinary. The shop door sign remains decorative alongside the clear status badge.

## Validation

Production React build: passed, with existing unrelated warnings. Backend syntax checks: passed.

21 integration checks passed, 0 failed. These include three new banner checks covering independent logo/banner persistence, removal, stale revisions, owner authorization, HTTPS validation, all three hub types and preservation when older operational forms omit banner fields. The existing 18 pricing/checkout/settlement integration checks also passed. The disposable test database ran MongoDB 7.0.14 after the environment's 8.2.6 binary could not initialize its CPU allocator. No production data or live image-provider writes were used.

Browser presentation checks used a production frontend with synthetic API fixtures: desktop banner, default shop and broken-image fallback; narrow mobile banner/status readability; page width equals viewport width (382px). Status placement is scoped inside each card. A final spacing adjustment reserves room above the illustrated shop name. Live Cloudinary upload was not exercised; the existing validated item-photo upload implementation is reused with business-specific labels. Check one upload, a pasted URL, removal, and opening-hours transitions on your staging site before release.
