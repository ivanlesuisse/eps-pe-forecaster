# 🚀 TO-DO: Configure IBKR OAuth (Required for Connection)

**Status:** ⏳ NOT STARTED  
**Time to Complete:** ~15 minutes  
**Blocker:** IBKR connection will not work until this is done

---

## Error Fix Summary

**Problem:** 404 Error when clicking "Connecter IBKR"  
**Root Cause:** Missing IBKR OAuth credentials in `.env.local`  
**Solution:** Follow the 5 steps below

---

## ✅ Step 1: Generate Encryption Keys & Secrets (2 minutes)

Run these commands in your terminal and **copy the outputs**:

```bash
# Generate encryption key
node -e "console.log('ENCRYPTION_KEY_BASE64=' + require('crypto').randomBytes(32).toString('base64'))"

# Generate OAuth state secret
node -e "console.log('OAUTH_STATE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate internal sync secret
node -e "console.log('INTERNAL_SYNC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate cron secret
node -e "console.log('CRON_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Save these outputs** — you'll need them in Step 3.

---

## ✅ Step 2: Generate RSA Key Pair (2 minutes)

Run these commands:

```bash
# Generate private key
openssl genrsa -out ibkr_private.pem 2048

# Extract public key (you'll upload this to IBKR)
openssl rsa -in ibkr_private.pem -pubout -out ibkr_public.pem

# Format private key for .env.local (single line with \n escapes)
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ibkr_private.pem > ibkr_private_formatted.txt
```

**Keep these files:**
- `ibkr_public.pem` — Upload to IBKR
- `ibkr_private_formatted.txt` — Copy to `.env.local`

---

## ✅ Step 3: Create & Configure `.env.local` (2 minutes)

```bash
# Copy the example template
cp .env.example .env.local

# Edit the file
nano .env.local
```

**Add these variables** (use values from Steps 1 & 2):

```bash
# ========================================
# IBKR OAUTH 1.0a CREDENTIALS
# ========================================
IBKR_CONSUMER_KEY=your_consumer_key_from_ibkr_here

# Private RSA key (paste from ibkr_private_formatted.txt)
IBKR_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"

# ========================================
# ENCRYPTION & SECURITY (from Step 1)
# ========================================
ENCRYPTION_KEY_BASE64=paste_your_generated_key_here
OAUTH_STATE_SECRET=paste_your_generated_secret_here
INTERNAL_SYNC_SECRET=paste_your_generated_secret_here
CRON_SECRET=paste_your_generated_secret_here

# ========================================
# APP CONFIGURATION
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Save file** (Ctrl+X → Y → Enter in nano)

---

## ✅ Step 4: Register OAuth App in IBKR (5 minutes)

### 4a. Log in to IBKR

1. Go to [IBKR Client Portal](https://www.interactivebrokers.com/sso/Login)
2. Enter your credentials
3. Click **User Settings** (gear icon)

### 4b. Navigate to OAuth Settings

1. Click **API** in the left menu
2. Click **Settings**
3. Find **OAuth Applications** section
4. Click **Create New Application**

### 4c. Fill in Application Details

| Field | Value |
|-------|-------|
| **Application Name** | Swiss FinTrack |
| **OAuth Type** | OAuth 1.0a (**NOT** 2.0) |
| **Callback URL** | `http://localhost:3000/api/brokers/ibkr/callback` |
| **Permissions** | ✅ Read Portfolio Data |

### 4d. Upload Public Key

1. Click **Browse** next to "Public Key"
2. Select your `ibkr_public.pem` file
3. Click **Upload**

### 4e. Get Consumer Key

1. After creation, you'll see **Consumer Key** displayed
2. **Copy this value**
3. Paste it in `.env.local` as `IBKR_CONSUMER_KEY=<value>`

---

## ✅ Step 5: Restart Dev Server & Test (1 minute)

```bash
# Restart the dev server
npm run dev
```

**Test the connection:**

1. Navigate to: [http://localhost:3001/dashboard/ibkr](http://localhost:3001/dashboard/ibkr)
   - (Or port 3000 if available)

2. Click **"Connecter IBKR"** button

3. **Expected behavior:**
   - ✅ Redirected to **IBKR's official login page** (not 404 error)
   - ✅ You can log in with your IBKR credentials
   - ✅ After authorizing, redirected back to app
   - ✅ Connection status shows "Connecté ✅"
   - ✅ Position count displays

---

## 📋 Verification Checklist

- [ ] Step 1: Generated 4 secrets using `node -e` commands
- [ ] Step 2: Generated RSA key pair with `openssl`
- [ ] Step 3: Created `.env.local` with all 8 environment variables
- [ ] Step 4: Registered OAuth app in IBKR and got Consumer Key
- [ ] Step 5: Restarted dev server with `npm run dev`
- [ ] ✅ Clicked "Connecter IBKR" and redirected to IBKR login (not 404)

---

## 🆘 Troubleshooting

### "Still getting 404 error"
- Verify `.env.local` exists in project root
- Check `IBKR_CONSUMER_KEY` is set correctly (no spaces)
- Check `IBKR_PRIVATE_KEY_PEM` has `\n` (not actual line breaks)
- Restart dev server: `npm run dev`

### "Invalid signature from IBKR"
- Public key uploaded to IBKR must match your private key
- Verify you're using the same `ibkr_public.pem` that was generated with this private key

### "Redirect URI mismatch"
- Callback URL in IBKR must **exactly** match: `http://localhost:3000/api/brokers/ibkr/callback`
- No trailing slash
- Use `localhost`, not `127.0.0.1`

### "Connection timeout"
- Check your internet connection
- Verify IBKR API is reachable: `curl https://api.ibkr.com/`

---

## 📚 Reference

- **Full Guide:** [IBKR_IMPLEMENTATION.md](IBKR_IMPLEMENTATION.md)
- **Quick Start:** [IBKR_QUICKSTART.md](IBKR_QUICKSTART.md)
- **Status Report:** [IBKR_STATUS.md](IBKR_STATUS.md)
- **IBKR API Docs:** https://ndcdocs.interactivebrokers.com/

---

**Last Updated:** February 25, 2026  
**Status:** ⏳ PENDING CONFIGURATION
