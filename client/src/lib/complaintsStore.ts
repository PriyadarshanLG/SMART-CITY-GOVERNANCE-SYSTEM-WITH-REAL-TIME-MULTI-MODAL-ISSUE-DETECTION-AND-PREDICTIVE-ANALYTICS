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

export function clearAllComplaints() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: [] }));
}

export function seedSampleComplaintsForDemo() {
  const sampleData: ComplaintRecord[] = [
    {
      complaintId: 'SC-2026-900101',
      title: 'Bitumen asphalt damage & pothole near Dairy Circle Ring Road',
      category: 'PWD: Roads, Bridges & Potholes',
      department: 'Public Works Department (PWD)',
      priority: 'High',
      status: 'Resolved',
      supportCount: 28,
      citizenName: 'Priya S.',
      citizenPhone: '+91 98765 43210',
      citizenEmail: 'priya.s@gmail.com',
      description:
        'Multiple deep potholes formed across 30 meters of roadway. Heavy traffic bottleneck during peak hours.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&auto=format&fit=crop&q=80',
      resolvedImageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
      resolutionNotes: 'Bitumen asphalt resurfaced and leveled. Traffic flow restored.',
      location: {
        ward: 'Central Sector',
        area: 'Dairy Circle Ring Road',
        city: 'Hassan',
        district: 'Hassan',
        state: 'Karnataka',
        latitude: 13.0042,
        longitude: 76.1018,
      },
      createdAt: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString(),
      timeline: [
        { status: 'Submitted', note: 'Grievance submitted with GPS coordinates.' },
        { status: 'Department Assigned', note: 'Assigned to Ward Engineer Er. D. Kulkarni (PWD).' },
        { status: 'Work In Progress', note: 'Bitumen patching team dispatched.' },
        { status: 'Resolved', note: '✅ Work completed & photo proof verified by Executive Engineer.' },
      ],
    },
    {
      complaintId: 'SC-2026-900102',
      title: 'Commercial waste accumulation near BM Market gate',
      category: 'Municipal: Waste Management & Sanitation',
      department: 'Municipal Corporation',
      priority: 'High',
      status: 'Work In Progress',
      supportCount: 35,
      citizenName: 'M. Venkatesh',
      citizenPhone: '+91 98450 99881',
      description:
        'Large piles of commercial waste and plastic packaging blocking pedestrian walkway outside vegetable market gate.',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80',
      location: {
        ward: 'Market Sector',
        area: 'BM Road Vegetable Market',
        city: 'Hassan',
        district: 'Hassan',
        state: 'Karnataka',
        latitude: 13.0078,
        longitude: 76.0982,
      },
      createdAt: new Date(Date.now() - 3600 * 12 * 1000).toISOString(),
      timeline: [
        { status: 'Submitted', note: 'Sanitation complaint raised by market association.' },
        { status: 'Department Assigned', note: 'Dispatched to Municipal Health Inspector.' },
        { status: 'Work In Progress', note: 'Compactor vehicle dispatched.' },
      ],
    },
    {
      complaintId: 'SC-2026-900103',
      title: 'Heritage sign boards & tourist pathway maintenance',
      category: 'Tourism: Heritage Sites & Tourist Amenities',
      department: 'Tourism Department',
      priority: 'Medium',
      status: 'Department Assigned',
      supportCount: 14,
      citizenName: 'Kavita Rao',
      citizenPhone: '+91 98453 22110',
      description:
        'Directional signboards to historic sites are rusted and unreadable, confusing out-of-station tourists.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80',
      location: {
        ward: 'Heritage Sector',
        area: 'Shettihalli Rosary Viewpoint',
        city: 'Hassan',
        district: 'Hassan',
        state: 'Karnataka',
        latitude: 12.9985,
        longitude: 76.0912,
      },
      createdAt: new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString(),
      timeline: [
        { status: 'Submitted', note: 'Tourism amenity ticket logged.' },
        { status: 'Department Assigned', note: 'Assigned to Tourism Officer Smt. Radhika Shenoy.' },
      ],
    },
    {
      complaintId: 'SC-2026-900104',
      title: 'Coconut trees crown yellowing & pest advisory required',
      category: 'Agriculture: Crop Pest & Disease (Farmer Direct)',
      department: 'Agriculture Department',
      priority: 'High',
      status: 'Resolved',
      supportCount: 42,
      cropType: 'Coconut 🥥',
      citizenName: 'Farmer N. Ramesh',
      citizenPhone: '+91 94480 55667',
      description:
        'Severe yellowing of lower fronds and crown drooping noticed across 2 acres of coconut palm plantation.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80',
      resolvedImageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?w=400&auto=format&fit=crop&q=80',
      resolutionNotes: 'Organic bio-fungicide spray advisory & field inspection completed.',
      location: {
        ward: 'Rural Agro Sector',
        area: 'Channarayapatna Rural Farm Sector',
        city: 'Hassan',
        district: 'Hassan',
        state: 'Karnataka',
        latitude: 13.015,
        longitude: 76.112,
      },
      createdAt: new Date(Date.now() - 3600 * 18 * 1000).toISOString(),
      timeline: [
        { status: 'Submitted', note: 'Farmer direct advisory request raised.' },
        { status: 'Department Assigned', note: 'Assigned to Dr. H. M. Lingaraju (Plant Protection Officer).' },
        { status: 'Resolved', note: '✅ Field advisory delivered & pest treatment verified.' },
      ],
    },
  ];

  saveComplaints(sampleData);
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
