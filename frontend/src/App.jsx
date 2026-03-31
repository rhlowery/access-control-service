import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Shield, 
  Activity, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Bell, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { CatalogPage } from './pages/CatalogPage';
import { ApproverDashboard } from './pages/ApproverDashboard';
import { ReviewerDashboard } from './pages/ReviewerDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { UserGroupManagement } from './pages/UserGroupManagement';
import { AuthService } from './services/AuthService';
import { getApiUrl } from './config';

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-[260px] bg-[var(--sidebar-bg)] border-r border-[var(--border)] p-6 flex flex-col gap-8 sticky top-0 h-screen transition-all duration-300">
    <div className="brand flex items-center gap-2 text-2xl font-bold bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
      <Shield size={32} className="text-[var(--primary)]" />
      <span>ACS UI</span>
    </div>
    <nav className="flex flex-col gap-2">
      <a href="#" className={`nav-link group ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
        <Activity size={20} className="group-hover:scale-110 transition-transform" />
        Dashboard
      </a>
      <a href="#" className={`nav-link group ${activeTab === 'access-requests' ? 'active' : ''}`} onClick={() => setActiveTab('access-requests')}>
        <Clock size={20} className="group-hover:scale-110 transition-transform" />
        Access Requests
      </a>
      <a href="#" className={`nav-link group ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>
        <Database size={20} className="group-hover:scale-110 transition-transform" />
        Data Catalog
      </a>
      {AuthService.hasRole('APPROVER') && (
        <a href="#" className={`nav-link group ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
          Approvals
        </a>
      )}
      {AuthService.hasRole('AUDITOR') && (
        <a href="#" className={`nav-link group ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          <Activity size={20} className="group-hover:scale-110 transition-transform" />
          Audit Logs
        </a>
      )}
      {AuthService.hasRole('ADMIN') && (
        <a href="#" className={`nav-link group ${activeTab === 'identity' ? 'active' : ''}`} onClick={() => setActiveTab('identity')}>
          <Users size={20} className="group-hover:scale-110 transition-transform" />
          Identity & Access
        </a>
      )}
    </nav>
    <div className="flex-1"></div>
    <nav className="flex flex-col gap-2">
      <a href="#" className={`nav-link group ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
        <Settings size={20} className="group-hover:rotate-45 transition-transform" />
        Settings
      </a>
      <a href="#" className="nav-link text-danger hover:bg-danger/10 group cursor-pointer" onClick={() => AuthService.logout()}>
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        Logout
      </a>
    </nav>
  </aside>
);

const Header = ({ username }) => (
  <header className="flex items-center justify-between p-6 bg-transparent">
    <div className="search-bar glass px-6 py-2 flex items-center gap-3 w-[380px] hover:ring-2 ring-primary/20 transition-all">
      <Search size={18} className="text-[var(--text-muted)]" />
      <input 
        type="text" 
        placeholder="Search resources, requests..." 
        className="bg-transparent border-none text-[var(--text)] w-full outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600" 
      />
    </div>
    <div className="flex items-center gap-6">
      <div className="relative cursor-pointer group">
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
      </div>
      <div className="user-profile glass flex items-center gap-3 px-3 py-1.5 hover:scale-105 transition-transform cursor-pointer">
        <div className="avatar w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
          {username?.charAt(0) || 'U'}
        </div>
        <span className="font-medium hidden sm:inline">{username || 'Anonymous User'}</span>
      </div>
    </div>
  </header>
);

const Dashboard = ({ stats, requests }) => (
  <div className="dashboard-content space-y-8 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="stat-card glass p-6 border-l-4 border-primary group hover:translate-y-[-4px] transition-all">
        <span className="stat-label block text-sm text-[var(--text-muted)] mb-1 uppercase tracking-wider font-bold">Total Requests</span>
        <span className="stat-value text-3xl font-bold font-outfit">{stats.total}</span>
      </div>
      <div className="stat-card glass p-6 border-l-4 border-warning group hover:translate-y-[-4px] transition-all">
        <span className="stat-label block text-sm text-[var(--text-muted)] mb-1 uppercase tracking-wider font-bold">Pending Approval</span>
        <span className="stat-value text-3xl font-bold font-outfit">{stats.pending}</span>
      </div>
      <div className="stat-card glass p-6 border-l-4 border-success group hover:translate-y-[-4px] transition-all">
        <span className="stat-label block text-sm text-[var(--text-muted)] mb-1 uppercase tracking-wider font-bold">Active Permissions</span>
        <span className="stat-value text-3xl font-bold font-outfit">{stats.active}</span>
      </div>
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-6 font-outfit">Recent Access Requests</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {requests.map(req => (
          <div key={req.id} className="card glass p-6 hover:ring-1 ring-primary/30 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                {req.status}
              </span>
              <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-tight">{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-1 line-clamp-1">{req.catalogName || 'Unknown Resource'}</h3>
              <p className="text-[var(--text-muted)] text-sm italic">Requested by {req.requesterId}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
               <span className="text-xs bg-[var(--text)]/5 px-2 py-1 rounded text-[var(--text-muted)] border border-[var(--border)]">
                 {req.privileges?.join(', ') || 'No privileges'}
               </span>
               <button className="btn-secondary text-xs px-3 py-1.5">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

import { LoginPage } from './pages/LoginPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
          fetchRequests();
        }
      } catch (err) {
        console.error('Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchRequests = async () => {
    try {
      const reqRes = await fetch(getApiUrl('/api/storage/requests'));
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData || []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    active: requests.filter(r => r.status === 'APPROVED').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <Shield size={48} className="text-primary pulse" />
        <Activity size={32} className="text-primary/40 spin-slow" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(userData) => {
      setUser(userData);
      fetchRequests();
    }} />;
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background text-[var(--text)] transition-colors duration-300">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header username={user?.userId || user?.name || (user?.email?.split('@')[0])} />
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-[60vh]">
                <Activity size={48} className="text-primary spin-slow" />
              </div>
            ) : (
              <div className="max-w-7xl mx-auto w-full">
                {activeTab === 'dashboard' && <Dashboard stats={stats} requests={requests.slice(0, 3)} />}
                {activeTab === 'access-requests' && <Dashboard stats={stats} requests={requests} />}
                {activeTab === 'catalog' && <CatalogPage />}
                {activeTab === 'approvals' && <ApproverDashboard />}
                {activeTab === 'audit' && <ReviewerDashboard />}
                {activeTab === 'identity' && <UserGroupManagement />}
                {activeTab === 'settings' && <SettingsPage />}
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
