import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { account, unauthorized, apiError, sameOrigin } from "@/lib/api";
import { goalInput } from "@/lib/wealth-validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await account();
    if (!user) return unauthorized();
    return NextResponse.json(
      await prisma.goal.create({
        data: { ...goalInput(await request.json()), userId: user.id },
      }),
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
