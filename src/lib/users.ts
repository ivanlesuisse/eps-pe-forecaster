import { prisma } from "@/lib/prisma";

export async function getOrCreateUserByClerkId(clerkId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}@clerk.local`,
        baseCurrency: "CHF",
      },
    });
  }

  return user;
}
