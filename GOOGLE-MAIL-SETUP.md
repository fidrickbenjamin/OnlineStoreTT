# Google mail setup — Tactical Trends

The update supports Google SMTP and Gmail API. Credentials are set in the BACKEND environment, not in the admin form or frontend. No real credentials are included in this package.

## Choose the connection for your hosting

**Your Render free web service blocks outbound SMTP ports 25, 465 and 587. Use Gmail API over HTTPS while staying on that instance.** Google SMTP requires a hosting plan/service that permits these ports. The Gmail API sends through the same Google mailbox and still has Google's sending limits.

Sources:
- https://render.com/docs/free
- https://developers.google.com/workspace/gmail/api/guides/sending
- https://support.google.com/accounts/answer/185833

## Option A — Gmail API for Render free

Use a dedicated store Google mailbox you control. In Google Cloud:

1. Create/select a project and enable **Gmail API**.
2. Configure the Google Auth Platform consent screen / audience. For initial testing, add the sending Google account as a test user. Use the minimum sending scope: `https://www.googleapis.com/auth/gmail.send`.
3. Create an OAuth client of type **Web application**. Add this authorized redirect URI: `https://developers.google.com/oauthplayground`.
4. Open https://developers.google.com/oauthplayground. In the gear/settings, choose **Use your own OAuth credentials** and enter the client ID and client secret from your project. Keep these private.
5. Enter the scope above, authorize the actual sending mailbox, and exchange the authorization code for tokens. Copy the refresh token into Render's backend Environment settings. Do not post any token or secret in chat, screenshots or source control.
6. Set the backend environment values below, replacing the descriptions with your own values:

```text
MAIL_PROVIDER=gmail-api
GOOGLE_CLIENT_ID=your-own-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-own-google-oauth-client-secret
GOOGLE_REFRESH_TOKEN=your-own-google-refresh-token
SMTP_FROM_EMAIL=your-google-sending-mailbox@gmail.com
SMTP_FROM_NAME=Tactical Trends Market Place
```

The `SMTP_FROM_*` naming is retained for compatibility with existing store configuration; these values are also used by the Gmail API. SMTP_USER/PASS/PORT are not needed for this option.

**Production authorization:** external OAuth consent apps left in **Testing** normally receive refresh tokens that expire after seven days for the Gmail sending scope. Complete Google's production publishing/verification requirements as applicable, or use an eligible internal Workspace application. Publishing is not a promise of exemption from verification. Tokens can also be revoked or expire for other reasons. An expired authorization appears in the Mail delivery logs and requires reconnecting the sender.

Use the actual mailbox address or an approved Gmail “Send mail as” alias. A custom domain address that worked with Mailtrap is not automatically authorized for Gmail. Workspace administrators may restrict OAuth access.

OAuth references:
- https://developers.google.com/identity/protocols/oauth2
- https://developers.google.com/identity/protocols/oauth2/web-server

## Option B — Google SMTP on hosting that permits SMTP

1. Enable Google 2-Step Verification on the sending account.
2. Create a Google **App Password**: https://myaccount.google.com/apppasswords. Use this password, not the ordinary Google sign-in password. App Passwords may be unavailable under some organization/security policies.
3. Set these BACKEND environment values:

```text
MAIL_PROVIDER=google-smtp
SMTP_USER=your-google-sending-mailbox@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM_EMAIL=your-google-sending-mailbox@gmail.com
SMTP_FROM_NAME=Tactical Trends Market Place
SMTP_PORT=465
```

Port 465 uses TLS immediately. Port 587 uses STARTTLS. The application fixes the server to smtp.gmail.com and requires TLS. SMTP_APP_PASSWORD is accepted as an alternative to SMTP_PASS. Never prefix these secrets with REACT_APP_.

Changing the Google account password can revoke App Passwords. Use the actual sending account or an approved alias.

## Deploy and verify

1. Choose one explicit MAIL_PROVIDER. Old Mailtrap configuration can be removed once the Google provider is confirmed; it is retained only as a legacy option when explicitly selected or when no Google settings exist. There is no automatic cross-provider resend.
2. Save the backend Environment changes and restart/redeploy the backend.
3. Sign in as a full administrator. Open **Hub Operations → Mail**.
4. Confirm the provider and sender, then choose **Verify mail connection**. Gmail API verification confirms token refresh; SMTP verification checks authentication. Neither proves inbox delivery.
5. Tick the test confirmation checkbox and choose **Send test email to me**. This sends only to your signed-in administrator address. Check inbox, spam and the sending mailbox's Sent folder.
6. Place a small test order and update its progress. Confirm the buyer receives its own notification, and that operations/finance administrators receive their notifications. Check password reset on a test customer account too.

Order and hub notifications enter a MongoDB-backed queue. The worker checks approximately every six seconds and sends at most two queued messages per batch while the app is awake. Render free instance sleep pauses the worker; this is not an always-on background email service. Password resets and the administrator test email use a direct send.

Pending items wait if mail configuration is incomplete. Failed items require an administrator retry. Unknown items may already have been accepted by Google: check Sent before retrying to avoid duplicate messages. An interrupted sending attempt is also held as Unknown. “Sent” means provider acceptance, not guaranteed inbox delivery. Retained attempt history is 30 days; outbox records are retained for 60 days. Do not use this queue as a permanent email archive.

Templates reuse the active seasonal settings, with inline colours, a holiday label and Madras trim during Independence. The email preview follows saved seasonal settings; it is not a live site screenshot.

Google quotas and anti-spam rules apply to SMTP and API alike. This is for transactional store notices, not unrestricted bulk advertising. If volume grows, use a transactional provider and an always-on worker.

## Troubleshooting

- Connection timeout on Render free + google-smtp: select Gmail API or hosting that permits SMTP.
- Missing settings: the Mail page lists required variable names without displaying secrets.
- GOOGLE_AUTH: reconnect the sender and check client credentials, refresh token, consent audience and permissions.
- GOOGLE_QUOTA: wait for Google's quota window; do not repeatedly retry.
- Unknown / WORKER_INTERRUPTED: check Sent before manually queueing another attempt.
- Test accepted but absent: check spam, recipient address, sending account restrictions and Google logs.
- Upload errors for catalogue photos are separate: they use your existing Cloudinary account, not Google mail.
