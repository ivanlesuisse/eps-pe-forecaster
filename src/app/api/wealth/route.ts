import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { bounded } from "@/lib/wealth-validation";
export async function GET() {
  try {
    const user = await account();
    if (!user) return unauthorized();
    const [assets, goals, snapshots] = await Promise.all([
      prisma.asset.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { deadline: "asc" },
      }),
      prisma.wealthSnapshot.findMany({
        where: { userId: user.id },
        orderBy: { day: "desc" },
        take: 366,
      }),
    ]);
    return NextResponse.json(
      {
        assets,
        goals,
        snapshots: snapshots.reverse(),
        monthlyIncome: user.monthlyIncome,
        monthlyExpenses: user.monthlyExpenses,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await account();
    if (!user) return unauthorized();
    const body = await request.json();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyIncome: bounded(body.monthlyIncome, "Revenus"),
        monthlyExpenses: bounded(body.monthlyExpenses, "Dépenses"),
      },
    });
    return NextResponse.json({ saved: true });
  } catch (e) {
    return apiError(e);
  }
}
