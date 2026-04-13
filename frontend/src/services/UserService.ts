import { getApiUrl } from '../config';

const API_BASE = getApiUrl('/api');

export const UserService = {
  async getUsers() {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getGroups() {
    const response = await fetch(`${API_BASE}/groups`);
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },

  async getPersonas() {
    const response = await fetch(`${API_BASE}/auth/personas`);
    if (!response.ok) throw new Error('Failed to fetch personas');
    return response.json();
  },

  async assignUserPersona(userId, persona) {
    const response = await fetch(`${API_BASE}/auth/users/${userId}/persona`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: persona
    });
    if (!response.ok) throw new Error(`Failed to assign persona to user ${userId}`);
    return response.json();
  },

  async assignGroupPersona(groupId, persona) {
    const response = await fetch(`${API_BASE}/auth/groups/${groupId}/persona`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: persona
    });
    if (!response.ok) throw new Error(`Failed to assign persona to group ${groupId}`);
    return response.json();
  }
};
