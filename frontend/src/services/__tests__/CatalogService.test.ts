import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogService } from '../CatalogService';

describe('CatalogService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  it('getRegistrations fetches from the correct endpoint', async () => {
    const mockData = [{ id: 'main', name: 'main' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await CatalogService.getRegistrations();
    expect(fetch).toHaveBeenCalledWith('/api/catalog/registrations', expect.anything());
    expect(result).toEqual(mockData);
  });

  it('getNodes fetches with catalogId and path', async () => {
    const mockData = [{ name: 'default', type: 'schema' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await CatalogService.getNodes('main', 'default');
    expect(fetch).toHaveBeenCalledWith('/api/catalog/main/nodes?path=default', expect.anything());
    expect(result).toEqual(mockData);
  });

  it('getNodes handles root path correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await CatalogService.getNodes('main', '/');
    expect(fetch).toHaveBeenCalledWith('/api/catalog/main/nodes', expect.anything());
  });

  it('getPermissions fetches with catalogId and path', async () => {
    const mockData = { permissions: ['SELECT'] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await CatalogService.getPermissions('main', 'default/users');
    expect(fetch).toHaveBeenCalledWith('/api/catalog/main/nodes/permissions?path=default%2Fusers', expect.anything());
    expect(result).toEqual(mockData);
  });

  it('searchCatalog fetches with query', async () => {
    const mockData = [{ name: 'sales' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await CatalogService.searchCatalog('sales');
    expect(fetch).toHaveBeenCalledWith('/api/catalog/search?q=sales', expect.anything());
    expect(result).toEqual(mockData);
  });

  it('throws error when fetch fails', async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(CatalogService.getRegistrations()).rejects.toThrow(/HTTP error!/);
  });

  it('throws error when getNodes fails', async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(CatalogService.getNodes('main', '/')).rejects.toThrow(/HTTP error!/);
  });

  it('throws error when getPermissions fails', async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(CatalogService.getPermissions('main', '/')).rejects.toThrow(/HTTP error!/);
  });

  it('throws error when searchCatalog fails', async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(CatalogService.searchCatalog('test')).rejects.toThrow(/HTTP error!/);
  });
});
