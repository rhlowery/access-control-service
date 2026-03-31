import { api } from './ApiService';

const API_BASE = '/api/catalog';

export const CatalogService = {
  async getRegistrations() {
    return await api.get(`${API_BASE}/registrations`);
  },

  async getNodes(catalogId, path = '/') {
    const query = path !== '/' ? `?path=${encodeURIComponent(path)}` : '';
    return await api.get(`${API_BASE}/${catalogId}/nodes${query}`);
  },

  async getPermissions(catalogId, path) {
    return await api.get(`${API_BASE}/${catalogId}/nodes/permissions?path=${encodeURIComponent(path)}`);
  },

  async searchCatalog(query) {
    return await api.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  }
};
