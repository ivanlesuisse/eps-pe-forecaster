"use client";

import { 
  Building2, 
  Coins, 
  Briefcase, 
  Wallet, 
  Diamond, 
  Rocket, 
  Landmark,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrokerSearch } from "@/components/BrokerSearch";

const categories = [
  {
    id: "banking",
    title: "Comptes bancaires",
    description: "Comptes courants, livrets d'épargne",
    icon: Landmark,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    id: "investment",
    title: "Investissements",
    description: "Actions, fonds, obligations",
    icon: Briefcase,
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  {
    id: "crypto",
    title: "Cryptomonnaies",
    description: "Bitcoin, Ethereum et autres",
    icon: Coins,
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  {
    id: "real-estate",
    title: "Immobilier",
    description: "Maisons, appartements, terrains",
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    id: "commodity",
    title: "Matières premières",
    description: "Or, argent, métaux",
    icon: Diamond,
    color: "text-sky-500",
    bg: "bg-sky-500/10"
  },
  {
    id: "startup",
    title: "Startups",
    description: "Investissements en capital-risque",
    icon: Rocket,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    id: "other",
    title: "Autres actifs",
    description: "Voitures, bijoux, collections...",
    icon: Wallet,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10"
  }
];

export default function AddAssetPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-white mb-2">Compléter mon patrimoine</h1>
        <p className="text-zinc-400">Sélectionnez une catégorie pour ajouter un nouvel actif.</p>
      </div>

      <BrokerSearch />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/dashboard/add/${cat.id}`}
            className="flex items-center justify-between p-5 bg-[#0d0d0d] border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${cat.bg} ${cat.color}`}>
                <cat.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{cat.title}</h3>
                <p className="text-sm text-zinc-500">{cat.description}</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold text-white mb-1">Vous ne trouvez pas votre actif ?</h4>
          <p className="text-sm text-zinc-500">Ajoutez-le manuellement dans la cat&eacute;gorie &quot;Autres actifs&quot; ou contactez-nous.</p>
        </div>
        <button className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors">
          Contacter le support
        </button>
      </div>
    </div>
  );
}
