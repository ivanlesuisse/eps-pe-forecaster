import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { summarize } from "@/lib/wealth";
export async function POST(r: Request) {
  try {
    sameOrigin(r);
    const user = await account();
    if (!user) return unauthorized();
    return await prisma.$transaction(async (tx) => {
      const assets = await tx.asset.findMany({ where: { userId: user.id } });
      const summary = summarize(
        assets.map((a) => ({
          ...a,
          updatedAt: a.updatedAt.toISOString(),
          createdAt: a.createdAt.toISOString(),
        })),
      );
      if (summary.missing)
        return NextResponse.json(
          {
            error:
              "Complétez les taux de change avant d’enregistrer un relevé.",
          },
          { status: 400 },
        );
      const day = new Date().toISOString().slice(0, 10);
      const data = {
        gross: summary.gross,
        debt: summary.debt,
        net: summary.net,
      };
      return NextResponse.json(
        await tx.wealthSnapshot.upsert({
          where: { userId_day: { userId: user.id, day } },
          create: { ...data, userId: user.id, day },
          update: data,
        }),
      );
    });
  } catch (e) {
    return apiError(e);
  }
}
