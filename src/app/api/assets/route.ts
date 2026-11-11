import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { assetInput } from "@/lib/wealth-validation";
export async function GET() {
  try {
    const user = await account();
    if (!user) return unauthorized();
    return NextResponse.json(
      await prisma.asset.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await account();
    if (!user) return unauthorized();
    const data = assetInput(await request.json());
    const asset = await prisma.asset.create({
      data: { ...data, userId: user.id },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
