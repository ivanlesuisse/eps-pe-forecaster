# 🏦 IBKR OAuth Integration — Implementation Complete

## ✅ What Was Implemented

### Security Infrastructure
- **AES-256-GCM Encryption** ([`src/lib/encryption.ts`](src/lib/encryption.ts))
  - Token encryption/decryption with unique IVs and auth tags
  - Serialization for database storage
  
- **OAuth 1.0a RSA-SHA256 Signing** ([`src/lib/ibkr/oauth1.ts`](src/lib/ibkr/oauth1.ts))
  - RFC 3986 parameter encoding
  - Signature base string construction
  - Request signing with private RSA key
  
- **CSRF State Protection** ([`src/lib/ibkr/state.ts`](src/lib/ibkr/state.ts))
  - Signed state cookies with HMAC-SHA256
  - 10-minute TTL with automatic expiration
  
- **Audit Logging** ([`src/lib/audit.ts`](src/lib/audit.ts))
  - All OAuth events logged to database
  - Connection, sync, disconnect, failures tracked

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/brokers/ibkr/connect` | POST | Initiates OAuth flow, returns authorization URL |
| `/api/brokers/ibkr/callback` | GET | Handles OAuth callback, exchanges code for token |
| `/api/brokers/ibkr/sync` | POST | Syncs portfolio positions from IBKR to Asset table |
| `/api/brokers/ibkr/disconnect` | DELETE | Revokes token locally + calls IBKR logout |
| `/api/brokers/ibkr/connection` | GET | Returns connection status + portfolio summary |
| `/api/cron/ibkr/tickle` | POST | Keepalive cron job (prevents 24h token expiry) |

### IBKR Client ([`src/lib/ibkr/client.ts`](src/lib/ibkr/client.ts))
- `getRequestToken()` — OAuth 1.0a request token
- `getAuthorizationUrl()` — Builds IBKR authorization URL
- `getAccessToken()` — Exchanges verifier for access token
- `ibkrApiGet()` — Signed GET requests to IBKR API
- `ibkrApiPost()` — Signed POST requests (logout, tickle)
- `fetchPortfolioBundle()` — Fetches accounts, positions, summary, ledger

### Dashboard UI ([`src/app/dashboard/ibkr/page.tsx`](src/app/dashboard/ibkr/page.tsx))
- Connection status display
- One-click OAuth connect button
- Manual sync trigger
- Disconnect button
- Real-time position count + portfolio value

---

## 🔐 Required Environment Variables

Add these to your `.env.local`:

```bash
# IBKR OAuth 1.0a Credentials
IBKR_CONSUMER_KEY=your_consumer_key_here
IBKR_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Encryption & Security
ENCRYPTION_KEY_BASE64=generate_32_byte_key_in_base64
OAUTH_STATE_SECRET=random_secret_for_state_hmac
INTERNAL_SYNC_SECRET=random_secret_for_background_sync

# Cron Job Authentication
CRON_SECRET=random_secret_for_tickle_endpoint

# App URL (for OAuth callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: IBKR API Base URLs (defaults provided)
IBKR_OAUTH_BASE_URL=https://api.ibkr.com/v1/api/oauth
IBKR_API_BASE_URL=https://api.ibkr.com/v1/api
```

### How to Generate Secrets

```bash
# Generate 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎫 How to Get IBKR OAuth Credentials

