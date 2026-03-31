import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../UserService';

describe('UserService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  const mockResponse = (data, ok = true) => {
    return Promise.resolve({
      ok,
      json: () => Promise.resolve(data)
    });
  };

  it('fetches users successfully', async () => {
    const mockData = [{ id: '1', name: 'user1' }];
    global.fetch.mockResolvedValueOnce(mockResponse(mockData));

    const result = await UserService.getUsers();
    expect(global.fetch).toHaveBeenCalledWith('/api/users');
    expect(result).toEqual(mockData);
  });

  it('handles fetch users error', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse(null, false));
    await expect(UserService.getUsers()).rejects.toThrow('Failed to fetch users');
  });

  it('fetches groups successfully', async () => {
    const mockData = [{ id: '1', name: 'group1' }];
    global.fetch.mockResolvedValueOnce(mockResponse(mockData));

    const result = await UserService.getGroups();
    expect(global.fetch).toHaveBeenCalledWith('/api/groups');
    expect(result).toEqual(mockData);
  });

  it('handles fetch groups error', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse(null, false));
    await expect(UserService.getGroups()).rejects.toThrow('Failed to fetch groups');
  });

  it('fetches personas successfully', async () => {
    const mockData = ['ADMIN', 'APPROVER'];
    global.fetch.mockResolvedValueOnce(mockResponse(mockData));

    const result = await UserService.getPersonas();
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/personas');
    expect(result).toEqual(mockData);
  });

  it('handles fetch personas error', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse(null, false));
    await expect(UserService.getPersonas()).rejects.toThrow('Failed to fetch personas');
  });

  it('assigns user persona successfully', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse({ success: true }));

    const result = await UserService.assignUserPersona('user-1', 'ADMIN');
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/users/user-1/persona', {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: 'ADMIN'
    });
    expect(result).toEqual({ success: true });
  });

  it('handles assign user persona error', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse(null, false));
    await expect(UserService.assignUserPersona('user-1', 'ADMIN')).rejects.toThrow('Failed to assign persona to user user-1');
  });

  it('assigns group persona successfully', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse({}));

    await UserService.assignGroupPersona('group-1', 'APPROVER');
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/groups/group-1/persona', {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: 'APPROVER'
    });
  });

  it('handles assign group persona error', async () => {
    global.fetch.mockResolvedValueOnce(mockResponse(null, false));
    await expect(UserService.assignGroupPersona('group-1', 'APPROVER')).rejects.toThrow('Failed to assign persona to group group-1');
  });
});
