"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  PieChart, 
  Lightbulb, 
  Wallet, 
  TrendingUp, 
  PenTool, 
  Users, 
  Zap,
  ChevronRight,
  Settings,
  LogOut,
  MoreHorizontal
} from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { 
    icon: PieChart, 
    label: "Portfolio", 
    href: "/dashboard/portfolio", 
    hasSubmenu: true,
    subItems: [
      { label: "Stocks & Funds", href: "/dashboard/portfolio/stocks" },
      { label: "ETF", href: "/dashboard/portfolio/etf" },
      { label: "Crypto", href: "/dashboard/portfolio/crypto" },
      { label: "Savings accounts", href: "/dashboard/portfolio/savings" },
      { label: "Checking accounts", href: "/dashboard/portfolio/checking" },
      { label: "Other assets", href: "/dashboard/portfolio/other" },
      { label: "Precious Metals", href: "/dashboard/portfolio/metals" },
    ]
  },
  { icon: Lightbulb, label: "Insights", href: "/dashboard/insights" },
  { icon: Wallet, label: "Budget", href: "/dashboard/budget" },
  { icon: TrendingUp, label: "Investing", href: "/dashboard/investing", isNew: true },
  { icon: PenTool, label: "Tools", href: "/dashboard/tools", hasSubmenu: true },
  { icon: Users, label: "Community", href: "/dashboard/community" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 rounded-sm block"></span>
            Swiss FinTrack
        </h1>
      </div>

      <nav className="flex-grow px-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? "bg-zinc-800/50 text-white" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.isNew && (
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                    New
                  </span>
                )}
              </div>
              {item.hasSubmenu && <ChevronRight size={14} className={`text-zinc-600 transition-transform ${pathname.startsWith(item.href) ? 'rotate-90' : ''}`} />}
            </Link>
            
            {item.subItems && pathname.startsWith(item.href) && (
              <div className="mt-1 ml-9 space-y-1 border-l border-zinc-800">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className={`block px-4 py-1.5 text-xs font-medium transition-colors ${
                      pathname === sub.href 
                        ? "text-white" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Plus</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">Unlock the full experience</p>
            <button className="text-[11px] text-zinc-400 hover:text-white transition-colors">
                Try for free
            </button>
        </div>

        <div className="relative">
          {showUserMenu && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-[#121212] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl py-1 z-50">
              <Link 
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={16} />
                <span>Paramètres</span>
              </Link>
              <button 
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors w-full text-left"
              >
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
          
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors group"
          >
              <UserButton afterSignOutUrl="/" />
              <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName || "User"}</p>
              </div>
              <div className="text-zinc-600 group-hover:text-white">
                <MoreHorizontal size={18} />
              </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
