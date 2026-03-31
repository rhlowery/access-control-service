import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserGroupManagement } from '../UserGroupManagement';
import { UserService } from '../../services/UserService';

vi.mock('../../services/UserService', () => ({
  UserService: {
    getUsers: vi.fn(),
    getGroups: vi.fn(),
    getPersonas: vi.fn(),
    assignUserPersona: vi.fn(),
    assignGroupPersona: vi.fn()
  }
}));

const mockUsers = [
  { id: 'user-1', name: 'Alice', userId: 'alice@acs.local', roles: ['ADMIN'], groups: ['IT'] },
  { id: 'user-2', name: 'Bob', userId: 'bob@acs.local', roles: ['REQUESTER'], groups: [] }
];

const mockGroups = [
  { id: 'group-1', name: 'IT Support', members: ['user-1'] },
  { id: 'group-2', name: 'HR', members: [] }
];

describe('UserGroupManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();

    UserService.getUsers.mockResolvedValue(mockUsers);
    UserService.getGroups.mockResolvedValue(mockGroups);
    UserService.getPersonas.mockResolvedValue(['ADMIN', 'APPROVER', 'REQUESTER']);
  });

  it('renders loading state initially', async () => {
    UserService.getUsers.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockUsers), 100)));
    render(<UserGroupManagement />);
    expect(screen.getByText('Loading directory data...')).toBeInTheDocument();
  });

  it('renders users table and tabs', async () => {
    await act(async () => {
      render(<UserGroupManagement />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Identity & Access')).toBeInTheDocument();
    });

    // Default tab is Users
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('No groups')).toBeInTheDocument();
  });

  it('switches to groups tab', async () => {
    await act(async () => {
      render(<UserGroupManagement />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const groupsTab = screen.getByRole('button', { name: /groups/i });
    fireEvent.click(groupsTab);

    expect(screen.getByText('IT Support')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('handles assigning persona to user', async () => {
    UserService.assignUserPersona.mockResolvedValue({ success: true });

    await act(async () => {
      render(<UserGroupManagement />);
    });

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'APPROVER' } }); // Bob's select

    expect(UserService.assignUserPersona).toHaveBeenCalledWith('user-2', 'APPROVER');
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Persona APPROVER explicitly assigned to user user-2');
    });
  });

  it('handles failure when assigning user persona', async () => {
    UserService.assignUserPersona.mockRejectedValue(new Error('Update failed'));

    await act(async () => {
      render(<UserGroupManagement />);
    });

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'REQUESTER' } });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Update failed');
    });
  });

  it('handles assigning persona to group', async () => {
    UserService.assignGroupPersona.mockResolvedValue({ success: true });

    await act(async () => {
      render(<UserGroupManagement />);
    });

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /groups/i }));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'ADMIN' } }); // IT Support

    expect(UserService.assignGroupPersona).toHaveBeenCalledWith('group-1', 'ADMIN');
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Persona ADMIN explicitly assigned to group group-1');
    });
  });

  it('handles failure when assigning group persona', async () => {
    UserService.assignGroupPersona.mockRejectedValue(new Error('Update failed group'));

    await act(async () => {
      render(<UserGroupManagement />);
    });

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /groups/i }));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'ADMIN' } }); // IT Support

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Update failed group');
    });
  });

  it('handles api fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    UserService.getUsers.mockRejectedValue(new Error('Network error'));
    
    await act(async () => {
      render(<UserGroupManagement />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user/group data', expect.any(Error));
    });

    expect(screen.getByText('No users found.')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('renders correctly with object-based personas', async () => {
    UserService.getPersonas.mockResolvedValue([{ id: 'P1', name: 'Persona 1' }]);
    await act(async () => {
      render(<UserGroupManagement />);
    });
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getAllByText('Persona 1')[0]).toBeInTheDocument();
    
    // Switch to groups and check there too
    fireEvent.click(screen.getByRole('button', { name: /groups/i }));
    await waitFor(() => expect(screen.getByText('IT Support')).toBeInTheDocument());
    expect(screen.getAllByText('Persona 1')[0]).toBeInTheDocument();
  });

  it('handles non-array results from api', async () => {
    UserService.getUsers.mockResolvedValue(null);
    UserService.getGroups.mockResolvedValue({ not: 'an-array' });
    UserService.getPersonas.mockResolvedValue(true);
    
    await act(async () => {
      render(<UserGroupManagement />);
    });
    
    await waitFor(() => expect(screen.getByText('No users found.')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /groups/i }));
    expect(screen.getByText('No groups found.')).toBeInTheDocument();
  });
});
