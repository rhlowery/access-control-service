import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { AuthService } from '../../services/AuthService';

vi.mock('../../services/AuthService', () => ({
  AuthService: {
    getConfig: vi.fn(),
    getProviders: vi.fn(),
    login: vi.fn(),
    isMockAuth: vi.fn(),
    getMockUsers: vi.fn()
  }
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AuthService.getConfig.mockResolvedValue({ authServerUrl: 'http://auth', clientId: 'test' });
    AuthService.getProviders.mockResolvedValue([]);
    AuthService.isMockAuth.mockReturnValue(false);
    AuthService.getMockUsers.mockReturnValue([]);
  });

  it('shows loading state initially', async () => {
    AuthService.getProviders.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<LoginPage onLoginSuccess={vi.fn()} />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders login form and can login with local account', async () => {
    const onLoginSuccess = vi.fn();
    AuthService.login.mockResolvedValue({ status: 'success' });

    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    // Use findBy to wait for loading to finish
    const userInput = await screen.findByPlaceholderText(/Username or ID/i);
    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    expect(AuthService.login).toHaveBeenCalledWith('admin', 'password', 'local');
  });

  it('shows error message on failed login', async () => {
    AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage onLoginSuccess={vi.fn()} />);
    
    const userInput = await screen.findByPlaceholderText(/Username or ID/i);
    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
  });

  it('shows and handles multiple identity providers', async () => {
    const mockProviders = [
      { id: 'google', name: 'Google', type: 'OIDC' },
      { id: 'okta', name: 'Okta', type: 'SAML' }
    ];
    AuthService.getProviders.mockResolvedValue(mockProviders);
    const onLoginSuccess = vi.fn();
    
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);
    
    await screen.findByText(/^Google$/i);
    await screen.findByText(/^Okta$/i);
    
    fireEvent.click(screen.getByText(/^Google$/i));
    await waitFor(() => expect(AuthService.login).toHaveBeenCalled());
  });

  // ---- Mock Authentication Mode Tests ----

  it('renders mock identity picker when authType is mock', async () => {
    AuthService.isMockAuth.mockReturnValue(true);
    AuthService.getMockUsers.mockReturnValue([
      { userId: 'admin', name: 'Admin User', persona: 'ADMIN' },
      { userId: 'approver', name: 'Approver', persona: 'APPROVER' },
      { userId: 'auditor', name: 'Auditor', persona: 'AUDITOR' },
      { userId: 'requester', name: 'Requester', persona: 'REQUESTER' }
    ]);

    render(<LoginPage onLoginSuccess={vi.fn()} />);

    // Should show mock mode banner
    await screen.findByText(/Mock Authentication Mode/i);

    // Should show all mock personas
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Approver')).toBeInTheDocument();
    expect(screen.getByText('Auditor')).toBeInTheDocument();
    expect(screen.getByText('Requester')).toBeInTheDocument();

    // Should NOT show the credential form
    expect(screen.queryByPlaceholderText(/Username or ID/i)).toBeNull();
    expect(screen.queryByPlaceholderText(/Password/i)).toBeNull();
  });

  it('handles mock login when identity is selected', async () => {
    const onLoginSuccess = vi.fn();
    AuthService.isMockAuth.mockReturnValue(true);
    AuthService.getMockUsers.mockReturnValue([
      { userId: 'admin', name: 'Admin User', persona: 'ADMIN' }
    ]);
    AuthService.login.mockResolvedValue({ userId: 'admin', persona: 'ADMIN' });

    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await screen.findByText('Admin User');
    fireEvent.click(screen.getByText('Admin User'));

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('admin', '', 'mock');
      expect(onLoginSuccess).toHaveBeenCalledWith({ userId: 'admin', persona: 'ADMIN' });
    });
  });

  it('shows error on failed mock login', async () => {
    AuthService.isMockAuth.mockReturnValue(true);
    AuthService.getMockUsers.mockReturnValue([
      { userId: 'admin', name: 'Admin User', persona: 'ADMIN' }
    ]);
    AuthService.login.mockRejectedValue(new Error('Mock service unavailable'));

    render(<LoginPage onLoginSuccess={vi.fn()} />);

    await screen.findByText('Admin User');
    fireEvent.click(screen.getByText('Admin User'));

    await waitFor(() => expect(screen.getByText(/Mock service unavailable/i)).toBeInTheDocument());
  });

  it('renders custom mock users from backend config', async () => {
    AuthService.isMockAuth.mockReturnValue(true);
    AuthService.getMockUsers.mockReturnValue([
      { userId: 'developer', name: 'Dev User', persona: 'REQUESTER' }
    ]);

    render(<LoginPage onLoginSuccess={vi.fn()} />);

    await screen.findByText('Dev User');
    expect(screen.getByText('REQUESTER')).toBeInTheDocument();
  });
});
