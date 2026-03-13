# Micasa Zoho Worker

Cloudflare Worker backend for relaying website consultation form data to Zoho CRM.

## 1) Prerequisites

- Cloudflare account
- Node.js 20+
- Zoho OAuth app with `client_id`, `client_secret`, `refresh_token`

## 2) Install

```bash
cd zoho-worker
npm install
npx wrangler login
```

## 3) Configure

Update `wrangler.toml`:

- `ALLOWED_ORIGIN` = your GitHub Pages URL, e.g. `https://yourname.github.io`
- Keep `ZOHO_MODULE = "Leads"` unless you need another module.

Set secrets:

```bash
npx wrangler secret put ZOHO_CLIENT_ID
npx wrangler secret put ZOHO_CLIENT_SECRET
npx wrangler secret put ZOHO_REFRESH_TOKEN
```

Optional if using regional domains:

- `ZOHO_ACCOUNTS_BASE` and `ZOHO_API_BASE` in `wrangler.toml`

## 4) Run local

```bash
npm run dev
```

## 5) Deploy

```bash
npm run deploy
```

You will get a URL like:

`https://micasa-zoho-worker.<subdomain>.workers.dev`

## 6) Frontend integration

In `home/start_conversation.html`, set:

```js
const BACKEND_ENDPOINT = "https://micasa-zoho-worker.<subdomain>.workers.dev";
```

The page will POST JSON to this endpoint.

## Notes

- Keep all Zoho secrets in Cloudflare secrets only.
- Do not expose Zoho OAuth credentials in frontend code.
- Ensure CORS origin exactly matches your deployed frontend domain.
