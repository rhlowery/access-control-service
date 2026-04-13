import { getApiUrl } from '../config';

class ApiService {
  public baseUrl: string;
  constructor() {
    this.baseUrl = getApiUrl('');
  }

  async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    const optionsHeaders: Record<string, string> = (options.headers as Record<string, string>) || {};

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...optionsHeaders
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Handle unauthorized (session expired)
        console.warn('Session expired or unauthorized request');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response is No Content
      if (response.status === 204) return null as T;

      return await response.json() as T;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const methodOptions: RequestInit = { ...options, method: 'POST' };
    if (body !== undefined) {
      methodOptions.body = JSON.stringify(body);
    }
    return this.fetch<T>(endpoint, methodOptions);
  }

  put<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const methodOptions: RequestInit = { ...options, method: 'PUT' };
    if (body !== undefined) {
      methodOptions.body = JSON.stringify(body);
    }
    return this.fetch<T>(endpoint, methodOptions);
  }

  patch<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const methodOptions: RequestInit = { ...options, method: 'PATCH' };
    if (body !== undefined) {
      methodOptions.body = JSON.stringify(body);
    }
    return this.fetch<T>(endpoint, methodOptions);
  }

  delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService();
