import { getApiUrl } from '../config';

class AuthServiceWrapper {
    constructor() {
        this.config = null;
        this.user = null;
    }

    async getConfig() {
        if (this.config) return this.config;
        try {
            const response = await fetch(getApiUrl('/api/auth/config'));
            if (response.ok) {
                this.config = await response.json();
                return this.config;
            }
        } catch (error) {
            console.error('Failed to fetch auth config', error);
        }
        return { authServerUrl: '', clientId: '' };
    }

    async getProviders() {
        try {
            const response = await fetch(getApiUrl('/api/auth/providers'));
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch providers', error);
        }
        return [];
    }

    async login(userId, password, providerId = 'local') {
        const response = await fetch(getApiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, password, providerId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return await response.json();
    }

    async logout() {
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
        window.location.reload();
    }

    async getCurrentUser() {
        try {
            const response = await fetch(getApiUrl('/api/auth/me'));
            if (response.ok) {
                this.user = await response.json();
                return this.user;
            }
        } catch (error) {
            console.error('Failed to fetch current user', error);
        }
        return null;
    }

    isMockAuth() {
        return this.config?.isMock === true;
    }

    getMockUsers() {
        if (!this.config) return [];
        return this.config.mockUsers || [
            { userId: 'admin', name: 'Admin User', persona: 'ADMIN' },
            { userId: 'approver', name: 'Approver', persona: 'APPROVER' },
            { userId: 'auditor', name: 'Auditor', persona: 'AUDITOR' },
            { userId: 'requester', name: 'Requester', persona: 'REQUESTER' }
        ];
    }

    hasRole(role) {
        if (!this.user) return false;
        // Map persona to roles for backward compatibility with existing UI logic
        const persona = this.user.persona || 'NONE';
        if (role === 'ADMIN') return ['ADMIN', 'SECURITY_ADMIN', 'PLATFORM_ADMIN'].includes(persona);
        if (role === 'APPROVER') return ['APPROVER', 'ADMIN'].includes(persona);
        if (role === 'AUDITOR') return ['AUDITOR', 'ADMIN'].includes(persona);
        return false;
    }
}

export const AuthService = new AuthServiceWrapper();
