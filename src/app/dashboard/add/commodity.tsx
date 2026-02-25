"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const commodityTypes = [
  { id: "gold", label: "Or", icon: "🟨" },
  { id: "silver", label: "Argent", icon: "⚪" },
  { id: "platinum", label: "Platine", icon: "🩶" },
  { id: "oil", label: "Pétrole", icon: "🛢️" },
  { id: "natural_gas", label: "Gaz naturel", icon: "💨" },
  { id: "copper", label: "Cuivre", icon: "🟧" },
];

const storageTypes = [
  { id: "home", label: "Domicile", description: "Stocké chez vous" },
  { id: "bank", label: "Coffre bancaire", description: "Sécurisé à la banque" },
  { id: "vault", label: "Coffre-fort spécialisé", description: "Professionnel de la garde" },
];

export default function AddCommodityAssetPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g"); // grams for precious metals, barrels for oil, etc
  const [purityGrade, setPurityGrade] = useState("");
  const [buyingPricePerUnit, setBuyingPricePerUnit] = useState("");
  const [currentPricePerUnit, setCurrentPricePerUnit] = useState("");

  const handleNext = async () => {
    if (selectedType && quantity && buyingPricePerUnit && currentPricePerUnit) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: getCommodityLabel(),
            type: "COMMODITY",
            category: selectedType,
            value: parseFloat(getTotalCurrentValue()),
            quantity: parseFloat(quantity),
            buyingPrice: parseFloat(buyingPricePerUnit),
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

  const isComplete = selectedType && quantity && buyingPricePerUnit && currentPricePerUnit;
  
  const getTotalBuyingPrice = () => {
    return (parseFloat(quantity || '0') * parseFloat(buyingPricePerUnit || '0')).toFixed(2);
  };

  const getTotalCurrentValue = () => {
    return (parseFloat(quantity || '0') * parseFloat(currentPricePerUnit || '0')).toFixed(2);
  };

  const getCommodityLabel = () => {
    return commodityTypes.find(c => c.id === selectedType)?.label || "";
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter une matière première</h1>
        <p className="text-zinc-400">Or, argent, métaux précieux ou commodités</p>
      </div>

      {/* Step 1: Select Commodity Type */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Type de matière première</h2>
        <div className="grid grid-cols-2 gap-3">
          {commodityTypes.map((commodity) => (
            <button
              key={commodity.id}
              onClick={() => setSelectedType(commodity.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedType === commodity.id
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
              }`}
            >
              <div className="text-2xl mb-2">{commodity.icon}</div>
              <p className="text-sm font-medium text-white">{commodity.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Storage Location */}
      {selectedType && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Lieu de conservation</h2>
          <div className="space-y-3">
            {storageTypes.map((storage) => (
              <button
                key={storage.id}
                onClick={() => setSelectedStorage(storage.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedStorage === storage.id
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                }`}
              >
                <p className="font-medium text-white">{storage.label}</p>
                <p className="text-sm text-zinc-500">{storage.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Commodity Details */}
      {selectedType && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ Détails</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Quantité</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="g">Grammes</option>
                  <option value="oz">Onces (troy)</option>
                  <option value="kg">Kilogrammes</option>
                  <option value="unit">Unité</option>
                </select>
              </div>
            </div>

            {(selectedType === "gold" || selectedType === "silver" || selectedType === "platinum") && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Pureté</label>
                <select
                  value={purityGrade}
                  onChange={(e) => setPurityGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="">Sélectionner une pureté...</option>
                  <option value="999">999 ‰ (99.9%)</option>
                  <option value="995">995 ‰ (99.5%)</option>
                  <option value="9999">9999 ‰ (99.99%)</option>
                  <option value="750">750 ‰ (18 carats)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix d&apos;achat par unit&eacute; (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 60"
                  value={buyingPricePerUnit}
                  onChange={(e) => setBuyingPricePerUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix actuel par unité (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 68"
                  value={currentPricePerUnit}
                  onChange={(e) => setCurrentPricePerUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedType && quantity && buyingPricePerUnit && currentPricePerUnit && (
        <div className="mb-10 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-2">Résumé de votre portefeuille {getCommodityLabel()}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-300">Valeur actuelle:</span>
              <span className="text-white font-bold">CHF {parseFloat(getTotalCurrentValue()).toLocaleString('fr-CH')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">Montant investi:</span>
              <span className="text-zinc-400">CHF {parseFloat(getTotalBuyingPrice()).toLocaleString('fr-CH')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">Gain/Perte:</span>
              <span className={`font-bold ${parseFloat(getTotalCurrentValue()) >= parseFloat(getTotalBuyingPrice()) ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(getTotalCurrentValue()) >= parseFloat(getTotalBuyingPrice()) ? '+' : ''}
                CHF {(parseFloat(getTotalCurrentValue()) - parseFloat(getTotalBuyingPrice())).toFixed(2)}
              </span>
            </div>
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
          className="flex-1 px-6 py-3 bg-sky-500 rounded-full text-white font-bold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
