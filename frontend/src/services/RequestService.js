import { api } from './ApiService';

const API_BASE = '/api/storage/requests';

export const RequestService = {
  async getRequests() {
    return await api.get(API_BASE);
  },

  async submitRequest(request) {
    return await api.post(API_BASE, request);
  },

  async approveRequest(id) {
    return await api.post(`${API_BASE}/${id}/approve`);
  },

  async rejectRequest(id, reason) {
    return await api.post(`${API_BASE}/${id}/reject`, { reason });
  },

  async verifyRequest(id) {
    return await api.post(`${API_BASE}/${id}/verify`);
  },

  streamRequests(callback) {
    const eventSource = new EventSource(api.baseUrl + `${API_BASE}/stream`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return eventSource;
  }
};
