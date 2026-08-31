import { useEffect, useState } from 'react';

export interface AlertRecord {
  id: string;
  department: string;
  icon?: string;
  category: 'warning' | 'emergency' | 'advisory' | 'info';
  message: string;
  postedBy: string;
  createdAt: string;
}

const STORAGE_KEY = 'janseva_department_alerts';
const EVENT_KEY = 'janseva_alerts_updated';

export const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-01',
    department: 'Public Works Department (PWD)',
    icon: '🚨',
    category: 'warning',
    message: 'HEAVY RAINFALL WARNING: Emergency response crews deployed for Ward 04 & Central Market sector',
    postedBy: 'PWD Command Center',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ALT-02',
    department: 'Municipal Corporation',
    icon: '⚡',
    category: 'info',
    message: 'LIVE TRACKING: All complaints are automatically sent to the right team and tracked within 24 hours',
    postedBy: 'Municipal Commissioner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ALT-03',
    department: 'Municipal Corporation',
    icon: '📞',
    category: 'advisory',
    message: 'MUNICIPAL HELPLINE: Toll-free 24/7 hotline 1800-425-2026 active for emergency flood & power outage reports',
    postedBy: 'Helpline Desk',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ALT-04',
    department: 'Agriculture & Rural Development',
    icon: '🌾',
    category: 'advisory',
    message: 'AGRICULTURE ADVISORY: Coconut & Paddy crop fungal rot diagnostic advisory active for Hassan district farmers',
    postedBy: 'Agri District Officer',
    createdAt: new Date().toISOString(),
  },
];

export function getStoredAlerts(): AlertRecord[] {
  if (typeof window === 'undefined') return INITIAL_ALERTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return INITIAL_ALERTS;
}

export function broadcastAlert(alertData: Omit<AlertRecord, 'id' | 'createdAt'>): AlertRecord {
  const current = getStoredAlerts();
  const newAlert: AlertRecord = {
    id: `ALT-${Date.now().toString().slice(-4)}`,
    ...alertData,
    createdAt: new Date().toISOString(),
  };

  const updated = [newAlert, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: updated }));
  }
  return newAlert;
}

export function useDepartmentAlerts() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => getStoredAlerts());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AlertRecord[]>;
      if (customEvent.detail) {
        setAlerts(customEvent.detail);
      } else {
        setAlerts(getStoredAlerts());
      }
    };

    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    alerts,
    broadcastAlert,
  };
}
