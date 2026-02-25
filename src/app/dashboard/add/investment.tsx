"use client";

import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const investmentTypes = [
  { id: "mutual_fund", label: "Fonds d'investissement", description: "ETF, fonds communs" },
  { id: "stock", label: "Actions", description: "Actions individuelles" },
  { id: "bond", label: "Obligations", description: "Bons du trésor, obligations" },
  { id: "etf", label: "ETF", description: "Fonds négociés en bourse" },
];

const popularBrokers = [
  { id: "viac", name: "VIAC" },
  { id: "interactive_brokers", name: "Interactive Brokers" },
  { id: "degiro", name: "DEGIRO" },
  { id: "etoro", name: "eToro" },
  { id: "trading_212", name: "Trading 212" },
  { id: "saxo_bank", name: "Saxo Bank" },
];

export default function AddInvestmentAssetPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  const filteredBrokers = popularBrokers.filter(broker =>
    broker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = async () => {
    if (selectedType && selectedBroker && ticker && quantity && buyingPrice && currentPrice) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ticker,
            type: "INVESTMENT",
            category: selectedType,
            institution: selectedBroker,
            value: parseFloat(currentPrice) * parseFloat(quantity),
            quantity: parseFloat(quantity),
            buyingPrice: parseFloat(buyingPrice),
            currency: "CHF",
          }),
        });

        if (!response.ok) throw new Error("Failed to create asset");
        
        router.push("/dashboard");
      } catch (error) {
        console.error("Error creating asset:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const isComplete = selectedType && selectedBroker && ticker && quantity && buyingPrice && currentPrice;

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        Retour
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter un investissement</h1>
        <p className="text-zinc-400">Suivez vos actions, fonds et obligations</p>
      </div>

      {/* Step 1: Select Investment Type */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Type d&apos;investissement</h2>
        <div className="space-y-3">
          {investmentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === type.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
              }`}
            >
              <p className="font-medium text-white">{type.label}</p>
              <p className="text-sm text-zinc-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Broker */}
      {selectedType && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Plateforme/Courtier</h2>
          
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher un courtier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredBrokers.map((broker) => (
              <button
                key={broker.id}
                onClick={() => setSelectedBroker(broker.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedBroker === broker.id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                }`}
              >
                <p className="text-sm font-medium text-white">{broker.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Investment Details */}
      {selectedType && selectedBroker && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ D&eacute;tails de l&apos;investissement</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Ticker/Code ISIN</label>
              <input
                type="text"
                placeholder="Ex: VWRL, VOO, AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Quantité</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix d&apos;achat (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 150"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Prix actuel (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 165"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {buyingPrice && currentPrice && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-400">Gain/Perte estim&eacute;</p>
                <p className="text-2xl font-bold text-green-500">
                  +CHF {((parseFloat(currentPrice) - parseFloat(buyingPrice)) * parseFloat(quantity)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold hover:bg-zinc-800 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleNext}
          disabled={!isComplete}
          className="flex-1 px-6 py-3 bg-violet-500 rounded-full text-white font-bold hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
