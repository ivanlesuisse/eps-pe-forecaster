"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, Fragment } from 'react';

const chartData = [
  { date: '1/27/2026', stocks: 110000, crypto: 18000, savings: 3600, checking: 3000, other: 800, metals: 700 },
  { date: '1/30/2026', stocks: 112000, crypto: 19000, savings: 3650, checking: 3000, other: 820, metals: 720 },
  { date: '2/2/2026', stocks: 108000, crypto: 17500, savings: 3650, checking: 3000, other: 850, metals: 730 },
  { date: '2/5/2026', stocks: 114000, crypto: 20500, savings: 3660, checking: 3000, other: 880, metals: 740 },
  { date: '2/8/2026', stocks: 113000, crypto: 19500, savings: 3666, checking: 3000, other: 900, metals: 750 },
  { date: '2/17/2026', stocks: 115000, crypto: 21500, savings: 3658, checking: 3000, other: 900, metals: 754 },
  { date: '2/20/2026', stocks: 113884, crypto: 20533, savings: 3666, checking: 3000, other: 900, metals: 754 },
];

const assets = [
  { 
    name: 'Stocks & Funds', 
    color: '#d946ef', 
    split: '79%', 
    value: 'CHF 115,053', 
    pl: '+CHF 36,748', 
    plPercent: '+46.93%', 
    isPositive: true,
    subAccounts: [
      { name: 'Ivan Barroso', logo: 'https://www.google.com/s2/favicons?domain=revolut.com', split: '77%', value: 'CHF 111,383', pl: '+CHF 35,558', plPercent: '+46.89%', isPositive: true },
      { name: 'ibit', logo: 'https://www.google.com/s2/favicons?domain=yuh.com', split: '3%', value: 'CHF 3,670', pl: '+CHF 1,190', plPercent: '+47.96%', isPositive: true }
    ]
  },
  { 
    name: 'Crypto', 
    color: '#8b5cf6', 
    split: '15%', 
    value: 'CHF 22,137', 
    pl: '-CHF 504', 
    plPercent: '-2.23%', 
    isPositive: false,
    subAccounts: [
      { name: 'yuh crypto', logo: 'https://www.google.com/s2/favicons?domain=yuh.com', split: '15%', value: 'CHF 22,137', pl: '-CHF 504', plPercent: '-2.23%', isPositive: false }
    ]
  },
  { 
    name: 'Savings accounts', 
    color: '#3b82f6', 
    split: '3%', 
    value: 'CHF 3,658', 
    pl: '', 
    plPercent: '', 
    isPositive: null,
    subAccounts: [
      { name: 'bricks', logo: 'https://www.google.com/s2/favicons?domain=bricks.co', split: '3%', value: 'CHF 3,658', pl: '', plPercent: '', isPositive: null }
    ]
  },
  { 
    name: 'Checking accounts', 
    color: '#14b8a6', 
    split: '2%', 
    value: 'CHF 3,000', 
    pl: '', 
    plPercent: '', 
    isPositive: null,
    subAccounts: [
      { name: 'yuh savings', logo: 'https://www.google.com/s2/favicons?domain=yuh.com', split: '2%', value: 'CHF 3,000', pl: '', plPercent: '', isPositive: null }
    ]
  },
  { 
    name: 'Other assets', 
    color: '#f97316', 
    split: '0.62%', 
    value: 'CHF 900', 
    pl: '+CHF 100', 
    plPercent: '+12.50%', 
    isPositive: true,
    subAccounts: []
  },
];

const pieData = [
  { name: 'Stocks & Funds', value: 79, color: '#d946ef' },
  { name: 'Crypto', value: 15, color: '#8b5cf6' },
  { name: 'Savings accounts', value: 3, color: '#3b82f6' },
  { name: 'Checking accounts', value: 2, color: '#14b8a6' },
  { name: 'Other assets', value: 1, color: '#f97316' },
];

export default function PortfolioPage() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (name: string) => {
    setExpandedRows(prev => 
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-3 bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6 relative">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stocksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#3f3f46" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#3f3f46" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `CHF ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="stocks" stackId="1" stroke="#d946ef" fill="#d946ef" fillOpacity={0.2} />
                <Area type="monotone" dataKey="crypto" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="savings" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="checking" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="other" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Area type="monotone" dataKey="metals" stackId="1" stroke="#7dd3fc" fill="#7dd3fc" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All P&L Section */}
        <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-zinc-500 text-sm mb-2">All P&L</div>
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-green-500">+CHF 37,114</span>
                <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-md font-bold">+34.24%</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                The unrealized capital gain is the difference between your unit purchase price and the current price. This amount does not take into account realized capital gains.
            </p>
            <button className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                See how it works <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Table Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-bold text-white">Assets</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 cursor-pointer">
                All categories <ChevronDown size={14} />
              </div>
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 cursor-pointer">
                All <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-wider border-b border-zinc-800/50">
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold text-center">Split</th>
                  <th className="px-6 py-4 font-bold text-right">Value <ChevronDown size={10} className="inline ml-1" /></th>
                  <th className="px-6 py-4 font-bold text-right">All P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {assets.map((asset) => (
                  <Fragment key={asset.name}>
                    <tr 
                      className="hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                      onClick={() => toggleRow(asset.name)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ChevronRight size={14} className={`text-zinc-700 transition-transform ${expandedRows.includes(asset.name) ? 'rotate-90' : ''}`} />
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }}></div>
                          <span className="text-sm font-semibold text-white">{asset.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-white">{asset.split}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-white">{asset.value}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {asset.pl ? (
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-bold ${asset.isPositive ? 'text-green-500' : 'text-red-500'}`}>{asset.pl}</span>
                            <span className={`text-[10px] font-bold ${asset.isPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>{asset.plPercent}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedRows.includes(asset.name) && asset.subAccounts.map((sub) => (
                      <tr key={sub.name} className="bg-zinc-900/40 border-t border-zinc-800/20">
                        <td className="px-6 py-4 pl-16">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={sub.logo} alt={sub.name} className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-zinc-300">{sub.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-zinc-400">{sub.split}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-zinc-300">{sub.value}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {sub.pl ? (
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-medium ${sub.isPositive ? 'text-green-500/80' : 'text-red-500/80'}`}>{sub.pl}</span>
                              <span className={`text-[10px] font-medium ${sub.isPositive ? 'text-green-500/50' : 'text-red-500/50'}`}>{sub.plPercent}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-800">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Donut Chart Section */}
        <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-white leading-none mb-1">CHF 145,519</div>
              <div className="text-xs text-zinc-500 font-medium">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
