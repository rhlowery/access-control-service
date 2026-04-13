import React, { useState } from 'react';
import { X, Shield, Calendar, AlignLeft, User, Database, Plus } from 'lucide-react';
import { RequestService } from '../../services/RequestService';
import { AuthService } from '../../services/AuthService';

export const AccessRequestForm = ({ node, onClose, onSuccess }) => {
    const currentUser = AuthService.getCurrentUser();
    const [principalId, setPrincipalId] = useState(currentUser?.userId || '');
    const [privileges, setPrivileges] = useState([]);
    const [justification, setJustification] = useState('');
    const [expiration, setExpiration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availablePrivileges = ['SELECT', 'UPDATE', 'INSERT', 'DELETE', 'CREATE', 'DROP', 'USE_CATALOG', 'USE_SCHEMA'];

    const togglePrivilege = (priv) => {
        setPrivileges(prev => 
            prev.includes(priv) ? prev.filter(p => p !== priv) : [...prev, priv]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (privileges.length === 0) {
            window.alert('Please select at least one privilege.');
            return;
        }
        if (!justification.trim()) {
            window.alert('Please provide a justification.');
            return;
        }

        setIsSubmitting(true);
        try {
            const request = {
                requesterId: currentUser?.userId || 'guest',
                userId: principalId,
                resourceType: node.type.toUpperCase(),
                resourcePath: node.path === '/' ? node.name : `${node.path}/${node.name}`,
                privileges,
                justification,
                expirationTime: expiration ? new Date(expiration).toISOString() : null,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            await RequestService.submitRequest(request);
            window.alert('Access request submitted successfully!');
            onSuccess?.();
            onClose();
        } catch (err) {
            window.alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4" onClick={onClose}>
            <div className="glass max-w-lg w-full p-8 shadow-2xl border border-white/10 flex flex-col gap-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center text-[var(--accent)] border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                            <Shield size={28} />
                        </div>
                        <h2 className="text-2xl font-bold font-outfit uppercase tracking-tight text-[var(--text)]">Request Access</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-50 hover:opacity-100">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} aria-label="access-request-form" className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="principalId" className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <User size={14} className="text-[var(--primary)]" /> Principal (User ID)
                        </label>
                        <input 
                            id="principalId"
                            type="text" 
                            value={principalId} 
                            onChange={e => setPrincipalId(e.target.value)} 
                            placeholder="e.g., user_123"
                            className="w-full bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 ring-[var(--primary)]/30 outline-none transition-all shadow-inner"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="resourcePath" className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Database size={14} className="text-secondary" /> Resource Path
                        </label>
                        <input 
                            id="resourcePath" 
                            type="text" 
                            value={node.path === '/' ? node.name : `${node.path}/${node.name}`} 
                            readOnly 
                            className="w-full bg-black/10 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-mono tracking-tighter opacity-50 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2 mb-3">
                            <Shield size={14} className="text-accent" /> Requested Privileges
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availablePrivileges.map(priv => (
                                <button 
                                    key={priv} 
                                    type="button"
                                    onClick={() => togglePrivilege(priv)}
                                    className={`text-[10px] font-bold px-3 py-2 rounded-lg border transition-all text-center uppercase tracking-widest ${
                                        privileges.includes(priv)
                                        ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_-5px_var(--primary)]'
                                        : 'bg-white/5 text-[var(--text-muted)] border-[var(--border)] hover:bg-white/10 hover:text-[var(--text)]'
                                    }`}
                                >
                                    {priv}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="expiration" className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                                <Calendar size={14} className="text-sky-500" /> Expiration (Optional)
                            </label>
                            <input 
                                id="expiration"
                                type="datetime-local" 
                                value={expiration} 
                                onChange={e => setExpiration(e.target.value)} 
                                className="w-full bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-sky-500/30 transition-all shadow-inner [&::-webkit-calendar-picker-indicator]:dark:invert"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="justification" className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <AlignLeft size={14} className="text-amber-500" /> Justification
                        </label>
                        <textarea 
                            id="justification"
                            rows="4" 
                            value={justification} 
                            onChange={e => setJustification(e.target.value)} 
                            placeholder="Please explain why you need this access..."
                            className="w-full bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl p-4 text-sm focus:ring-2 ring-amber-500/30 outline-none transition-all resize-none shadow-inner"
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            type="button" 
                            className="w-full flex-1 px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[var(--text)] border border-[var(--border)] transition-all order-2 sm:order-1" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={`w-full flex-1 px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all order-1 sm:order-2 shadow-lg ${
                                isSubmitting 
                                ? 'bg-primary/50 cursor-not-allowed text-white' 
                                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95'
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting...</>
                            ) : (
                                <><Plus size={18} /> Submit Request</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
