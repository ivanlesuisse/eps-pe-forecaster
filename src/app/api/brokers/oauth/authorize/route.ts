import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOAuthState } from "@/lib/security";
import { logAuditEvent } from "@/lib/audit";

/**
 * GET /api/brokers/oauth/authorize
 * Initiate OAuth flow with broker
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const broker = searchParams.get("broker")?.toLowerCase();

    if (!broker || !["ibkr", "degiro", "revolut"].includes(broker)) {
      return NextResponse.json({ error: "Invalid broker" }, { status: 400 });
    }

    // Generate CSRF state token
    const state = generateOAuthState();
    
    // Create OAuth redirect URL based on broker
    const redirectUrl = getOAuthRedirectUrl(broker, state);

    await logAuditEvent({
      userId: authResult.userId,
      action: "oauth_initiated",
      broker,
      status: "success",
    });

    // Return authorization URL
    return NextResponse.json({
      authorizationUrl: redirectUrl,
      state, // Client should store this
    });
  } catch (error) {
    console.error("OAuth authorize error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    );
  }
}

/**
 * Get OAuth redirect URL based on broker
 */
function getOAuthRedirectUrl(broker: string, state: string): string {
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/brokers/oauth/callback`;
  const clientId = process.env[`${broker.toUpperCase()}_OAUTH_CLIENT_ID`];
  const isDev = process.env.NODE_ENV === "development";

  if (!clientId) {
    throw new Error(`Missing OAuth client ID for ${broker}`);
  }

  // In development, use mock OAuth URLs for testing
  if (isDev) {
    const mockAuthUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/brokers/oauth/mock-authorize`;
    return `${mockAuthUrl}?broker=${broker}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  switch (broker) {
    case "ibkr":
      // Interactive Brokers OAuth 2.0
      // Docs: https://ndcdocs.interactivebrokers.com/chapter/9/en_US/Webapi/OAuth.html
      return `https://api.ibkr.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=read%20portfolio%20accounts`;

    case "degiro":
      // DEGIRO OAuth
      return `https://trader.degiro.nl/login/secure/register?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    case "revolut":
      // Revolut OAuth
      return `https://revolut.com/api/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

    default:
      throw new Error("Unsupported broker");
  }
}