### Step 1: Register for IBKR API Access
1. Go to [IBKR Client Portal](https://www.interactivebrokers.com/sso/Login)
2. Navigate to **User Settings** → **API** → **Settings**
3. Request API access if not already enabled

### Step 2: Generate OAuth Consumer Key
1. In **API Settings**, create a new **OAuth Application**
2. Set the **Redirect URI** to: `https://yourdomain.com/api/brokers/ibkr/callback`
   - For local dev: `http://localhost:3000/api/brokers/ibkr/callback`
3. Select **OAuth 1.0a** (not 2.0)
4. Copy your **Consumer Key**

### Step 3: Generate RSA Key Pair
```bash
# Generate private key
openssl genrsa -out ibkr_private.pem 2048

# Extract public key
openssl rsa -in ibkr_private.pem -pubout -out ibkr_public.pem

# Convert private key to single-line format for .env
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ibkr_private.pem
```

### Step 4: Upload Public Key to IBKR
1. In **API Settings** → **OAuth Application**, upload `ibkr_public.pem`
2. IBKR validates your requests using this public key

---

## 🔄 OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Connect IBKR" in /dashboard/ibkr           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/brokers/ibkr/connect                          │
│    ├─ Generate signed state cookie (CSRF protection)       │
│    ├─ Call IBKR /request_token (OAuth 1.0a signed)         │
│    ├─ Get oauth_token + oauth_token_secret                 │
│    └─ Return authorization URL to frontend                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirect to IBKR Authorization Page                     │
│    User logs in with IBKR credentials (on IBKR's servers)  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. IBKR redirects to /api/brokers/ibkr/callback            │
│    ?oauth_token=XXX&oauth_verifier=YYY&state=ZZZ           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GET /api/brokers/ibkr/callback                          │
│    ├─ Validate state cookie matches query param            │
│    ├─ Exchange oauth_verifier for access_token             │
│    ├─ Encrypt access_token with AES-256-GCM                │
│    ├─ Store in BrokerToken table (userId_broker unique)    │
│    ├─ Log success to AuditLog table                        │
│    └─ Trigger background sync POST /api/brokers/ibkr/sync  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. POST /api/brokers/ibkr/sync (background)                │
│    ├─ Decrypt access_token from database                   │
│    ├─ Call IBKR /portfolio/accounts (signed GET)           │
│    ├─ For each account:                                    │
│    │   ├─ Fetch /portfolio/{id}/positions                  │
│    │   ├─ Fetch /portfolio/{id}/summary                    │
│    │   └─ Fetch /portfolio/{id}/ledger                     │
│    ├─ Normalize positions to Asset schema                  │
│    ├─ Delete old IBKR assets (institution = "IBKR")        │
│    ├─ Bulk insert new positions in transaction             │
│    └─ Log sync success with position count                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirect to /dashboard/ibkr?connected=1                 │
│    User sees portfolio positions in Asset table            │
│    Display on /dashboard (via AssetsList component)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Instructions

### 1. Set Up Environment
```bash
# Copy .env.example to .env.local (if not already done)
cp .env.example .env.local

# Add your IBKR credentials (see above section)
nano .env.local

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test OAuth Flow
1. Navigate to [http://localhost:3000/dashboard/ibkr](http://localhost:3000/dashboard/ibkr)
2. Click **"Connecter IBKR"**
3. You'll be redirected to IBKR login page
4. Log in with your IBKR credentials
5. Authorize the app
6. You'll be redirected back to `/dashboard/ibkr?connected=1`
7. Check connection status shows "Connecté"
8. Verify positions count > 0

### 4. Verify Database
```bash
npx prisma studio
```
Check tables:
- `BrokerToken` — Should have 1 row with encrypted token
- `Asset` — Should have positions with `institution = "IBKR"`
- `AuditLog` — Should have events: `broker_connect_initiated`, `broker_connect_success`, `broker_data_sync`

### 5. Test Manual Sync
1. Go to `/dashboard/ibkr`
2. Click **"Synchroniser"**
3. Wait 2-5 seconds
4. Positions should update

### 6. Test Disconnect
1. Click **"Déconnecter"**
2. Connection status should show "Non connecté"
3. Check `BrokerToken` table — row should be deleted

---

## ⏰ Cron Job Setup (Production)

The IBKR access token expires after 24 hours of inactivity. Set up a cron job to call `/tickle` every 23 hours.

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/ibkr/tickle",
      "schedule": "0 */23 * * *"
    }
  ]
}
```

### Manual Cron (crontab)
```bash
# Add to crontab -e
0 */23 * * * curl -X POST https://yourdomain.com/api/cron/ibkr/tickle -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔍 Troubleshooting

### "Missing IBKR_CONSUMER_KEY"
- Verify `.env.local` has `IBKR_CONSUMER_KEY` set
- Restart dev server after changing env vars

### "Invalid signature" from IBKR
- Check your private key format (must include `\n` escapes)
- Verify public key uploaded to IBKR matches your private key
- Ensure `IBKR_CONSUMER_KEY` matches the one in IBKR portal

### "Unauthorized" on callback
- Check `NEXT_PUBLIC_APP_URL` matches your actual domain
- Verify callback URL in IBKR portal matches exactly
- For localhost, use `http://localhost:3000` (not `127.0.0.1`)

### Positions not syncing
- Check browser console for errors
- Check server logs: `npm run dev` output
- Verify access token not expired (< 24h old)
- Manually trigger sync: `POST /api/brokers/ibkr/sync`

### "Token expired and no refresh token"
- IBKR OAuth 1.0a doesn't provide refresh tokens
- User must re-authorize via OAuth flow
- Set up cron job to prevent expiration

---

## 📊 Audit Log Events

All IBKR operations are logged to `AuditLog` table:

| Event | When | Status |
|-------|------|--------|
| `broker_connect_initiated` | User clicks connect button | success |
| `broker_connect_success` | Token stored successfully | success |
| `broker_connect_failed` | OAuth error or invalid state | failure |
| `broker_data_sync` | Portfolio positions imported | success |
| `broker_disconnect` | User disconnects IBKR | success |
| `token_refresh_success` | Tickle cron job succeeded | success |
| `token_refresh_failed` | Tickle cron job failed | failure |
| `unauthorized_access_attempt` | Invalid CSRF state detected | failure |

View logs:
```typescript
import { getUserAuditLogs } from '@/lib/audit';

const logs = await getUserAuditLogs(userId, 50);
```

---

## 🚀 Next Steps

### Recommended Improvements
1. **Add retry logic** for transient IBKR API failures
2. **Implement webhook** for IBKR account updates (if supported)
3. **Add position-level refresh** instead of full sync
4. **Cache IBKR responses** (Redis) to reduce API calls
5. **Add real-time quotes** via IBKR market data API
6. **Support multiple IBKR accounts** per user

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong encryption key (32 random bytes)
- [ ] Enable HTTPS (required for OAuth in prod)
- [ ] Set up cron job for token keepalive
- [ ] Configure error alerting (Sentry, Datadog)
- [ ] Enable rate limiting on API routes
- [ ] Add monitoring for failed sync attempts
- [ ] Test token expiration handling
- [ ] Verify GDPR compliance (data deletion)

---

## 📚 References

- [IBKR Web API Docs](https://ndcdocs.interactivebrokers.com/)
- [OAuth 1.0a RFC 5849](https://tools.ietf.org/html/rfc5849)
- [IBKR Client Portal API](https://interactivebrokers.github.io/cpwebapi/)
- [Prisma Schema Guide](https://www.prisma.io/docs/concepts/components/prisma-schema)

---

**Implementation Date:** February 25, 2026  
**Status:** ✅ Production-Ready (after env vars configured)  
**Security Level:** High (AES-256-GCM + OAuth 1.0a RSA-SHA256)
