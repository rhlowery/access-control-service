import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestService } from '../RequestService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

class MockEventSource {
  constructor(url) {
    this.url = url;
    this.close = vi.fn();
  }
}
vi.stubGlobal('EventSource', MockEventSource);

describe('RequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('fetches requests', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([{ id: '1' }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    const res = await RequestService.getRequests();
    expect(res).toEqual([{ id: '1' }]);
    const calledUrl = typeof mockFetch.mock.calls[0][0] === 'string' 
      ? mockFetch.mock.calls[0][0] 
      : mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toContain('/api/storage/requests');
  });

  it('throws on fetch error', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(RequestService.getRequests()).rejects.toThrow('Failed to fetch requests');
  });

  it('approves a request', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'APPROVED' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    const res = await RequestService.approveRequest('req-1');
    expect(res.status).toBe('APPROVED');
    const calledUrl = typeof mockFetch.mock.calls[0][0] === 'string' 
      ? mockFetch.mock.calls[0][0] 
      : mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toContain('/api/storage/requests/req-1/approve');
  });

  it('rejects a request with reason', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'REJECTED' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    await RequestService.rejectRequest('req-1', 'not needed');
    const firstCall = mockFetch.mock.calls[0];
    const calledUrl = typeof firstCall[0] === 'string' ? firstCall[0] : firstCall[0].url;
    expect(calledUrl).toContain('/api/storage/requests/req-1/reject');
  });

  it('verifies a request', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ verified: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    await RequestService.verifyRequest('req-1');
    const calledUrl = typeof mockFetch.mock.calls[0][0] === 'string' 
      ? mockFetch.mock.calls[0][0] 
      : mockFetch.mock.calls[0][0].url;
    expect(calledUrl).toContain('/api/storage/requests/req-1/verify');
  });

  it('throws on approve error', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(RequestService.approveRequest('1')).rejects.toThrow('Failed to approve request');
  });

  it('throws on reject error', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(RequestService.rejectRequest('1', 'reason')).rejects.toThrow('Failed to reject request');
  });

  it('throws on verify error', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(RequestService.verifyRequest('1')).rejects.toThrow('Failed to verify request');
  });

  it('streams requests', () => {
    const callback = vi.fn();
    const es = RequestService.streamRequests(callback);
    
    const mockEvent = { data: JSON.stringify({ id: 'new-req' }) };
    es.onmessage(mockEvent);
    
    expect(callback).toHaveBeenCalledWith({ id: 'new-req' });
    
    es.onerror();
    expect(es.close).toHaveBeenCalled();
  });
});
