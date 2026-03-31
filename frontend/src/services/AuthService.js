import { api } from './ApiService';

class AuthServiceWrapper {
    constructor() {
        this.config = null;
        this.user = null;
    }

    async getConfig() {
        if (this.config) return this.config;
        try {
            this.config = await api.get('/api/auth/config');
            return this.config;
        } catch (error) {
            console.error('Failed to fetch auth config', error);
        }
        return { authServerUrl: '', clientId: '' };
    }

    async getProviders() {
        try {
            // Using cb query param to bypass cache if needed, although ApiService can handle headers
            return await api.get(`/api/auth/providers?cb=${Date.now()}`);
        } catch (error) {
            console.error('Failed to fetch providers', error);
        }
        return [];
    }

    async login(userId, password, providerId = 'local') {
        const result = await api.post('/api/auth/login', { userId, password, providerId });
        this.user = result;
        return result;
    }

    authorize(providerId) {
        // Redirection is still handled via direct URL
        window.location.href = api.baseUrl + `/api/auth/authorize/${providerId}`;
    }

    async logout() {
        try {
            await api.post('/api/auth/logout');
        } catch (e) {
            console.warn('Logout request failed, proceeding with local clear');
        }
        this.user = null;
        window.location.reload();
    }

    async getCurrentUser() {
        if (this.user) return this.user;
        try {
            this.user = await api.get('/api/auth/me');
            return this.user;
        } catch (error) {
            // 401 is handled by ApiService (redirecting or just throwing)
            this.user = null;
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
        const persona = this.user.persona || 'NONE';
        if (role === 'ADMIN') return ['ADMIN', 'SECURITY_ADMIN', 'PLATFORM_ADMIN'].includes(persona);
        if (role === 'APPROVER') return ['APPROVER', 'ADMIN'].includes(persona);
        if (role === 'AUDITOR') return ['AUDITOR', 'ADMIN'].includes(persona);
        return false;
    }
}

export const AuthService = new AuthServiceWrapper();
