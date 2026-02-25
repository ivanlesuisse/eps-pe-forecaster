"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const valuationMethods = [
  { id: "market", label: "Valeur de marché", description: "Basée sur les prix actuels" },
  { id: "cost", label: "Valeur au coût", description: "Basée sur le prix payé" },
  { id: "appraised", label: "Valeur estimée/Expertise", description: "Estimée par un expert" },
  { id: "manual", label: "Valeur saisie manuellement", description: "Votre estimation personnelle" },
];

export default function AddOtherAssetPage() {
  const router = useRouter();
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const handleNext = async () => {
    if (assetName && selectedMethod && currentValue) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: assetName,
            type: "OTHER",
            category: assetCategory || "other",
            value: parseFloat(currentValue),
            buyingPrice: purchasePrice ? parseFloat(purchasePrice) : null,
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

  const isComplete = assetName && selectedMethod && currentValue;

  const getGainLoss = () => {
    if (purchasePrice && currentValue) {
      return (parseFloat(currentValue) - parseFloat(purchasePrice)).toFixed(2);
    }
    return null;
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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter un autre actif</h1>
        <p className="text-zinc-400">Voitures, bijoux, collections, œuvres d&apos;art, etc.</p>
      </div>

      {/* Step 1: Asset Info */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Informations de l&apos;actif</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Nom de l&apos;actif</label>
            <input
              type="text"
                placeholder="Ex: Voiture BMW M4, Montre Rolex, Tableau..."
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Cat&eacute;gorie</label>
            <input
              type="text"
              placeholder="Ex: V&eacute;hicule, Bijouterie, Art, Collection..."
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description (optionnel)</label>
            <textarea
              placeholder="Ex: BMW M4 2023, couleur bleu électrique, 5000 km..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Valuation Method */}
      {assetName && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ M&eacute;thode d&apos;&eacute;valuation</h2>
          <div className="space-y-3">
            {valuationMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === method.id
                    ? "border-zinc-500 bg-zinc-500/10"
                    : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                }`}
              >
                <p className="font-medium text-white">{method.label}</p>
                <p className="text-sm text-zinc-500">{method.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Valuation Details */}
      {assetName && selectedMethod && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ Valeurs</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Date d&apos;acquisition (optionnel)</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Prix d&apos;achat (CHF) - Optionnel</label>
              <input
                type="number"
                placeholder="Ex: 85000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Valeur actuelle estimée (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 75000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {assetName && selectedMethod && currentValue && (
        <div className="mb-10 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-3">Résumé de votre actif</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-300">Nom:</span>
              <span className="text-white font-bold">{assetName}</span>
            </div>
            {assetCategory && (
              <div className="flex justify-between">
                <span className="text-zinc-300">Catégorie:</span>
                <span className="text-zinc-400">{assetCategory}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-zinc-700">
              <span className="text-zinc-300">M&eacute;thode d&apos;&eacute;valuation:</span>
              <span className="text-zinc-400 text-sm">
                {valuationMethods.find(m => m.id === selectedMethod)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">Valeur actuelle:</span>
              <span className="text-white font-bold">CHF {parseFloat(currentValue).toLocaleString('fr-CH')}</span>
            </div>
            {purchasePrice && (
              <div className="flex justify-between">
                <span className="text-zinc-300">Gain/Perte:</span>
                <span className={`font-bold ${parseFloat(getGainLoss() || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(getGainLoss() || '0') >= 0 ? '+' : ''}
                  CHF {parseFloat(getGainLoss() || '0').toLocaleString('fr-CH')}
                </span>
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
          className="flex-1 px-6 py-3 bg-zinc-500 rounded-full text-white font-bold hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
