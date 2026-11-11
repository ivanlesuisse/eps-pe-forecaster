"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, ShieldCheck, Unplug } from "lucide-react";

type ConnectionStatus = {
  connected: boolean;
  tokenExpiresAt?: string | null;
  lastConnectionUpdateAt?: string | null;
  positions: number;
  totalValue: number;
};

export default function IBKRPage() {
  return (
    <Suspense fallback={<div role="status" className="p-6 text-zinc-400">Chargement du statut IBKR...</div>}>
      <IBKRContent />
    </Suspense>
  );
}

function IBKRContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [busyAction, setBusyAction] = useState<"connect" | "sync" | "disconnect" | null>(null);
  const [message, setMessage] = useState<string>("");

  const callbackStatus = useMemo(() => {
    if (params.get("connected") === "1") {
      return "Connexion IBKR réussie. Synchronisation démarrée.";
    }

    if (params.get("error")) {
      return "Échec de connexion IBKR. Vérifie les credentials API et la clé RSA.";
    }

    return "";
  }, [params]);

  async function loadStatus() {
    setLoadingStatus(true);
    setMessage("");
    try {
      const response = await fetch("/api/brokers/ibkr/connection", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load IBKR status");
      }
      setStatus(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de chargement du statut");
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleConnect = async () => {
    setBusyAction("connect");
    setMessage("");
    try {
      const response = await fetch("/api/brokers/ibkr/connect", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start IBKR OAuth flow");
      }

      if (!data.authorizationUrl) {
        throw new Error("Missing authorization URL from server");
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Échec de connexion IBKR");
      setBusyAction(null);
    }
  };

  const handleSync = async () => {
    setBusyAction("sync");
    setMessage("");

    try {
      const response = await fetch("/api/brokers/ibkr/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setMessage(`Synchronisation OK: ${data.recordCount || 0} positions importées.`);
      await loadStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Échec de synchronisation");
    } finally {
      setBusyAction(null);
    }
  };

  const handleDisconnect = async () => {
    setBusyAction("disconnect");
    setMessage("");

    try {
      const response = await fetch("/api/brokers/ibkr/disconnect", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Disconnect failed");
      }

      setMessage("Connexion IBKR supprimée.");
      await loadStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Échec de déconnexion");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-6">
      <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Interactive Brokers</h1>
        <p className="text-zinc-400">
          Connexion OAuth 1.0a sécurisée (signature RSA). Vos identifiants IBKR ne transitent jamais par Swiss FinTrack.
        </p>
      </div>

      {(callbackStatus || message) && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-200 text-sm">
          {callbackStatus || message}
        </div>
      )}

      <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6 space-y-4">
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Chargement du statut IBKR...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-500">État connexion</p>
                <p className="text-white font-semibold mt-1">
                  {status?.connected ? "Connecté" : "Non connecté"}
                </p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-500">Positions IBKR</p>
                <p className="text-white font-semibold mt-1">{status?.positions ?? 0}</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-zinc-500">Valeur totale</p>
                <p className="text-white font-semibold mt-1">
                  CHF {(status?.totalValue ?? 0).toLocaleString("fr-CH")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleConnect}
                disabled={busyAction !== null}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center gap-2"
              >
                {busyAction === "connect" ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Connecter IBKR
              </button>

              <button
                onClick={handleSync}
                disabled={busyAction !== null || !status?.connected}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold flex items-center gap-2"
              >
                {busyAction === "sync" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Synchroniser
              </button>

              <button
                onClick={handleDisconnect}
                disabled={busyAction !== null || !status?.connected}
                className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 disabled:opacity-50 text-white font-semibold flex items-center gap-2"
              >
                {busyAction === "disconnect" ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />}
                Déconnecter
              </button>

              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-200"
              >
                Voir le dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
