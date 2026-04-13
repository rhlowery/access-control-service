import React, { useState, useEffect } from 'react';
import { RequestService } from '../services/RequestService';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  Activity, 
  MessageSquare, 
  ShieldAlert, 
  Filter 
} from 'lucide-react';

export const ApproverDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [isLiveEnabled, setIsLiveEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let stream = null;
        if (isLiveEnabled) {
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
        return () => stream?.close();
    }, [isLiveEnabled]);

    const fetchRequests = async () => {
        try {
            const data = await RequestService.getRequests();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleApprove = async (id) => {
        try {
            await RequestService.approveRequest(id);
            fetchRequests(); // Refresh table
        } catch (err) { alert(err.message); }
    };

    const handleRejectClick = (id) => {
        setCurrentRequestId(id);
        setShowRejectionModal(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason) {
            alert('Rejection reason is required.');
            return;
        }
        try {
            await RequestService.rejectRequest(currentRequestId, rejectionReason);
            setShowRejectionModal(false);
            setRejectionReason('');
            fetchRequests();
        } catch (err) { alert(err.message); }
    };

    const filteredRequests = requests.filter(r => r.status === selectedTab || (selectedTab === 'PENDING' && !r.status));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-outfit tracking-tight">Approver Dashboard</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage and review access requests for your catalogs</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="glass px-4 py-2 flex items-center gap-3">
                        <span className="text-sm font-medium">Live Feed</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isLiveEnabled} 
                                onChange={(e) => setIsLiveEnabled(e.target.checked)} 
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                         {isLiveEnabled && <Radio size={14} className="text-danger pulse" />}
                     </div>
                     <button className="btn-primary flex items-center gap-2" onClick={fetchRequests}>
                        <Activity size={18} /> Refresh
                     </button>
                </div>
            </header>
 
            {error && (
                <div className="glass p-4 border-l-4 border-danger bg-danger/10 text-danger mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <ShieldAlert size={20} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="flex gap-4 border-b border-[var(--border)] mb-8 overflow-x-auto pb-px">
                {['PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                            selectedTab === tab 
                            ? 'text-[var(--text)] border-[var(--primary)]' 
                            : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass overflow-hidden shadow-xl border border-[var(--border)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[var(--text-muted)] text-sm uppercase tracking-wider border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                                <th className="p-4 font-bold">Principal</th>
                                <th className="p-4 font-bold">Resource</th>
                                <th className="p-4 font-bold">Permission</th>
                                <th className="p-4 font-bold">Justification</th>
                                <th className="p-4 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-[var(--border)] group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium">{req.principalId}</td>
                                    <td className="p-4 font-mono text-xs opacity-80">{req.resourcePath}</td>
                                    <td className="p-4">
                                        <span className="badge-success bg-primary/10 text-primary border-primary/20 px-2.5 py-1 text-[10px] font-bold">
                                            {req.permission}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-xs truncate text-sm opacity-70">
                                        {req.justification}
                                    </td>
                                    <td className="p-4">
                                        {selectedTab === 'PENDING' ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleApprove(req.id)}
                                                    className="p-2 bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success hover:text-white transition-all shadow-sm" 
                                                    title="Approve access"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectClick(req.id)}
                                                    className="p-2 bg-danger/20 text-danger border border-danger/30 rounded-lg hover:bg-danger hover:text-white transition-all shadow-sm"
                                                    title="Reject access"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-70">
                                                {selectedTab === 'APPROVED' ? (
                                                    <span className="text-success text-xs font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                                        <CheckCircle2 size={14} /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="text-danger text-xs font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                                        <XCircle size={14} /> Rejected
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 opacity-30">
                                        <div className="flex flex-col items-center">
                                            <Clock size={64} className="mb-4" />
                                            <p className="text-lg font-medium italic">No {selectedTab.toLowerCase()} requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
                    <div className="glass max-w-md w-full p-8 shadow-2xl border border-white/10 flex flex-col gap-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 text-danger">
                            <XCircle size={28} />
                            <h3 className="text-2xl font-bold font-outfit">Confirm Rejection</h3>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm -mt-2">Provide a mandatory reason for rejecting this access request.</p>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                                <MessageSquare size={14} /> Reason for Rejection
                            </label>
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Request doesn't follow principle of least privilege..."
                                className="w-full h-32 bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl p-4 text-sm focus:ring-2 ring-danger/30 outline-none transition-all resize-none shadow-inner"
                            />
                        </div>

                        <div className="flex justify-end items-center gap-4 mt-2">
                            <button 
                                onClick={() => setShowRejectionModal(false)} 
                                className="text-sm font-medium hover:text-danger underline-offset-4 hover:underline transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmReject} 
                                className="btn-primary bg-danger hover:bg-danger/90 px-8"
                            >
                                Reject Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
