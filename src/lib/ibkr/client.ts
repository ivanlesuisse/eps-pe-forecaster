import {
  ibkrSignedFetch,
  parseOAuthFormResponse,
} from "@/lib/ibkr/oauth1";

function getIbkrConfig() {
  const consumerKey = process.env.IBKR_CONSUMER_KEY;
  const privateKeyPem = process.env.IBKR_PRIVATE_KEY_PEM;
  const oauthBase =
    process.env.IBKR_OAUTH_BASE_URL || "https://api.ibkr.com/v1/api/oauth";
  const apiBase = process.env.IBKR_API_BASE_URL || "https://api.ibkr.com/v1/api";

  if (!consumerKey || !privateKeyPem) {
    throw new Error("Missing IBKR_CONSUMER_KEY or IBKR_PRIVATE_KEY_PEM");
  }

  return {
    consumerKey,
    privateKeyPem,
    oauthBase,
    apiBase,
  };
}

export async function getRequestToken(callbackUrl: string) {
  const config = getIbkrConfig();

  const response = await ibkrSignedFetch({
    method: "POST",
    url: `${config.oauthBase}/request_token`,
    consumerKey: config.consumerKey,
    privateKeyPem: config.privateKeyPem,
    callback: callbackUrl,
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`IBKR request token failed (${response.status})`);
  }

  const parsed = parseOAuthFormResponse(body);
  if (!parsed.oauth_token) {
    throw new Error("IBKR did not return oauth_token");
  }

  return {
    oauthToken: parsed.oauth_token,
    oauthTokenSecret: parsed.oauth_token_secret,
  };
}

export function getAuthorizationUrl(oauthToken: string) {
  const config = getIbkrConfig();
  return `${config.oauthBase}/authorize?oauth_token=${encodeURIComponent(oauthToken)}`;
}

export async function getAccessToken(options: {
  oauthToken: string;
  oauthVerifier: string;
}) {
  const config = getIbkrConfig();

  const response = await ibkrSignedFetch({
    method: "POST",
    url: `${config.oauthBase}/access_token`,
    consumerKey: config.consumerKey,
    privateKeyPem: config.privateKeyPem,
    token: options.oauthToken,
    verifier: options.oauthVerifier,
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`IBKR access token failed (${response.status})`);
  }

  const parsed = parseOAuthFormResponse(body);
  if (!parsed.oauth_token) {
    throw new Error("IBKR did not return access oauth_token");
  }

  return {
    oauthToken: parsed.oauth_token,
    oauthTokenSecret: parsed.oauth_token_secret,
  };
}

export async function ibkrApiGet(path: string, oauthToken: string) {
  const config = getIbkrConfig();

  const response = await ibkrSignedFetch({
    method: "GET",
    url: `${config.apiBase}${path}`,
    consumerKey: config.consumerKey,
    privateKeyPem: config.privateKeyPem,
    token: oauthToken,
  });

  if (!response.ok) {
    throw new Error(`IBKR API request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

export async function ibkrApiPost(path: string, oauthToken: string) {
  const config = getIbkrConfig();

  const response = await ibkrSignedFetch({
    method: "POST",
    url: `${config.apiBase}${path}`,
    consumerKey: config.consumerKey,
    privateKeyPem: config.privateKeyPem,
    token: oauthToken,
  });

  if (!response.ok) {
    throw new Error(`IBKR API request failed (${response.status}) for ${path}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function fetchPortfolioBundle(oauthToken: string) {
  const accounts = await ibkrApiGet("/portfolio/accounts", oauthToken);

  const normalizedAccounts = Array.isArray(accounts)
    ? accounts
    : Array.isArray(accounts?.accounts)
      ? accounts.accounts
      : [];

  const accountBundles = await Promise.all(
    normalizedAccounts.map(async (account) => {
      const accountId = String(account.id || account.accountId || account.acctId || "");
      if (!accountId) {
        return null;
      }

      const [positions, summary, ledger] = await Promise.all([
        ibkrApiGet(`/portfolio/${accountId}/positions`, oauthToken).catch(() => []),
        ibkrApiGet(`/portfolio/${accountId}/summary`, oauthToken).catch(() => ({})),
        ibkrApiGet(`/portfolio/${accountId}/ledger`, oauthToken).catch(() => ({})),
      ]);

      return {
        accountId,
        positions: Array.isArray(positions)
          ? positions
          : Array.isArray(positions?.positions)
            ? positions.positions
            : [],
        summary,
        ledger,
      };
    })
  );

  return {
    accounts: accountBundles.filter(Boolean),
  };
}
