"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader, Check, AlertCircle } from "lucide-react";

interface BrokerConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
}

const brokerConfigs: Record<string, BrokerConfig> = {
  ibkr: {
    name: "Interactive Brokers",
    icon: "🏦",
    color: "from-blue-600 to-blue-700",
    description: "Connectez votre compte Interactive Brokers pour importer automatiquement votre portefeuille",
  },
  degiro: {
    name: "DEGIRO",
    icon: "📈",
    color: "from-orange-600 to-orange-700",
    description: "Importez vos positions DEGIRO en toute sécurité via OAuth",
  },
  revolut: {
    name: "Revolut",
    icon: "💳",
    color: "from-purple-600 to-purple-700",
    description: "Synchronisez vos investissements Revolut automatiquement",
  },
};

export default function BrokerConnectionPage({ params }: { params: Promise<{ brokerId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const brokerId = resolvedParams.brokerId;
  const config = brokerConfigs[brokerId];

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="text-center py-20">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Courtier non trouvé</h1>
          <p className="text-zinc-500 mb-8">Le courtier demandé n&apos;existe pas.</p>
          <Link href="/dashboard/add" className="text-blue-400 hover:text-blue-300">
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  const handleOAuthLogin = async () => {
    setLoading(true);
    setStatus("loading");

    try {
      // Request OAuth authorization URL
      const endpoint =
        brokerId === "ibkr"
          ? "/api/brokers/ibkr/connect"
          : `/api/brokers/oauth/authorize?broker=${brokerId}`;

      const response = await fetch(endpoint, {
        method: brokerId === "ibkr" ? "POST" : "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage("❌ Erreur lors de la demande d'autorisation");
        setError(data.error);
        setLoading(false);
        return;
      }

      // Redirect to broker's authorization page
      if (data.authorizationUrl) {
        // Add broker to callback URL
        const authUrl = new URL(data.authorizationUrl);
        authUrl.searchParams.set("broker", brokerId);
        window.location.href = authUrl.toString();
      }
    } catch (error) {
      setStatus("error");
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
      setError(error instanceof Error ? error.message : "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${config.color} bg-opacity-20`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{config.name}</h1>
            <p className="text-zinc-400">{config.description}</p>
          </div>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
            <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-300 font-semibold">Connexion réussie!</p>
              <p className="text-sm text-green-200">{message}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-300 font-semibold">Erreur d&apos;authentification</p>
              <p className="text-sm text-red-200">{message}</p>
              {error && <p className="text-xs text-red-300 mt-2 font-mono">{error}</p>}
            </div>
          </div>
        )}

        {/* OAuth Button */}
        {status !== "success" && (
          <div className="space-y-6">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
              🔒 Connexion sécurisée via OAuth - Vos identifiants ne sont jamais stockés
            </div>

            <button
              onClick={handleOAuthLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? "Redirection vers " + config.name : `Se connecter avec ${config.name}`}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-zinc-500">Infos de sécurité</span>
              </div>
            </div>

            <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3 text-sm text-zinc-400">
              <div className="flex gap-3">
                <span className="text-green-400">✓</span>
                <span>Authentification sécurisée par OAuth</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">✓</span>
                <span>Tokens chiffrés et stockés de manière sécurisée</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">✓</span>
                <span>Aucun mot de passe n&apos;est jamais stocké</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">✓</span>
                <span>Tous les accès sont auditées</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            En vous connectant, vous acceptez notre{" "}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
