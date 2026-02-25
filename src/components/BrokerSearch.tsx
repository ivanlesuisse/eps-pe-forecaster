"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";

const brokers = [
  {
    id: "ibkr",
    name: "Interactive Brokers",
    aliases: ["IBKR", "Interactive", "Brokers"],
    icon: "🏦",
    color: "from-blue-600 to-blue-700",
    description: "Accédez aux actions, ETF, options et plus",
  },
  {
    id: "td-directinvesting",
    name: "TD Direct Investing",
    aliases: ["TD", "Direct Investing"],
    icon: "📊",
    color: "from-green-600 to-green-700",
    description: "Service de courtage canadien",
  },
  {
    id: "revolut",
    name: "Revolut",
    aliases: ["Revolut"],
    icon: "💳",
    color: "from-purple-600 to-purple-700",
    description: "Investissements et trading mobile",
  },
  {
    id: "degiro",
    name: "DEGIRO",
    aliases: ["DEGIRO", "De Giro"],
    icon: "📈",
    color: "from-orange-600 to-orange-700",
    description: "Courtage en ligne européen",
  },
  {
    id: "etoro",
    name: "eToro",
    aliases: ["eToro", "eTO"],
    icon: "🟢",
    color: "from-green-500 to-green-600",
    description: "Trading social et copie de traders",
  },
  {
    id: "wise",
    name: "Wise Invest",
    aliases: ["Wise", "Wise Invest"],
    icon: "💰",
    color: "from-cyan-600 to-cyan-700",
    description: "Investissements internationaux",
  },
];

export function BrokerSearch() {
  const [search, setSearch] = useState("");

  const filteredBrokers = useMemo(() => {
    if (!search.trim()) return brokers;
    
    const query = search.toLowerCase();
    return brokers.filter(broker => 
      broker.name.toLowerCase().includes(query) ||
      broker.aliases.some(alias => alias.toLowerCase().includes(query))
    );
  }, [search]);

  return (
    <div className="mb-10">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-3">
          Ou connectez un établissement
        </label>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Recherchez: IBKR, Interactive Brokers, TD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Brokers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBrokers.length > 0 ? (
          filteredBrokers.map((broker) => (
            <Link
              key={broker.id}
              href={`/dashboard/add/broker/${broker.id}`}
              className={`p-4 rounded-xl border border-zinc-700 hover:border-blue-500 bg-gradient-to-br ${broker.color} bg-opacity-10 hover:bg-opacity-20 transition-all group cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{broker.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                    {broker.name}
                  </h3>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-300">
                    {broker.description}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-zinc-500">
            <TrendingUp className="mx-auto mb-2 opacity-50" />
            <p>Aucun établissement trouvé</p>
          </div>
        )}
      </div>

      {search && filteredBrokers.length === 0 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">
          💡 Votre courtier n&apos;est pas listé ? Ajoutez-le manuellement dans &quot;Investissements&quot;
        </div>
      )}
    </div>
  );
}
