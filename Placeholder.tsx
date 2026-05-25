import React from "react";
import { Construction } from "lucide-react";

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-20 w-20 bg-[#111111] border border-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-500">
        <Construction className="h-10 w-10 text-violet-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 max-w-md mx-auto">
        This module of the PiRC Sovereign platform is currently under active development and will be available in the next release cycle.
      </p>
    </div>
  );
}
