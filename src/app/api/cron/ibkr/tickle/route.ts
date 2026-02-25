import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  decryptToken,
  deserializeEncryptedToken,
} from "@/lib/encryption";
import { ibkrApiPost } from "@/lib/ibkr/client";
import { logAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  if (!bearer || bearer !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeTokens = await prisma.brokerToken.findMany({
    where: {
      broker: "ibkr",
      revoked: false,
    },
    include: {
      user: {
        select: {
          clerkId: true,
        },
      },
    },
  });

  let refreshed = 0;
  let failed = 0;

  for (const token of activeTokens) {
    try {
      const encrypted = deserializeEncryptedToken(token.encryptedToken);
      const accessToken = decryptToken(
        encrypted.encryptedData,
        encrypted.iv,
        encrypted.authTag
      );

      await ibkrApiPost("/tickle", accessToken);

      await prisma.brokerToken.update({
        where: { id: token.id },
        data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });

      await logAuditEvent({
        userId: token.user.clerkId,
        action: "token_refresh_success",
        broker: "ibkr",
        status: "success",
      });

      refreshed += 1;
    } catch (error) {
      await logAuditEvent({
        userId: token.user.clerkId,
        action: "token_refresh_failed",
        broker: "ibkr",
        status: "failure",
        details: {
          code: error instanceof Error ? error.message : "tickle_failed",
        },
      });

      failed += 1;
    }
  }

  return NextResponse.json({
    success: true,
    processed: activeTokens.length,
    refreshed,
    failed,
  });
}
