"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, Coins, Briefcase, Wallet, Diamond, Rocket, Landmark, Trash2, Edit2 } from "lucide-react";
import { getGainLossColorClass } from "@/lib/calculations";

interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  institution?: string;
  value: number;
  quantity: number | null;
  buyingPrice: number | null;
  currency: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ComponentType<{ size: number }>> = {
  BANKING: Landmark,
  INVESTMENT: Briefcase,
  CRYPTO: Coins,
  REAL_ESTATE: Building2,
  COMMODITY: Diamond,
  STARTUP: Rocket,
  OTHER: Wallet,
};

const typeColors: Record<string, string> = {
  BANKING: "bg-emerald-500/10 text-emerald-500",
  INVESTMENT: "bg-violet-500/10 text-violet-500",
  CRYPTO: "bg-violet-500/10 text-violet-500",
  REAL_ESTATE: "bg-blue-500/10 text-blue-500",
  COMMODITY: "bg-sky-500/10 text-sky-500",
  STARTUP: "bg-orange-500/10 text-orange-500",
  OTHER: "bg-zinc-500/10 text-zinc-500",
};

export default function AssetsList() {
  const { isLoaded, userId } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      setError("Vous devez être connecté pour voir vos actifs");
      setLoading(false);
      return;
    }

    const fetchAssets = async () => {
      try {
        console.log("Authenticated user:", userId);
        console.log("Fetching assets...");
        const response = await fetch("/api/assets");
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Failed to fetch assets");
        }
        
        const data = await response.json();
        console.log("Assets fetched:", data);
        setAssets(data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [isLoaded, userId]);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet actif ?")) {
      try {
        const response = await fetch(`/api/assets/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete asset");
        setAssets(assets.filter(a => a.id !== id));
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const calculateGainLoss = (asset: Asset) => {
    if (asset.buyingPrice && asset.quantity) {
      return asset.value - (asset.buyingPrice * asset.quantity);
    }
    return 0;
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  if (!isLoaded) return <div className="text-white">Chargement de l&apos;authentification...</div>;
  
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
        <p className="font-bold mb-2">Erreur: {error}</p>
        <p className="text-sm mb-3">V&eacute;rifiez que vous &ecirc;tes connect&eacute; et autoris&eacute; &agrave; acc&eacute;der aux actifs.</p>
        <Link href="/sign-in" className="text-red-400 underline hover:text-red-300">
          Aller &agrave; la page de connexion
        </Link>
      </div>
    );
  }

  if (loading) return <div className="text-white">Chargement des actifs...</div>;

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Aucun actif ajouté pour le moment.</p>
        <Link href="/dashboard/add" className="text-orange-500 hover:text-orange-600 font-bold">
          Ajouter votre premier actif
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-zinc-500 text-sm">Valeur totale du portefeuille</p>
          <p className="text-3xl font-bold text-white">CHF {totalValue.toLocaleString('fr-CH')}</p>
        </div>
        <Link href="/dashboard/add" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-colors">
          + Ajouter un actif
        </Link>
      </div>

      <div className="space-y-3">
        {assets.map((asset) => {
          const gainLoss = calculateGainLoss(asset);
          const Icon = typeIcons[asset.type];
          
          return (
            <div key={asset.id} className="bg-[#0d0d0d] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {Icon && (
                    <div className={`p-3 rounded-lg ${typeColors[asset.type]}`}>
                      <Icon size={20} />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{asset.name}</p>
                    <p className="text-zinc-500 text-sm">
                      {asset.institution ? `${asset.institution} • ` : ""}
                      {asset.category}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1 mr-4">
                  <p className="text-white font-bold">CHF {asset.value.toLocaleString('fr-CH')}</p>
                  {gainLoss !== 0 && (
                    <p className={`text-sm font-bold ${getGainLossColorClass(gainLoss)}`}>
                      {gainLoss > 0 ? '+' : ''}CHF {gainLoss.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Éditer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
