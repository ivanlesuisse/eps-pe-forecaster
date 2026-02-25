'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, DollarSign, Zap } from 'lucide-react';

interface ProjectionData {
  year: number;
  balance: number;
  contributions: number;
  gains: number;
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'compound' | 'projection' | 'analysis'>('compound');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060b1a] to-[#0a0f23] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Outils d&apos;Investissement
          </h1>
          <p className="text-zinc-400 text-lg">
            Calculateurs avanc&eacute;s et projections pour optimiser vos investissements
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('compound')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'compound'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="inline mr-2 w-4 h-4" />
            Intérêts Composés
          </button>
          <button
            onClick={() => setActiveTab('projection')}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === 'projection'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="inline mr-2 w-4 h-4" />
            Projections
          </button>
        </div>

        {/* Content */}
        {activeTab === 'compound' && <CompoundInterestCalculator />}
        {activeTab === 'projection' && <InvestmentProjection />}
      </div>
    </div>
  );
}

/**
 * Calculateur d'intérêts composés
 */
function CompoundInterestCalculator() {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(20);

  const data = useMemo(() => {
    const result: ProjectionData[] = [];
    let balance = initialAmount;
    let totalContributions = initialAmount;

    for (let year = 0; year <= years; year++) {
      const gains = balance - totalContributions;
      result.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        gains: Math.round(gains),
      });

      // Calculate for next year
      for (let month = 0; month < 12; month++) {
        balance += monthlyContribution;
        balance *= 1 + annualReturn / 100 / 12;
      }
      totalContributions += monthlyContribution * 12;
    }

    return result;
  }, [initialAmount, monthlyContribution, annualReturn, years]);

  const finalBalance = data[data.length - 1]?.balance || 0;
  const totalInvested = data[data.length - 1]?.contributions || 0;
  const totalGains = finalBalance - totalInvested;
  const roi = totalInvested > 0 ? ((totalGains / totalInvested) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-sm font-semibold text-cyan-400 mb-3">
            <DollarSign className="inline w-4 h-4 mr-1" />
            Capital Initial
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-zinc-500 mt-2">${initialAmount.toLocaleString()}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-sm font-semibold text-cyan-400 mb-3">
            <TrendingUp className="inline w-4 h-4 mr-1" />
            Contribution Mensuelle
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-zinc-500 mt-2">${monthlyContribution.toLocaleString()}/mois</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-sm font-semibold text-cyan-400 mb-3">
            <Zap className="inline w-4 h-4 mr-1" />
            Rendement Annuel (%)
          </label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            step="0.5"
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-zinc-500 mt-2">{annualReturn}% par an</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <label className="block text-sm font-semibold text-cyan-400 mb-3">
            Période (années)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min="1"
            max="50"
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-zinc-500 mt-2">{years} ans</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-6">
          <p className="text-emerald-400 text-sm font-semibold mb-2">SOLDE FINAL</p>
          <p className="text-4xl font-bold text-white">${finalBalance.toLocaleString()}</p>
          <p className="text-zinc-400 text-xs mt-2">Montant total après {years} années</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-400/10 to-blue-600/10 border border-cyan-400/30 rounded-lg p-6">
          <p className="text-cyan-400 text-sm font-semibold mb-2">MONTANT INVESTI</p>
          <p className="text-4xl font-bold text-white">${totalInvested.toLocaleString()}</p>
          <p className="text-zinc-400 text-xs mt-2">Capital investi + contributions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400/10 to-indigo-600/10 border border-blue-400/30 rounded-lg p-6">
          <p className="text-blue-400 text-sm font-semibold mb-2">GAINS (ROI)</p>
          <p className="text-4xl font-bold text-white">${totalGains.toLocaleString()}</p>
          <p className="text-zinc-400 text-xs mt-2">+{roi}% de retour sur investissement</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Area Chart */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Croissance du Portefeuille</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(6, 11, 26, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Chart */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Contributions vs Gains</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(6, 11, 26, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="contributions" stackId="a" fill="#06b6d4" name="Investissements" />
              <Bar dataKey="gains" stackId="a" fill="#10b981" name="Gains" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Projection Détaillée par Année</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Année</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Investissements</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Gains</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Solde Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white">{row.year}</td>
                  <td className="text-right py-3 px-4 text-cyan-400">${row.contributions.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-emerald-400">${row.gains.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 font-semibold text-white">
                    ${row.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Projection d'investissement avec scénarios
 */
function InvestmentProjection() {
  const [scenarios, setScenarios] = useState([
    { name: 'Conservative', amount: 5000, return: 4, color: '#3b82f6' },
    { name: 'Modéré', amount: 10000, return: 7, color: '#06b6d4' },
    { name: 'Agressif', amount: 15000, return: 10, color: '#10b981' },
  ]);
  const [years, setYears] = useState(20);

  const projectionData = useMemo(() => {
    const result: Array<Record<string, number>> = [];

    for (let year = 0; year <= years; year++) {
      const row: Record<string, number> = { year };

      scenarios.forEach((scenario) => {
        let balance = scenario.amount;
        for (let y = 0; y < year; y++) {
          balance *= 1 + scenario.return / 100;
        }
        row[scenario.name] = Math.round(balance);
      });

      result.push(row);
    }

    return result;
  }, [scenarios, years]);

  return (
    <div className="space-y-8">
      {/* Scenario Controls */}
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Comparer des Scénarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scenario.color }}
                />
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => {
                    const updated = [...scenarios];
                    updated[idx].name = e.target.value;
                    setScenarios(updated);
                  }}
                  className="bg-transparent text-white font-semibold flex-1 outline-none border-b border-transparent hover:border-cyan-400"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Investissement Initial</label>
                  <input
                    type="number"
                    value={scenario.amount}
                    onChange={(e) => {
                      const updated = [...scenarios];
                      updated[idx].amount = Number(e.target.value);
                      setScenarios(updated);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Rendement Annuel (%)</label>
                  <input
                    type="number"
                    value={scenario.return}
                    onChange={(e) => {
                      const updated = [...scenarios];
                      updated[idx].return = Number(e.target.value);
                      setScenarios(updated);
                    }}
                    step="0.5"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Valeur après {years} ans:</p>
                  <p className="text-2xl font-bold text-white">
                    ${projectionData[years]?.[scenario.name]?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-cyan-400 mb-3">
          P&eacute;riode d&apos;analyse: {years} ann&eacute;es
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Comparison Chart */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Projection Comparative</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(6, 11, 26, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Legend />
            {scenarios.map((scenario) => (
              <Line
                key={scenario.name}
                type="monotone"
                dataKey={scenario.name}
                stroke={scenario.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Final Comparison Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Valeurs Finales Comparées</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Scénario</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Investi</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Valeur Finale</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Gains</th>
                <th className="text-right py-3 px-4 text-cyan-400 font-semibold">Rendement</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                const finalValue = projectionData[years]?.[scenario.name] || 0;
                const gains = finalValue - scenario.amount;
                const roi = ((gains / scenario.amount) * 100).toFixed(1);
                return (
                  <tr key={scenario.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: scenario.color }}
                      />
                      {scenario.name}
                    </td>
                    <td className="text-right py-3 px-4 text-white">${scenario.amount.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-400">
                      ${finalValue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-cyan-400">${gains.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-blue-400 font-semibold">+{roi}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
