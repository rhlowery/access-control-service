import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Folder as FolderIcon, 
  Table as TableIcon, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Lock as LockIcon,
  MoreVertical
} from 'lucide-react';
import { CatalogService } from '../../services/CatalogService';

const TreeNode = ({ node, catalogId, level = 0, onSelect, onRightClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async (e) => {
    e.stopPropagation();
    if (!isOpen && (node.type === 'catalog' || node.type === 'schema')) {
      setLoading(true);
      try {
        const data = await CatalogService.getNodes(catalogId || node.id, node.path);
        setChildren(data || []);
      } catch (err) {
        console.error('Failed to load children', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const nodeIcon = node.type === 'catalog' ? <Database size={16} className="text-secondary" /> : 
                   node.type === 'schema' ? <FolderIcon size={16} className="text-accent" /> : 
                   <TableIcon size={16} className="text-primary" />;

  const permissionIcon = node.access === 'SELECT' ? 
                         <CheckCircle2 size={12} className="text-success" /> : 
                         <LockIcon size={12} className="text-[var(--text-muted)] opacity-50" />;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98] ${isOpen ? 'bg-white/5 shadow-sm' : ''}`}
        onClick={() => onSelect(node)}
        onContextMenu={(e) => { e.preventDefault(); onRightClick(e, node); }}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div 
          className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-black/20 dark:hover:bg-white/10 transition-colors z-10 expand-icon"
          onClick={toggleOpen}
        >
          {node.type !== 'table' && (
            loading ? (
              <span className="w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              isOpen ? <ChevronDown size={14} className="opacity-60" /> : <ChevronRight size={14} className="opacity-60" />
            )
          )}
        </div>
        
        <span className="flex-shrink-0 group-hover:scale-110 transition-transform">{nodeIcon}</span>
        
        <span className={`text-sm flex-1 truncate font-medium ${isOpen ? 'text-[var(--text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>
          {node.name}
        </span>
        
        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          {permissionIcon}
          <MoreVertical size={14} className="opacity-30 hover:opacity-100 cursor-help" />
        </div>
      </div>
      
      {isOpen && (
        <div className="flex flex-col border-l border-[var(--border)] ml-5 my-1">
          {children.map(child => (
            <TreeNode 
              key={`${child.path}-${child.name}`} 
              node={child} 
              catalogId={catalogId || node.id} 
              level={0} // Fixed level relative to parent line
              onSelect={onSelect}
              onRightClick={onRightClick}
            />
          ))}
          {children.length === 0 && !loading && (
            <span className="text-[10px] text-[var(--text-muted)] italic py-2 ml-8 opacity-40">Empty or no access</span>
          )}
        </div>
      )}
    </div>
  );
};

export const CatalogTree = ({ onSelect, onRightClick }) => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await CatalogService.getRegistrations();
        const mapped = data.map(c => ({
          id: c.id,
          name: c.name,
          type: 'catalog',
          path: '/',
          access: c.access || 'NONE'
        }));
        setCatalogs(mapped);
      } catch (err) {
        console.error('Failed to load catalogs', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-primary/20"></div>
      <p className="text-xs font-bold uppercase tracking-widest opacity-40">Scanning Catalog Service...</p>
    </div>
  );

  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      {catalogs.length > 0 ? (
        catalogs.map(catalog => (
          <TreeNode 
            key={catalog.id} 
            node={catalog} 
            level={0}
            onSelect={onSelect}
            onRightClick={onRightClick}
          />
        ))
      ) : (
        <div className="text-center py-12 px-6">
          <Database size={40} className="mx-auto opacity-10 mb-4" />
          <p className="text-xs font-bold uppercase tracking-wider opacity-40">No catalogs registered</p>
        </div>
      )}
    </div>
  );
};
