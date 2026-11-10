import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  decryptToken,
  deserializeEncryptedToken,
} from "@/lib/encryption";
import { extractRequestMetadata, logAuditEvent } from "@/lib/audit";
import { fetchPortfolioBundle } from "@/lib/ibkr/client";

export const runtime = "nodejs";

interface RawPosition {
  symbol?: string;
  conidEx?: string;
  contractDesc?: string;
  contract?: string;
  description?: string;
  companyName?: string;
  position?: number;
  qty?: number;
  quantity?: number;
  mktValue?: number;
  marketValue?: number;
  marketvalue?: number;
  avgCost?: number;
  averagePrice?: number;
  currency?: string;
}

function normalizePosition(position: RawPosition) {
  const symbol = String(
    position.symbol ||
      position.conidEx ||
      position.contractDesc ||
      position.contract ||
      "UNKNOWN"
  );

  const name = String(
    position.description ||
      position.contractDesc ||
      position.companyName ||
      symbol
  );

  const quantity = Number(position.position ?? position.qty ?? position.quantity ?? 0);
  const marketValue = Number(
    position.mktValue ?? position.marketValue ?? position.marketvalue ?? 0
  );

  const avgCost = Number(position.avgCost ?? position.averagePrice ?? 0);
  const buyingPrice =
    Number.isFinite(avgCost) && avgCost > 0
      ? avgCost
      : quantity > 0 && Number.isFinite(marketValue) && marketValue > 0
        ? marketValue / quantity
        : null;

  return {
    symbol,
    name,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    marketValue: Number.isFinite(marketValue) ? marketValue : 0,
    buyingPrice,
    currency: String(position.currency || "USD"),
  };
}

async function resolveSyncUserId(request: NextRequest): Promise<string | null> {
  const internalSecret = request.headers.get("x-internal-sync-secret");
  const internalClerkUserId = request.headers.get("x-sync-clerk-user-id");

  if (
    internalSecret &&
    process.env.INTERNAL_SYNC_SECRET &&
    internalSecret === process.env.INTERNAL_SYNC_SECRET
  ) {
    if (!internalClerkUserId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: internalClerkUserId },
      select: { id: true },
    });

    return user?.id ?? null;
  }

  const authResult = await auth();
  if (!authResult.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: authResult.userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function POST(request: NextRequest) {
  const userId = await resolveSyncUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metadata = extractRequestMetadata(request);

  try {
    const brokerToken = await prisma.brokerToken.findUnique({
      where: {
        userId_broker: {
          userId,
          broker: "ibkr",
        },
      },
    });

    if (!brokerToken || brokerToken.revoked) {
      return NextResponse.json(
        { error: "No active IBKR connection found" },
        { status: 404 }
      );
    }

    const encrypted = deserializeEncryptedToken(brokerToken.encryptedToken);
    const accessToken = decryptToken(
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.authTag
    );

    const bundle = await fetchPortfolioBundle(accessToken);
    const accountBundles = bundle.accounts || [];

    const normalizedPositions = accountBundles.flatMap((account) =>
      (account.positions || []).map((position: RawPosition) => ({
        accountId: account.accountId,
        ...normalizePosition(position),
      }))
    );

    await prisma.$transaction(async (tx) => {
      await tx.asset.deleteMany({
        where: {
          userId,
          institution: "IBKR",
        },
      });

      for (const position of normalizedPositions) {
        await tx.asset.create({
          data: {
            userId,
            name: position.name,
            type: "INVESTMENT",
            category: "Brokerage",
            institution: "IBKR",
            value: position.marketValue,
            quantity: position.quantity,
            buyingPrice: position.buyingPrice,
            currency: position.currency,
          },
        });
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true },
    });

    if (user?.clerkId) {
      await logAuditEvent({
        userId: user.clerkId,
        action: "broker_data_sync",
        broker: "ibkr",
        status: "success",
        details: {
          timestamp: new Date().toISOString(),
          accountsSynced: accountBundles.length,
          recordCount: normalizedPositions.length,
        },
        ...metadata,
      });
    }

    return NextResponse.json({
      success: true,
      accountsSynced: accountBundles.length,
      recordCount: normalizedPositions.length,
    });
  } catch (error) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true },
    });

    if (user?.clerkId) {
      await logAuditEvent({
        userId: user.clerkId,
        action: "broker_connect_failed",
        broker: "ibkr",
        status: "failure",
        details: {
          code: error instanceof Error ? error.message : "sync_failed",
        },
        ...metadata,
      });
    }

    return NextResponse.json(
      { error: "Failed to sync IBKR portfolio" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
