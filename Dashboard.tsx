import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pickaxe, Droplet, Rocket, Crown, Activity, Globe, Calculator, Layers } from 'lucide-react';
import { Asset, generateMockAssets, formatHugeNumber } from '../models/wealth';
import Decimal from 'decimal.js';

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [decimalExpansion, setDecimalExpansion] = useState<number>(0);

  useEffect(() => {
    setAssets(generateMockAssets());
  }, []);

  // Simulate algorithmic expansion and massive decimal precision scaling
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const newValue = asset.totalValue.mul(asset.growthRate);
        return { ...asset, totalValue: newValue };
      }));
      setCycleCount(c => c + 1);
      // Simulate expanding decimal precision over 10 million conceptual slots
      setDecimalExpansion(prev => prev + Math.floor(Math.random() * 1000000));
    }, 2000); // cycle every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const totalWealth = assets.reduce((acc, curr) => acc.add(curr.totalValue), new Decimal(0));

  const chartData = [
    { name: 'Cycle 1', value: 400 },
    { name: 'Cycle 2', value: 300 },
    { name: 'Cycle 3', value: 550 },
    { name: 'Cycle 4', value: 800 },
    { name: 'Cycle 5', value: 1200 },
    { name: 'Cycle 6', value: 1800 },
  ]; // Conceptual growth trend

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans overflow-x-hidden selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              PiRC Wealth Core
            </h1>
            <p className="mt-2 text-slate-400 font-mono text-sm md:text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Global & Extraterrestrial Asset Revaluation Engine
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="flex flex-col items-end bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Active Cycle</span>
              <span className="text-lg font-mono text-cyan-400">#{cycleCount}</span>
            </div>
            <div className="flex flex-col items-end bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Expansion Delta</span>
              <span className="text-lg font-mono text-blue-400 flex items-center gap-1">
                <Layers className="w-4 h-4" />
                {decimalExpansion.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* Global Valuation Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calculator className="w-32 h-32" />
            </div>
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-2">Total System Valuation</h2>
            <div className="text-4xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              ${formatHugeNumber(totalWealth)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 font-mono">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Real-time decimal compounding active</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Network Growth Trend</h2>
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-500 font-mono">ALGORITHMIC STABILITY</div>
              <div className="text-lg text-emerald-400 font-bold">99.999%</div>
            </div>
          </motion.div>
        </section>

        {/* Asset Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
               Asset Classifications
               <span className="px-2 py-1 bg-cyan-950 text-cyan-400 text-xs rounded-full border border-cyan-800/50 font-mono">
                 HIGH PRECISION
               </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {assets.map((asset, index) => (
              <AssetCard key={asset.id} asset={asset} delay={index * 0.1} />
            ))}
          </div>
        </section>

        {/* System Terminal Log */}
        <section className="bg-black/50 border border-slate-800 rounded-2xl p-4 font-mono text-xs md:text-sm text-slate-400">
          <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="ml-2 uppercase tracking-wider">System Log / Decentralized Nodes</span>
          </div>
          <div className="space-y-1 h-32 overflow-y-auto w-full custom-scrollbar">
            <p className="text-cyan-400">&gt; Initializing PiRC Autonomous Core...</p>
            <p>&gt; Connection established with NASA Deep Space Network API...</p>
            <p>&gt; Syncing global commodities indices (Gold, Silver, Platinum)...</p>
            <p>&gt; Sharding algorithm scaled to precision depth {decimalExpansion} decimal places...</p>
            <p className="text-emerald-400">&gt; Cycle #{cycleCount} processed successfully.</p>
          </div>
        </section>

      </div>
    </div>
  );
}

function AssetCard({ asset, delay }: { asset: Asset, delay: number }) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'EARTH_MINERALS': return <Pickaxe className="w-6 h-6 text-yellow-400" />;
      case 'EARTH_ENERGY': return <Droplet className="w-6 h-6 text-stone-400" />;
      case 'SPACE_METALS': return <Rocket className="w-6 h-6 text-purple-400" />;
      case 'ARTIFACTS': return <Crown className="w-6 h-6 text-amber-500" />;
      default: return <Activity className="w-6 h-6 text-slate-400" />;
    }
  };

  const getGradient = (category: string) => {
    switch (category) {
      case 'EARTH_MINERALS': return 'from-yellow-950/40 to-slate-900 border-yellow-900/30';
      case 'EARTH_ENERGY': return 'from-stone-900 to-slate-900 border-stone-800/50';
      case 'SPACE_METALS': return 'from-purple-950/40 to-slate-900 border-purple-900/30';
      case 'ARTIFACTS': return 'from-amber-950/40 to-slate-900 border-amber-900/30';
      default: return 'from-slate-900 to-slate-900 border-slate-800';
    }
  };

  // Extract extremely precise representation string safely
  let rawValue = asset.totalValue.toString();
  if (rawValue.length > 20) {
    rawValue = rawValue.substring(0, 20) + '...';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`relative p-6 rounded-2xl border bg-gradient-to-br ${getGradient(asset.category)} overflow-hidden group hover:border-slate-600 transition-colors duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          {getIcon(asset.category)}
        </div>
        <div className="text-right">
          <span className="block text-[10px] uppercase font-mono text-slate-500 tracking-wider">Qty</span>
          <span className="text-sm font-semibold">{formatHugeNumber(asset.quantity)} {asset.unit}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{asset.name}</h3>
      <p className="text-xs text-slate-500 font-mono mb-4">{asset.category.replace('_', ' ')}</p>
      
      <div className="mt-auto">
        <div className="text-sm text-slate-400 mb-1">Estimated Value (USD)</div>
        <div className="text-2xl font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
          ${formatHugeNumber(asset.totalValue)}
        </div>
        <div className="mt-2 text-[10px] text-slate-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap" title={asset.totalValue.toString()}>
          RAW: {rawValue}
        </div>
      </div>
    </motion.div>
  );
}
