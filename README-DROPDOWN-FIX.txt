TACTICAL TRENDS — ACCOUNT DROPDOWN LAYER FIX

Extract into E:\Web Projects\OnlineStore, merging the frontend folder.
Replace frontend/src/components/layout/Header.css with the included current version.
From E:\Web Projects\OnlineStore\frontend run:
  npm run build
Redeploy using your existing workflow. Refresh the live page after deployment.

The main header now sits above the category navigation scroller, keeping the account menu visible and clickable over navigation and seasonal artwork. On short screens, the dropdown scrolls so the final actions remain reachable. Seasonal colours and current hub navigation are preserved.

Validation: checked every menu item's visibility/hit target across 30 combinations of seasonal themes and viewport sizes (320, 393, 600, 844 landscape, 1024 and 1440 pixels). Checked navigation, viewport fit, scrolling and Escape dismissal. Browser checks applied the updated stylesheet to the existing production build; the mobile scrolling layer was simulated to reproduce the screenshot overlap.

Only one CSS source file is changed. No backend files, environment files, PaymentMethod.jsx, build files or test folders are included.
