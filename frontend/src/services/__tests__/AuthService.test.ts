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
        
        // DTO Validation
        const callArgs = fetchMock.mock.calls[0];
        const url = typeof callArgs[0] === 'string' ? callArgs[0] : (callArgs[0].url || '');
        const bodyContent = callArgs[1] ? callArgs[1].body : null;
        
        expect(url).toContain('/api/auth/login');
        if (bodyContent) {
            expect(JSON.parse(bodyContent)).toEqual({
                userId: 'admin',
                password: 'password',
                providerId: 'local'
            });
        }

        expect(result).toEqual(mockResult);
    });

    it('throws error on failed login', async () => {
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 }));
        await expect(AuthService.login('admin', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('throws generic error on failed login without message', async () => {
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 401 }));
        await expect(AuthService.login('admin', 'wrong')).rejects.toThrow(/HTTP error!/);
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
        (AuthService as any).user = { persona: 'ADMIN' };
        expect(AuthService.hasRole('UNKNOWN')).toBe(false);
    });

    it('detects mock configuration properly', () => {
        (AuthService as any).config = { isMock: true };
        expect(AuthService.isMockAuth()).toBe(true);

        (AuthService as any).config = { isMock: false };
        expect(AuthService.isMockAuth()).toBe(false);

        (AuthService as any).config = { authType: 'oidc', authServerUrl: 'http://idp' };
        expect(AuthService.isMockAuth()).toBe(false);
    });

    it('isMockAuth returns false when config is null', () => {
        (AuthService as any).config = null;
        expect(AuthService.isMockAuth()).toBe(false);
    });

    it('returns default mock users', () => {
        (AuthService as any).config = { authType: 'mock' };
        const users = AuthService.getMockUsers();
        expect(users.length).toBe(4);
        expect(users[0].persona).toBe('ADMIN');
    });

    it('returns configured mock users', () => {
        const customUsers = [{ userId: 'custom', name: 'Custom', persona: 'ADMIN' }];
        (AuthService as any).config = { authType: 'mock', mockUsers: customUsers };
        const users = AuthService.getMockUsers();
        expect(users).toEqual(customUsers);
    });

    it('getMockUsers returns empty array when config is null', () => {
        (AuthService as any).config = null;
        expect(AuthService.getMockUsers()).toEqual([]);
    });
});
