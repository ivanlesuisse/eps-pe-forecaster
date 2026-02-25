import { auth } from '@clerk/nextjs/server';
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import WelcomeBanner from './WelcomeBanner';


export default async function Header() {
  const { userId } = await auth();

  return (
    <>
      <header className="py-4 px-8 flex justify-between items-center border-b border-zinc-800">
        <Link href="/">
          <h1 className="text-2xl font-bold">Swiss FinTrack</h1>
        </Link>
        <div>
          {userId ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="border border-zinc-700 font-semibold py-2 px-4 rounded-full hover:bg-zinc-800 transition-colors">
                  Dashboard
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/sign-in">
                <button className="border border-zinc-700 font-semibold py-2 px-4 rounded-full hover:bg-zinc-800 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-zinc-200 transition-colors">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <WelcomeBanner />
    </>
  );
}
