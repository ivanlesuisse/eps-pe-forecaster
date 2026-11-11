import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { InvalidAssetInput } from "./asset-input";
import { NextResponse } from "next/server";
export async function account() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email: `${userId}@clerk.local` },
  });
}
export const unauthorized = () =>
  NextResponse.json(
    { error: "Connectez-vous pour continuer." },
    { status: 401 },
  );
export function apiError(error: unknown) {
  if (error instanceof InvalidAssetInput || error instanceof SyntaxError)
    return NextResponse.json({ error: error.message }, { status: 400 });
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "Impossible d’enregistrer. Réessayez dans un instant." },
    { status: 500 },
  );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new InvalidAssetInput("Origine de la requête invalide.");
}
