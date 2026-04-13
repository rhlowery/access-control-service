import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessRequestForm } from '../AccessRequestForm';
import { RequestService } from '../../../services/RequestService';
import { AuthService } from '../../../services/AuthService';

vi.mock('../../../services/RequestService', () => ({
    RequestService: {
        submitRequest: vi.fn()
    }
}));

vi.mock('../../../services/AuthService', () => ({
    AuthService: {
        getCurrentUser: vi.fn().mockReturnValue({ userId: 'test-user' })
    }
}));

const mockNode = {
    id: 'table-1',
    name: 'users',
    type: 'table',
    path: 'main/default'
};

describe('AccessRequestForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.alert = vi.fn();
    });

    it('renders with default values', () => {
        render(<AccessRequestForm node={mockNode} onClose={() => {}} />);
        expect(screen.getByDisplayValue('test-user')).toBeInTheDocument();
        expect(screen.getByDisplayValue('main/default/users')).toBeInTheDocument();
        expect(screen.getByText('Request Access')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
        render(<AccessRequestForm node={mockNode} onClose={() => {}} />);
        
        const form = screen.getByLabelText('access-request-form');
        fireEvent.submit(form);
        
        expect(window.alert).toHaveBeenCalledWith('Please select at least one privilege.');
        
        fireEvent.click(screen.getByText('SELECT', { selector: 'button' }));
        fireEvent.submit(form);
        expect(window.alert).toHaveBeenCalledWith('Please provide a justification.');
    });

    it('submits successfully', async () => {
        RequestService.submitRequest.mockResolvedValue({ id: 'req-123' });
        const onSuccess = vi.fn();
        const onClose = vi.fn();
        
        render(<AccessRequestForm node={mockNode} onClose={onClose} onSuccess={onSuccess} />);
        
        fireEvent.click(screen.getByText('SELECT', { selector: 'button' }));
        fireEvent.click(screen.getByText('UPDATE', { selector: 'button' }));
        fireEvent.change(screen.getByPlaceholderText(/Please explain why/), { target: { value: 'need data for report' } });
        fireEvent.change(screen.getByLabelText(/Expiration/), { target: { value: '2026-12-31T23:59' } });
        
        fireEvent.click(screen.getByText('Submit Request'));
        
        await waitFor(() => expect(RequestService.submitRequest).toHaveBeenCalled());
        expect(window.alert).toHaveBeenCalledWith('Access request submitted successfully!');
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('handles submission error', async () => {
        RequestService.submitRequest.mockRejectedValue(new Error('Network error'));
        render(<AccessRequestForm node={mockNode} onClose={() => {}} />);
        
        fireEvent.click(screen.getByText('SELECT', { selector: 'button' }));
        fireEvent.change(screen.getByPlaceholderText(/Please explain why/), { target: { value: 'test' } });
        fireEvent.click(screen.getByText('Submit Request'));
        
        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error: Network error'));
    });

    it('toggles privileges correctly', () => {
        render(<AccessRequestForm node={mockNode} onClose={() => {}} />);
        const selectBox = screen.getByText('SELECT', { selector: 'button' });
        
        fireEvent.click(selectBox);
        expect(selectBox.className).toContain('text-primary');
        
        fireEvent.click(selectBox);
        expect(selectBox.className).not.toContain('text-primary');
    });
});
