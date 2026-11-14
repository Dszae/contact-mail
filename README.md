# contact-mail

Private web inbox for `contact@dipeshsapkota7.com.np`, served at
https://contact.dipeshsapkota7.com.np.

## How it works

- Cloudflare Email Routing forwards mail for the domain to Gmail.
- This site is a static-assets-only Cloudflare Worker. No code runs on
  Cloudflare per request, so the Free plan CPU limit (error 1102) does not apply.
- The browser signs in with Google and calls the Gmail API directly. It shows
  only mail sent to the domain or from `contact@`, and sends as `contact@`
  through Gmail's "Send mail as" (Resend SMTP).
- The access token stays in memory for one hour. Nothing is stored server side.

## One-time Google setup

1. Google Cloud Console: create a project, then enable the **Gmail API**.
2. Google Auth Platform > Branding: app name, support email.
3. Audience: External, publishing status **Testing**, add your Gmail address as a test user.
4. Data access: add the scope `https://www.googleapis.com/auth/gmail.modify`.
5. Clients > Create client > Web application. Authorized JavaScript origins:
   - `https://contact.dipeshsapkota7.com.np`
   - `http://127.0.0.1:8799` (local testing, optional)
6. Copy the client ID into `public/config.js` (`clientId`) and deploy.

In Testing mode Google asks you to approve access again roughly every 7 days.

## Commands

```
npx wrangler dev --port 8799 --ip 127.0.0.1   # local, open /?preview for sample data
npx wrangler deploy                            # publish
```

## Files

- `public/index.html`, `public/styles.css`, `public/app.js`: the app
- `public/config.js`: client ID, address, labels
- `public/_headers`: CSP and security headers
- `wrangler.jsonc`: Worker and custom domain
