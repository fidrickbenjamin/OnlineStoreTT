# Tactical Trends — Item photo upload update

Apply this incremental update AFTER the Product Variants and Mobile Hub Design updates. It adds the same photo editor to Food, Convenience and Hardware item forms for administrators and approved business owners.

Back up your project. Copy backend/ and frontend/ into their matching folders, preserving paths. Review independent edits to these files before replacing them. No dependencies, database migration or new environment variables are required.

## Using it as admin

1. Open Hub Operations → Restaurants & menus, Convenience stores or Hardware stores.
2. Select the business and edit an item, or start a new item. For stores, use the Products section.
3. Under Item photo, choose Upload item photo. Select a JPG, PNG or WebP file from your device.
4. Wait for “Photo uploaded. Save the item to publish this change.” Check the preview.
5. Complete your item details and click Save item.

The photo is stored by Cloudinary during upload, but the product/menu listing changes only after you save the item. Images follow the responsive display rules from the previous update. Variants and sides retain their current behaviour; all variants of one item share its item photo.

## Business owners

Approved, active business owners have the same photo controls in Business Centre. They can upload to their own business folder and save images only through their own item editor. Pending or archived businesses cannot use the partner upload endpoint. Admin upload access continues to require full-admin or catalogue permission.

## Replace, remove or use a URL

- Replace item photo: choose a new image. A failed upload leaves the current draft/saved image unchanged.
- Remove photo: clears this draft's image. Save item to apply the removal.
- Photo link (optional): keep using a public HTTPS image URL instead of uploading. Its preview appears in the same editor.

Replacing or removing an image does NOT delete old files from Cloudinary. A URL may be shared by other products or external content. Uploads discarded without saving can therefore remain in Cloudinary; clean up unused assets manually only after checking they are no longer referenced.

## Mobile and upload limits

- Original device file: JPG, PNG or WebP, up to 8 MB.
- The browser resizes large photos to a maximum 1200 px longest edge, reducing dimensions further if needed to fit the server upload limit of 450 KB. It normally uses WebP, with a compatible fallback when necessary.
- If your phone supplies a HEIC file that cannot be selected/decoded, export it as JPEG first.
- The image preview fits the complete photo. Public food cards retain their existing landscape crop; store products retain their full-product image frames.
- The editor and Save action are disabled while an upload is in progress. Existing name, price, side and variant draft values are retained when the upload completes.
- Uploads are limited to 20 attempts per account/hour per upload route. Failed selections rejected locally are not sent to the server.

## Cloudinary configuration

The existing backend settings must be present:

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Use the same server-side account already configured for store images. No keys go in the frontend. If these settings already exist, no environment changes are needed. Storage errors are reported without exposing raw provider messages or credentials.

Uploads use image-only storage in tactical-trends/hub-catalogue. Partner uploads use a subfolder for their own business ID. The backend checks image format/signature and size as well as permissions.

## Build and deployment

Restart/redeploy the backend so the partner upload route is available. Rebuild and deploy the frontend as usual:

```powershell
cd frontend
npm run build
cd ..
```

Deploy the backend and frontend update together. If Express serves frontend/build, ensure that your own rebuilt frontend is included in the deployed service. The build output is deliberately not bundled in this update ZIP.

This package excludes backend/app.js and its CORS configuration, all environment files, config.env, PaymentMethod.jsx, build output, node_modules and test folders. Mail configuration, payment methods, delivery pricing and order processing are unchanged.

## Validation

Production build passed, with existing unrelated lint warnings remaining. 45 backend integration checks passed, including eight upload/permission/failure checks and existing variant, category, store, admin and cash-report checks. The existing concurrent supplier-payment test also checks that an optimistic conflict can safely retry the same request key without creating a duplicate payment; no financial code changed.

Browser checks covered admin upload/compression, saving disabled during upload, keeping draft values, failed/invalid/oversized selections, replacing/removing photos, URL entry, restaurant owner uploads, public display, Convenience/Hardware partner uploads and responsive layouts at 320/390/768/1440 px. Image decoding was also checked with createImageBitmap unavailable, using the browser Image fallback. Existing catalogue, spotlight, basket, payment-choice, hub styling and property-banner behaviour passed browser regression checks.

Tests used disposable records and mocked Cloudinary. No live image storage, emails or payments were used in verification. After deployment, upload and save a test item using your own configured Cloudinary account to confirm the live connection.
