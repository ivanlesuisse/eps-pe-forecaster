'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { QUOTES } from '@/lib/quotes';
import { X } from 'lucide-react';

export default function WelcomeBanner() {
  const { isSignedIn, user } = useUser();
  const [visible, setVisible] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!isSignedIn) {
        // clear session marker on sign out so next sign-in shows the banner again
        sessionStorage.removeItem('welcomeShown');
        return;
      }

      const shown = sessionStorage.getItem('welcomeShown');
      if (!shown) {
        const timer = setTimeout(() => {
          const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
          setQuote(q);
          setVisible(true);
          sessionStorage.setItem('welcomeShown', Date.now().toString());
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore sessionStorage errors in private modes
    }
  }, [isSignedIn]);

  if (!visible) return null;

  const name = user?.firstName || user?.fullName || 'Utilisateur';

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <div className="relative rounded-lg bg-gradient-to-r from-cyan-800/80 to-blue-900/80 border border-white/10 p-4 text-white shadow-lg">
        <button
          aria-label="Fermer"
          onClick={() => setVisible(false)}
          className="absolute right-3 top-3 text-zinc-300 hover:text-white"
        >
          <X size={16} />
        </button>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-zinc-300">Bienvenue, <span className="font-semibold text-white">{name}</span> 👋</div>
          {quote && (
            <div className="text-sm text-zinc-200 whitespace-pre-line">{quote}</div>
          )}
        </div>
      </div>
    </div>
  );
}
