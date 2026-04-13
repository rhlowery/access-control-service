import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { AuthService } from './services/AuthService';

vi.mock('./services/AuthService', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
    getConfig: vi.fn(),
    getProviders: vi.fn(),
    hasRole: vi.fn(),
    isMockAuth: vi.fn().mockReturnValue(false),
    getMockUsers: vi.fn().mockReturnValue([])
  }
}));

// Mock standard API calls for App fetching data
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.getConfig.mockResolvedValue({ authServerUrl: 'http://auth', clientId: 'test' });
    AuthService.getProviders.mockResolvedValue([]);
    AuthService.hasRole.mockReturnValue(false);
  });

  it('shows login page when user is not authenticated', async () => {
    AuthService.getCurrentUser.mockResolvedValue(null);
    render(<App />);
    
    await waitFor(() => expect(screen.getByText(/Access Control/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/Username or ID/i)).toBeInTheDocument();
  });

  it('shows login page on getCurrentUser error', async () => {
    AuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));
    render(<App />);
    await waitFor(() => expect(screen.getByPlaceholderText(/Username or ID/i)).toBeInTheDocument());
  });

  it('shows dashboard when user is successfully authenticated', async () => {
    const mockUser = { userId: 'admin', name: 'Mock Admin', persona: 'ADMIN' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    
    // Mock the data stats/requests calls that happen after login
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);

    // Use findByText to wait for the loading state to finish
    await screen.findByText(/^admin$/i);
    expect(screen.getByText(/Recent Access Requests/i)).toBeInTheDocument();
  });

  it('renders sidebar links according to roles', async () => {
    const mockUser = { userId: 'admin', persona: 'ADMIN' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    AuthService.hasRole.mockReturnValue(true);
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);
    
    await screen.findByText(/^admin$/i);
    // Role-based links
    expect(screen.getByText(/Identity & Access/i)).toBeInTheDocument();
  });

  it('renders sidebar links for NONE persona', async () => {
    const mockUser = { userId: 'guest', persona: 'NONE' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    AuthService.hasRole.mockReturnValue(false);
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);
    await screen.findByText(/^guest$/i);
    // Should NOT show admin links
    expect(screen.queryByText(/Identity & Access/i)).toBeNull();
  });

  it('renders sidebar links for APPROVER', async () => {
    const mockUser = { userId: 'approver', persona: 'APPROVER' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    AuthService.hasRole.mockImplementation((role) => role === 'APPROVER');
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);
    await screen.findByText(/^approver$/i);
    expect(screen.getByText(/Approvals/i)).toBeInTheDocument();
  });

  it('renders sidebar links for AUDITOR', async () => {
    const mockUser = { userId: 'auditor', persona: 'AUDITOR' };
    AuthService.getCurrentUser.mockResolvedValue(mockUser);
    AuthService.hasRole.mockImplementation((role) => role === 'AUDITOR');
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<App />);
    await screen.findByText(/^auditor$/i);
    expect(screen.getByText(/Audit Logs/i)).toBeInTheDocument();
  });
});
