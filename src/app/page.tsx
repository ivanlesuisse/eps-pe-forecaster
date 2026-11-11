import Header from "@/components/Header";
import AnimatedHero from "@/components/AnimatedHero";
import Link from "next/link";
import { ShieldCheck, ChartSpline, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#060b1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.15),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(249,115,22,0.12),transparent_45%)]" />
      <Header />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm md:p-12">
          <AnimatedHero />
          <p className="mx-auto mt-14 max-w-3xl text-center text-lg leading-relaxed text-blue-100/75">
            Comptes, investissements, immobilier et prévoyance : retrouvez votre patrimoine dans un espace personnel, conçu pour vos projets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-xl bg-sky-500 px-7 py-3 font-semibold text-white transition-colors hover:bg-sky-400"
            >
              Créer un compte
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Se connecter
            </Link>
            <Link href="/demo" className="text-emerald-300 px-4 py-3 text-sm">Explorer une démo →</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <ChartSpline className="mb-3 text-sky-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">Vue consolidée</h3>
            <p className="text-sm text-zinc-300">Suivez vos actifs, vos dettes et vos valorisations manuelles en CHF.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <Layers className="mb-3 text-emerald-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">Catégories intelligentes</h3>
            <p className="text-sm text-zinc-300">Actions, ETF, crypto, immobilier, piliers 2 et 3a : votre patrimoine au complet.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <ShieldCheck className="mb-3 text-orange-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">Accès sécurisé</h3>
            <p className="text-sm text-zinc-300">Authentification robuste et espace personnel protege par defaut.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-8 py-6 text-center text-blue-100/50">
        <p>&copy; {new Date().getFullYear()} Swiss FinTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
