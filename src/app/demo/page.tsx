"use client";
import { useState } from "react";
import Link from "next/link";
import { WealthProvider } from "@/components/WealthProvider";
import WealthApp, { View } from "@/components/WealthApp";
export default function Demo() {
  const [view, setView] = useState<View>("overview");
  return (
    <WealthProvider demo>
      <div className="demo-header">
        <Link className="brand" href="/">
          <span>F</span>FinTrack
        </Link>
        <span>
          DÉMO · données fictives · rien n’est enregistré sur votre compte
        </span>
        <Link className="primary-button" href="/sign-up">
          Créer mon compte
        </Link>
      </div>
      <nav className="demo-nav">
        {(
          [
            ["overview", "Vue d’ensemble"],
            ["portfolio", "Actifs"],
            ["goals", "Objectifs"],
            ["insights", "Analyse"],
            ["budget", "Budget"],
            ["tools", "Simulateur"],
          ] as [View, string][]
        ).map(([id, label]) => (
          <button
            className={view === id ? "selected" : ""}
            key={id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main className="demo-main">
        <WealthApp key={view} view={view} />
      </main>
    </WealthProvider>
  );
}
