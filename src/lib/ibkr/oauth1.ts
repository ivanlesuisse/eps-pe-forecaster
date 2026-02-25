import { createSign, randomBytes } from "crypto";

type QueryParams = Record<string, string>;

function rfc3986Encode(input: string): string {
  return encodeURIComponent(input).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function normalizeParams(params: QueryParams): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${rfc3986Encode(key)}=${rfc3986Encode(params[key])}`)
    .join("&");
}

function createSignatureBaseString(
  method: string,
  baseUrl: string,
  allParams: QueryParams
): string {
  return [
    method.toUpperCase(),
    rfc3986Encode(baseUrl),
    rfc3986Encode(normalizeParams(allParams)),
  ].join("&");
}

function normalizePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function signWithRsaSha256(baseString: string, privateKeyPem: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(baseString);
  signer.end();
  return signer.sign(normalizePrivateKey(privateKeyPem), "base64");
}

function parseUrlParams(url: string): QueryParams {
  const parsed = new URL(url);
  const result: QueryParams = {};

  parsed.searchParams.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
}

export function buildOAuthHeader(options: {
  method: string;
  url: string;
  consumerKey: string;
  privateKeyPem: string;
  token?: string;
  verifier?: string;
  callback?: string;
  bodyParams?: QueryParams;
}): string {
  const oauthParams: QueryParams = {
    oauth_consumer_key: options.consumerKey,
    oauth_nonce: randomBytes(24).toString("hex"),
    oauth_signature_method: "RSA-SHA256",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  if (options.token) {
    oauthParams.oauth_token = options.token;
  }

  if (options.verifier) {
    oauthParams.oauth_verifier = options.verifier;
  }

  if (options.callback) {
    oauthParams.oauth_callback = options.callback;
  }

  const allParams: QueryParams = {
    ...parseUrlParams(options.url),
    ...(options.bodyParams || {}),
    ...oauthParams,
  };

  const signatureBaseString = createSignatureBaseString(
    options.method,
    getBaseUrl(options.url),
    allParams
  );

  oauthParams.oauth_signature = signWithRsaSha256(
    signatureBaseString,
    options.privateKeyPem
  );

  return (
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((key) => `${rfc3986Encode(key)}="${rfc3986Encode(oauthParams[key])}"`)
      .join(", ")
  );
}

export async function ibkrSignedFetch(options: {
  method: "GET" | "POST" | "DELETE";
  url: string;
  consumerKey: string;
  privateKeyPem: string;
  token?: string;
  verifier?: string;
  callback?: string;
  bodyParams?: QueryParams;
}) {
  const body = options.bodyParams
    ? new URLSearchParams(options.bodyParams).toString()
    : undefined;

  const authorization = buildOAuthHeader({
    ...options,
    bodyParams: options.bodyParams,
  });

  return fetch(options.url, {
    method: options.method,
    headers: {
      Authorization: authorization,
      Accept: "application/json, application/x-www-form-urlencoded, text/plain",
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body } : {}),
    cache: "no-store",
  });
}

export function parseOAuthFormResponse(responseText: string): QueryParams {
  const params = new URLSearchParams(responseText);
  const result: QueryParams = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}
