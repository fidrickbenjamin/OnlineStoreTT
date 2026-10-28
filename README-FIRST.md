# Tactical Trends — Admin operations and Google mail upgrade

This is an incremental source update for the latest version of the project. Back up your working project and database before applying it. Extract the backend/ and frontend/ contents into the matching project folders, preserving paths. Review any independent changes you made to these same files before replacing them.

## Included changes

- Full-database dashboard counts, server-side job search, filters and pagination. Older unresolved requests are no longer omitted by the former latest-300 display limit.
- Needs-attention filters for business acceptance, quotes, expired quotes, payment reviews, driver dispatch/offers, ready orders, late preparation, paid cancellations and driver cash. These counts overlap when an order needs multiple actions.
- Daily reconciliation by Dominica date: verified receipts by method, delivery portion, cash received by Tactical Trends, driver cash handovers, cash refunds, business cash payments, explained adjustments, cash count, variance, CSV and print views. Close/reopen history and source fingerprints flag later changes to closed days.
- Current outstanding driver cash, unpaid hub quotes, and business balances shown separately from daily till cash.
- Hub display names, visibility/order and announcements. Header, splash, hero and hub navigation use these settings. Pausing a service hub prevents new requests; existing activity remains accessible. Property visibility controls its customer page/navigation, not a replacement for property listing permissions.
- Product photo upload using existing Cloudinary credentials, unsaved product draft warnings, draft preview, CSV preview and imports of up to 100 new store products per file. Existing category and five-spotlight rules remain in effect.
- Staff access for operations, catalogue, finance and settings, enforced on the server. Existing admins remain full administrators until explicitly changed. Scoped staff use Hub Operations only; other admin pages remain full-admin pages. Only a full administrator can manage mail, staff access and change history. You cannot change your own access.
- Audit history for successful Hub Operations writes, recording the actor, route, time and selected non-secret fields. It does not reconstruct past changes or record every field in every application module.
- Google SMTP and Gmail API sending, seasonal email branding, durable order/hub notification queue, mail configuration status, preview, explicit test send, retry review and retained attempt history.
- Explicit cash holder on hub cash verification and actual refund-method selection for manually recorded refunds.

## Mail setup is required

Read **GOOGLE-MAIL-SETUP.md** before enabling Google mail. Your Render free instance blocks SMTP ports, so use the included Gmail API option while staying on the free plan. Google SMTP is included for hosting that allows SMTP. This update does not create Google credentials, change your Render environment, send live test emails or prove live inbox delivery.

## Install/build

No new npm dependencies or package changes are required. In PowerShell from your project root:

```powershell
cd frontend
npm run build
cd ..
```

Deploy your rebuilt frontend and updated backend using your normal deployment process. When Express serves frontend/build, the build must exist in the deployed service. A backend-only `npm install` does not rebuild the frontend. The build output is deliberately not included in this update ZIP, as requested.

Restart the backend after applying source/environment changes. MongoDB creates the new collections/indexes through the existing model startup flow. There is no destructive migration or automatic rewrite of historical payments.

The ZIP deliberately excludes backend/app.js (including your CORS setup), environment files, config.env, build output, node_modules, tests and Cart/PaymentMethod.jsx. Preserve those files in your own project.

## First admin checks

1. Open Hub Operations → Dispatch & attention. Search an old request by its full ID or TT reference and check the attention filters.
2. Open Daily reconciliation. Record the actual opening cash and counted cash. Explain any variance or adjustment before closing. Reopening a closed day requires a reason; earlier snapshots remain in history.
3. Review Business accounts as before. Goods/meal costs owed to each store stay separate from delivery fees and customer receipts. Driver cash counts as till cash only after recorded handover.
4. Review legacy receipt warnings. Only verified historical Paid/Refunded orders may have missing receipt metadata filled, using the actual receipt date and reference. Unknown cash holders and refund methods are excluded from the corresponding till totals until reviewed. Use an explained adjustment for a verified historical correction. Do not invent a receipt date to make a report balance.
5. Configure hub visibility and announcements. Test a paused hub using a fresh customer page. Cached navigation refreshes periodically or on refocus; the server blocks new service requests immediately.
6. In Convenience/Hardware stores, select a store and selected category. Upload/preview a product or use the downloadable CSV template. Preview is read-only. Import creates new products; edit existing products individually. If an import partially fails, review the per-row results and retry only failed rows after refreshing.
7. Give an existing test account only the permissions it needs and verify its access. Keep your full administrator account.
8. Configure and test Google mail using the separate guide.

## Practical limits

Cash reports reflect recorded events, not bank feeds or an accounting-system reconciliation. Old records without actual receipt dates cannot be assigned to a day automatically. Supplier payment reversals correct records; they do not prove physical cash was returned. Count and explain actual cash movements.

Draft protection covers unsaved store product edits. CSV import does not overwrite existing products or add inventory reservation. Photo uploads require the existing Cloudinary configuration. No new driver payout system is introduced.

The mail queue runs while this application is awake. Render free service sleep delays queued notices. Failed/uncertain messages require review rather than automatic repeated sends. Provider acceptance is not proof of inbox delivery.

Validation: optimized production build passed (existing unrelated lint warnings remain); 167 automated tests passed, including regression, admin/finance/catalogue integration and isolated Google SMTP/Gmail API tests with mocked providers. Browser checks passed at 320, 390, 768 and 1440 px for operations/mail layouts, restricted access, cash close/reopen, hub visibility, CSV preview/import and unsaved drafts. Existing catalogue/spotlight, food menu, mobile basket and payment-choice flows also passed browser regression checks. No live payment or email transaction was used.
