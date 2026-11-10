import { finiteNumber, optionalNumber, requiredText, InvalidAssetInput } from "@/lib/asset-input";
import { getOrCreateUserByClerkId } from "@/lib/users";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/assets - Starting request");
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log("Auth result:", { userId, hasUserId: !!userId });

    if (!userId) {
      console.log("No userId found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized - no userId" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUserByClerkId(userId);

    const body = await request.json();
    const {
      name,
      type,
      category,
      institution,
      value,
      quantity,
      buyingPrice,
      currency = "CHF",
      logo,
    } = body;

    console.log("Creating asset:", { name, type, value });

    const parsedValue = finiteNumber(value, "value");
    const parsedQuantity = optionalNumber(quantity, "quantity");
    const parsedBuyingPrice = optionalNumber(buyingPrice, "buyingPrice");
    const parsedName = requiredText(name, "name");
    const parsedType = requiredText(type, "type");

    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        name: parsedName,
        type: parsedType,
        category: category || type,
        institution: institution || "",
        value: parsedValue,
        ...(parsedQuantity !== null ? { quantity: parsedQuantity } : {}),
        ...(parsedBuyingPrice !== null ? { buyingPrice: parsedBuyingPrice } : {}),
        currency,
        logo: logo || "",
      },
    });

    console.log("Asset created:", asset.id);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidAssetInput || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("GET /api/assets - Starting request");
    // Try alternative Clerk auth pattern
    const authSession = await auth();

    
    const userId = authSession?.userId;
    
    console.log("Auth result:", { userId, hasUserId: !!userId });

    if (!userId) {
      console.log("No userId found in auth");
      return NextResponse.json(
        { error: "Unauthorized - no userId" },
        { status: 401 }
      );
    }

    console.log("Looking up user with clerkId:", userId);
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log("User found:", { userId: user?.id, email: user?.email });

    if (!user) {
      console.log("User not found in database, returning empty array");
      return NextResponse.json([], { status: 200 });
    }

    const assets = await prisma.asset.findMany({
      where: { userId: user.id },
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Assets found:", assets.length);
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
