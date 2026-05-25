import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard,
  Database,
  FileCode2,
  Search,
  LineChart,
  Layers,
  Building2,
  CreditCard,
  GitMerge
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Repository Sync", href: "/sync", icon: GitMerge },
  { name: "Matrix Registry", href: "/matrix", icon: Database },
  { name: "Contracts Hub", href: "/contracts", icon: FileCode2 },
  { name: "Data Explorer", href: "/explorer", icon: Search },
  { name: "Economics Simulator", href: "/economics", icon: LineChart },
  { name: "7-Layer Visualizer", href: "/layers", icon: Layers },
  { name: "Real World Assets", href: "/rwa", icon: Building2 },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading, error, signIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          <p className="text-slate-400">Authenticating with Pi Network...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="p-8 max-w-md w-full bg-[#111111] border border-white/5 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mb-6">
             <div className="text-indigo-400 font-bold text-3xl">Ï</div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">PiRC Sovereign Platform</h2>
          <p className="text-slate-400 mb-8">
            Connect your Pi Network account to access the dashboard and registries.
          </p>
          
          {error && (
            <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 w-full text-sm">
              {error}
            </div>
          )}

          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign in with Pi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/10 flex flex-col pt-6 pb-6 space-y-8">
        <div className="flex items-center space-x-3 px-6 mb-4">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">π</div>
          <h1 className="font-bold text-xl tracking-tight text-white">PiRC Sovereign</h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-2 mt-4">Platform</div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors my-1",
                  isActive 
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 border-t border-white/5 pt-4 text-xs text-slate-500">
          v2.4.0-quantum-ready
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-[#050505] relative">
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-10 w-full">
           <div className="flex items-center space-x-4 bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-mono text-emerald-400">Matrix Connected</span>
           </div>
           
           <div className="flex items-center space-x-4">
              <button 
                onClick={signOut}
                className="text-xs font-semibold px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all active:scale-95 text-slate-300"
              >
                Sign Out
              </button>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <div className="text-xs font-bold text-white">@{user.username}</div>
                  <div className="text-[10px] text-slate-500 w-24 truncate" title={user.uid}>{user.uid}</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 border border-white/20"></div>
              </div>
           </div>
        </header>
        <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
