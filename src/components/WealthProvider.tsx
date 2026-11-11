"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WealthData, WealthAsset, Goal, summarize } from "@/lib/wealth";
const empty: WealthData = {
  assets: [],
  goals: [],
  snapshots: [],
  monthlyIncome: 0,
  monthlyExpenses: 0,
};
export const demoData: WealthData = {
  monthlyIncome: 6200,
  monthlyExpenses: 3900,
  goals: [
    {
      id: "demo-goal",
      name: "Apport immobilier",
      targetAmount: 100000,
      currentAmount: 38000,
      monthlySaving: 1200,
      deadline: "2030-12-31",
    },
  ],
  assets: [
    {
      id: "demo-etf",
      name: "ETF Monde",
      type: "ETF",
      category: "ETF",
      institution: "Courtier",
      value: 78000,
      quantity: 600,
      buyingPrice: 100,
      currency: "CHF",
      annualFeePercent: 0.2,
      monthlyIncome: 120,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-cash",
      name: "Épargne de sécurité",
      type: "BANKING",
      category: "Épargne",
      institution: "Banque",
      value: 22000,
      quantity: 1,
      buyingPrice: null,
      currency: "CHF",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-3a",
      name: "Prévoyance 3a",
      type: "PENSION_3A",
      category: "3a",
      institution: "Fondation",
      value: 31000,
      quantity: 1,
      buyingPrice: null,
      currency: "CHF",
      annualFeePercent: 0.4,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-btc",
      name: "Bitcoin",
      type: "CRYPTO",
      category: "Crypto",
      institution: "Wallet",
      value: 9000,
      quantity: 0.12,
      buyingPrice: 50000,
      currency: "CHF",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-debt",
      name: "Crédit personnel",
      type: "DEBT",
      category: "Crédit",
      institution: "Banque",
      value: 8000,
      quantity: 1,
      buyingPrice: null,
      currency: "CHF",
      updatedAt: new Date().toISOString(),
    },
  ],
  snapshots: [
    { day: "2026-08-01", gross: 128000, debt: 10000, net: 118000 },
    { day: "2026-09-01", gross: 132000, debt: 9500, net: 122500 },
    { day: "2026-10-01", gross: 137000, debt: 9000, net: 128000 },
    { day: "2026-11-01", gross: 140000, debt: 8000, net: 132000 },
  ],
};
type Context = {
  data: WealthData;
  loading: boolean;
  error: string;
  demo: boolean;
  refresh: () => Promise<void>;
  mutate: (path: string, method: string, body?: unknown) => Promise<void>;
};
const context = createContext<Context | null>(null);
export function WealthProvider({
  children,
  demo = false,
}: {
  children: ReactNode;
  demo?: boolean;
}) {
  const [data, setData] = useState<WealthData>(demo ? demoData : empty);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (demo) return;
    try {
      const r = await fetch("/api/wealth", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Chargement impossible.");
      setData(d);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [demo]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const mutate = async (path: string, method: string, body?: unknown) => {
    if (demo) {
      setData((old) => {
        const next = structuredClone(old);
        const id = path.split("/").pop();
        const stamp = new Date().toISOString();
        if (path === "/api/assets/import") {
          const rows = (body as { rows: WealthAsset[] }).rows;
          next.assets.push(
            ...rows.map((a) => ({
              ...a,
              id: crypto.randomUUID(),
              updatedAt: stamp,
            })),
          );
        } else if (path.startsWith("/api/assets")) {
          if (method === "POST")
            next.assets.unshift({
              ...(body as WealthAsset),
              id: crypto.randomUUID(),
              updatedAt: stamp,
            });
          if (method === "PUT")
            next.assets = next.assets.map((a) =>
              a.id === id
                ? { ...a, ...(body as WealthAsset), updatedAt: stamp }
                : a,
            );
          if (method === "DELETE")
            next.assets = next.assets.filter((a) => a.id !== id);
        } else if (path.startsWith("/api/goals")) {
          if (method === "POST")
            next.goals.push({ ...(body as Goal), id: crypto.randomUUID() });
          if (method === "PUT")
            next.goals = next.goals.map((g) =>
              g.id === id ? { ...g, ...(body as Goal) } : g,
            );
          if (method === "DELETE")
            next.goals = next.goals.filter((g) => g.id !== id);
        } else if (path === "/api/wealth") Object.assign(next, body);
        else if (path === "/api/snapshots") {
          const s = summarize(next.assets);
          const day = stamp.slice(0, 10);
          next.snapshots = next.snapshots.filter((s) => s.day !== day);
          next.snapshots.push({
            day,
            gross: s.gross,
            debt: s.debt,
            net: s.net,
          });
        }
        return next;
      });
      return;
    }
    const r = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || "Enregistrement impossible.");
    await refresh();
  };
  return (
    <context.Provider value={{ data, loading, error, demo, refresh, mutate }}>
      {children}
    </context.Provider>
  );
}
export function useWealth() {
  const c = useContext(context);
  if (!c) throw new Error("WealthProvider absent");
  return c;
}
