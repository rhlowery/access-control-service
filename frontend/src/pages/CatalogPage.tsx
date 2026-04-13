import React, { useState } from 'react';
import { Database, ChevronRight, CheckCircle2, Shield, Info, Plus, Search, Activity } from 'lucide-react';
import { CatalogTree } from '../components/catalog/CatalogTree';
import { AccessRequestForm } from '../components/requests/AccessRequestForm';

const Breadcrumbs = ({ path }) => {
  const parts = ['Catalog', ...path.filter(p => p)];
  return (
    <nav className="flex items-center gap-2 mb-8 text-sm px-1 py-2 overflow-x-auto whitespace-nowrap">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <span className={`font-medium ${index === parts.length - 1 ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer transition-colors underline-offset-4 hover:underline'}`}>
            {part}
          </span>
          {index < parts.length - 1 && <ChevronRight size={14} className="text-gray-400 opacity-50 flex-shrink-0" />}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const CatalogPage = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSelect = (node) => {
    setSelectedNode(node);
    const newPath = node.path.split('/').filter(p => p);
    if (node.type !== 'catalog') {
      setBreadcrumbPath(['main', ...newPath]);
    } else {
      setBreadcrumbPath([node.name]);
    }
  };

  const handleRightClick = (e, node) => {
    console.log('Right click on', node);
  };

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8 h-screen max-w-7xl mx-auto overflow-hidden">
      <div className="w-full md:w-[350px] flex-shrink-0 h-full overflow-hidden flex flex-col glass p-1 shadow-lg border border-white/5">
        <div className="p-4 border-b border-[var(--border)] bg-white/5 flex items-center gap-3">
          <Database size={20} className="text-primary" />
          <h2 className="text-lg font-bold font-outfit uppercase tracking-wider">Catalog Explorer</h2>
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <CatalogTree onSelect={handleSelect} onRightClick={handleRightClick} />
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col custom-scrollbar pb-20">
        <Breadcrumbs path={breadcrumbPath} />
        
        {selectedNode ? (
          <div className="details-view space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass p-8 shadow-xl border border-white/5 relative overflow-hidden group">
              <div className="flex items-center gap-6 relative z-10">
                 <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Database size={40} className="text-primary" />
                 </div>
                 <div>
                   <h1 className="text-3xl font-bold font-outfit line-clamp-1">{selectedNode.name}</h1>
                   <div className="flex items-center gap-3 mt-1.5 opacity-60">
                     <span className="badge bg-white/10 text-xs px-2 py-0.5 border border-white/5">{selectedNode.type.toUpperCase()}</span>
                     <span className="text-xs font-mono tracking-tighter truncate max-w-[200px]">{selectedNode.path || '/'}</span>
                   </div>
                 </div>
              </div>
              <div className="relative z-10">
                 <button className="btn-primary flex items-center gap-2.5 px-8 py-3.5 shadow-primary/30" onClick={() => setShowRequestForm(true)}>
                   <Plus size={20} /> Request Access
                 </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 hover:translate-y-[-4px] transition-all border border-white/5 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-primary group-hover:rotate-12 transition-transform" />
                    <h3 className="text-lg font-bold font-outfit">Current Access</h3>
                  </div>
                  {selectedNode.access === 'SELECT' ? (
                    <span className="text-xs font-bold uppercase text-success bg-success/10 px-2 py-1 rounded">Granted</span>
                  ) : (
                    <span className="text-xs font-bold uppercase text-danger bg-danger/10 px-2 py-1 rounded">Required</span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 bg-black/10 dark:bg-white/5 rounded-xl border border-[var(--border)]">
                  {selectedNode.access === 'SELECT' ? (
                    <><CheckCircle2 size={18} className="text-success" /> <span className="text-sm font-medium">Full SELECT privileges detected</span></>
                  ) : (
                    <><Info size={18} className="text-amber-500" /> <span className="text-sm font-medium">Standard read access is currently restricted</span></>
                  )}
                </div>
              </div>
              <div className="glass p-6 hover:translate-y-[-4px] transition-all border border-white/5 group">
                <div className="flex items-center gap-3 mb-6">
                  <Info size={20} className="text-accent group-hover:rotate-12 transition-transform" />
                  <h3 className="text-lg font-bold font-outfit">Resource Metadata</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm items-center border-b border-[var(--border)] pb-2 opacity-80">
                    <span className="font-medium">Direct Owner</span>
                    <span className="font-mono bg-white/5 px-2 rounded tracking-tighter">data-admin@acs.local</span>
                  </div>
                  <div className="flex justify-between text-sm items-center border-b border-[var(--border)] pb-2 opacity-80">
                    <span className="font-medium">Last Metadata Update</span>
                    <span className="font-bold tracking-tight">Today, 2:45 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedNode.type === 'table' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
                  <h3 className="text-xl font-bold font-outfit">Schema Preview</h3>
                  <span className="text-xs opacity-50">(First 2 columns)</span>
                </div>
                <div className="glass overflow-hidden shadow-2xl border border-white/5">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-black/10 dark:bg-white/10 uppercase text-[10px] font-bold tracking-widest opacity-60">
                      <tr className="border-b border-[var(--border)]">
                        <th className="p-4">Resource Column</th>
                        <th className="p-4">Data Type</th>
                        <th className="p-4 text-center">Constraints</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[var(--border)]">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">id</td>
                        <td className="p-4"><span className="badge bg-amber-500/10 text-amber-500 border border-amber-500/20">STRING</span></td>
                        <td className="p-4 text-center text-xs opacity-50 italic">NOT NULL</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">created_at</td>
                        <td className="p-4"><span className="badge bg-sky-500/10 text-sky-500 border border-sky-500/20">TIMESTAMP</span></td>
                        <td className="p-4 text-center text-xs opacity-50 italic">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass py-32 flex flex-col items-center justify-center text-center px-6 shadow-2xl border border-white/5 group translate-y-12">
            <div className="relative mb-8">
              <Database size={80} className="opacity-10 group-hover:scale-110 transition-all duration-500" />
              <Search size={32} className="absolute -bottom-2 -right-2 text-primary pulse scale-125" />
            </div>
            <h3 className="text-2xl font-bold font-outfit mb-3">Begin Exploration</h3>
            <p className="max-w-md opacity-60 leading-relaxed font-medium">Explore the unified data mesh across your catalogs. Select any schema, table, or volume to view its lineage and request required access.</p>
            <div className="mt-12 flex items-center gap-4 opacity-50 text-xs font-bold uppercase tracking-widest border-t border-white/5 pt-8 w-full max-w-xs justify-center">
              <Activity size={12} className="text-success" /> Unified Data Mesh Ready
            </div>
          </div>
        )}

        {showRequestForm && selectedNode && (
          <AccessRequestForm 
            node={selectedNode} 
            onClose={() => setShowRequestForm(false)} 
            onSuccess={() => {
               // Show a global toast or banner here if needed
            }}
          />
        )}
      </div>
    </div>
  );
};
