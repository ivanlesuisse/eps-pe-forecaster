import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOAuthState } from "@/lib/ibkr/state";
import { getAuthorizationUrl, getRequestToken } from "@/lib/ibkr/client";
import { extractRequestMetadata, logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth();

    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await createOAuthState();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/brokers/ibkr/callback?state=${encodeURIComponent(state)}`;

    const { oauthToken } = await getRequestToken(callbackUrl);
    const authorizationUrl = getAuthorizationUrl(oauthToken);

    await logAuditEvent({
      userId: authResult.userId,
      action: "broker_connect_initiated",
      broker: "ibkr",
      status: "success",
      ...extractRequestMetadata(request),
    });

    return NextResponse.json({ authorizationUrl });
  } catch (error) {
    const authResult = await auth();
    if (authResult.userId) {
      await logAuditEvent({
        userId: authResult.userId,
        action: "broker_connect_failed",
        broker: "ibkr",
        status: "failure",
        details: {
          code: error instanceof Error ? error.message : "unknown_error",
        },
        ...extractRequestMetadata(request),
      });
    }

    return NextResponse.json(
      { error: "Failed to initiate IBKR connection" },
      { status: 400 }
    );
  }
}
