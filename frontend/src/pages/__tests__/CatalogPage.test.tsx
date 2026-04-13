import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogPage } from '../CatalogPage';
import { CatalogService } from '../../services/CatalogService';

vi.mock('../../services/CatalogService', () => ({
  CatalogService: {
    getRegistrations: vi.fn(),
    getNodes: vi.fn(),
    getPermissions: vi.fn(),
    searchCatalog: vi.fn()
  }
}));

vi.mock('../../components/catalog/CatalogTree', () => ({
  CatalogTree: ({ onSelect, onRightClick }) => (
    <div data-testid="mock-catalog-tree">
      <button onClick={() => onSelect({ id: 'c1', name: 'main', type: 'catalog', path: 'main', access: 'SELECT' })}>Select Catalog</button>
      <button onClick={() => onSelect({ id: 't1', name: 'users', type: 'table', path: 'default/users', access: 'NONE' })}>Select Table</button>
      <button onContextMenu={(e) => { e.preventDefault(); onRightClick(e, { name: 'test-node' }); }}>Right Click Node</button>
    </div>
  )
}));

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invitation to select a resource initially', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    expect(screen.getByText('Begin Exploration')).toBeInTheDocument();
  });

  it('updates breadcrumbs and details when a node is selected', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    const selectBtn = screen.getByText('Select Catalog');
    fireEvent.click(selectBtn);
    
    // Breadcrumb should update - check for 'Catalog' and 'main'
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getAllByText('main')[0]).toBeInTheDocument();
    expect(screen.getByText('Full SELECT privileges detected')).toBeInTheDocument();
  });

  it('handles table selection and type-specific rendering', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    const selectBtn = screen.getByText('Select Table');
    fireEvent.click(selectBtn);

    // Check breadcrumbs for non-catalog
    // Line 29: setBreadcrumbPath(['main', ...newPath]);
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getAllByText('users')[0]).toBeInTheDocument();
    expect(screen.getAllByText('TABLE')[0]).toBeInTheDocument();
  });

  it('triggers right-click and opens access request form', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    // Right click
    const rightClickBtn = screen.getByText('Right Click Node');
    fireEvent.contextMenu(rightClickBtn);
    expect(consoleSpy).toHaveBeenCalledWith('Right click on', expect.objectContaining({ name: 'test-node' }));
    
    // Select a node restricted access and click request button
    fireEvent.click(screen.getByText('Select Table'));
    const requestBtn = screen.getByText('Request Access');
    fireEvent.click(requestBtn);
    
    // Should now show the form modal
    expect(screen.getByText('Principal (User ID)')).toBeInTheDocument();
  });

  it('renders table-specific preview', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    fireEvent.click(screen.getByText('Select Table'));
    
    // Preview should exist for tables
    expect(screen.getByText('Schema Preview')).toBeInTheDocument();
    expect(screen.getByText('TIMESTAMP')).toBeInTheDocument();
  });

  it('can close the access request form', async () => {
    CatalogService.getRegistrations.mockResolvedValueOnce([]);
    render(<CatalogPage />);
    
    fireEvent.click(screen.getByText('Select Table'));
    fireEvent.click(screen.getByText('Request Access'));
    
    // Close button
    fireEvent.click(screen.getByText(/Cancel/i));
    
    // Form should be gone
    expect(screen.queryByText('Principal (User ID)')).toBeNull();
  });
});
