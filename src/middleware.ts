import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/', '/demo', '/privacy', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const {userId}=await auth();
    if(!userId) return NextResponse.json({error:"Connectez-vous pour continuer."},{status:401});
  } else if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
