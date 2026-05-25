import React, { useEffect, useState } from "react";
import { FileCode2, CheckCircle, Clock } from "lucide-react";

interface ContractEntry {
  id: string;
  name: string;
  status: string;
  tvl: number;
  audits: string;
}

export function Contracts() {
  const [data, setData] = useState<ContractEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setData(json.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Smart Contract Studio</h2>
          <p className="text-slate-400 mt-1">Deploy, monitor, and query PiRC Soroban contracts.</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Deploy New Contract
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading contracts...</div>
        ) : (
          data.map((contract) => (
            <div key={contract.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-black/40 border border-white/10 rounded-lg text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                  <FileCode2 className="h-6 w-6" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  contract.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {contract.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1"/> : <Clock className="w-3 h-3 mr-1"/>}
                  {contract.status}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-1">{contract.name}</h3>
                <p className="text-slate-500 text-sm font-mono">{contract.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <div className="text-xs text-slate-500 mb-1">TVL</div>
                  <div className="text-sm font-medium text-slate-300">Ï€ {contract.tvl.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Audits</div>
                  <div className="text-sm font-medium text-slate-300">{contract.audits}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
