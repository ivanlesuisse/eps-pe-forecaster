/**
 * Interactive Brokers Web API Integration
 * Implements OAuth 2.0 and portfolio data fetching from IBKR Web API
 */

interface IBKRPortfolioPosition {
  symbol: string;
  description?: string;
  currency: string;
  quantity: number;
  marketPrice: number;
  marketValue: number;
  costBasis?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
}

interface IBKRPortfolio {
  accountId: string;
  positions: IBKRPortfolioPosition[];
  totalValue: number;
  updatedAt: Date;
}

interface IBKRAccountInfo {
  accountId: string;
  accountType: string;
  accountStatus: string;
  currency: string;
  buyingPower: number;
  totalValue: number;
}

interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Exchange OAuth code for access token (IBKR Web API v2)
 */
export async function exchangeIBKRCode(code: string): Promise<TokenExchangeResponse | null> {
  try {
    const clientId = process.env.IBKR_OAUTH_CLIENT_ID;
    const clientSecret = process.env.IBKR_OAUTH_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/brokers/oauth/callback`;

    if (!clientId || !clientSecret) {
      console.error("Missing IBKR OAuth credentials");
      return null;
    }

    const response = await fetch("https://api.ibkr.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("IBKR token exchange failed:", error);
      return null;
    }

    const tokenData: TokenExchangeResponse = await response.json();
    return tokenData;
  } catch (error) {
    console.error("Error exchanging IBKR code:", error);
    return null;
  }
}

/**
 * Fetch portfolio data from IBKR Web API
 * https://ndcdocs.interactivebrokers.com/chapter/9/en_US/Webapi/Portfolio-API.html
 */
interface AccountsData {
  accounts?: Array<{ accountId?: string }>;
}

interface PositionData {
  positions?: Array<Record<string, unknown>>;
}

export async function fetchIBKRPortfolio(
  accessToken: string
): Promise<IBKRPortfolio | null> {
  try {
    // Get account info first
    const accountsResponse = await fetch("https://api.ibkr.com/v2/accounts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!accountsResponse.ok) {
      console.error("Failed to fetch IBKR accounts");
      return null;
    }

    const accountsData = await accountsResponse.json() as AccountsData;
    const accountId = accountsData.accounts?.[0]?.accountId;

    if (!accountId) {
      console.error("No accounts found in IBKR response");
      return null;
    }

    // Get portfolio for the account
    const portfolioResponse = await fetch(
      `https://api.ibkr.com/v2/portfolio/${accountId}/positions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!portfolioResponse.ok) {
      console.error("Failed to fetch IBKR portfolio");
      return null;
    }

    const portfolioData = await portfolioResponse.json() as PositionData;

    // Transform IBKR positions to our format
    const positions: IBKRPortfolioPosition[] = (
      portfolioData.positions || []
    ).map((pos) => {
      const p = pos as Record<string, unknown>;
      const contractDetails = p.contractDetails as Record<string, unknown> | undefined;
      return {
        symbol: String(contractDetails?.symbol || p.symbol || ""),
        description: String(contractDetails?.description || p.description || ""),
        currency: String(p.currency || contractDetails?.currency || "USD"),
        quantity: Number(p.quantity || 0),
        marketPrice: Number(p.marketPrice || 0),
        marketValue: Number(p.marketValue || 0),
        costBasis: Number(p.costBasis || 0),
        unrealizedPL: Number(p.unrealizedPL || 0),
        unrealizedPLPercent: Number(p.unrealizedPLPercent || 0),
      };
    });

    // Calculate total value
    const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);

    return {
      accountId,
      positions,
      totalValue,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error fetching IBKR portfolio:", error);
    return null;
  }
}

/**
 * Get account information from IBKR Web API
 */
export async function fetchIBKRAccountInfo(
  accessToken: string
): Promise<IBKRAccountInfo | null> {
  try {
    const response = await fetch("https://api.ibkr.com/v2/accounts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch IBKR account info");
      return null;
    }

    const data = await response.json();
    const account = data.accounts?.[0];

    if (!account) {
      return null;
    }

    return {
      accountId: account.accountId,
      accountType: account.accountType,
      accountStatus: account.status,
      currency: account.currency || "USD",
      buyingPower: account.buyingPower || 0,
      totalValue: account.totalValue || 0,
    };
  } catch (error) {
    console.error("Error fetching IBKR account info:", error);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshIBKRToken(
  refreshToken: string
): Promise<TokenExchangeResponse | null> {
  try {
    const clientId = process.env.IBKR_OAUTH_CLIENT_ID;
    const clientSecret = process.env.IBKR_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing IBKR OAuth credentials");
      return null;
    }

    const response = await fetch("https://api.ibkr.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      console.error("Failed to refresh IBKR token");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing IBKR token:", error);
    return null;
  }
}

/**
 * Get real-time market data for a position
 */
export async function getIBKRMarketData(
  accessToken: string,
  symbol: string
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      `https://api.ibkr.com/v2/market-data/reference/${symbol}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching market data:", error);
    return null;
  }
}
