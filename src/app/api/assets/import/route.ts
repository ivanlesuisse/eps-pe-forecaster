import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { assetInput } from "@/lib/wealth-validation";
import { InvalidAssetInput } from "@/lib/asset-input";
export async function POST(r: Request) {
  try {
    sameOrigin(r);
    const user = await account();
    if (!user) return unauthorized();
    const { rows } = await r.json();
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 200)
      throw new InvalidAssetInput("Import limité à 200 lignes.");
    const data = rows.map((row) => ({ ...assetInput(row), userId: user.id }));
    await prisma.$transaction(
      data.map((d) => prisma.asset.create({ data: d })),
    );
    return NextResponse.json({ imported: data.length }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
