import { useState, useEffect } from 'react';
import { api } from './api';
import type { ComplaintRecord } from '../types/complaint';

const STORAGE_KEY = 'smartcity_all_complaints';
const EVENT_KEY = 'smartcity_complaints_synced';

// Zero preloaded complaints: Start fresh and clean
export const DEFAULT_COMPLAINTS: ComplaintRecord[] = [];

// Helper: Check if a complaint is legacy mock/testing data
function isLegacyMockComplaint(item: ComplaintRecord): boolean {
  if (!item || !item.complaintId) return true;
  const id = item.complaintId.toUpperCase();
  const mockIds = [
    'SC-2026-000109',
    'SC-2026-000115',
    'SC-2026-000214',
    'SC-2026-000305',
    'SC-2026-000418',
    'SC-2026-000520',
    'SC-2026-000801',
    'SC-2026-000701',
    'SC-2026-000702',
    'SC-2026-000601',
    'SC-2026-000602',
    'SC-2026-000001',
  ];
  return mockIds.includes(id);
}

// Helper: Read stored complaints (cleaned of all sample data)
export function getStoredComplaints(): ComplaintRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Purge legacy mock data
        const clean = parsed.filter((c) => !isLegacyMockComplaint(c));
        if (clean.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        }
        return clean;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

// Helper: Save and broadcast
export function saveComplaints(complaints: ComplaintRecord[]) {
  if (typeof window === 'undefined') return;
  const clean = complaints.filter((c) => !isLegacyMockComplaint(c));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: clean }));
}

// Global API / Action methods
export async function addComplaintRecord(complaintData: Partial<ComplaintRecord>): Promise<ComplaintRecord> {
  const all = getStoredComplaints();

  // Format random real token
  const tokenNum = Math.floor(100000 + Math.random() * 900000);
  const complaintId = complaintData.complaintId || `SC-2026-${tokenNum}`;

  const newRecord: ComplaintRecord = {
    complaintId,
    title: complaintData.title || 'Civic Grievance',
    description: complaintData.description || '',
    category: complaintData.category || 'General',
    department: complaintData.department || 'Public Works Department (PWD)',
    priority: complaintData.priority || 'High',
    status: complaintData.status || 'Department Assigned',
    supportCount: 1,
    citizenName: complaintData.citizenName || 'Concerned Citizen',
    citizenPhone: complaintData.citizenPhone || '',
    citizenEmail: complaintData.citizenEmail || '',
    imageUrl: complaintData.imageUrl,
    cropType: complaintData.cropType,
    location: complaintData.location || {
      city: 'Hassan',
      district: 'Hassan',
      state: 'Karnataka',
      area: 'Local Area',
      ward: 'Ward 01',
    },
    createdAt: new Date().toISOString(),
    timeline: [
      {
        status: 'Submitted',
        note: `Grievance registered by ${complaintData.citizenName || 'citizen'} with live coordinates.`,
        createdAt: new Date().toISOString(),
      },
      {
        status: 'Department Assigned',
        note: `Routed directly to ${complaintData.department || 'Department'} with priority '${complaintData.priority || 'High'}'.`,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  // Prepend new complaint
  const updated = [newRecord, ...all];
  saveComplaints(updated);

  // Background sync with server
  try {
    await api.post('/complaints', newRecord);
  } catch {
    // offline or backend fallback
  }

  return newRecord;
}

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: string,
  noteText?: string,
  workDonePhoto?: string | null,
  remarks?: string
): Promise<ComplaintRecord | null> {
  const all = getStoredComplaints();
  let updatedRecord: ComplaintRecord | null = null;

  const updatedList = all.map((item) => {
    if (item.complaintId === complaintId) {
      const timeline = [
        ...(item.timeline || []),
        {
          status: newStatus,
          note:
            noteText ||
            (newStatus === 'Resolved' || newStatus === 'Completed'
              ? `✅ Work verified & completed. ${remarks ? `Remarks: "${remarks}"` : ''}`
              : `Status updated to ${newStatus} by field officer.`),
          createdAt: new Date().toISOString(),
        },
      ];

      updatedRecord = {
        ...item,
        status: newStatus,
        timeline,
        resolvedImageUrl: workDonePhoto || item.resolvedImageUrl,
        resolutionNotes: remarks || item.resolutionNotes,
      };
      return updatedRecord;
    }
    return item;
  });

  if (updatedRecord) {
    saveComplaints(updatedList);

    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus,
        note: noteText,
        resolvedImageUrl: workDonePhoto || undefined,
        resolutionNotes: remarks || undefined,
      });
    } catch {
      // offline fallback
    }
  }

  return updatedRecord;
}

export async function transferComplaintToDept(
  complaintId: string,
  targetDept: string
): Promise<ComplaintRecord | null> {
  const all = getStoredComplaints();
  let updatedRecord: ComplaintRecord | null = null;

  const updatedList = all.map((item) => {
    if (item.complaintId === complaintId) {
      const timeline = [
        ...(item.timeline || []),
        {
          status: 'Department Assigned',
          note: `Reassigned from ${item.department} to ${targetDept} by triage officer.`,
          createdAt: new Date().toISOString(),
        },
      ];

      updatedRecord = {
        ...item,
        department: targetDept,
        timeline,
      };
      return updatedRecord;
    }
    return item;
  });

  if (updatedRecord) {
    saveComplaints(updatedList);

    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        status: 'Department Assigned',
        department: targetDept,
        note: `Transferred to ${targetDept}`,
      });
    } catch {
      // offline fallback
    }
  }

  return updatedRecord;
}

// React Hook for Real-Time Sync across all components
export function useComplaints() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(getStoredComplaints);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<ComplaintRecord[]>;
      if (customEvent.detail) {
        setComplaints(customEvent.detail);
      } else {
        setComplaints(getStoredComplaints());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setComplaints(getStoredComplaints());
      }
    };

    window.addEventListener(EVENT_KEY, handleSync);
    window.addEventListener('storage', handleStorage);

    // Initial fetch from backend
    api
      .get('/complaints')
      .then((res) => {
        if (res.data?.complaints && Array.isArray(res.data.complaints)) {
          const serverComplaints: ComplaintRecord[] = res.data.complaints.filter(
            (c: ComplaintRecord) => !isLegacyMockComplaint(c)
          );
          const current = getStoredComplaints();
          const mergedMap = new Map<string, ComplaintRecord>();
          serverComplaints.forEach((c) => mergedMap.set(c.complaintId, c));
          current.forEach((c) => mergedMap.set(c.complaintId, c));
          const merged = Array.from(mergedMap.values()).filter((c) => !isLegacyMockComplaint(c));
          saveComplaints(merged);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener(EVENT_KEY, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    complaints,
    addComplaint: addComplaintRecord,
    updateStatus: updateComplaintStatus,
    transferComplaint: transferComplaintToDept,
  };
}
