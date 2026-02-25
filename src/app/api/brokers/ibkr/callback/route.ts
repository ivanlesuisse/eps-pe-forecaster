import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractRequestMetadata, logAuditEvent } from "@/lib/audit";
import {
  encryptToken,
  serializeEncryptedToken,
} from "@/lib/encryption";
import { getAccessToken } from "@/lib/ibkr/client";
import { clearOAuthStateCookie, validateOAuthState } from "@/lib/ibkr/state";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserByClerkId } from "@/lib/users";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const oauthProblem = searchParams.get("oauth_problem");

  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.redirect(new URL("/sign-in", appUrl));
  }

  const metadata = extractRequestMetadata(request);

  try {
    if (oauthProblem) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "broker_connect_failed",
        broker: "ibkr",
        status: "failure",
        details: { code: oauthProblem },
        ...metadata,
      });

      return NextResponse.redirect(
        new URL(`/dashboard/add/broker/ibkr?error=${encodeURIComponent(oauthProblem)}`, appUrl)
      );
    }

    const validState = await validateOAuthState(state);
    await clearOAuthStateCookie();

    if (!validState) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "unauthorized_access_attempt",
        broker: "ibkr",
        status: "failure",
        details: { code: "invalid_state" },
        ...metadata,
      });

      return NextResponse.redirect(new URL("/dashboard/add/broker/ibkr?error=invalid_state", appUrl));
    }

    if (!oauthToken || !oauthVerifier) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "broker_connect_failed",
        broker: "ibkr",
        status: "failure",
        details: { code: "missing_oauth_parameters" },
        ...metadata,
      });

      return NextResponse.redirect(
        new URL("/dashboard/add/broker/ibkr?error=missing_oauth_parameters", appUrl)
      );
    }

    const user = await getOrCreateUserByClerkId(authResult.userId);

    const access = await getAccessToken({
      oauthToken,
      oauthVerifier,
    });

    const encryptedAccess = serializeEncryptedToken(encryptToken(access.oauthToken));
    const encryptedSecret = access.oauthTokenSecret
      ? serializeEncryptedToken(encryptToken(access.oauthTokenSecret))
      : null;

    await prisma.brokerToken.upsert({
      where: {
        userId_broker: {
          userId: user.id,
          broker: "ibkr",
        },
      },
      update: {
        encryptedToken: encryptedAccess,
        refreshToken: encryptedSecret,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revoked: false,
      },
      create: {
        userId: user.id,
        broker: "ibkr",
        encryptedToken: encryptedAccess,
        refreshToken: encryptedSecret,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await logAuditEvent({
      userId: authResult.userId,
      action: "broker_connect_success",
      broker: "ibkr",
      status: "success",
      ...metadata,
    });

    fetch(`${appUrl}/api/brokers/ibkr/sync`, {
      method: "POST",
      headers: {
        "x-internal-sync-secret": process.env.INTERNAL_SYNC_SECRET || "",
        "x-sync-clerk-user-id": authResult.userId,
      },
    }).catch(() => undefined);

    return NextResponse.redirect(new URL("/dashboard/ibkr?connected=1", appUrl));
  } catch (error) {
    await logAuditEvent({
      userId: authResult.userId,
      action: "broker_connect_failed",
      broker: "ibkr",
      status: "failure",
      details: {
        code: error instanceof Error ? error.message : "unknown_error",
      },
      ...metadata,
    });

    return NextResponse.redirect(new URL("/dashboard/ibkr?error=connect_failed", appUrl));
  }
}
