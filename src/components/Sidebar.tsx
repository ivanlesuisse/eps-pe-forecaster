"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Layers,
  Target,
  ChartNoAxesCombined,
  Wallet,
  Settings,
  Menu,
  X,
  ArrowUpRight,
  Landmark,
} from "lucide-react";
const links = [
  { href: "/dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/dashboard/portfolio", label: "Mes actifs", icon: Layers },
  { href: "/dashboard/goals", label: "Mes objectifs", icon: Target },
  { href: "/dashboard/insights", label: "Analyse", icon: ChartNoAxesCombined },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/tools", label: "Simulateur", icon: ArrowUpRight },
  { href: "/dashboard/ibkr", label: "Connexion IBKR", icon: Landmark },
  { href: "/dashboard/settings", label: "Mon compte", icon: Settings },
];
export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="mobile-header">
        <Link href="/dashboard" className="brand">
          <span>F</span>FinTrack
        </Link>
        <button
          className="icon-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <button
          className="nav-overlay"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`wealth-sidebar ${open ? "nav-open" : ""}`}>
        <Link href="/dashboard" className="brand">
          <span>F</span>FinTrack <small>CH</small>
        </Link>
        <p className="nav-caption">VOTRE PATRIMOINE, EN CLAIR</p>
        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-link ${pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/")) ? "active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="status-dot" />
            Espace personnel
            <div className="muted">Vos données restent dans votre compte.</div>
          </div>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-zinc-400">Gérer ma session</span>
          </div>
        </div>
      </aside>
    </>
  );
}
