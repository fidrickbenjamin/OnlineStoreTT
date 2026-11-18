# Cart delivery selector follow-up

Apply AFTER tactical-trends-community-checkout-update.zip. This ZIP replaces only frontend/src/components/Cart/Cart.jsx. Merge the frontend folder into the project, then build with `npm run build --prefix frontend` and deploy the new frontend through your usual process.

In Hub Operations > Marketplace delivery, configure the main dispatch community, routes/zones and collection instructions; enable community-based checkout and save. When enabled, the cart now offers:
- Collect my order — free collection.
- Deliver to my community — price at checkout.

The next screen collects the recipient community and calculates the route fee or requests a manual quote. The cart shows item subtotal, but labels delivery, tax and the final total as calculated at checkout instead of implying an uncalculated delivery is free or using the cart's legacy tax estimate. Existing offers/current prices are still verified on order review. Returning from an approved quote shows the delivery choice without exposing its internal identifier and keeps that quote reference for the next screen.

Previously saved Roseau/Portsmouth selections are treated as community delivery when the new checkout is enabled. If community checkout is disabled, the previous legacy options remain intentionally supported; seeing them after installation means the feature has not been enabled, or an old frontend build is still being served. Refresh the browser after deploying.

No backend, PaymentMethod.jsx, environment/config files, app.js, dependencies, builds, tests or QA data are included. No live deployment was performed.

Validation: production React build passed with existing unrelated warnings and no Cart.jsx warning. Reviewed selector mapping, invalid-option blocking, configured feature-flag fallback, quote-reference preservation and deferred totals. This follow-up did not add automated tests or repeat browser QA; the preceding release validated community checkout and quote handling separately.
