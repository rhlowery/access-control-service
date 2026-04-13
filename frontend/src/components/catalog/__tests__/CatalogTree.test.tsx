import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogTree } from '../CatalogTree';
import { CatalogService } from '../../../services/CatalogService';

vi.mock('../../../services/CatalogService');

describe('CatalogTree', () => {
  const mockCatalogs = [
    { id: 'catalog-1', name: 'main', type: 'catalog', access: 'SELECT' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a list of catalogs', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce(mockCatalogs);
    
    render(<CatalogTree onSelect={() => {}} onRightClick={() => {}} />);
    
    expect(await screen.findByText('main')).toBeInTheDocument();
  });

  it('expands a catalog to show nodes on click', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce(mockCatalogs);
    CatalogService.getNodes.mockResolvedValueOnce([
      { name: 'default', type: 'schema', path: 'default', access: 'NONE' }
    ]);

    render(<CatalogTree onSelect={() => {}} onRightClick={() => {}} />);

    // Wait for the catalog to appear
    const catalogNode = await screen.findByText('main');
    
    // Find the expand button (ChevronRight/Down)
    const expandBtn = catalogNode.parentElement.querySelector('.expand-icon');
    fireEvent.click(expandBtn);

    // Schema should appear
    expect(await screen.findByText('default')).toBeInTheDocument();
    expect(CatalogService.getNodes).toHaveBeenCalledWith('catalog-1', '/');
  });

  it('calls onSelect when a node is clicked', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce(mockCatalogs);
    const selectHandler = vi.fn();
    
    render(<CatalogTree onSelect={selectHandler} onRightClick={() => {}} />);
    
    const catalogNode = await screen.findByText('main');
    fireEvent.click(catalogNode);
    
    expect(selectHandler).toHaveBeenCalledWith(expect.objectContaining({ name: 'main' }));
  });

  it('calls onRightClick when context menu is triggered', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce(mockCatalogs);
    const rightClickHandler = vi.fn();
    
    render(<CatalogTree onSelect={() => {}} onRightClick={rightClickHandler} />);
    
    const catalogNode = await screen.findByText('main');
    fireEvent.contextMenu(catalogNode);
    
    expect(rightClickHandler).toHaveBeenCalled();
  });
});
