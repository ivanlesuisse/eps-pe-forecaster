"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

type DashboardPlaceholderPageProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function DashboardPlaceholderPage({
  title,
  description,
  ctaHref = "/dashboard/add",
  ctaLabel = "Ajouter un actif",
}: DashboardPlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-3xl border border-zinc-800 bg-[#0d0d0d] p-8 md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          Swiss FinTrack
        </div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <Plus size={18} />
            {ctaLabel}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition-colors hover:bg-zinc-900"
          >
            Retour au dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
