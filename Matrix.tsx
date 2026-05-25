import React, { useEffect, useState } from "react";
import { Activity, Search, Download } from "lucide-react";

interface MatrixEntry {
  id: string;
  layer: string;
  nodeCount: number;
  health: string;
  volume: string;
  timestamp: number;
}

export function Matrix() {
  const [data, setData] = useState<MatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch from our mock Express API
    fetch("/api/pirc_matrix")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item => 
    item.layer.toLowerCase().includes(search.toLowerCase()) || 
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Live Matrix Registry</h2>
          <p className="text-slate-400 mt-1">Real-time status of the 7-Layer Architecture and nodes.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Activity className="h-4 w-4 text-emerald-500" />
            Live Updates Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a0a0a] text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Layer ID</th>
                <th className="px-6 py-4 font-medium">Layer Name</th>
                <th className="px-6 py-4 font-medium">Node Count</th>
                <th className="px-6 py-4 font-medium">Health Status</th>
                <th className="px-6 py-4 font-medium">Volume</th>
                <th className="px-6 py-4 font-medium">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading registry data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-violet-400">{row.id}</td>
                    <td className="px-6 py-4 text-slate-200 font-medium">{row.layer}</td>
                    <td className="px-6 py-4 text-slate-300">{row.nodeCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.health === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        row.health === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {row.health}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{row.volume}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(row.timestamp).toISOString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
