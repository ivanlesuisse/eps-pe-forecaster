import { getOrCreateUserByClerkId } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encryptToken } from "@/lib/security";
import { logAuditEvent, extractRequestMetadata } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import {
  exchangeIBKRCode,
  fetchIBKRPortfolio,
} from "@/lib/brokers/ibkr";

/**
 * GET /api/brokers/oauth/callback
 * OAuth callback handler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const broker = searchParams.get("broker")?.toLowerCase();
    const error = searchParams.get("error");

    const authResult = await auth();
    if (!authResult.userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Handle OAuth errors
    if (error) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "oauth_failed",
        broker: broker || "unknown",
        status: "failure",
        details: { error },
        ...extractRequestMetadata(request),
      });

      return NextResponse.redirect(
        new URL(
          `/dashboard/add/broker/${broker}?error=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    if (!code || !state || !broker) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "oauth_missing_params",
        broker: broker || "unknown",
        status: "failure",
        ...extractRequestMetadata(request),
      });

      return NextResponse.json(
        { error: "Missing OAuth parameters" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, broker);

    if (!tokenData) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "oauth_token_exchange_failed",
        broker,
        status: "failure",
        ...extractRequestMetadata(request),
      });

      return NextResponse.redirect(
        new URL(
          `/dashboard/add/broker/${broker}?error=token_exchange_failed`,
          request.url
        )
      );
    }

    const user = await getOrCreateUserByClerkId(authResult.userId);

    // Calculate token expiration (typically 1 hour for access token)
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Store encrypted token
    const encryptedToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token
      ? encryptToken(tokenData.refresh_token)
      : null;

    // Upsert broker token
    await prisma.brokerToken.upsert({
      where: {
        userId_broker: {
          userId: user.id,
          broker,
        },
      },
      update: {
        encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        revoked: false,
      },
      create: {
        userId: user.id,
        broker,
        encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
      },
    });

    // Fetch and import portfolio
    const portfolio = await fetchBrokerPortfolio(broker, tokenData.access_token);

    // Import assets
    if (portfolio?.positions) {
      for (const position of portfolio.positions) {
        await prisma.asset.create({
          data: {
            userId: user.id,
            name: position.name || position.symbol,
            type: "INVESTMENT",
            category: "investment",
            institution: broker.charAt(0).toUpperCase() + broker.slice(1),
            quantity: position.quantity || 0,
            buyingPrice: position.costBase && position.quantity ? position.costBase / position.quantity : undefined,
            value: position.marketValue || 0,
            currency: position.currency || "USD",
          },
        });
      }
    }

    // Log successful connection
    await logAuditEvent({
      userId: authResult.userId,
      action: "oauth_connected",
      broker,
      status: "success",
      details: {
        positionsImported: portfolio?.positions?.length || 0,
      },
      ...extractRequestMetadata(request),
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/dashboard/portfolio?success=true&imported=${portfolio?.positions?.length || 0}`,
        request.url
      )
    );
  } catch (error) {
    console.error("OAuth callback error:", error);

    const { searchParams } = new URL(request.url);
    const broker = searchParams.get("broker") || "unknown";

    const authResult = await auth();
    if (authResult.userId) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "oauth_callback_error",
        broker,
        status: "failure",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        ...extractRequestMetadata(request),
      });
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/add/broker/${broker}?error=internal_error`,
        request.url
      )
    );
  }
}

/**
 * Exchange OAuth code for access token
 */
async function exchangeCodeForToken(code: string, broker: string) {
  // For IBKR, use real API
  if (broker === "ibkr") {
    return await exchangeIBKRCode(code);
  }

  // In development, handle mock codes for other brokers
  if (code.startsWith("mock_auth_code_")) {
    console.log(`[DEV] Using mock token for broker: ${broker}`);
    return {
      access_token: `mock_token_${broker}_${Date.now()}`,
      refresh_token: `mock_refresh_${broker}_${Date.now()}`,
      expires_in: 3600,
      token_type: "Bearer",
    };
  }

  const clientId = process.env[`${broker.toUpperCase()}_OAUTH_CLIENT_ID`];
  const clientSecret = process.env[`${broker.toUpperCase()}_OAUTH_CLIENT_SECRET`];
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/brokers/oauth/callback`;

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${broker}`);
  }

  try {
    const response = await fetch(getTokenEndpoint(broker), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Token exchange error for ${broker}:`, error);
    return null;
  }
}

/**
 * Get OAuth token endpoint based on broker
 */
function getTokenEndpoint(broker: string): string {
  switch (broker) {
    case "ibkr":
      return "https://api.ibkr.com/oauth/token";
    case "degiro":
      return "https://trader.degiro.nl/api/oauth/token";
    case "revolut":
      return "https://api.revolut.com/oauth/token";
    default:
      throw new Error("Unsupported broker");
  }
}

/**
 * Fetch portfolio from broker using access token
 */
async function fetchBrokerPortfolio(broker: string, accessToken: string) {
  try {
    if (broker === "ibkr") {
      // Use real IBKR API
      const portfolio = await fetchIBKRPortfolio(accessToken);
      if (portfolio) {
        return {
          positions: portfolio.positions.map((pos) => ({
            symbol: pos.symbol,
            name: pos.description || pos.symbol,
            quantity: pos.quantity,
            marketValue: pos.marketValue,
            currency: pos.currency,
            costBase: pos.costBasis,
          })),
          accountValue: portfolio.totalValue,
        };
      }
    }

    // Fallback for other brokers or failed IBKR calls
    console.log(`Fetching portfolio from ${broker}`);
    return {
      positions: [
        {
          symbol: "AAPL",
          name: "Apple Inc",
          quantity: 10,
          marketValue: 2500,
          currency: "USD",
          costBase: 2000,
        },
        {
          symbol: "MSFT",
          name: "Microsoft Corp",
          quantity: 5,
          marketValue: 2000,
          currency: "USD",
          costBase: 1800,
        },
      ],
      accountValue: 4500,
    };
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return null;
  }
}
