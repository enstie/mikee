# Zoho OAuth Setup Guide

Follow this step-by-step to get your Zoho credentials for the Worker.

## Step 1: Create a Zoho Developer Account

1. Go to [https://developer.zoho.com](https://developer.zoho.com)
2. Sign up or log in with your Zoho account.
3. If you don't have a Zoho account, create one at [https://www.zoho.com/signup.html](https://www.zoho.com/signup.html)

## Step 2: Create an OAuth App

1. In Zoho Developer Console, go to **Getting Started > OAuth 2.0 Apps**
2. Click **Create Server-based Application**
3. Fill in:
   - **Application Name**: `Micasa Integration` (or your preference)
   - **Homepage URL**: Your GitHub Pages URL (e.g., `https://yourname.github.io`)
   - **Authorized Redirect URI**: `http://localhost:8080/callback` (for testing; use your domain in production)
4. Click **Create**

## Step 3: Note Your Client ID and Secret

After creation, you'll see:
- **Client ID**
- **Client Secret**

Save these somewhere safe—you'll need them in a moment.

## Step 4: Get Authorization Code

1. In a new browser tab, construct this URL and visit it:

```
https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=YOUR_CLIENT_ID&scope=ZohoCRM.modules.all&redirect_uri=http://localhost:8080/callback&access_type=offline
```

Replace `YOUR_CLIENT_ID` with the Client ID from Step 3.

2. You'll be asked to approve access. Click **Accept**.
3. You'll be redirected to something like:
   ```
   http://localhost:8080/callback?code=1234567890abcdef&location=us&org_id=123456
   ```
4. Copy the `code` value (the long string after `code=`). **This is your authorization code.**

## Step 5: Exchange Code for Refresh Token

Open PowerShell or any terminal and run:

```powershell
$body = @{
    grant_type = "authorization_code"
    client_id = "YOUR_CLIENT_ID"
    client_secret = "YOUR_CLIENT_SECRET"
    redirect_uri = "http://localhost:8080/callback"
    code = "YOUR_AUTHORIZATION_CODE"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://accounts.zoho.com/oauth/v2/token" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$response
```

Replace:
- `YOUR_CLIENT_ID` from Step 3
- `YOUR_CLIENT_SECRET` from Step 3
- `YOUR_AUTHORIZATION_CODE` from Step 4

The response will include:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Save the `refresh_token` value.**

## Step 6: Store Secrets in Cloudflare Worker

Once you have all three:

```bash
cd mikee/zoho-worker
npx wrangler secret put ZOHO_CLIENT_ID
# Paste your Client ID, press Enter twice

npx wrangler secret put ZOHO_CLIENT_SECRET
# Paste your Client Secret, press Enter twice

npx wrangler secret put ZOHO_REFRESH_TOKEN
# Paste your Refresh Token, press Enter twice
```

## Step 7: Update wrangler.toml

Edit [wrangler.toml](./wrangler.toml):

Replace `ALLOWED_ORIGIN = "https://YOUR_USERNAME.github.io"` with your actual GitHub Pages URL.

Example:
```toml
[vars]
ALLOWED_ORIGIN = "https://janedoe.github.io"
```

## Step 8: Deploy

```bash
npm run deploy
```

You'll see:
```
✓ Uploaded micasa-zoho-worker successfully.
Your worker is published at: https://micasa-zoho-worker.YOUR_SUBDOMAIN.workers.dev
```

Copy that URL and paste it into [start_conversation.html](../home/start_conversation.html):

```js
const BACKEND_ENDPOINT = "https://micasa-zoho-worker.YOUR_SUBDOMAIN.workers.dev";
```

## Step 9: Test

1. Go to your form page.
2. Fill in all fields and click **Send Request**.
3. Check your Zoho CRM **Leads** module—you should see the new lead appear within seconds.

## Troubleshooting

**"Zoho token refresh failed"**
- Check that `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` are correct.
- Confirm they're stored in Cloudflare via `npx wrangler secret list`.

**"lead creation failed"**
- Verify your CRM has a `Leads` module (it's standard).
- Check field mapping in [src/index.js](./src/index.js) matches your Zoho field names.

**CORS error in browser**
- Ensure `ALLOWED_ORIGIN` in wrangler.toml exactly matches your deployed frontend URL.

**No refresh token in response**
- Add `&access_type=offline` to your auth URL in Step 4.
