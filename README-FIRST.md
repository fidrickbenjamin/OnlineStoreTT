# Tactical Trends — Mobile hub design update

Apply this incremental frontend update AFTER the Product Variants upgrade and the earlier Admin / Google Mail upgrade. Back up your current project, then copy frontend/ into the matching project folder, preserving paths. Review independent edits you made to these same files before replacing them.

## What changed

- Food Hub now uses warm food-ordering colours, a clearer restaurant introduction, prominent browsing actions and a refreshed illustrated storefront presentation.
- Convenience uses a fresh green identity; Hardware uses a blue catalogue identity. Ride and Delivery have their own compact introductions and matching request controls. Seasonal navbar colours, labels and trims remain in place.
- Hub navigation shows the current hub. My activity and the main browsing controls have larger mobile tap targets.
- Product sizes/flavours appear as selectable price tiles instead of a dropdown. The selected choice is highlighted, and sold-out choices are disabled. Products with more than four variants have an expandable list. If a selected choice is outside the collapsed list, its name and price remain visible.
- Meal photos use consistent landscape frames with controlled cropping. Convenience/Hardware product photos fit completely inside matching frames in the regular catalogue and spotlight. Logos also fit completely rather than being cropped.
- Supported unsigned Cloudinary images get responsive image candidates and automatic format/quality transformations. Other hosts retain their original images with responsive display sizing. Existing transformed or signed Cloudinary paths are left unchanged. Large original uploads on other hosts still need appropriately sized source files.
- Image frames reserve space while loading. Missing/broken hub images receive stable placeholders; an unsuccessful Cloudinary optimization falls back to the original URL before showing a placeholder. Marketplace/property cards also fall back to the existing default image when a URL fails.
- Property Hub no longer receives the seasonal welcome banner or edge decorations. Its own property introduction and filters remain, along with the seasonal navbar and trims. Property listing cards stack their photos above their details on mobile, with consistent landscape frames. Page gutters prevent horizontal overflow.
- Mobile inputs retain readable sizes; variant choices support native radio keyboard controls, focus outlines and selected/sold-out labels. Reduced-motion preferences are respected for the new card interactions.

## Ordering remains the same

Choose a variant, then Add to order. Choose another variant to add it as a separate basket line. Existing sides/extras, floating basket, delivery estimates, quote approval and payment choices remain in place. Business availability and saved hub visibility are still respected.

There are no backend, price, delivery-rate, payment-provider, stock or financial-ledger changes in this update. Saved variants, categories, spotlights and old orders continue using the existing data. No new npm dependencies or environment settings are needed.

## Install and deploy

From your project root in PowerShell:

```powershell
cd frontend
npm run build
cd ..
```

Deploy the rebuilt frontend using your existing process. If Express serves frontend/build, ensure that rebuilt output is present on the deployed service; a backend-only npm install does not rebuild the frontend. The build directory is deliberately not included in this ZIP.

This package contains only the source files needed for this visual upgrade and this guide. It excludes backend/app.js and your CORS configuration, all environment files, config.env, PaymentMethod.jsx, build output, node_modules and test folders. Your Google mail configuration is untouched.

## Checks

- Production build passed, with existing unrelated lint warnings remaining.
- 37 existing variant, catalogue, store, admin and reconciliation integration tests passed.
- Browser checks covered hub landing pages at 320, 390, 768 and 1440 px; mobile variant selection and long-list expansion; sold-out choices; separate basket rows; extras, totals, collection checkout and existing payment choices.
- Image checks covered food cropping, complete product/logo fitting, consistent spotlight/catalogue frames, Cloudinary and ordinary-host error placeholders, and reserved image space.
- Property banner removal, retained seasonal header, property card responsiveness and account dropdown layering were checked. Food identity and property banner behaviour were checked with Independence, Christmas and Carnival themes.
- Existing category import, category/spotlight management, partner catalogue access, mobile basket/delivery/payment choices and food-menu browser regressions passed.

Tests use disposable data and mocked external images/maps. No live payments or emails were sent. Screenshots used for review contain test fixtures and are not included in the update.
