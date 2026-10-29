# Tactical Trends — Service Hub & audit fixes

29 October 2026 · Incremental source update for the existing OnlineStore project.

This is an update, not a complete project. Copy its `backend` and `frontend` contents into the corresponding folders in your existing project. Keep the folder structure. Do not replace your whole application with this ZIP.

## What is included

- **Service Hub** at `/service-hub`: category browsing, business/service search, community filter, hours, responsive business profiles and direct phone/WhatsApp/email/website links.
- Default categories: car wash & vehicle care, rentals, doctors & health services, repairs & technicians, beauty & personal care, home & trades, professional services, and other services. Admin can add, rename and pause categories.
- Admin-managed service listings with quick selection buttons and a dropdown, editable services and indicative price labels, photo upload/link, weekly hours, approval/suspension and archival. No demo businesses are created in production.
- Signed-in businesses can submit a listing or edit their own listing. An edit returns it to Pending for review. Admin-created listings can be managed by admin; assigning them to a business owner is not part of this release.
- Callback enquiries with customer consent and an account history. Admin can mark them contacted, resolved or cancelled. Enquiries are coordinated manually in Hub Operations; this release does not automatically send service-enquiry email/SMS or notify a listed business.
- Health listings require admin to check practitioner credentials and permission before publication. The directory does not collect medical records, provide medical advice, confirm appointments or handle service payments.
- Food and partner-store baskets saved separately per business for up to seven days on the same browser. Variants, extras and quantities are retained; current catalogue prices are displayed and server-validated. Delivery/contact details are not persisted in these baskets. A successful order submission clears that business's basket.
- Return to the intended order page after sign-in.
- Main-shop delivery fees configurable separately from existing restaurant/store community routes. Server checks destination community, rejects unavailable rates and preserves the order's delivery snapshot.
- Customer-care footer and editable contact, delivery, returns/refunds, privacy and terms pages.
- Accessible filter/shipping/quantity labels, keyboard-operable quantity buttons, simpler category navigation, improved empty/loading states and “No reviews yet” presentation.
- Product purchase-unit and pack-content fields in admin, with unit information in product/cart/order review and server order snapshots. Actual product data is not guessed or rewritten.
- Page titles/descriptions, canonical links, private/filter-page indexing controls, restaurant/store/service structured data, heading corrections and viewport scale 1. Existing product structured data is retained. This remains a React client-rendered app, not an SSR migration.
- Service Hub appears in header, splash and hub navigation. The repeated in-page hub rail is now an expandable “Explore hubs & partner centres” panel.

## Preserved exclusions

The ZIP contains **no** environment/config files, `backend/app.js`, CORS edits, build output, node_modules, test folders, fixture data or preview server. Existing payment integrations, food fulfilment and restaurant/store accounts remain in place.

**PaymentMethod.jsx is included intentionally:** it is based on the latest version in this project. Only checkout validity and displayed totals were adapted to the server-confirmed quote so newly configured delivery options work. Its PayPal button, retry behaviour, styling and provider logic were retained. If you changed this page independently since the last update, merge those checkout changes into your newer page rather than overwriting your edits.

## Install and deploy

1. Back up your current source and MongoDB database. Keep a record of the currently deployed commit.
2. Extract the ZIP. Copy `backend/` into your existing backend and `frontend/` into your existing frontend, merging folders and replacing the listed changed files. Do not copy the ZIP as a new application root.
3. Keep all of your current environment files, credentials and `backend/app.js`. There are no new required environment variables or dependencies. Service/admin photo uploads use the existing Cloudinary configuration.
4. From your existing project root, run:

   ```powershell
   cd frontend
   npm run build
   cd ..
   ```

5. Deploy the backend changes and the newly built frontend together. Commit/push the merged source using your normal Render workflow. A backend-only `npm install` does not rebuild the frontend.
6. For an Express service serving `frontend/build`, your Render build command must install the frontend dependencies and build it. With up-to-date package locks, a suitable command is:

   ```sh
   npm ci && npm ci --prefix frontend && npm run build --prefix frontend
   ```

   Keep the existing `npm start` command. If your frontend is deployed as a separate static service, also redeploy that service with its normal frontend build.
7. Refresh the live site after successful deployment. Check that `/service-hub`, `/help/contact` and Hub Operations load without errors.

The build folder is generated by your build/deployment process; it is deliberately absent from this ZIP. MongoDB creates the new service directory, enquiry, customer information and delivery settings collections through the application; no destructive database migration or seeding is required.

## First admin setup — do this before promoting the update

Open **Dashboard → Hub Operations**:

1. **Customer care & policies:** confirm the phone, email and support availability. Review and adjust every default policy to match actual business practices before deploying/promoting. These are editable service guidelines, not a legal/compliance certification.
2. **Marketplace delivery:** the existing free pickup, Roseau XCD 15 and Portsmouth XCD 15 choices are retained as defaults. Add Wesley and other communities only with your actual approved fees. Set the communities covered by each fee, instructions and availability. Unlisted communities cannot use another community's fee; customers are directed to contact you for a quote before ordering. This release does not create custom-priced main-shop orders automatically from that enquiry.
3. **Delivery areas & rates:** continue using the existing directional community routes for restaurant, convenience, hardware and general hub deliveries. Main-shop fees and partner-store routes are separate settings.
4. **Service businesses:** create a business, select its category, enter its public contact details/address, add services and indicative price labels, add a photo, set hours and choose Approved when reviewed. Admin can keep drafts Pending, suspend a business or archive it. Health listings require the explicit credential/permission check.
5. **Service enquiries:** check this queue regularly. Coordinate the enquiry with the customer and business, then update its status. No appointment or rental reservation is guaranteed by submission.
6. **Hub settings:** enable/disable Service Hub and set its display order or announcement. Pausing it blocks new callback enquiries while existing enquiry history remains accessible.
7. **Products:** verify units and contents on existing retail listings. In particular, confirm whether the charger is a single adapter or pack, and the actual fertilizer bag weight. Then enter the verified information. Use concise and consistent variant names such as Small, Large, Lime and Orange; no existing catalogue names or prices are automatically rewritten.

Admin permissions: Catalogue staff manage service businesses/categories; Operations staff manage callback enquiries; Settings staff manage checkout delivery/customer-care information. Full administrators have all of these capabilities. Callback customer details are not returned to catalogue-only staff.

## Before wider advertising

Follow DEPLOYMENT-CHECKLIST.md. Automated checks cannot confirm live provider credentials, SMTP delivery, real-phone behaviour, professional credentials, legal terms or tax registration. The existing tax calculation has not been changed; verify its applicability for your business. No live payment, email, refund or production deployment was performed for this update.

## Rollback

Before accepting new orders under custom delivery options, you can restore your backed-up source and rebuild/redeploy. Leave the new MongoDB collections intact; do not delete customer history to roll back a screen.

After custom-delivery orders have been accepted, retain the new order model and delivery-snapshot compatibility until those orders are resolved. An older backend's hard-coded shipping enum may reject updates to those orders. Review existing orders before reverting backend payment/order code.
