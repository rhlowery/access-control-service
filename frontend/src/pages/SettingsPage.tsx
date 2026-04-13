import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Database, 
  ExternalLink, 
  Save,
  Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [streamEnabled, setStreamEnabled] = useState(true);

    const handleSave = () => {
        alert('Settings saved successfully!');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300">
            <header className="mb-10">
                <h1 className="text-3xl font-bold font-outfit tracking-tight mb-2">System Settings</h1>
                <p className="text-[var(--text-muted)]">Configure your environment and personal preferences</p>
            </header>

            <div className="space-y-8">
                <section className="glass p-8 rounded-2xl shadow-xl border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
                        <User size={24} className="text-primary" />
                        <h3 className="text-xl font-bold font-outfit m-0">Profile Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Display Name</label>
                            <input 
                                type="text" 
                                defaultValue="Admin User" 
                                className="w-full bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary/30 outline-none transition-all shadow-inner" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
                            <input 
                                type="email" 
                                defaultValue="admin@acs.local" 
                                className="w-full bg-white/5 dark:bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary/30 outline-none transition-all shadow-inner" 
                            />
                        </div>
                    </div>
                </section>

                <section className="glass p-8 rounded-2xl shadow-xl border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
                        <Shield size={24} className="text-primary" />
                        <h3 className="text-xl font-bold font-outfit m-0">System Preferences</h3>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold mb-1">Appearance</h4>
                                <p className="text-sm text-[var(--text-muted)] m-0">Switch between dark and light themes</p>
                            </div>
                            <button 
                                onClick={toggleDarkMode}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-[var(--border)] hover:bg-white/10 rounded-lg transition-colors font-medium text-sm"
                            >
                                {isDarkMode ? <Moon size={18} className="text-sky-400" /> : <Sun size={18} className="text-amber-500" />}
                                {isDarkMode ? 'Dark' : 'Light'}
                            </button>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold mb-1">Real-time Streaming</h4>
                                <p className="text-sm text-[var(--text-muted)] m-0">Enable or disable live log streams globally</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={streamEnabled} 
                                    onChange={(e) => setStreamEnabled(e.target.checked)} 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold mb-1">System Notifications</h4>
                                <p className="text-sm text-[var(--text-muted)] m-0">Alert me for new access requests and security events</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={notifications} 
                                    onChange={(e) => setNotifications(e.target.checked)} 
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </section>

                <section className="glass p-6 rounded-xl border-l-4 border-l-primary border border-t-[var(--border)] border-r-[var(--border)] border-b-[var(--border)] shadow-md">
                    <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full shadow-inner">
                                <Bell size={24} className="text-primary pulse" />
                            </div>
                            <span className="text-sm font-medium pr-4">New version (v1.2.4) available. Review what's new in the release docs.</span>
                        </div>
                        <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold whitespace-nowrap">
                            Release Notes <ExternalLink size={16} />
                        </button>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button 
                        className="btn-primary flex items-center gap-2 px-8 py-3.5 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all text-sm font-bold uppercase tracking-widest" 
                        onClick={handleSave}
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
