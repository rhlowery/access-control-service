import { getApiUrl } from '../config';

const API_BASE = getApiUrl('/api/audit/log');

export const AuditService = {
  async getLogs() {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  streamLogs(callback) {
    // Note: This endpoint is requested in Backend Issue #12
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
