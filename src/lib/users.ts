import { prisma } from "@/lib/prisma";

export async function getOrCreateUserByClerkId(clerkId: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email: `${clerkId}@clerk.local`, baseCurrency: "CHF" },
  });
}
