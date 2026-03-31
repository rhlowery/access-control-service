import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApproverDashboard } from '../ApproverDashboard';
import { RequestService } from '../../services/RequestService';

vi.stubGlobal('alert', vi.fn());

vi.mock('../../services/RequestService', () => ({
  RequestService: {
    getRequests: vi.fn(),
    approveRequest: vi.fn(),
    rejectRequest: vi.fn(),
    streamRequests: vi.fn().mockImplementation(() => ({ close: vi.fn() }))
  }
}));

const mockRequests = [
  { id: 'req-1', principalId: 'user1', resourcePath: 'main.db.t1', permission: 'SELECT', justification: 'need it', status: 'PENDING' },
  { id: 'req-2', principalId: 'user2', resourcePath: 'main.db.t2', permission: 'SELECT', justification: 'reason', status: 'APPROVED' }
];

describe('ApproverDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    RequestService.getRequests.mockResolvedValue(mockRequests);
  });

  it('renders pending requests by default', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    expect(screen.queryByText('user2')).not.toBeInTheDocument(); // req-2 is APPROVED, filtered out
  });

  it('filters by status tabs', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('APPROVED'));
    await waitFor(() => expect(screen.getByText('user2')).toBeInTheDocument());
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
  });

  it('handles approval', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    const approveBtn = screen.getByTitle('Approve access');
    fireEvent.click(approveBtn);
    
    expect(RequestService.approveRequest).toHaveBeenCalledWith('req-1');
    await waitFor(() => expect(RequestService.getRequests).toHaveBeenCalledTimes(2));
  });

  it('handles rejection with reason modal', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    const rejectBtn = screen.getByTitle('Reject access');
    fireEvent.click(rejectBtn);
    
    expect(screen.getByText('Confirm Rejection')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText(/e.g., Request doesn't/);
    fireEvent.change(textarea, { target: { value: 'forbidden' } });
    
    const confirmBtn = screen.getByText('Reject Access');
    fireEvent.click(confirmBtn);
    
    expect(RequestService.rejectRequest).toHaveBeenCalledWith('req-1', 'forbidden');
    await waitFor(() => expect(screen.queryByText('Confirm Rejection')).not.toBeInTheDocument());
  });

  it('validates mandatory rejection reason', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Reject access'));
    const confirmBtn = screen.getByText('Reject Access');
    fireEvent.click(confirmBtn);
    
    expect(global.alert).toHaveBeenCalledWith('Rejection reason is required.');
    expect(RequestService.rejectRequest).not.toHaveBeenCalled();
  });

  it('handles cancel in rejection modal', async () => {
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Reject access'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Confirm Rejection')).not.toBeInTheDocument();
  });

  it('handles errors during approval', async () => {
    RequestService.approveRequest.mockRejectedValue(new Error('Backend error'));
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Approve access'));
    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Backend error'));
  });

  it('handles errors during rejection', async () => {
    RequestService.rejectRequest.mockRejectedValue(new Error('Backend error 2'));
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTitle('Reject access'));
    fireEvent.change(screen.getByPlaceholderText(/e.g., Request doesn't/), { target: { value: 'some reason' } });
    fireEvent.click(screen.getByText('Reject Access'));
    
    await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Backend error 2'));
  });

  it('toggles live field', async () => {
    render(<ApproverDashboard />);
    const toggle = screen.getByRole('checkbox');
    
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(RequestService.streamRequests).toHaveBeenCalled();
  });

  it('updates existing request when SSE event arrives', async () => {
    let streamCallback;
    RequestService.streamRequests.mockImplementation((cb) => {
      streamCallback = cb;
      return { close: vi.fn() };
    });
    
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    
    // Enable live
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Simulate update to req-1 (making it APPROVED)
    fireEvent.click(screen.getByText('APPROVED')); // Switch tab to see it disappear/appear
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
    
    await act(async () => {
      streamCallback({ id: 'req-1', principalId: 'user1', status: 'APPROVED' });
    });
    
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
  });

  it('adds a new request when SSE event arrives with unknown ID', async () => {
    let streamCallback;
    RequestService.streamRequests.mockImplementation((cb) => {
      streamCallback = cb;
      return { close: vi.fn() };
    });
    
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox'));
    
    await act(async () => {
      streamCallback({ id: 'req-3', principalId: 'user3', status: 'PENDING', resourcePath: 'main.db.t3' });
    });
    
    await waitFor(() => expect(screen.getByText('user3')).toBeInTheDocument());
  });

  it('handles errors during fetch', async () => {
    RequestService.getRequests.mockRejectedValue(new Error('Fetch failed'));
    render(<ApproverDashboard />);
    await waitFor(() => expect(screen.getByText('Fetch failed')).toBeInTheDocument());
  });
});
