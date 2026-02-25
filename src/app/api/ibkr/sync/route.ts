import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use OAuth flow via /api/brokers/ibkr/connect then /api/brokers/ibkr/sync.",
    },
    { status: 410 }
  );
}
