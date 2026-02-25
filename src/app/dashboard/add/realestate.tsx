"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const propertyTypes = [
  { id: "primary", label: "Résidence principale", description: "Votre domicile" },
  { id: "rental", label: "Bien locatif", description: "Propriété de rapport" },
  { id: "commercial", label: "Commercial/Professionnel", description: "Bureau, local commercial" },
  { id: "land", label: "Terrain", description: "Terrains à bâtir" },
  { id: "scpi", label: "SCPI/Immeuble collectif", description: "Parts de fonds immobiliers" },
];

export default function AddRealEstateAssetPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [mortgageAmount, setMortgageAmount] = useState("");

  const handleNext = async () => {
    if (selectedType && address && currentValue) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: address,
            type: "REAL_ESTATE",
            category: selectedType,
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

  const isComplete = selectedType && address && currentValue;
  const equity = purchasePrice && mortgageAmount 
    ? (parseFloat(purchasePrice) - parseFloat(mortgageAmount)).toFixed(2)
    : null;

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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter un bien immobilier</h1>
        <p className="text-zinc-400">Suivez vos biens immobiliers et leur valorisation</p>
      </div>

      {/* Step 1: Select Property Type */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Type de bien</h2>
        <div className="space-y-3">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === type.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
              }`}
            >
              <p className="font-medium text-white">{type.label}</p>
              <p className="text-sm text-zinc-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Property Details */}
      {selectedType && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Détails du bien</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Adresse</label>
              <input
                type="text"
                placeholder="Ex: Rue de la Paix 123, 1201 Genève"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix d&apos;achat (CHF)</label>
                <input
                  type="number"
                  placeholder="Ex: 500000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date d&apos;achat</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Valeur actuelle estimée (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 550000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Montant du crédit hypothécaire (optionnel)</label>
              <input
                type="number"
                placeholder="Ex: 300000"
                value={mortgageAmount}
                onChange={(e) => setMortgageAmount(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedType && currentValue && (
        <div className="mb-10 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-2">Résumé du bien</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-300">Valeur actuelle:</span>
              <span className="text-white font-bold">CHF {parseFloat(currentValue).toLocaleString('fr-CH')}</span>
            </div>
            {purchasePrice && (
              <div className="flex justify-between">
                <span className="text-zinc-300">Plus/moins-value:</span>
                <span className={`font-bold ${parseFloat(currentValue) >= parseFloat(purchasePrice) ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(currentValue) >= parseFloat(purchasePrice) ? '+' : ''}
                  CHF {(parseFloat(currentValue) - parseFloat(purchasePrice)).toFixed(2)}
                </span>
              </div>
            )}
            {equity && (
              <div className="flex justify-between">
                <span className="text-zinc-300">Équité du bien:</span>
                <span className="text-blue-400 font-bold">CHF {parseFloat(equity).toLocaleString('fr-CH')}</span>
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
          className="flex-1 px-6 py-3 bg-blue-500 rounded-full text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
