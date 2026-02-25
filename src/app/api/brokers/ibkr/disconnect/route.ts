import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  decryptToken,
  deserializeEncryptedToken,
} from "@/lib/encryption";
import { extractRequestMetadata, logAuditEvent } from "@/lib/audit";
import { ibkrApiPost } from "@/lib/ibkr/client";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metadata = extractRequestMetadata(request);

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: authResult.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = await prisma.brokerToken.findUnique({
      where: {
        userId_broker: {
          userId: user.id,
          broker: "ibkr",
        },
      },
    });

    if (!token) {
      return NextResponse.json({ success: true });
    }

    try {
      const parsed = deserializeEncryptedToken(token.encryptedToken);
      const accessToken = decryptToken(parsed.encryptedData, parsed.iv, parsed.authTag);
      await ibkrApiPost("/logout", accessToken);
    } catch {
      // Local revocation still proceeds when remote logout fails.
    }

    await prisma.brokerToken.delete({
      where: {
        userId_broker: {
          userId: user.id,
          broker: "ibkr",
        },
      },
    });

    await logAuditEvent({
      userId: authResult.userId,
      action: "broker_disconnect",
      broker: "ibkr",
      status: "success",
      ...metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await logAuditEvent({
      userId: authResult.userId,
      action: "broker_disconnect",
      broker: "ibkr",
      status: "failure",
      details: {
        code: error instanceof Error ? error.message : "unknown_error",
      },
      ...metadata,
    });

    return NextResponse.json(
      { error: "Failed to disconnect IBKR" },
      { status: 500 }
    );
  }
}
