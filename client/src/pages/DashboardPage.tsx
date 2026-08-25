import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Landmark,
  Layers,
  Loader2,
  Lock,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import type { ComplaintRecord } from '../types/complaint';

const fallbackComplaints: ComplaintRecord[] = [
  {
    complaintId: 'SC-2026-000001',
    title: 'Street light outage near Ward 7 avenue',
    category: 'Street Light Outage',
    department: 'Electricity Department',
    priority: 'Medium',
    status: 'Work In Progress',
    supportCount: 18,
    location: { ward: '01', area: 'Central Avenue', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 2000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000214',
    title: 'Garbage mound outside metro station exit gate',
    category: 'Solid Waste & Sanitation',
    department: 'Sanitation & SWM Department',
    priority: 'High',
    status: 'Pending',
    supportCount: 29,
    location: { ward: '04', area: 'Metro Ward Sector 4', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 4000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000305',
    title: 'Main pipeline water leak on pedestrian walkway',
    category: 'Water Supply Leakage',
    department: 'Water Supply & Sewerage Board',
    priority: 'High',
    status: 'Pending',
    supportCount: 42,
    location: { ward: '01', area: 'Central Avenue 4th Cross', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 6000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000109',
    title: 'Deep road crater in lane 3 pavement',
    category: 'Road Damage & Potholes',
    department: 'Public Works Department (PWD)',
    priority: 'Low',
    status: 'Resolved',
    supportCount: 18,
    location: { ward: '02', area: 'West Sector 80 Feet Road', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 24000).toISOString(),
  },
];

const activityData = [
  { name: 'Jan', filed: 92, resolved: 80 },
  { name: 'Feb', filed: 118, resolved: 90 },
  { name: 'Mar', filed: 143, resolved: 110 },
  { name: 'Apr', filed: 167, resolved: 125 },
  { name: 'May', filed: 154, resolved: 130 },
  { name: 'Jun', filed: 183, resolved: 150 },
];

const roleTabs = [
  { id: 'citizen', label: 'Citizen View (नागरिक)', badge: 'Public' },
  { id: 'officer', label: 'Ward Officer / JE View', badge: 'Field Desk' },
  { id: 'dept-head', label: 'Dept Head / AEE View', badge: 'Supervisor' },
  { id: 'admin', label: 'Municipal Admin View', badge: 'GovTech Master' },
];

export function DashboardPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeRole = (role ?? 'citizen').toLowerCase();

  const [complaints, setComplaints] = useState<ComplaintRecord[]>(fallbackComplaints);
  const [summaryStats, setSummaryStats] = useState({
    total: 18423,
    resolved: 15620,
    inProgress: 2803,
    slaRate: 84.8,
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.allSettled([
        api.get('/complaints'),
        api.get('/complaints/stats/summary'),
      ]);

      if (listRes.status === 'fulfilled' && listRes.value.data?.complaints?.length > 0) {
        setComplaints(listRes.value.data.complaints as ComplaintRecord[]);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.total > 0) {
        setSummaryStats({
          total: statsRes.value.data.total,
          resolved: statsRes.value.data.resolved,
          inProgress: statsRes.value.data.inProgress,
          slaRate: statsRes.value.data.slaRate || 85,
        });
      }
    } catch {
      // Use fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [activeRole]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.complaintId.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (c.department && c.department.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (c.location?.area && c.location.area.toLowerCase().includes(searchFilter.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchFilter, statusFilter]);

  return (
    <div className="page-shell py-8 space-y-8">
      
      {/* Official Government Workspace Header */}
      <div className="gov-panel p-6 border-t-8 border-t-[#0A2540] dark:border-t-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <GovernmentEmblem className="h-14 w-14 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="gov-badge font-mono">GOVTECH CONSOLE</span>
                <span className="gov-badge-green font-mono text-[9px]">GIGW 3.0 VERIFIED</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A2540] dark:text-white mt-1">
                Municipal Grievance Operations & Case Management
              </h1>
              <h2 className="font-hindi text-xs font-bold text-slate-600 dark:text-slate-400">
                लोक शिकायत निगरानी, निस्तारण एवं विभागीय कार्यक्षेत्र
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="btn-gov-outline text-xs px-3 py-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/report" className="btn-gov-saffron text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              Lodge Grievance
            </Link>
          </div>
        </div>

        {/* Role Workspace Selector Tabs */}
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800 flex flex-wrap gap-2">
          {roleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(`/dashboard/${tab.id}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeRole === tab.id
                  ? 'bg-[#0A2540] text-white shadow-sm dark:bg-blue-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded bg-amber-500/30 px-1 text-[8px] font-black text-amber-900 dark:text-amber-300 border border-amber-500/40">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-panel border-l-4 border-l-[#0A2540] p-4">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Registered</span>
          <span className="font-mono text-2xl font-black text-[#0A2540] dark:text-white mt-1 block">{summaryStats.total.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Central Portal Queue</span>
        </div>
        <div className="gov-panel border-l-4 border-l-emerald-600 p-4">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Redressed within SLA</span>
          <span className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">{summaryStats.resolved.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 mt-1 block">{summaryStats.slaRate}% Compliance</span>
        </div>
        <div className="gov-panel border-l-4 border-l-amber-600 p-4">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Pending Inspection</span>
          <span className="font-mono text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">{summaryStats.inProgress.toLocaleString()}</span>
          <span className="text-[10px] text-amber-600 mt-1 block">Active Field Orders</span>
        </div>
        <div className="gov-panel border-l-4 border-l-blue-600 p-4">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Covered Municipal Wards</span>
          <span className="font-mono text-2xl font-black text-blue-900 dark:text-blue-400 mt-1 block">120 Wards</span>
          <span className="text-[10px] text-blue-600 mt-1 block">100% GIS Mapped</span>
        </div>
      </div>

      {/* Case Management Table */}
      <div className="gov-panel p-6 border border-slate-300 dark:border-slate-800">
        
        {/* Table Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#0A2540] dark:text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#0A2540] dark:text-white">
              Official Grievance Queue ({filteredComplaints.length} Records)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search GRN, Title, Ward..."
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 pl-8 text-xs font-bold text-slate-900 outline-none focus:border-[#0A2540] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0A2540] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Inspection</option>
              <option value="Work In Progress">Work In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* The Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A2540] text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">GRN / Ref ID</th>
                <th className="px-4 py-3">Grievance Particulars</th>
                <th className="px-4 py-3">Ward & Locality</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredComplaints.map((item) => (
                <tr key={item.complaintId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-black text-[#0A2540] dark:text-amber-400">
                    {item.complaintId}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{item.title}</p>
                    <span className="text-[10px] text-slate-500">{item.department}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    <span>Ward {item.location?.ward || '01'}</span>
                    <span className="text-slate-400 block text-[10px]">{item.location?.area}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.priority === 'High'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/complaints/${item.complaintId}`}
                      className="btn-gov-outline text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      Audit Dossier ➔
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
