"use client";

import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";

// Liste des banques populaires en Suisse
const popularBanks = [
  { id: "ubs", name: "UBS", logo: "🏦" },
  { id: "credit_suisse", name: "Credit Suisse", logo: "🏦" },
  { id: "raiffeisen", name: "Raiffeisen", logo: "🏦" },
  { id: "migros", name: "Migros Bank", logo: "🏦" },
  { id: "coop", name: "Coop Bank", logo: "🏦" },
  { id: "ubs_neo", name: "UBS Neo", logo: "📱" },
  { id: "revolut", name: "Revolut", logo: "📱" },
  { id: "wise", name: "Wise", logo: "📱" },
];

const accountTypes = [
  { id: "checking", label: "Compte courant", description: "Transactions quotidiennes" },
  { id: "savings", label: "Compte épargne", description: "Rendements à court terme" },
  { id: "fix_term", label: "Dépôt à terme fixe", description: "Intérêts fixes" },
];

export default function AddBankingAssetPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBanks = popularBanks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = async () => {
    if (loading) return;
    if (selectedBank && selectedType && balance) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: accountName || "Compte bancaire",
            type: "BANKING",
            category: selectedType,
            institution: selectedBank,
            value: parseFloat(balance),
            currency: "CHF",
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.details || "Failed to create asset");
        }
        
        router.push("/dashboard");
      } catch (error) {
        const errorMessage = (error as Error).message || "Une erreur est survenue";
        console.error("Error creating asset:", error);
        setError(errorMessage);

      } finally {
        setLoading(false);
      }
    }
  };

  const isComplete = selectedBank && selectedType && balance && accountName;

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
        <h1 className="text-3xl font-bold text-white mb-2">Ajouter un compte bancaire</h1>
        <p className="text-zinc-400">Où aimeriez-vous synchroniser vos comptes ou les ajouter manuellement ?</p>
      </div>

      {/* Step 1: Select Bank */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">1️⃣ Banque</h2>
        
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher une banque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredBanks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                selectedBank === bank.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
              }`}
            >
              <div className="text-2xl mb-2">{bank.logo}</div>
              <p className="text-sm font-medium text-white">{bank.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Select Account Type */}
      {selectedBank && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">2️⃣ Type de compte</h2>
          <div className="space-y-3">
            {accountTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.id
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-[#0d0d0d] hover:border-zinc-700"
                }`}
              >
                <p className="font-medium text-white">{type.label}</p>
                <p className="text-sm text-zinc-500">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Account Details */}
      {selectedBank && selectedType && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">3️⃣ Détails du compte</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Nom du compte</label>
              <input
                type="text"
                placeholder="Ex: Compte principal"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Solde (CHF)</label>
              <input
                type="number"
                placeholder="Ex: 10000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}
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
          disabled={!isComplete || loading}
          className="flex-1 px-6 py-3 bg-orange-500 rounded-full text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Ajout en cours…" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
