import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await auth();

  if (!authResult.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: authResult.userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ connected: false, positions: 0, totalValue: 0 });
  }

  const token = await prisma.brokerToken.findUnique({
    where: {
      userId_broker: {
        userId: user.id,
        broker: "ibkr",
      },
    },
    select: { expiresAt: true, revoked: true, updatedAt: true },
  });

  const ibkrAssets = await prisma.asset.findMany({
    where: {
      userId: user.id,
      institution: "IBKR",
    },
    select: { value: true },
  });

  return NextResponse.json({
    connected: !!token && !token.revoked,
    tokenExpiresAt: token?.expiresAt || null,
    lastConnectionUpdateAt: token?.updatedAt || null,
    positions: ibkrAssets.length,
    totalValue: ibkrAssets.reduce((sum, asset) => sum + asset.value, 0),
  });
}
