import { getApiUrl } from '../config';

const API_BASE = getApiUrl('/api/storage/requests');

export const RequestService = {
  async getRequests() {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  async submitRequest(request) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error('Failed to submit request');
    return response.json();
  },

  async approveRequest(id) {
    const response = await fetch(`${API_BASE}/${id}/approve`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to approve request');
    return response.json();
  },

  async rejectRequest(id, reason) {
    const response = await fetch(`${API_BASE}/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to reject request');
    return response.json();
  },

  async verifyRequest(id) {
    const response = await fetch(`${API_BASE}/${id}/verify`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to verify request');
    return response.json();
  },

  streamRequests(callback) {
    const eventSource = new EventSource(`${API_BASE}/stream`);
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
