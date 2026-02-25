# 🚀 Quick Start: IBKR Integration

**Time to complete:** 15-20 minutes  
**Prerequisites:** IBKR account, Node.js 18+, npm installed

---

## Step 1: Generate Encryption Keys (2 minutes)

```bash
# Generate AES encryption key
node -e "console.log('ENCRYPTION_KEY_BASE64=' + require('crypto').randomBytes(32).toString('base64'))"

# Generate OAuth state secret
node -e "console.log('OAUTH_STATE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate internal sync secret
node -e "console.log('INTERNAL_SYNC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate cron secret
node -e "console.log('CRON_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy these outputs — you'll add them to `.env.local` in Step 4.

---

## Step 2: Generate RSA Key Pair for IBKR (3 minutes)

```bash
# Generate private key
openssl genrsa -out ibkr_private.pem 2048

# Extract public key (you'll upload this to IBKR)
openssl rsa -in ibkr_private.pem -pubout -out ibkr_public.pem

# Convert private key to .env format (single line with \n escapes)
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ibkr_private.pem > ibkr_private_formatted.txt
```

Your `ibkr_private_formatted.txt` should look like:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n
```

---

## Step 3: Register OAuth App in IBKR Portal (5 minutes)

1. **Log in to IBKR:**  
   [https://www.interactivebrokers.com/sso/Login](https://www.interactivebrokers.com/sso/Login)

2. **Navigate to API Settings:**  
   User Settings → API → Settings → OAuth Applications

3. **Create New Application:**
   - **Name:** Swiss FinTrack
   - **Type:** OAuth 1.0a (NOT 2.0)
   - **Callback URL:** `http://localhost:3000/api/brokers/ibkr/callback`  
     *(For production: `https://yourdomain.com/api/brokers/ibkr/callback`)*
   - **Permissions:** Read portfolio data

4. **Upload Public Key:**  
   Upload the `ibkr_public.pem` file you generated in Step 2

5. **Copy Consumer Key:**  
   You'll see something like `TESTCONS123456789`  
   Copy this — you'll need it in Step 4

---

## Step 4: Configure Environment Variables (3 minutes)

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your favorite editor
nano .env.local
```

Fill in these values:

```bash
# From Step 1 (your generated secrets)
ENCRYPTION_KEY_BASE64=your_generated_base64_key
OAUTH_STATE_SECRET=your_generated_hex_secret
INTERNAL_SYNC_SECRET=your_generated_hex_secret
CRON_SECRET=your_generated_hex_secret

# From Step 2 (RSA private key)
IBKR_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"

# From Step 3 (IBKR consumer key)
IBKR_CONSUMER_KEY=your_consumer_key_from_ibkr

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** The private key MUST be on a single line with `\n` escapes, not actual newlines!

---

## Step 5: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 6: Test Connection (5 minutes)

1. **Navigate to IBKR page:**  
   [http://localhost:3000/dashboard/ibkr](http://localhost:3000/dashboard/ibkr)

2. **Click "Connecter IBKR"**  
   You'll be redirected to IBKR's login page

3. **Authorize the app:**  
   - Log in with your IBKR credentials
   - Grant permission for portfolio access

4. **Verify success:**  
   - You'll be redirected back to `/dashboard/ibkr?connected=1`
   - Connection status should show **"Connecté ✅"**
   - Position count should display (e.g., "12 positions")
   - Total value should display (e.g., "$125,343.21")

5. **Check your dashboard:**  
   - Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Your IBKR positions should appear in the assets list
   - Each position shows: symbol, quantity, current value, institution ("IBKR")

---

## ✅ Success Checklist

- [ ] Can click "Connecter IBKR" without errors
- [ ] Redirected to IBKR login page (not localhost)
- [ ] After authorization, redirected back to your app
- [ ] Connection status shows "Connecté"
- [ ] Position count > 0
- [ ] Assets visible in `/dashboard`
- [ ] "Synchroniser" button refreshes data
- [ ] "Déconnecter" button revokes access

---

## 🐛 Common Issues

### Error: "Missing IBKR_CONSUMER_KEY"
**Fix:** Restart dev server after editing `.env.local`:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Error: "Invalid signature"
**Fix:** Check private key format:
```bash
# Print first 50 chars
echo $IBKR_PRIVATE_KEY_PEM | head -c 50
# Should output: -----BEGIN PRIVATE KEY-----\nMIIE...
```
If you see actual newlines instead of `\n`, reformat:
```bash
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ibkr_private.pem
```

### Error: "Redirect URI mismatch"
**Fix:** Ensure callback URL in IBKR portal exactly matches:
```
http://localhost:3000/api/brokers/ibkr/callback
```
No trailing slash, must use `localhost` (not `127.0.0.1`).

### Positions not appearing
**Fix:** Check browser console and server logs:
```bash
# Browser DevTools → Console (F12)
# Server terminal → Look for errors

# Manually trigger sync:
curl -X POST http://localhost:3000/api/brokers/ibkr/sync \
  -H "Authorization: Bearer YOUR_INTERNAL_SYNC_SECRET"
```

---

## 🎉 Next Steps

**You're ready to use IBKR integration!**

### For Production Deployment:
1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Update callback URL in IBKR portal to `https://yourdomain.com/api/brokers/ibkr/callback`
3. Set up cron job for token keepalive (see [IBKR_IMPLEMENTATION.md](IBKR_IMPLEMENTATION.md#cron-job-setup-production))
4. Enable HTTPS (required for OAuth in production)

### Optional Enhancements:
- Set up automatic portfolio sync (every 6 hours)
- Add real-time quote updates
- Enable transaction history import
- Support multiple IBKR accounts

---

**Need help?** See [IBKR_IMPLEMENTATION.md](IBKR_IMPLEMENTATION.md) for detailed troubleshooting.
