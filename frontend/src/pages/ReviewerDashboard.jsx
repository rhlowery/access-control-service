import React, { useState, useEffect } from 'react';
import { AuditService } from '../services/AuditService';
import { RequestService } from '../services/RequestService';
import { CatalogService } from '../services/CatalogService';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCcw, 
  CheckCircle2, 
  Activity, 
  Database,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const ReviewerDashboard = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [requests, setRequests] = useState([]);
    const [isLiveEnabled, setIsLiveEnabled] = useState(false);
    const [selectedTab, setSelectedTab] = useState('AUDIT_LOG'); // AUDIT_LOG, REQUESTS, INTEGRITY
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedTab === 'AUDIT_LOG') fetchAuditLogs();
        if (selectedTab === 'REQUESTS') fetchRequests();
    }, [selectedTab]);

    useEffect(() => {
        let stream = null;
        if (isLiveEnabled) {
            if (selectedTab === 'AUDIT_LOG') {
                stream = AuditService.streamLogs((newLog) => {
                    setAuditLogs(prev => [newLog, ...prev]);
                });
            } else if (selectedTab === 'REQUESTS') {
                stream = RequestService.streamRequests((updatedReq) => {
                    setRequests(prev => {
                        const index = prev.findIndex(r => r.id === updatedReq.id);
                        if (index !== -1) {
                            const newRequests = [...prev];
                            newRequests[index] = { ...newRequests[index], ...updatedReq };
                            return newRequests;
                        }
                        return [updatedReq, ...prev];
                    });
                });
            }
        }
        return () => stream?.close();
    }, [isLiveEnabled, selectedTab]);

    const fetchAuditLogs = async () => {
        setIsLoading(true);
        try {
            const data = await AuditService.getLogs();
            setAuditLogs(Array.isArray(data) ? data : []);
        } finally { setIsLoading(false); }
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await RequestService.getRequests();
            setRequests(data);
        } finally { setIsLoading(false); }
    };

    const handleVerify = async (id) => {
        try {
            await RequestService.verifyRequest(id);
            alert(`Request ${id} verified and audit entry created.`);
            fetchRequests();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-outfit tracking-tight">Reviewer & Auditor Dashboard</h1>
                    <p className="text-[var(--text-muted)] mt-1">Audit trails, request verification, and compliance monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass px-4 py-2 flex items-center gap-3">
                        <span className="text-sm font-medium">Live Stream</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isLiveEnabled} 
                                onChange={(e) => setIsLiveEnabled(e.target.checked)} 
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                         {isLiveEnabled && <Activity size={14} className="text-success pulse" />}
                     </div>
                     <button className="btn-primary flex items-center gap-2" onClick={selectedTab === 'AUDIT_LOG' ? fetchAuditLogs : fetchRequests}>
                        <RefreshCcw size={18} /> Refresh
                     </button>
                </div>
            </header>

            <div className="flex gap-4 border-b border-[var(--border)] overflow-x-auto pb-px">
                {[
                    { id: 'AUDIT_LOG', label: 'Audit Log', icon: History },
                    { id: 'REQUESTS', label: 'Access Requests', icon: TrendingUp },
                    { id: 'INTEGRITY', label: 'Resource Integrity', icon: ShieldCheck }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap ${
                            selectedTab === tab.id 
                            ? 'text-[var(--text)] border-[var(--primary)] bg-white/5 dark:bg-white/5' 
                            : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)] hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={18} className={selectedTab === tab.id ? 'text-[var(--primary)]' : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass overflow-hidden shadow-2xl border border-[var(--border)] min-h-[400px]">
                <div className="overflow-x-auto">
                    {selectedTab === 'AUDIT_LOG' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[var(--text-muted)] text-sm uppercase tracking-wider border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                                    <th className="p-4 font-bold">Timestamp</th>
                                    <th className="p-4 font-bold">Principal</th>
                                    <th className="p-4 font-bold">Action</th>
                                    <th className="p-4 font-bold">Resource</th>
                                    <th className="p-4 font-bold text-center">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {auditLogs.map((log, idx) => (
                                    <tr key={log.id || idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm font-mono opacity-80">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{log.principalId}</td>
                                        <td className="p-4">
                                            <span className="bg-white/10 dark:bg-black/20 border border-[var(--border)] px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm opacity-70 truncate max-w-xs">{log.resourcePath}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                {log.result === 'SUCCESS' ? 
                                                    <CheckCircle2 size={20} className="text-success shadow-success/20" /> : 
                                                    <AlertTriangle size={20} className="text-danger" />
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-24 opacity-30">
                                            <div className="flex flex-col items-center">
                                                <History size={64} className="mb-4" />
                                                <p className="text-xl font-medium italic">No audit logs available.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {selectedTab === 'REQUESTS' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[var(--text-muted)] text-sm uppercase tracking-wider border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                                    <th className="p-4 font-bold">ID</th>
                                    <th className="p-4 font-bold">Status</th>
                                    <th className="p-4 font-bold">Resource</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {requests.map(req => (
                                    <tr key={req.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-xs font-mono opacity-60">{req.id}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold uppercase ${req.status === 'APPROVED' ? 'text-success' : 'text-[var(--text-muted)]'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium">{req.resourcePath}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <button onClick={() => handleVerify(req.id)} className="btn-secondary text-[10px] uppercase font-bold tracking-widest px-4 py-2 hover:border-primary/50 hover:text-primary transition-all">
                                                    Verify Integrity
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {selectedTab === 'INTEGRITY' && (
                        <div className="py-24 text-center space-y-6">
                            <div className="relative inline-block">
                                <Database size={80} className="opacity-10 mx-auto" />
                                <TrendingUp size={32} className="absolute -bottom-2 -right-2 text-primary pulse" />
                            </div>
                            <div className="max-w-md mx-auto space-y-3 px-6">
                                <h3 className="text-2xl font-bold font-outfit">Catalog Integrity Checker</h3>
                                <p className="text-[var(--text-muted)] text-sm">Select a catalog resource from the tree to perform a deep-scan verification and detect policy drift in real-time.</p>
                                <div className="pt-4 flex items-center justify-center gap-3">
                                    <span className="w-2 h-2 bg-primary rounded-full pulse"></span>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">System Ready for Scan</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
