# IBKR Integration Guide

## Overview

This application integrates with Interactive Brokers (IBKR) using their **Web API v2** with OAuth 2.0 authentication, following the approach documented on IBKR's official API documentation.

## Architecture

### Authentication Flow

```
1. User clicks "Connect IBKR"
   ↓
2. App redirects to IBKR OAuth authorization endpoint
   ↓
3. User logs in to IBKR and grants permissions
   ↓
4. IBKR redirects back with authorization code
   ↓
5. App exchanges code for access token (server-to-server, secure)
   ↓
6. Token is encrypted and stored in database
   ↓
7. Portfolio data is immediately fetched and imported
```

### Security

- **Token Storage**: AES-256 encryption at rest, HTTPS in transit
- **Token Expiration**: Automatic refresh using refresh tokens
- **Audit Logging**: All operations logged with IP, user agent, timestamps
- **CSRF Protection**: State tokens prevent cross-site request forgery

## Setting Up IBKR OAuth Credentials

### Step 1: Register Your Application with IBKR

1. Go to [IBKR API Portal](https://www.interactivebrokers.com/en/trading/ib-api.php)
2. Navigate to "Account Management API" or "Web API Trading" (depending on your use case)
3. Fill out the onboarding form with:
   - **Firm Name**: Your company/app name
   - **Firm Type**: "Third Party Service Provider" or "Independent Software Developer"
   - **Use Cases**: Select "View Portfolio Data" and "Trading"
   - **Description**: "Swiss-FinTrack - Personal wealth management platform"

### Step 2: Obtain OAuth Credentials

After approval from IBKR, you'll receive:
- **Client ID**: Your application identifier
- **Client Secret**: Keep this secret! Don't commit to Git
- **OAuth Authorization endpoint**: `https://api.ibkr.com/oauth/authorize`
- **OAuth Token endpoint**: `https://api.ibkr.com/oauth/token`

### Step 3: Configure Environment Variables

Create a `.env.local` file (NOT committed to Git) with:

```bash
# Interactive Brokers OAuth Credentials
IBKR_OAUTH_CLIENT_ID=your_client_id_here
IBKR_OAUTH_CLIENT_SECRET=your_client_secret_here

# Security Keys (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_32_char_hex_string
JWT_SECRET=your_32_char_hex_string

# App URLs
NEXTAUTH_URL=https://your-app.com  # Use HTTPS in production
```

### Step 4: Update Redirect URI

In your IBKR application settings, set the Redirect URI to:
```
https://your-app.com/api/brokers/oauth/callback
```

(For development: `http://localhost:3000/api/brokers/oauth/callback`)

## API Endpoints

### 1. Initialize OAuth Flow

```bash
GET /api/brokers/oauth/authorize?broker=ibkr
```

**Response:**
```json
{
  "authorizationUrl": "https://api.ibkr.com/oauth/authorize?client_id=...",
  "state": "csrf_token_here"
}
```

### 2. OAuth Callback

```bash
GET /api/brokers/oauth/callback?code=AUTH_CODE&state=CSRF_TOKEN&broker=ibkr
```

Auto-redirects after successful token exchange and portfolio import.

### 3. Manual Portfolio Sync

```bash
GET /api/brokers/ibkr/sync
```

**Response:**
```json
{
  "success": true,
  "portfolioValue": 50000,
  "positions": 10,
  "lastSyncAt": "2026-02-21T12:00:00Z"
}
```

## IBKR Web API Data Retrieved

### Available Endpoints Used

1. **Account Information**
   - Account ID, type, status
   - Buying power, total account value
   - Endpoint: `GET /v2/accounts`

2. **Portfolio Positions**
   - Symbol, quantity, current market price
   - Market value, cost basis
   - Unrealized P&L and percentages
   - Endpoint: `GET /v2/portfolio/{accountId}/positions`

3. **Token Refresh** (automatic)
   - Keeps sessions alive without re-authentication
   - Endpoint: `POST /oauth/token` (grant_type=refresh_token)

## Implementation Details

### File Structure

```
src/
├── lib/
│   ├── brokers/
│   │   └── ibkr.ts                    # IBKR API integration
│   ├── security.ts                     # Encryption, JWT, OAuth state
│   └── audit.ts                        # Audit logging
├── app/api/
│   └── brokers/
│       ├── oauth/
│       │   ├── authorize/route.ts     # OAuth flow initiation
│       │   └── callback/route.ts      # OAuth callback handler
│       └── ibkr/
│           └── sync/route.ts          # Manual portfolio sync
```

### Key Functions in `src/lib/brokers/ibkr.ts`

```typescript
// Exchange OAuth authorization code for access token
exchangeIBKRCode(code: string): Promise<TokenResponse>

// Fetch portfolio positions and account value
fetchIBKRPortfolio(accessToken: string): Promise<IBKRPortfolio>

// Get account information
fetchIBKRAccountInfo(accessToken: string): Promise<IBKRAccountInfo>

// Refresh access token using refresh token
refreshIBKRToken(refreshToken: string): Promise<TokenResponse>

// Get real-time market data for a symbol
getIBKRMarketData(accessToken: string, symbol: string): Promise<any>
```

## Token Management

### Automatic Refresh

When importing portfolio or syncing:
1. Check if token is expired
2. If expired and refresh token exists, automatically refresh
3. Store new token (encrypted)
4. Continue with portfolio fetch

### Token Lifecycle

- **Lifespan**: 1 hour (3600 seconds) - configurable in callback
- **Refresh**: Automatic before expiration
- **Storage**: Encrypted with AES-256 using `ENCRYPTION_KEY`
- **Audit**: All refresh attempts logged

## Development vs Production

### Development (`NODE_ENV=development`)

- Mock OAuth available for testing (click "Skip & Auto-Authorize")
- No real IBKR connection required
- Test all flows without credentials

### Production (`NODE_ENV=production`)

- Only real OAuth flows enabled
- Real IBKR credentials required
- HTTPS enforced
- Token refresh enabled

## Testing Flows

### Test 1: Mock OAuth (Development Only)

1. Navigate to `/dashboard/add` 
2. Select "Interactive Brokers"
3. Click "Connect with IBKR"
4. Choose "Skip & Auto-Authorize" (dev only)
5. Portfolio auto-imports with mock data

### Test 2: Real OAuth (With IBKR Credentials)

1. Configure `.env.local` with real credentials
2. Navigate to `/dashboard/add`
3. Select "Interactive Brokers"
4. Click "Connect with IBKR"
5. Log in to IBKR
6. Grant portfolio permissions
7. Real portfolio data imports

### Test 3: Manual Sync

After connecting:
```bash
curl http://localhost:3000/api/brokers/ibkr/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## IBKR API Documentation References

- **Web API Overview**: https://www.interactivebrokers.com/campus/ibkr-api-page/web-api/
- **Web API Trading Docs**: https://www.interactivebrokers.com/campus/ibkr-api-page/web-api-trading/
- **OAuth 2.0 Details**: https://ndcdocs.interactivebrokers.com/chapter/9/en_US/Webapi/OAuth.html
- **Portfolio API**: https://ndcdocs.interactivebrokers.com/chapter/9/en_US/Webapi/Portfolio-API.html
- **API Support**: api-solutions@interactivebrokers.com

## Troubleshooting

### "Missing OAuth credentials" Error

**Solution**: Ensure `IBKR_OAUTH_CLIENT_ID` and `IBKR_OAUTH_CLIENT_SECRET` are set in `.env.local`

### Token Exchange Fails

**Solution**: 
- Check Redis/session storage is working
- Verify state token matches
- Check IBKR OAuth endpoint is accessible
- Review IBKR error message in console logs

### Portfolio Not Importing

**Solution**:
- Verify IBKR account has open positions
- Check token expiration time
- Review audit logs at `SELECT * FROM AuditLog WHERE action='portfolio_synced'`

### "Token Refresh Failed"

**Solution**:
- Re-connect IBKR account (OAuth flow)
- Verify refresh token isn't revoked by IBKR
- Check `.env` has `ENCRYPTION_KEY` set

## What's Different from Finary

**Why direct IBKR integration instead of aggregators?**

| Aspect | Finary | Swiss-FinTrack |
|--------|--------|-----------------|
| Approach | Aggregators (Powens, Plaid) | Direct IBKR API |
| Setup | Pre-integrated 1800+ institutions | Broker-specific configuration |
| Control | Less control, standardized data | Full control, custom workflows |
| Cost | Aggregator fees | Minimal (IBKR API free) |
| Real-time data | 96.5% daily success rate | IBKR's real-time API |
| Scope | Multi-broker generalist | Specialist IBKR integration |

**Decision**: For a specialized wealth management app focused on power traders, direct API integration provides better performance and richer data access than generic aggregators.
