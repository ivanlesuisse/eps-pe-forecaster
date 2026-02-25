# IBKR Setup Checklist

## Prerequisites
- [ ] IBKR account with trading permissions
- [ ] IBKR account has some positions (stocks, ETFs, etc.)
- [ ] Node.js and npm installed
- [ ] Development server running (`npm run dev`)

## Step 1: Get IBKR OAuth Credentials
- [ ] Visit [IBKR API Portal](https://www.interactivebrokers.com/en/trading/ib-api.php)
- [ ] Contact api-solutions@interactivebrokers.com with:
  - Firm name: "Swiss-FinTrack"
  - Type: "Third Party Service Provider" 
  - Use cases: "Portfolio data access" + "Account management"
- [ ] Wait for approval (usually 1-2 weeks)
- [ ] Receive Client ID and Client Secret
- [ ] Save credentials securely (NOT in Git)

## Step 2: Configure Application
- [ ] Run: `node scripts/setup-ibkr-credentials.js`
- [ ] Enter Client ID when prompted
- [ ] Enter Client Secret when prompted
- [ ] Verify `.env.local` was created with 4 variables:
  - `IBKR_OAUTH_CLIENT_ID`
  - `IBKR_OAUTH_CLIENT_SECRET`
  - `ENCRYPTION_KEY`
  - `JWT_SECRET`
- [ ] Verify `.env.local` is in `.gitignore` (don't commit it)
- [ ] Restart dev server: `npm run dev`

## Step 3: Set Redirect URI in IBKR
- [ ] Log in to IBKR App Registration
- [ ] Find your registered app
- [ ] Add Redirect URI:
  - **Development**: `http://localhost:3000/api/brokers/oauth/callback`
  - **Production**: `https://your-domain.com/api/brokers/oauth/callback`
- [ ] Save and verify

## Step 4: Test OAuth Flow
- [ ] Navigate to http://localhost:3000/dashboard/add
- [ ] Click "Browse by Broker" (if not visible, search "Interactive Brokers")
- [ ] Click "Interactive Brokers" card
- [ ] Click "Connect with Interactive Brokers"
- [ ] You should be redirected to IBKR login page
- [ ] Log in with your IBKR credentials
- [ ] Grant permission to access portfolio data
- [ ] Redirected back with portfolio imported

## Step 5: Verify Data Import
- [ ] Go to http://localhost:3000/dashboard/portfolio
- [ ] Should see your actual IBKR positions
- [ ] Check asset names, quantities, values
- [ ] Verify currencies are correct

## Step 6: Check Audit Logs
- [ ] In database, check `AuditLog` table:
  ```sql
  SELECT * FROM AuditLog 
  WHERE action IN ('oauth_connected', 'portfolio_synced') 
  ORDER BY createdAt DESC 
  LIMIT 10;
  ```
- [ ] Should see successful sync entries

## Step 7: Manual Sync (Optional)
- [ ] Call sync endpoint to re-fetch portfolio:
  ```
  GET http://localhost:3000/api/brokers/ibkr/sync
  ```
- [ ] Should return updated portfolio data

## Production Checklist
- [ ] [ ] Set `NEXTAUTH_URL=https://your-domain.com` in `.env.local`
- [ ] [ ] Use HTTPS in production
- [ ] [ ] Store credentials in secure secret manager (not .env.local)
- [ ] [ ] Set up database backups
- [ ] [ ] Enable audit log retention policy
- [ ] [ ] Monitor token refresh failures
- [ ] [ ] Set up alerts for failed sync operations

## Troubleshooting

### Issue: "Invalid client credentials"
- [ ] Verify Client ID and Secret are correct (check for spaces)
- [ ] Verify IBKR hasn't revoked the credentials
- [ ] Check `.env.local` file exists
- [ ] Restart dev server after changes

### Issue: "Invalid redirect URI"
- [ ] Verify redirect URI is in IBKR App settings
- [ ] Check exact match (case-sensitive, no trailing slashes)
- [ ] For dev: should be exactly `http://localhost:3000/api/brokers/oauth/callback`

### Issue: "Portfolio not importing"
- [ ] Check IBKR account has open positions
- [ ] Check browser console for errors
- [ ] Check server console for API errors
- [ ] Verify OAuth token is valid

### Issue: "Token refresh failed"
- [ ] Re-connect IBKR (OAuth flow)
- [ ] Check `ENCRYPTION_KEY` environment variable is set
- [ ] Check database has refresh token stored

## Helpful Resources

- IBKR Web API Docs: https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/
- OAuth Flow Diagram: https://ndcdocs.interactivebrokers.com/chapter/9/en_US/Webapi/OAuth.html
- IBKR Support: support@interactivebrokers.com
- Local Docs: See `IBKR_INTEGRATION.md` in project root

## Quick Test Commands

```bash
# Check if dev server is running
curl http://localhost:3000/api/health

# Check if IBKR integration is accessible
curl http://localhost:3000/api/brokers/oauth/authorize?broker=ibkr

# Manually sync portfolio (requires Clerk auth)
curl http://localhost:3000/api/brokers/ibkr/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# View recent audit logs
sqlite3 prisma/dev.db "SELECT userId, action, broker, status, createdAt FROM AuditLog ORDER BY createdAt DESC LIMIT 5;"
```

## Success Criteria ✅

Your IBKR integration is working when:
1. ✅ OAuth login redirects to IBKR
2. ✅ Real IBKR account used for login
3. ✅ Portfolio data displays in Swiss-FinTrack
4. ✅ Positions match your IBKR account
5. ✅ Quantities and values are accurate
6. ✅ Audit logs show successful OAuth operations
7. ✅ Manual sync updates portfolio
8. ✅ Can see encrypted tokens in database (not plaintext)
