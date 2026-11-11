import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { goalInput } from "@/lib/wealth-validation";
type Context = { params: Promise<{ id: string }> };
export async function PUT(r: Request, { params }: Context) {
  try {
    sameOrigin(r);
    const user = await account();
    if (!user) return unauthorized();
    const { id } = await params;
    const result = await prisma.goal.updateMany({
      where: { id, userId: user.id },
      data: goalInput(await r.json()),
    });
    return NextResponse.json(
      result.count ? { saved: true } : { error: "Objectif introuvable." },
      { status: result.count ? 200 : 404 },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(r: Request, { params }: Context) {
  try {
    sameOrigin(r);
    const user = await account();
    if (!user) return unauthorized();
    const { id } = await params;
    const result = await prisma.goal.deleteMany({
      where: { id, userId: user.id },
    });
    return NextResponse.json(
      result.count ? { deleted: true } : { error: "Objectif introuvable." },
      { status: result.count ? 200 : 404 },
    );
  } catch (e) {
    return apiError(e);
  }
}
