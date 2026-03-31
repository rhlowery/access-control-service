import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  ArrowRight, 
  Activity, 
  Globe, 
  LogIn, 
  Fingerprint, 
  AlertCircle,
  UserCheck,
  Zap
} from 'lucide-react';
import { AuthService } from '../services/AuthService';

const PERSONA_STYLES = {
  ADMIN: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Shield },
  APPROVER: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: UserCheck },
  AUDITOR: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Activity },
  REQUESTER: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: User },
};

const MockLoginPanel = ({ mockUsers, onSelect, isSubmitting, error }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
      <Zap size={16} />
      <span className="font-medium">Mock Authentication Mode</span>
    </div>
    <p className="text-gray-400 text-sm text-center">Select an identity to sign in as:</p>
    
    {error && (
      <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm animate-in fade-in slide-in-from-top-1">
        <AlertCircle size={16} />
        {error}
      </div>
    )}

    <div className="grid grid-cols-1 gap-3">
      {mockUsers.map(mockUser => {
        const style = PERSONA_STYLES[mockUser.persona] || PERSONA_STYLES.REQUESTER;
        const IconComp = style.icon;
        return (
          <button
            key={mockUser.userId}
            disabled={isSubmitting}
            onClick={() => onSelect(mockUser)}
            className={`w-full flex items-center gap-4 p-4 ${style.bg} border ${style.border} rounded-xl hover:scale-[1.02] active:scale-95 transition-all group text-left`}
          >
            <div className={`p-2.5 rounded-lg bg-black/20 ${style.color}`}>
              <IconComp size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-white truncate">{mockUser.name || mockUser.userId}</span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">{mockUser.persona}</span>
            </div>
            <ArrowRight size={16} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
          </button>
        );
      })}
    </div>
  </div>
);

export const LoginPage = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [mockUsers, setMockUsers] = useState([]);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const configData = await AuthService.getConfig();
        const providersData = await AuthService.getProviders();
        console.log('[ACS] Auth Config:', configData);
        console.log('[ACS] Discovered Providers:', providersData);
        setMockUsers(AuthService.getMockUsers());
        setProviders(providersData);
        setIsMockMode(configData.isMock === true);
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthData();
  }, []);

  const handleLogin = async (e, providerId = 'local') => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await AuthService.login(userId || 'admin', password, providerId);
      onLoginSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMockLogin = async (mockUser) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await AuthService.login(mockUser.userId, '', 'mock');
      onLoginSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOidclogin = (providerId) => {
    AuthService.authorize(providerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c14]">
        <Activity data-testid="loading-spinner" size={48} className="text-primary spin-slow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0c10] overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent p-0.5 mb-6 group hover:scale-110 transition-transform cursor-pointer">
            <div className="w-full h-full bg-[#0a0c10] rounded-[22px] flex items-center justify-center">
              <Shield size={40} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight text-white mb-2">Access Control</h1>
          <p className="text-gray-400 font-medium">Secure Authorization Gateway</p>
        </div>

        <div className="glass p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Subtle light streak across the card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {isMockMode ? (
            <MockLoginPanel
              mockUsers={mockUsers}
              onSelect={handleMockLogin}
              isSubmitting={isSubmitting}
              error={error}
            />
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Username or ID" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner"
                      required 
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_hsla(230,85%,60%,0.3)]"
                >
                  {isSubmitting ? <Activity size={20} className="spin" /> : <>Sign In <ArrowRight size={18} /></>}
                </button>
              </form>

              {providers.length > 0 && (
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Or continue with identity provider</p>
                  <div className="space-y-3">
                    {providers.map(provider => (
                      <button 
                        key={provider.id}
                        onClick={() => handleOidclogin(provider.id)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {provider.type === 'OIDC' ? <Globe size={20} className="text-sky-400" /> : <Fingerprint size={20} className="text-amber-400" />}
                          <div className="text-left">
                            <span className="block text-sm font-bold text-white">{provider.name}</span>
                            <span className="block text-[10px] text-gray-500 uppercase tracking-widest">{provider.type} Configuration</span>
                          </div>
                        </div>
                        <LogIn size={18} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline underline-offset-4">Request Access</span>
        </p>
      </div>
    </div>
  );
};
