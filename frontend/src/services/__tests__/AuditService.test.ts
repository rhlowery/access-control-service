import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '../AuditService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

class MockEventSource {
    public url: string;
    public close: any;
    public onmessage: any;
    public onerror: any;

    constructor(url: string) {
        this.url = url;
        this.close = vi.fn();
    }
}
vi.stubGlobal('EventSource', MockEventSource);

describe('AuditService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
    });

    it('fetches logs', async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'log-1' }]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        const res = await AuditService.getLogs();
        expect(res).toEqual([{ id: 'log-1' }]);
        const calledUrl = typeof mockFetch.mock.calls[0][0] === 'string' 
          ? mockFetch.mock.calls[0][0] 
          : mockFetch.mock.calls[0][0].url;
        expect(calledUrl).toContain('/api/audit/log');
    });

    it('throws on logs fetch error', async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
        await expect(AuditService.getLogs()).rejects.toThrow('Failed to fetch audit logs');
    });

    it('streams audit events', () => {
        const callback = vi.fn();
        const es = AuditService.streamLogs(callback);
        
        const mockEvent = { data: JSON.stringify({ id: 'new-log' }) };
        es.onmessage(mockEvent as any);
        
        expect(callback).toHaveBeenCalledWith({ id: 'new-log' });
        
        es.onerror(new Event('error') as any);
        expect(es.close).toHaveBeenCalled();
    });
});
