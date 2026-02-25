"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const fundingRounds = [
  { id: "seed", label: "Seed", description: "Amorçage" },
  { id: "series_a", label: "Série A", description: "Financement principal" },
  { id: "series_b", label: "Série B", description: "Expansion" },
  { id: "series_c", label: "Série C", description: "Croissance" },
  { id: "private", label: "Pré-IPO/Privé", description: "Mature" },
];

export default function AddStartupAssetPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [equityPercentage, setEquityPercentage] = useState("");
  const [sharesCount, setSharesCount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentValuation, setCurrentValuation] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");

  const handleNext = async () => {
    if (companyName && selectedRound && (equityPercentage || sharesCount) && purchasePrice && currentValuation) {
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: companyName,
            type: "STARTUP",
            category: selectedRound,
            value: parseFloat(getEquityValue() || '0'),
            buyingPrice: parseFloat(purchasePrice),
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

  const isComplete = companyName && selectedRound && (equityPercentage || sharesCount) && purchasePrice && currentValuation;
  
  const getEquityValue = () => {
    if (equityPercentage && currentValuation) {
      return ((parseFloat(equityPercentage) / 100) * parseFloat(currentValuation)).toFixed(2);
    }
    return null;
  };

  const getGainLoss = () => {
    const current = getEquityValue();
    if (current) {
      return (parseFloat(current) - parseFloat(purchasePrice || '0')).toFixed(2);
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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter un investissement startup</h1>
        <p className="text-zinc-400">Suivez vos investissements en capital-risque</p>
      </div>

      {/* Step 1: Company Info */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Informations de l&apos;entreprise</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Nom de l&apos;entreprise</label>
            <input
              type="text"
              placeholder="Ex: TechStartup SA"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Secteur d&apos;activit&eacute;</label>
            <input
              type="text"
              placeholder="Ex: SaaS, IA, FinTech..."
              value={companyIndustry}
              onChange={(e) => setCompanyIndustry(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Stade de financement</label>
            <div className="space-y-3">
              {fundingRounds.map((round) => (
                <button
                  key={round.id}
                  onClick={() => setSelectedRound(round.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRound === round.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                  }`}
                >
                  <p className="font-medium text-white">{round.label}</p>
                  <p className="text-sm text-zinc-500">{round.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Equity Details */}
      {companyName && selectedRound && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Détails de votre participation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Pourcentage d&apos;&eacute;quit&eacute; (%)</label>
              <input
                type="number"
                placeholder="Ex: 2.5"
                step="0.01"
                value={equityPercentage}
                onChange={(e) => setEquityPercentage(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="text-center text-zinc-500 text-sm">OU</div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre d&apos;actions/parts</label>
              <input
                type="number"
                placeholder="Ex: 1000"
                value={sharesCount}
                onChange={(e) => setSharesCount(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Valuation */}
      {companyName && selectedRound && (equityPercentage || sharesCount) && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ Valorisation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Montant investi (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 25000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Valorisation actuelle de l&apos;entreprise (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 100000000"
                value={currentValuation}
                onChange={(e) => setCurrentValuation(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {companyName && selectedRound && (equityPercentage || sharesCount) && purchasePrice && currentValuation && (
        <div className="mb-10 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400 mb-3">R&eacute;sum&eacute; de votre investissement</p>
          <div className="space-y-2">
            {equityPercentage && (
              <div className="flex justify-between">
                <span className="text-zinc-300">Votre participation:</span>
                <span className="text-white font-bold">{equityPercentage}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-300">Valeur estimée:</span>
              <span className="text-white font-bold">CHF {parseFloat(getEquityValue() || '0').toLocaleString('fr-CH')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-300">Montant investi:</span>
              <span className="text-zinc-400">CHF {parseFloat(purchasePrice).toLocaleString('fr-CH')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700">
              <span className="text-zinc-300">Gain/Perte:</span>
              <span className={`font-bold ${parseFloat(getGainLoss() || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(getGainLoss() || '0') >= 0 ? '+' : ''}
                CHF {parseFloat(getGainLoss() || '0').toLocaleString('fr-CH')}
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
          className="flex-1 px-6 py-3 bg-orange-500 rounded-full text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
