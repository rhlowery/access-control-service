import { getApiUrl } from '../config';

const API_BASE = getApiUrl('/api/catalog');

export const CatalogService = {
  async getRegistrations() {
    const response = await fetch(`${API_BASE}/registrations`);
    if (!response.ok) throw new Error('Failed to fetch registrations');
    return response.json();
  },

  async getNodes(catalogId, path = '/') {
    const query = path !== '/' ? `?path=${encodeURIComponent(path)}` : '';
    const response = await fetch(`${API_BASE}/${catalogId}/nodes${query}`);
    if (!response.ok) throw new Error('Failed to fetch nodes');
    return response.json();
  },

  async getPermissions(catalogId, path) {
    const response = await fetch(`${API_BASE}/${catalogId}/nodes/permissions?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to fetch permissions');
    return response.json();
  },

  async searchCatalog(query) {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search catalog');
    return response.json();
  }
};
