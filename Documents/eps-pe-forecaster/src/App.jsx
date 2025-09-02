import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, LineChart as LineChartIcon, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Small helper to format numbers nicely
const fmt = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);

// Compute projection data for each year until maxYears
function buildProjectionData({
  startYear,
  currentEPS,
  growthPct, // e.g. 15 for 15%
  entryPrices,
  maxYears,
}) {
  const g = 1 + growthPct / 100;
  const rows = Array.from({ length: maxYears + 1 }, (_, i) => {
    const year = startYear + i;
    const eps = currentEPS * Math.pow(g, i);
    const base = {
      year,
      t: i, // t = years from now
      eps,
    };

    entryPrices.forEach((p, idx) => {
      base[`pe_${idx}`] = p / eps;
    });
    return base;
  });
  return rows;
}

export default function ForecastEPSPERatio() {
  // Defaults from the user's example
  const [currentPrice, setCurrentPrice] = useState<number>(175);
  const [currentEPS, setCurrentEPS] = useState<number>(3);
  const [growthPct, setGrowthPct] = useState<number>(15);
  const [entryPrices, setEntryPrices] = useState<number[]>([175, 160]);

  // Which horizons to show in the summary table
  const [horizons, setHorizons] = useState<number[]>([1, 3, 5, 10]);

  // Max chart horizon in years
  const [maxYears, setMaxYears] = useState<number>(10);

  const startYear = new Date().getFullYear();

  const data = useMemo(
    () =>
      buildProjectionData({
        startYear,
        currentEPS: Math.max(0.0001, currentEPS || 0),
        growthPct: growthPct || 0,
        entryPrices: entryPrices.filter((n) => n > 0),
        maxYears,
      }),
    [startYear, currentEPS, growthPct, entryPrices, maxYears]
  );

  const addEntryPrice = () => setEntryPrices((arr) => [...arr, currentPrice]);
  const removeEntryPrice = (idx: number) =>
    setEntryPrices((arr) => arr.filter((_, i) => i !== idx));

  const updateEntryPrice = (idx: number, value: number) =>
    setEntryPrices((arr) => arr.map((v, i) => (i === idx ? value : v)));

  const horizonSet = new Set(horizons);

  const peColor = (idx: number) => {
    const palette = [
      "#2563eb",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#14b8a6",
      "#e11d48",
      "#22c55e",
    ];
    return palette[idx % palette.length];
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            📈 EPS & P/E Forecaster
          </motion.h1>
          <div className="text-sm text-neutral-500">{startYear} Edition</div>
        </header>

        {/* Inputs */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid md:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-sm font-medium mb-2">Paramètres de base</div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-neutral-600">EPS actuel ($)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  min={0}
                  step={0.01}
                  value={currentEPS}
                  onChange={(e) => setCurrentEPS(parseFloat(e.target.value))}
                />
              </label>

              <label className="block">
                <span className="text-xs text-neutral-600">Croissance EPS (%/an)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  step={0.1}
                  value={growthPct}
                  onChange={(e) => setGrowthPct(parseFloat(e.target.value))}
                />
              </label>

              <label className="block">
                <span className="text-xs text-neutral-600">Horizon graphique (années)</span>
                <input
                  type="range"
                  className="mt-2 w-full"
                  min={1}
                  max={20}
                  value={maxYears}
                  onChange={(e) => setMaxYears(parseInt(e.target.value))}
                />
                <div className="text-xs text-neutral-600 mt-1">{maxYears} ans</div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-sm font-medium mb-2">Prix d'entrée & P/E actuel</div>
            <div className="flex gap-2 items-end mb-3">
              <label className="flex-1">
                <span className="text-xs text-neutral-600">Prix courant ($)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  min={0}
                  step={0.01}
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(parseFloat(e.target.value))}
                />
              </label>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white px-3 py-2 hover:bg-neutral-800"
                onClick={addEntryPrice}
                title="Ajouter comme scénario"
              >
                <Plus size={16} />
                Ajouter
              </button>
            </div>

            <div className="space-y-2">
              {entryPrices.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border rounded-xl px-3 py-2"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: peColor(idx) }}
                    title={`Scénario #${idx + 1}`}
                  />
                  <input
                    type="number"
                    className="flex-1 outline-none"
                    value={p}
                    min={0}
                    step={0.01}
                    onChange={(e) => updateEntryPrice(idx, parseFloat(e.target.value))}
                  />
                  <div className="text-xs text-neutral-600">
                    P/E actuel: <strong>{fmt(p / Math.max(currentEPS, 0.0001))}</strong>
                  </div>
                  <button
                    className="ml-2 p-1 rounded-lg hover:bg-neutral-100"
                    onClick={() => removeEntryPrice(idx)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {entryPrices.length === 0 && (
                <div className="text-xs text-neutral-500">Ajoutez un ou plusieurs prix d'entrée.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-sm font-medium mb-2">Horizons (tableau récap)</div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map((h) => (
                <label
                  key={h}
                  className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm cursor-pointer ${
                    horizonSet.has(h) ? "bg-neutral-900 text-white" : "bg-white"
                  }`}
                  onClick={() =>
                    setHorizons((arr) =>
                      arr.includes(h) ? arr.filter((x) => x !== h) : [...arr, h]
                    )
                  }
                >
                  <input type="checkbox" checked={horizonSet.has(h)} readOnly />
                  {h} ans
                </label>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Le graphique affiche tous les pas annuels jusqu'à l'horizon choisi, tandis que le tableau résume 
              {" "}
              1, 3, 5, 10 ans (sélection multiples possibles).
            </p>
          </div>
        </motion.section>

        {/* Charts */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <LineChartIcon size={18} />
              <h2 className="font-semibold">Projection du EPS</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tickFormatter={(t) => `${t}a`} />
                  <YAxis tickFormatter={(v) => `$${fmt(v as number)}`} />
                  <Tooltip formatter={(v: any) => `$${fmt(v)}`} labelFormatter={(l) => `${l} ans`} />
                  <Legend />
                  <Line type="monotone" dataKey="eps" name="EPS projeté" stroke="#111827" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={18} />
              <h2 className="font-semibold">P/E futur (prix d'entrée constant)</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tickFormatter={(t) => `${t}a`} />
                  <YAxis tickFormatter={(v) => `${fmt(v as number)}`} />
                  <Tooltip formatter={(v: any) => fmt(v)} labelFormatter={(l) => `${l} ans`} />
                  <Legend />
                  {entryPrices.map((_, idx) => (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={`pe_${idx}`}
                      name={`P/E @ $${fmt(entryPrices[idx])}`}
                      stroke={peColor(idx)}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* Summary Table */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Récapitulatif par horizon</h3>
            <div className="text-xs text-neutral-500">
              Hypothèse: P/E = Prix d'entrée / EPS projeté
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600">
                  <th className="text-left px-4 py-2">Horizon</th>
                  <th className="text-left px-4 py-2">EPS</th>
                  {entryPrices.map((p, idx) => (
                    <th key={idx} className="text-left px-4 py-2">P/E @ ${fmt(p)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((row) => horizonSet.has(row.t))
                  .map((row) => (
                    <tr key={row.t} className="border-t">
                      <td className="px-4 py-2 font-medium">{row.t} ans</td>
                      <td className="px-4 py-2">${fmt(row.eps)}</td>
                      {entryPrices.map((_, idx) => (
                        <td key={idx} className="px-4 py-2">{fmt((row as any)[`pe_${idx}`])}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Notes */}
        <section className="mt-6 text-xs text-neutral-500 leading-relaxed">
          <p>
            ⚠️ Ceci est un outil pédagogique. Les projections dépendent entièrement de l'hypothèse de
            croissance du EPS et ne constituent pas un conseil d'investissement. Le P/E futur affiché suppose que
            le prix d'entrée reste constant. Vous pouvez ajouter plusieurs scénarios de prix pour voir la sensibilité.
          </p>
        </section>
      </div>
    </div>
  );
}
