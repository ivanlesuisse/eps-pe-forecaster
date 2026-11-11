import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { assetInput } from "@/lib/wealth-validation";
type Context = { params: Promise<{ id: string }> };
const missing = () =>
  NextResponse.json({ error: "Actif introuvable." }, { status: 404 });
export async function GET(_r: Request, { params }: Context) {
  try {
    const user = await account();
    if (!user) return unauthorized();
    const { id } = await params;
    const asset = await prisma.asset.findFirst({
      where: { id, userId: user.id },
    });
    return asset ? NextResponse.json(asset) : missing();
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    const user = await account();
    if (!user) return unauthorized();
    const { id } = await params;
    const existing = await prisma.asset.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return missing();
    const data = assetInput({ ...existing, ...(await request.json()) });
    const result = await prisma.asset.updateMany({
      where: { id, userId: user.id },
      data,
    });
    return result.count ? NextResponse.json({ id, ...data }) : missing();
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    const user = await account();
    if (!user) return unauthorized();
    const { id } = await params;
    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { id, userId: user.id },
      });
      if (!asset) return false;
      await tx.transaction.deleteMany({ where: { assetId: id } });
      await tx.asset.deleteMany({ where: { id, userId: user.id } });
      return true;
    });
    return result ? NextResponse.json({ deleted: true }) : missing();
  } catch (e) {
    return apiError(e);
  }
}
