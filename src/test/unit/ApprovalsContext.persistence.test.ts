import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ApprovalsProvider, useApprovals, type ApprovalRequest } from '../../contexts/ApprovalsContext';
import { RequestsService } from '../../services/requestsService';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock RequestsService
vi.mock('../../services/requestsService', () => ({
  RequestsService: {
    create: vi.fn(),
    listAll: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

describe('ApprovalsContext Persistence (DB-first)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApprovalsProvider>{children}</ApprovalsProvider>
  );

  it('should load from DB on init and persist cache', async () => {
    const dbRow = {
      id: 'db-1',
      request_number: 'REQ-2025-0001',
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      resource_name: 'DB Resource',
      resource_type: 'Application',
      business_justification: 'From DB',
    };

    vi.mocked(RequestsService.listAll).mockResolvedValue([dbRow] as any);

    const { result } = renderHook(() => useApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
      expect(result.current.requests[0].id).toBe('db-1');
    });

    const cached = JSON.parse(localStorageMock.getItem('approvals-requests-cache-v1') || '[]');
    expect(cached).toHaveLength(1);
    expect(cached[0].id).toBe('db-1');
  });

  it('should save request to cache when created', async () => {
    const mockCreated = {
      id: 'db-id-123',
      request_number: 'REQ-2025-1234',
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      resource_name: 'Test Resource',
      resource_type: 'Application',
      business_justification: 'Test justification',
    };

    vi.mocked(RequestsService.create).mockResolvedValue(mockCreated as any);
    vi.mocked(RequestsService.listAll).mockResolvedValue([]);

    const { result } = renderHook(() => useApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.requests).toBeDefined();
    });

    const newRequest = {
      requester: { name: 'New User', email: 'new@example.com', department: 'Sales' },
      item: { name: 'New Resource', type: 'Application' },
      risk: 'Medium' as const,
      businessJustification: 'New request',
      sodConflicts: 0,
    };

    await result.current.submitAccessRequest(newRequest);

    await waitFor(() => {
      const cached = JSON.parse(localStorageMock.getItem('approvals-requests-cache-v1') || '[]');
      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('db-id-123');
      expect(cached[0].requester.name).toBe('New User');
    });
  });

  it('should persist cache across reloads', async () => {
    const cachedRequest: ApprovalRequest = {
      id: 'persist-test-1',
      requester: { name: 'Persist User', email: 'persist@example.com', department: 'Finance' },
      item: { name: 'Persist Resource', type: 'Application' },
      status: 'Pending',
      risk: 'High',
      age: '0d',
      slaRemaining: '3d',
      submittedAt: new Date().toISOString(),
      businessJustification: 'Should persist',
      sodConflicts: 0,
    };

    localStorageMock.setItem('approvals-requests-cache-v1', JSON.stringify([cachedRequest]));

    vi.mocked(RequestsService.listAll).mockResolvedValue([]);

    const { result, rerender } = renderHook(() => useApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    // Simulate reload
    await result.current.reload();

    await waitFor(() => {
      const cached = JSON.parse(localStorageMock.getItem('approvals-requests-cache-v1') || '[]');
      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('persist-test-1');
      expect(cached[0].requester.name).toBe('Persist User');
    });
  });

  it('should sync local-only requests to DB on load', async () => {
    const localRequest: ApprovalRequest = {
      id: 'REQ-LOCAL-1234567890',
      requester: { name: 'Local User', email: 'local@example.com', department: 'IT' },
      item: { name: 'Local Resource', type: 'Application' },
      status: 'Pending',
      risk: 'Low',
      age: '0d',
      slaRemaining: '3d',
      submittedAt: new Date().toISOString(),
      businessJustification: 'Local request',
      sodConflicts: 0,
    };

    localStorageMock.setItem('approvals-requests-cache-v1', JSON.stringify([localRequest]));

    const mockCreated = {
      id: 'synced-db-id',
      request_number: 'REQ-2025-5678',
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      resource_name: 'Local Resource',
      resource_type: 'Application',
      business_justification: 'Local request',
    };

    vi.mocked(RequestsService.create).mockResolvedValue(mockCreated as any);
    vi.mocked(RequestsService.listAll).mockResolvedValue([mockCreated] as any);

    const { result } = renderHook(() => useApprovals(), { wrapper });

    // Wait for sync and reload to complete
    await waitFor(() => {
      const requests = result.current.requests;
      const hasSynced = requests.some(r => r.id === 'synced-db-id');
      const hasLocal = requests.some(r => r.id.startsWith('REQ-LOCAL-'));
      expect(hasSynced).toBe(true);
      expect(hasLocal).toBe(false); // Local should be replaced
    }, { timeout: 3000 });

    // Verify cache was updated
    const cached = JSON.parse(localStorageMock.getItem('approvals-requests-cache-v1') || '[]');
    const cachedLocal = cached.filter((r: ApprovalRequest) => r.id.startsWith('REQ-LOCAL-'));
    expect(cachedLocal).toHaveLength(0);
  });

  it('should not prefer cache over DB; DB is authoritative', async () => {
    // Place a conflicting cached item, but DB should override
    const cachedRequest: ApprovalRequest = {
      id: 'same-id',
      requester: { name: 'Cached User', email: 'cached@example.com', department: 'Engineering' },
      item: { name: 'Cached Resource', type: 'Application' },
      status: 'Pending',
      risk: 'High',
      age: '0d',
      slaRemaining: '3d',
      submittedAt: '2025-01-01T10:00:00Z',
      businessJustification: 'Cached justification',
      sodConflicts: 2,
    };
    localStorageMock.setItem('approvals-requests-cache-v1', JSON.stringify([cachedRequest]));

    const dbRequest = {
      id: 'same-id',
      request_number: 'REQ-2025-9999',
      status: 'APPROVED',
      submitted_at: '2025-01-01T10:00:00Z',
      resource_name: 'Cached Resource',
      resource_type: 'Application',
      business_justification: 'Cached justification',
    };
    vi.mocked(RequestsService.listAll).mockResolvedValue([dbRequest] as any);

    const { result } = renderHook(() => useApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
      expect(result.current.requests[0].status).toBe('Approved');
    });
  });

  it('should handle DB failure gracefully and use cache', async () => {
    const cachedRequest: ApprovalRequest = {
      id: 'fallback-test-1',
      requester: { name: 'Fallback User', email: 'fallback@example.com', department: 'IT' },
      item: { name: 'Fallback Resource', type: 'Application' },
      status: 'Pending',
      risk: 'Low',
      age: '0d',
      slaRemaining: '3d',
      submittedAt: new Date().toISOString(),
      businessJustification: 'Fallback request',
      sodConflicts: 0,
    };

    localStorageMock.setItem('approvals-requests-cache-v1', JSON.stringify([cachedRequest]));

    vi.mocked(RequestsService.listAll).mockRejectedValue(new Error('DB connection failed'));

    const { result } = renderHook(() => useApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    await result.current.reload();

    await waitFor(() => {
      // Should still have the cached request
      expect(result.current.requests).toHaveLength(1);
      expect(result.current.requests[0].id).toBe('fallback-test-1');
      expect(result.current.requests[0].requester.name).toBe('Fallback User');
    });
  });
});

