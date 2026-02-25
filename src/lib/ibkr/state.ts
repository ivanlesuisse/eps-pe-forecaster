import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";

const STATE_COOKIE = "ibkr_oauth_state";
const TEN_MINUTES_SECONDS = 10 * 60;

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing OAUTH_STATE_SECRET (or fallback JWT_SECRET)");
  }

  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getStateSecret()).update(payload).digest("hex");
}

export async function createOAuthState(): Promise<string> {
  const state = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + TEN_MINUTES_SECONDS * 1000;
  const payload = `${state}.${expiresAt}`;
  const signature = signPayload(payload);
  const cookieValue = `${payload}.${signature}`;

  (await cookies()).set(STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TEN_MINUTES_SECONDS,
    path: "/",
  });

  return state;
}

export async function validateOAuthState(stateFromCallback: string | null): Promise<boolean> {
  if (!stateFromCallback) {
    return false;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(STATE_COOKIE)?.value;

  if (!raw) {
    return false;
  }

  const [state, expiresAtString, signature] = raw.split(".");
  if (!state || !expiresAtString || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtString);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const payload = `${state}.${expiresAt}`;
  const expectedSignature = signPayload(payload);
  if (signature !== expectedSignature) {
    return false;
  }

  return state === stateFromCallback;
}

export async function clearOAuthStateCookie(): Promise<void> {
  (await cookies()).delete(STATE_COOKIE);
}
