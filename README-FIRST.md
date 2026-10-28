# Tactical Trends — Splash Screen Hub Navigation

Apply this small update AFTER the Convenience & Hardware Hubs upgrade. It relies on the six hub routes already present in that version.

## Included

Only these two source files are replaced:
- frontend/src/components/CategorySplash.jsx
- frontend/src/components/CategorySplash.css

All six hub shortcuts appear above product categories: Property, Food, Convenience, Hardware, Ride and Delivery. Each has an icon, a clear name and a short description. Desktop uses three columns; mobile and tablet use two. Category search filters product categories while leaving the six hubs available. Deals and Business Centre remain below the categories.

The existing welcome behaviour is preserved: it opens on a fresh homepage load, stays closed during internal browsing, respects skipSplash/category query parameters, closes when a hub is selected and can be reopened using Browse categories. Escape, the close button and keyboard link navigation remain supported.

## Install

Merge the frontend folder into your latest project, replacing only the two included files. From your OnlineStore frontend folder, run:

```
npm run build
```

Deploy the newly generated frontend build using your normal deployment process. No backend, dependencies or environment changes are needed.

This ZIP excludes backend/app.js, environment/config files, PaymentMethod.jsx, build folders, dependencies and test folders.

## Validation

Production build passed with existing unrelated lint warnings. Chromium browser checks passed at 320/390/768/1440 widths: all six hub links visible before scrolling at the tested 844px viewport height, correct destinations, keyboard activation, touch target sizes, no modal horizontal overflow, category search/navigation, close/reopen, skipSplash behaviour and seasonal display. Mobile checks used browser emulation rather than a physical phone.
