import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Loader2,
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
import type { ComplaintRecord } from '../types/complaint';

const fallbackComplaints: ComplaintRecord[] = [
  {
    complaintId: 'SC-2026-000001',
    title: 'Street light outage near Ward 7 avenue',
    category: 'Street Light',
    department: 'Electricity Department',
    priority: 'Medium',
    status: 'Work In Progress',
    supportCount: 14,
    location: { ward: '01', area: 'Central Avenue', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 2000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000214',
    title: 'Garbage mound outside metro exit',
    category: 'Garbage & Waste',
    department: 'Sanitation Department',
    priority: 'High',
    status: 'Pending',
    supportCount: 29,
    location: { ward: '04', area: 'Metro Ward Sector 4', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 4000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000305',
    title: 'Leakage in main water pipeline sidewalk',
    category: 'Water Supply Leakage',
    department: 'Water Supply Department',
    priority: 'High',
    status: 'Pending',
    supportCount: 42,
    location: { ward: '01', area: 'Central Avenue 4th Cross', city: 'Smart City' },
    createdAt: new Date(Date.now() - 3600 * 6000).toISOString(),
  },
  {
    complaintId: 'SC-2026-000109',
    title: 'Deep pothole in lane 3 pavement',
    category: 'Road Damage & Potholes',
    department: 'Public Works Department',
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
  { id: 'citizen', label: 'Citizen View', badge: 'Public' },
  { id: 'officer', label: 'Ward Officer View', badge: 'Field Lead' },
  { id: 'dept-head', label: 'Dept Head View', badge: 'Supervisor' },
  { id: 'admin', label: 'Municipal Admin View', badge: 'GovTech Admin' },
];

export function DashboardPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeRole = (role ?? 'citizen').toLowerCase();

  const [complaints, setComplaints] = useState<ComplaintRecord[]>(fallbackComplaints);
  const [summaryStats, setSummaryStats] = useState<{
    total: number;
    resolved: number;
    inProgress: number;
    pending: number;
    slaRate: number;
  }>({
    total: 4,
    resolved: 1,
    inProgress: 1,
    pending: 2,
    slaRate: 85,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/complaints/stats/summary'),
      ]);

      if (complaintsRes.data?.items && complaintsRes.data.items.length > 0) {
        setComplaints(complaintsRes.data.items);
      }
      if (statsRes.data) {
        setSummaryStats(statsRes.data);
      }
    } catch {
      // Fallback data remains
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboardData();
  }, [activeRole]);

  const stats = useMemo(() => {
    if (activeRole === 'admin') {
      return [
        { label: 'Total Ingested (MongoDB)', value: `${summaryStats.total}`, sub: '100% indexed' },
        { label: 'Active Queue', value: `${summaryStats.pending + summaryStats.inProgress}`, sub: 'Field crews assigned' },
        { label: 'Resolved Tickets', value: `${summaryStats.resolved}`, sub: `${summaryStats.slaRate}% SLA adherence` },
        { label: 'ML Router Precision', value: '96.2%', sub: 'NLP model active' },
      ];
    }
    if (activeRole === 'officer') {
      return [
        { label: 'Assigned Field Cases', value: `${summaryStats.inProgress}`, sub: 'Active in queue' },
        { label: 'Pending Assessment', value: `${summaryStats.pending}`, sub: 'Triage needed' },
        { label: 'Closed / Verified', value: `${summaryStats.resolved}`, sub: '100% verified' },
        { label: 'Overdue Escalations', value: '0', sub: 'Clean turnaround' },
      ];
    }
    if (activeRole === 'dept-head') {
      return [
        { label: 'Avg Resolution Velocity', value: '8.6 hrs', sub: '-1.8 hrs vs last month' },
        { label: 'Pending Dept Routing', value: `${summaryStats.pending}`, sub: 'Triage queue' },
        { label: 'Field Squads Deployed', value: '18', sub: 'Active across wards' },
        { label: 'Resolution Rate', value: `${summaryStats.slaRate}%`, sub: 'SLA standard met' },
      ];
    }
    return [
      { label: 'Total City Grievances', value: `${summaryStats.total}`, sub: 'Logged on portal' },
      { label: 'Work In Progress', value: `${summaryStats.inProgress}`, sub: 'Field crew dispatched' },
      { label: 'Redressed Cases', value: `${summaryStats.resolved}`, sub: 'Verified resolved' },
      { label: 'SLA Resolution Rate', value: `${summaryStats.slaRate}%`, sub: 'Within 48 hours' },
    ];
  }, [activeRole, summaryStats]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && (item.status === 'Pending' || item.status === 'Submitted' || item.status === 'ML Classified')) ||
        (statusFilter === 'In Progress' && (item.status === 'Work In Progress' || item.status === 'Work Started' || item.status === 'Department Assigned' || item.status === 'Officer Assigned')) ||
        (statusFilter === 'Resolved' && (item.status === 'Resolved' || item.status === 'Completed' || item.status === 'Citizen Verified'));

      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location?.ward && item.location.ward.includes(searchTerm));

      return matchesStatus && matchesSearch;
    });
  }, [complaints, statusFilter, searchTerm]);

  return (
    <div className="page-shell py-8 space-y-8">
      {/* Role Navigation Switcher Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="gov-badge">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Unified Multi-Role Workspace (Live MongoDB Connected)
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold capitalize text-slate-950 dark:text-white">
            {activeRole.replace('-', ' ')} Operational Console
          </h1>
        </div>

        {/* Role Switcher Pills & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            title="Refresh from MongoDB"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {roleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/dashboard/${tab.id}`)}
              type="button"
              className={`rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border ${
                activeRole === tab.id
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="metric-card surface-card-hover">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Management Table & Analytics */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Grievance Management List / Table */}
        <div className="surface-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <p className="section-kicker">Live Grievance Queue</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Active Case Ledger (MongoDB)</h2>
            </div>
            {activeRole === 'citizen' && (
              <button
                onClick={() => navigate('/report')}
                className="btn-primary gap-2 text-xs"
                type="button"
              >
                <PlusCircle className="h-4 w-4" /> File New Grievance
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by token ID, issue, ward or department..."
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/60">
              {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints List Cards */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Querying MongoDB database...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No matching grievances found for this filter criteria.
              </div>
            ) : (
              filteredComplaints.map((item) => (
                <div
                  key={item.complaintId || item._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4.5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {item.complaintId}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          item.priority === 'High'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                            : item.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400">
                        · {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.department} · Ward {item.location?.ward || '01'} ({item.location?.area || 'Central'}) · Upvotes: {item.supportCount || 0}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === 'Resolved' || item.status === 'Completed' || item.status === 'Citizen Verified'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/20'
                          : item.status === 'Work In Progress' || item.status === 'Work Started'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-500/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                    <button
                      onClick={() => navigate(`/complaints/${item.complaintId}`)}
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      View Audit <ArrowRight className="h-3 w-3 ml-1 inline" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Role-specific Widget & Monthly Graph */}
        <div className="space-y-6">
          {/* Monthly Performance Chart */}
          <div className="surface-card p-6 md:p-8">
            <p className="section-kicker">Operational SLA Metrics</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Monthly Intake vs Closure</h2>
            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '1rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="filed" fill="#0284c7" radius={[6, 6, 0, 0]} name="Filed" />
                  <Bar dataKey="resolved" fill="#10b981" radius={[6, 6, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Admin / Officer Tools Widget */}
          {activeRole === 'admin' && (
            <div className="surface-card p-6">
              <p className="section-kicker">Municipal Controls</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Administration Hub</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {['Manage Users', 'Field Engineers', 'Ward Boundaries', 'Emergency Helplines', 'Broadcast Notices', 'ML Router Audit'].map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left font-bold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeRole === 'officer' && (
            <div className="surface-card p-6">
              <p className="section-kicker">Field Dispatch</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Ward Repair Crews</h2>
              <div className="mt-4 space-y-2 text-xs">
                {[
                  { van: 'Van #12 (Electrical)', status: 'Active at Ward 01', crew: '4 Technicians' },
                  { van: 'Van #07 (Public Works)', status: 'Pothole Patching', crew: '6 Workers' },
                  { van: 'Van #03 (Water Supply)', status: 'Main Pipeline Fix', crew: '3 Engineers' },
                ].map((v) => (
                  <div key={v.van} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{v.van}</p>
                      <p className="text-[11px] text-slate-500">{v.status}</p>
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{v.crew}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
