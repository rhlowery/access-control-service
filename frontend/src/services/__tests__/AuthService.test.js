import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../AuthService';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AuthService.config = null;
        AuthService.user = null;
    });

    it('fetches auth config correctly', async () => {
        const mockConfig = { authServerUrl: 'http://auth.test', clientId: 'test-client' };
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockConfig), { status: 200 }));

        const config = await AuthService.getConfig();
        expect(config).toEqual(mockConfig);
        expect(fetchMock).toHaveBeenCalled();
        
        // Test cache
        fetchMock.mockClear();
        const cachedConfig = await AuthService.getConfig();
        expect(cachedConfig).toEqual(mockConfig);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns default config on non-ok response', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
        const config = await AuthService.getConfig();
        expect(config).toEqual({ authServerUrl: '', clientId: '' });
    });

    it('returns empty config on failure', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        const config = await AuthService.getConfig();
        expect(config).toEqual({ authServerUrl: '', clientId: '' });
    });

    it('fetches providers correctly', async () => {
        const mockProviders = [{ id: 'oidc', name: 'OIDC', type: 'OIDC' }];
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockProviders), { status: 200 }));

        const providers = await AuthService.getProviders();
        expect(providers).toEqual(mockProviders);
    });

    it('returns empty array on providers failure', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        const providers = await AuthService.getProviders();
        expect(providers).toEqual([]);
    });

    it('handles login successfully', async () => {
        const mockResult = { status: 'success', userId: 'admin' };
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockResult), { status: 200 }));

        const result = await AuthService.login('admin', 'password', 'local');
        expect(result).toEqual(mockResult);
        expect(fetchMock).toHaveBeenCalled();
    });

    it('throws error on failed login', async () => {
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 }));
        await expect(AuthService.login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('throws generic error on failed login without message', async () => {
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 401 }));
        await expect(AuthService.login('admin', 'wrong')).rejects.toThrow('Login failed');
    });

    it('fetches current user and maps roles based on persona', async () => {
        const mockUser = { userId: 'admin', persona: 'ADMIN' };
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockUser), { status: 200 }));

        const user = await AuthService.getCurrentUser();
        expect(user).toEqual(mockUser);
        
        expect(AuthService.hasRole('ADMIN')).toBe(true);
        expect(AuthService.hasRole('APPROVER')).toBe(true);
        expect(AuthService.hasRole('AUDITOR')).toBe(true);
    });

    it('returns null when getCurrentUser is not ok', async () => {
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
        const user = await AuthService.getCurrentUser();
        expect(user).toBeNull();
    });

    it('returns null when getCurrentUser fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('Network error'));
        const user = await AuthService.getCurrentUser();
        expect(user).toBeNull();
    });

    it('handles logout', async () => {
        const reloadMock = vi.fn();
        vi.stubGlobal('location', { ...window.location, reload: reloadMock });
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
        
        await AuthService.logout();
        
        expect(fetchMock).toHaveBeenCalled();
        expect(reloadMock).toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('returns false for roles when user is not loaded', () => {
        expect(AuthService.hasRole('ADMIN')).toBe(false);
    });

    it('maps APPROVER persona correctly', async () => {
        AuthService.user = { persona: 'APPROVER' };
        expect(AuthService.hasRole('APPROVER')).toBe(true);
        expect(AuthService.hasRole('ADMIN')).toBe(false);
    });

    it('maps AUDITOR persona correctly', async () => {
        AuthService.user = { persona: 'AUDITOR' };
        expect(AuthService.hasRole('AUDITOR')).toBe(true);
        expect(AuthService.hasRole('ADMIN')).toBe(false);
    });

    it('returns false for unknown role', async () => {
        AuthService.user = { persona: 'ADMIN' };
        expect(AuthService.hasRole('UNKNOWN')).toBe(false);
    });

    it('isMockAuth returns true when config.isMock is true', async () => {
        AuthService.config = { isMock: true };
        expect(AuthService.isMockAuth()).toBe(true);
    });

    it('isMockAuth returns false when config.isMock is false', async () => {
        AuthService.config = { isMock: false };
        expect(AuthService.isMockAuth()).toBe(false);
    });

    it('isMockAuth returns false for oidc config without isMock', async () => {
        AuthService.config = { authType: 'oidc', authServerUrl: 'http://idp' };
        expect(AuthService.isMockAuth()).toBe(false);
    });

    it('isMockAuth returns false when config is null', () => {
        AuthService.config = null;
        expect(AuthService.isMockAuth()).toBe(false);
    });

    it('getMockUsers returns default users when config has no mockUsers', () => {
        AuthService.config = { authType: 'mock' };
        const users = AuthService.getMockUsers();
        expect(users.length).toBe(4);
        expect(users[0].persona).toBe('ADMIN');
    });

    it('getMockUsers returns custom users from config', () => {
        const customUsers = [{ userId: 'dev', name: 'Developer', persona: 'REQUESTER' }];
        AuthService.config = { authType: 'mock', mockUsers: customUsers };
        expect(AuthService.getMockUsers()).toEqual(customUsers);
    });

    it('getMockUsers returns empty array when config is null', () => {
        AuthService.config = null;
        expect(AuthService.getMockUsers()).toEqual([]);
    });
});
