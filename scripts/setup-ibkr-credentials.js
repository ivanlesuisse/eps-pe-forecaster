#!/usr/bin/env node

/**
 * IBKR Credentials Setup Script
 * 
 * This script helps you configure IBKR OAuth credentials securely.
 * Run: node scripts/setup-ibkr-credentials.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("\n🔐 IBKR OAuth Credentials Setup\n");
  console.log("This script will help you configure IBKR credentials securely.\n");

  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envLocalPath)) {
    console.log(
      "⚠️  .env.local already exists. Backing up to .env.local.backup"
    );
    fs.copyFileSync(envLocalPath, envLocalPath + ".backup");
  }

  // Get credentials from user
  console.log("📝 Enter your IBKR OAuth credentials:");
  console.log("   (Find these in your IBKR App Registration)\n");

  const clientId = await question("Client ID: ");
  const clientSecret = await question("Client Secret: ");

  if (!clientId || !clientSecret) {
    console.error("\n❌ Error: Both Client ID and Secret are required!");
    process.exit(1);
  }

  // Generate encryption keys if not present
  console.log("\n🔑 Generating encryption keys...");
  const encryptionKey = crypto.randomBytes(32).toString("hex");
  const jwtSecret = crypto.randomBytes(32).toString("hex");

  // Check if keys exist in .env (development defaults)
  let currentEnv = "";
  if (fs.existsSync(envPath)) {
    currentEnv = fs.readFileSync(envPath, "utf-8");
  }

  // Build .env.local content
  let envLocal = `# IBKR OAuth Credentials (DO NOT COMMIT)
IBKR_OAUTH_CLIENT_ID=${clientId}
IBKR_OAUTH_CLIENT_SECRET=${clientSecret}

# Security Keys (generated on ${new Date().toISOString()})
ENCRYPTION_KEY=${encryptionKey}
JWT_SECRET=${jwtSecret}

# NEXTAUTH_URL should be your production domain
# NEXTAUTH_URL=https://your-domain.com

# For development
NEXTAUTH_URL=http://localhost:3000

# Copy other variables from .env if needed
`;

  // Write to .env.local
  fs.writeFileSync(envLocalPath, envLocal);

  console.log("\n✅ Configuration saved to .env.local\n");

  console.log("📋 Credentials stored:");
  console.log(`   • Client ID: ${clientId}`);
  console.log(`   • Client Secret: ${clientSecret.substring(0, 8)}...`);
  console.log(`   • Encryption Key: ${encryptionKey.substring(0, 8)}...`);
  console.log(`   • JWT Secret: ${jwtSecret.substring(0, 8)}...\n`);

  console.log("⚠️  IMPORTANT:");
  console.log("   1. .env.local is in .gitignore - NEVER commit it");
  console.log("   2. Keep your Client Secret confidential");
  console.log("   3. Regenerate keys if they're ever exposed");
  console.log("   4. Update NEXTAUTH_URL for production\n");

  console.log("✨ Next steps:");
  console.log("   1. npm run dev");
  console.log("   2. Go to /dashboard/add");
  console.log("   3. Click 'Connect with IBKR'");
  console.log("   4. Log in with your IBKR account");
  console.log("   5. Grant portfolio access permission\n");

  rl.close();
}

main().catch((error) => {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
});
