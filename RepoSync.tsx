import React, { useEffect, useState } from "react";
import { GitBranch, Download, RefreshCw, FileText, Folder, CheckCircle, FileCode, FileJson, FileType, Search } from "lucide-react";

interface TreeNode {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

interface FileContent {
  name: string;
  path: string;
  content: string;
}

export function RepoSync() {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState<FileContent | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchTree();
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (!search) {
      setFilteredTree(tree);
    } else {
      setFilteredTree(tree.filter(item => item.path.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, tree]);

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/github/branches");
      const json = await res.json();
      if (json.status === "success") {
        setBranches(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTree = async () => {
    setLoading(true);
    setSearch("");
    try {
      const res = await fetch(`/api/github/tree?branch=${selectedBranch}`);
      const json = await res.json();
      if (json.status === "success") {
        setTree(json.data);
        setFilteredTree(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (path: string) => {
    setLoadingFile(true);
    setSelectedFileContent(null);
    try {
      const res = await fetch(`/api/github/file?branch=${selectedBranch}&path=${encodeURIComponent(path)}`);
      const json = await res.json();
      if (json.status === "success") {
        setSelectedFileContent(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFile(false);
    }
  };

  const importFile = async () => {
    if (!selectedFileContent) return;
    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedFileContent.path, 
          content: selectedFileContent.content
        })
      });
      const json = await res.json();
      if (json.status === "success") {
         alert(json.message);
      } else {
         alert(`Error: ${json.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to import file");
    }
  };

  const getFileIcon = (path: string, type: string) => {
    if (type === "tree") return <Folder className="w-4 h-4 text-violet-400" />;
    if (path.endsWith(".json")) return <FileJson className="w-4 h-4 text-emerald-400" />;
    if (path.endsWith(".ts") || path.endsWith(".js") || path.endsWith(".tsx") || path.endsWith(".jsx")) return <FileCode className="w-4 h-4 text-amber-400" />;
    if (path.endsWith(".md")) return <FileType className="w-4 h-4 text-blue-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Repository Sync
          </h2>
          <p className="text-slate-400 mt-1">Manage synchronization with Ze0ro99/PiRC</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-[#111111] border border-white/5 rounded-lg flex items-center px-3 py-1.5 h-10">
            <GitBranch className="h-4 w-4 text-slate-400 mr-2" />
            <select 
              className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none appearance-none pr-4 cursor-pointer"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchTree}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 h-10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Tree
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Tree View */}
        <div className="col-span-12 lg:col-span-5 bg-[#111111] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Repository Structure</h3>
              <span className="text-[10px] uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-md py-1.5 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
                <span className="text-sm">Fetching repository tree...</span>
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No files found.
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredTree.map((item) => (
                  <button 
                    key={item.sha} 
                    onClick={() => item.type === "file" && loadFile(item.path)}
                    disabled={item.type === "tree"}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      item.type === "tree" ? "opacity-70 cursor-default" : "hover:bg-white/5 cursor-pointer text-slate-300"
                    }`}
                  >
                    {getFileIcon(item.path, item.type)}
                    <span className="truncate">{item.path}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        <div className="col-span-12 lg:col-span-7 bg-[#111111] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileCode className="h-4 w-4 text-violet-400" />
              {selectedFileContent ? selectedFileContent.name : "File Viewer"}
            </h3>
            {selectedFileContent && (
              <button onClick={importFile} className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Import to Project
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto bg-[#0a0a0a] p-4 relative">
            {loadingFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm z-10 gap-2">
                 <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
                 <span className="text-sm text-slate-400">Loading file content...</span>
              </div>
            ) : selectedFileContent ? (
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                {selectedFileContent.content}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <FileText className="w-12 h-12 opacity-20" />
                <span className="text-sm">Select a file from the tree to preview and import.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
