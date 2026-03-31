import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewerDashboard } from '../ReviewerDashboard';
import { AuditService } from '../../services/AuditService';
import { RequestService } from '../../services/RequestService';

vi.stubGlobal('alert', vi.fn());

vi.mock('../../services/AuditService', () => ({
    AuditService: {
        getLogs: vi.fn(),
        streamLogs: vi.fn().mockImplementation(() => ({ close: vi.fn() }))
    }
}));
vi.mock('../../services/RequestService', () => ({
    RequestService: {
        getRequests: vi.fn(),
        verifyRequest: vi.fn(),
        streamRequests: vi.fn()
    }
}));

const mockAuditLogs = [
    { id: '1', timestamp: Date.now(), principalId: 'user1', action: 'LOGIN', resourcePath: 'System', result: 'SUCCESS' }
];

describe('ReviewerDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        AuditService.getLogs.mockResolvedValue(mockAuditLogs);
        RequestService.getRequests.mockResolvedValue([{ id: 'req-1', status: 'APPROVED', resourcePath: 'main.db.t1' }]);
    });

    it('renders audit logs by default', async () => {
        render(<ReviewerDashboard />);
        await waitFor(() => expect(screen.getByText('LOGIN')).toBeInTheDocument());
        expect(screen.getByText('user1')).toBeInTheDocument();
    });

    it('switches to requests view and handles verify', async () => {
        render(<ReviewerDashboard />);
        
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());
        
        const verifyBtn = screen.getByText('Verify Integrity');
        fireEvent.click(verifyBtn);
        
        expect(RequestService.verifyRequest).toHaveBeenCalledWith('req-1');
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith(expect.stringMatching(/verified/)));
    });

    it('handles verify error', async () => {
        RequestService.verifyRequest.mockRejectedValue(new Error('Verify failed'));
        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());
        
        fireEvent.click(screen.getByText('Verify Integrity'));
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Verify failed'));
    });

    it('toggles live-stream for audit logs', async () => {
        render(<ReviewerDashboard />);
        const toggle = screen.getByRole('checkbox');
        
        fireEvent.click(toggle);
        expect(AuditService.streamLogs).toHaveBeenCalled();
    });

    it('updates request status via stream in Reviewer Dashboard', async () => {
        let requestCallback;
        RequestService.streamRequests.mockImplementation(cb => {
            requestCallback = cb;
            return { close: vi.fn() };
        });

        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());

        // Enable live
        fireEvent.click(screen.getByRole('checkbox'));
        
        // Wait for effect to run and set requestCallback
        await waitFor(() => expect(RequestService.streamRequests).toHaveBeenCalled());
        
        // Simulate update to "VERIFIED"
        fireEvent.change(screen.getByRole('checkbox'), { target: { checked: true } }); // Ensure state is synced
        
        await act(async () => {
            requestCallback({ id: 'req-1', status: 'VERIFIED', resourcePath: 'main.db.t1' });
        });
        
        await waitFor(() => expect(screen.getByText('VERIFIED')).toBeInTheDocument());
    });

    it('adds a new request via stream in Reviewer Dashboard', async () => {
        let requestCallback;
        RequestService.streamRequests.mockImplementation(cb => {
            requestCallback = cb;
            return { close: vi.fn() };
        });

        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Access Requests'));
        await waitFor(() => expect(screen.getByText('req-1')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('checkbox'));
        await waitFor(() => expect(RequestService.streamRequests).toHaveBeenCalled());
        
        await act(async () => {
            requestCallback({ id: 'req-new', status: 'PENDING', resourcePath: 'new.db.t1' });
        });
        
        await waitFor(() => expect(screen.getByText('req-new')).toBeInTheDocument());
    });

    it('updates audit logs via stream', async () => {
        let logCallback;
        AuditService.streamLogs.mockImplementation(cb => {
            logCallback = cb;
            return { close: vi.fn() };
        });

        render(<ReviewerDashboard />);
        // Enable live
        fireEvent.click(screen.getByRole('checkbox'));
        
        await waitFor(() => expect(AuditService.streamLogs).toHaveBeenCalled());
        
        await act(async () => {
            logCallback({ id: 'log-2', timestamp: Date.now(), principalId: 'user2', action: 'LOGOUT', resourcePath: 'System', result: 'SUCCESS' });
        });
        
        await waitFor(() => expect(screen.getByText('LOGOUT')).toBeInTheDocument());
    });

    it('shows integrity placeholder', () => {
        render(<ReviewerDashboard />);
        fireEvent.click(screen.getByText('Resource Integrity'));
        expect(screen.getByText('Catalog Integrity Checker')).toBeInTheDocument();
    });
});
