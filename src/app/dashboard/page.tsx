"use client";

import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { ChevronDown, Grid, PieChart as PieChartIcon, Plus, Share2 } from 'lucide-react';
import Link from 'next/link';
import AssetsList from '@/components/AssetsList';

const worthData = [
  { date: '1/24', value: 142000 },
  { date: '1/27', value: 148000 },
  { date: '1/29', value: 152000 },
  { date: '1/31', value: 150000 },
  { date: '2/2', value: 153000 },
  { date: '2/4', value: 148000 },
  { date: '2/6', value: 143000 },
  { date: '2/8', value: 146000 },
  { date: '2/10', value: 141000 },
  { date: '2/12', value: 147000 },
  { date: '2/14', value: 145000 },
  { date: '2/16', value: 143188 },
  { date: '2/18', value: 144500 },
  { date: '2/21', value: 145522 },
];

const movers = [
  { name: 'Alphabet Inc Class A', ticker: 'US02079K3059', value: 'CHF 978', change: '+CHF 531', percent: '+118.72%', icon: 'https://www.google.com/s2/favicons?domain=google.com' },
  { name: 'NVIDIA Corp', ticker: 'US67066G1040', value: 'CHF 24,294', change: '+CHF 11,425', percent: '+88.79%', icon: 'https://www.google.com/s2/favicons?domain=nvidia.com' },
  { name: 'Ishares Bitcoin Trust', ticker: 'US46438F1012', value: 'CHF 3,670', change: '+CHF 1,190', percent: '+47.96%', icon: 'https://www.google.com/s2/favicons?domain=ishares.com' },
  { name: 'iShares Core S&P 5...', ticker: 'US4642872000', value: 'CHF 72,082', change: '+CHF 21,118', percent: '+41.44%', icon: 'https://www.google.com/s2/favicons?domain=ishares.com' },
  { name: 'Amundi Stoxx Europ...', ticker: 'LU0908500753', value: 'CHF 10,591', change: '+CHF 2,826', percent: '+36.40%', icon: 'https://www.google.com/s2/favicons?domain=amundi.com' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Mon Portefeuille</h1>
          <Link href="/dashboard/add" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={20} />
            Ajouter un actif
          </Link>
        </div>
      </div>

      <div className="space-y-8 max-w-[1400px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Worth Section */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-1 cursor-pointer hover:text-white transition-colors">
                <span className="text-sm font-medium">Total Worth</span>
                <ChevronDown size={14} />
              </div>
              <div className="text-sm text-zinc-500 mb-1">Feb 21, 2026</div>
              <div className="text-4xl font-bold text-white">CHF 145,522</div>
            </div>
            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
                {['1D', '7D', '1M', '3M', 'YTD', '1Y', 'ALL'].map((period) => (
                    <button 
                        key={period} 
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${period === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        {period}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={worthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Section */}
        <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-zinc-400 cursor-pointer hover:text-white transition-colors">
              <span className="text-sm font-medium">Distribution</span>
              <ChevronDown size={14} />
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-zinc-900 p-1 rounded-lg">
                    <button className="p-1.5 bg-zinc-800 rounded-md text-white"><Grid size={14} /></button>
                    <button className="p-1.5 text-zinc-500 hover:text-white"><PieChartIcon size={14} /></button>
                </div>
                <button className="p-1.5 text-zinc-500 hover:text-white"><Share2 size={16} /></button>
                <button className="text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2">See more</button>
            </div>
          </div>
          
          <div className="flex-grow flex gap-1 rounded-xl overflow-hidden min-h-[300px]">
            <div className="flex-grow bg-purple-600/80 p-4 flex flex-col justify-center items-center text-center">
                <div className="text-xs font-bold text-white/90">CHF 115,056</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider">Stocks & Funds • 79%</div>
            </div>
            <div className="w-1/4 flex flex-col gap-1">
                <div className="h-2/3 bg-blue-500/80 p-2 flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] font-bold text-white">CHF 22,138</div>
                    <div className="text-[8px] text-white/70 uppercase">Crypto • 15%</div>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-1">
                    <div className="bg-blue-400/80"></div>
                    <div className="bg-teal-500/80"></div>
                    <div className="bg-orange-400/80"></div>
                    <div className="bg-orange-200/80"></div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assets List Section */}
      <div className="bg-[#0d0d0d] border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Mon Portefeuille</h3>
        <AssetsList />
    </div>

      {/* Movers Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">My Movers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {movers.map((asset) => (
            <div key={asset.name} className="bg-[#0d0d0d] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.icon} alt={asset.name} className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-zinc-600 font-bold">#1</span>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-bold text-white truncate">{asset.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    {asset.ticker} <Share2 size={10} />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{asset.value}</div>
                <div className="text-[11px] font-bold text-green-500">
                    {asset.change} <span className="opacity-80">{asset.percent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

