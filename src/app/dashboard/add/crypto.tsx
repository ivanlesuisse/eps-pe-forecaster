"use client";

import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const cryptoExchanges = [
  { id: "binance", name: "Binance" },
  { id: "kraken", name: "Kraken" },
  { id: "coinbase", name: "Coinbase" },
  { id: "gemini", name: "Gemini" },
  { id: "ledger", name: "Ledger (Hardware)" },
  { id: "metamask", name: "MetaMask" },
  { id: "other", name: "Autre portefeuille" },
];

const populateCryptos = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "ripple", symbol: "XRP", name: "Ripple" },
];

export default function AddCryptoAssetPage() {
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const filteredExchanges = cryptoExchanges.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCryptos = populateCryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(cryptoSearch.toLowerCase())
  );

  const getCryptoSymbol = () => {
    return populateCryptos.find(c => c.id === selectedCrypto)?.symbol || "";
  };

  const handleNext = async () => {
    if (selectedExchange && selectedCrypto && quantity && buyingPrice && currentPrice) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: getCryptoSymbol(),
            type: "CRYPTO",
            category: selectedCrypto,
            institution: selectedExchange,
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

  const isComplete = selectedExchange && selectedCrypto && quantity && buyingPrice && currentPrice;

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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter des cryptomonnaies</h1>
        <p className="text-zinc-400">Suivez votre portefeuille de cryptomonnaies</p>
      </div>

      {/* Step 1: Select Exchange */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Plateforme/Portefeuille</h2>
        
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher une plateforme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredExchanges.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExchange(ex.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedExchange === ex.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
              }`}
            >
              <p className="text-sm font-medium text-white">{ex.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Cryptocurrency */}
      {selectedExchange && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Cryptomonnaie</h2>
          
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher une crypto..."
              value={cryptoSearch}
              onChange={(e) => setCryptoSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            {filteredCryptos.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCrypto === crypto.id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{crypto.name}</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-400">{crypto.symbol}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Crypto Details */}
      {selectedExchange && selectedCrypto && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ Détails de la cryptomonnaie</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Quantité ({getCryptoSymbol()})</label>
              <input
                type="number"
                placeholder="Ex: 0.5"
                step="0.00000001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix d&apos;achat (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 40000"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix actuel (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 42000"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {selectedExchange !== "other" && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Adresse du portefeuille (optionnel)</label>
                <input
                  type="text"
                  placeholder="Votre adresse publique"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            )}

            {buyingPrice && currentPrice && quantity && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-400">Valeur estimée</p>
                <p className="text-2xl font-bold text-green-500">
                  CHF {(parseFloat(currentPrice) * parseFloat(quantity)).toFixed(2)}
                </p>
                <p className="text-sm text-green-400 mt-1">
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
