import React, { useState, useEffect } from 'react';
import { UserService } from '../services/UserService';
import { Users, Users as UsersIcon, Settings2, UserCheck, Search, Activity, RefreshCcw } from 'lucide-react';

export const UserGroupManagement = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('USERS');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersData, groupsData, personasData] = await Promise.all([
                UserService.getUsers(),
                UserService.getGroups(),
                UserService.getPersonas()
            ]);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setGroups(Array.isArray(groupsData) ? groupsData : []);
            setPersonas(Array.isArray(personasData) ? personasData : ['ADMIN', 'APPROVER', 'REQUESTER']);
        } catch (error) {
            console.error('Failed to fetch user/group data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignUserPersona = async (userId, persona) => {
        try {
            await UserService.assignUserPersona(userId, persona);
            alert(`Persona ${persona} explicitly assigned to user ${userId}`);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAssignGroupPersona = async (groupId, persona) => {
        try {
            await UserService.assignGroupPersona(groupId, persona);
            alert(`Persona ${persona} explicitly assigned to group ${groupId}`);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-outfit tracking-tight">Identity & Access</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage users, groups, and explicit persona assignments</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="btn-primary flex items-center gap-2" onClick={fetchData}>
                        <RefreshCcw size={18} /> Refresh
                    </button>
                </div>
            </header>

            <div className="flex gap-4 border-b border-[var(--border)] overflow-x-auto pb-px">
                {[
                    { id: 'USERS', label: 'Users', icon: UserCheck },
                    { id: 'GROUPS', label: 'Groups', icon: UsersIcon }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2.5 whitespace-nowrap ${
                            selectedTab === tab.id 
                            ? 'text-[var(--text)] border-[var(--primary)] bg-white/5' 
                            : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)] hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={18} className={selectedTab === tab.id ? 'text-[var(--primary)]' : ''} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass overflow-hidden shadow-2xl border border-[var(--border)] min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-24 opacity-60">
                        <Activity size={48} className="text-primary spin-slow mb-6" />
                        <h3 className="text-xl font-medium tracking-wide">Loading directory data...</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {selectedTab === 'USERS' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[var(--text-muted)] text-sm uppercase tracking-wider border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                                        <th className="p-4 font-bold">User Name</th>
                                        <th className="p-4 font-bold">Groups</th>
                                        <th className="p-4 font-bold">Effective Persona</th>
                                        <th className="p-4 font-bold text-center">Assign Persona</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {users.map(user => (
                                        <tr key={user.id || user.userId || user.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold text-[var(--text)]">{user.name || user.userId}</td>
                                            <td className="p-4 text-sm opacity-80">
                                                {user.groups?.length > 0 ? (
                                                  <div className="flex flex-wrap gap-1">
                                                    {user.groups.map(g => (
                                                       <span key={g} className="bg-[var(--text)]/5 border border-[var(--border)] px-2 py-0.5 rounded text-xs">{g}</span>
                                                    ))}
                                                  </div>
                                                ) : <span className="italic opacity-50 text-xs">No groups</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${user.roles?.includes('ADMIN') ? 'bg-danger/10 text-danger border border-danger/20' : user.roles?.includes('APPROVER') ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-success/10 text-success border border-success/20'}`}>
                                                    {user.roles?.length ? user.roles[0] : 'REQUESTER'}
                                                </span>
                                            </td>
                                            <td className="p-4 w-48 align-middle">
                                                <div className="flex justify-center w-full">
                                                    <select 
                                                        className="input text-xs py-1.5 focus:ring-1 bg-transparent w-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAssignUserPersona(user.id || user.userId || user.name, e.target.value);
                                                        }}
                                                    >
                                                        <option value="" disabled className="dark:bg-gray-800">Change Persona...</option>
                                                        {personas.map(p => {
                                                            const pId = typeof p === 'object' ? p.id : p;
                                                            return <option key={pId} value={pId} className="dark:bg-gray-800 ">{typeof p === 'object' ? p.name || p.id : p}</option>
                                                        })}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-24 opacity-30">
                                                <UsersIcon size={48} className="mx-auto mb-4" />
                                                <p className="text-lg italic font-medium">No users found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {selectedTab === 'GROUPS' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[var(--text-muted)] text-sm uppercase tracking-wider border-b border-[var(--border)] bg-black/5 dark:bg-white/5">
                                        <th className="p-4 font-bold">Group Name</th>
                                        <th className="p-4 font-bold">Active Members</th>
                                        <th className="p-4 font-bold text-center">Assign Persona</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {groups.map(group => (
                                        <tr key={group.id || group.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold text-[var(--text)]">{group.name || group.id}</td>
                                            <td className="p-4 text-sm font-mono opacity-80">{group.members?.length || 0} users</td>
                                            <td className="p-4 w-48 align-middle">
                                                <div className="flex justify-center w-full">
                                                    <select 
                                                        className="input text-xs py-1.5 focus:ring-1 bg-transparent w-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) handleAssignGroupPersona(group.id || group.name, e.target.value);
                                                        }}
                                                    >
                                                        <option value="" disabled className="dark:bg-gray-800">Change Persona...</option>
                                                        {personas.map(p => {
                                                            const pId = typeof p === 'object' ? p.id : p;
                                                            return <option key={pId} value={pId} className="dark:bg-gray-800 ">{typeof p === 'object' ? p.name || p.id : p}</option>
                                                        })}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {groups.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-24 opacity-30">
                                                <UsersIcon size={48} className="mx-auto mb-4" />
                                                <p className="text-lg italic font-medium">No groups found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
