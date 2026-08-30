import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Map,
  PhoneCall,
  Radio,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
  Zap,
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: typeof TrendingUp;
}

const complaintData = [
  { month: 'Jan', complaints: 92, resolved: 80 },
  { month: 'Feb', complaints: 118, resolved: 90 },
  { month: 'Mar', complaints: 143, resolved: 110 },
  { month: 'Apr', complaints: 167, resolved: 125 },
  { month: 'May', complaints: 154, resolved: 130 },
  { month: 'Jun', complaints: 183, resolved: 150 },
];

const categories = [
  { name: 'Road Damage', count: 286 },
  { name: 'Sanitation', count: 194 },
  { name: 'Water Leak', count: 173 },
  { name: 'Drainage', count: 149 },
  { name: 'Street Lights', count: 122 },
];

const wardData = [
  { id: 'W-01', name: 'Central Ward', pending: 12, progressing: 5, completed: 88, officer: 'D. Kulkarni', phone: '080-223401', responseTime: '6.2 hrs' },
  { id: 'W-02', name: 'West Sector', pending: 8, progressing: 6, completed: 62, officer: 'S. Patil', phone: '080-223402', responseTime: '8.4 hrs' },
  { id: 'W-03', name: 'South Avenue', pending: 15, progressing: 3, completed: 42, officer: 'P. Nair', phone: '080-223403', responseTime: '11.1 hrs' },
  { id: 'W-04', name: 'Metro Ward', pending: 4, progressing: 5, completed: 94, officer: 'R. Sharma', phone: '080-223404', responseTime: '5.0 hrs' },
];

const emergencyContacts = [
  { name: 'Police Control Room', code: '100', desc: 'Law enforcement & security dispatch', badge: 'Police' },
  { name: 'Fire & Rescue HQ', code: '101', desc: 'Fire hazards & flood extraction', badge: 'Fire' },
  { name: 'Ambulance Emergency', code: '108', desc: '24/7 Paramedic and hospital triage', badge: 'Health' },
  { name: 'Electricity Grievance', code: '1912', desc: 'Transformer faults & line breaks', badge: 'Power' },
  { name: 'Water & Sewerage Desk', code: '1916', desc: 'Pipeline bursts & contamination', badge: 'Water' },
  { name: 'Women Safety Helpline', code: '1091', desc: 'Immediate crisis assistance', badge: 'Safety' },
];

export function HomePage() {
  const [selectedWard, setSelectedWard] = useState(wardData[0]!);
  const [liveStats, setLiveStats] = useState<{
    total: number;
    resolved: number;
    inProgress: number;
    slaRate: number;
  }>({
    total: 18423,
    resolved: 14218,
    inProgress: 2106,
    slaRate: 84.8,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/complaints/stats/summary');
        if (res.data && res.data.total > 0) {
          setLiveStats({
            total: res.data.total,
            resolved: res.data.resolved,
            inProgress: res.data.inProgress,
            slaRate: res.data.slaRate || 85,
          });
        }
      } catch {
        // Keep defaults
      }
    }
    void loadStats();
  }, []);

  const stats: StatCard[] = [
    { label: 'Total Grievances', value: liveStats.total.toLocaleString(), change: '+12% this month', isPositive: true, icon: TrendingUp },
    { label: 'Cases Resolved', value: liveStats.resolved.toLocaleString(), change: `${liveStats.slaRate}% SLA rate`, isPositive: true, icon: CheckCircle2 },
    { label: 'Under Work Queue', value: liveStats.inProgress.toLocaleString(), change: 'Live field queue', isPositive: true, icon: BellRing },
    { label: 'Enrolled Citizens', value: '61,204', change: '+240 today', isPositive: true, icon: Users },
  ];

  return (
    <div className="page-shell py-8 space-y-8">
      {/* Top Header & Alert Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="gov-badge">GIS Intelligence & Analytics Hub</span>
            <span className="pill text-[10px]">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Civic Quality & Regional Operations
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Real-time municipal operations surface for grievance intake, SLA resolution timelines, and interactive ward telemetry.
          </p>
        </div>

        {/* Monsoon Advisory Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 shadow-sm">
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold uppercase tracking-wide">Monsoon Drainage Watch:</span>
            <p className="mt-0.5 text-slate-700 dark:text-slate-300">Wards W-01 and W-03 are on high-priority drainage dispatch.</p>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, change, isPositive, icon: Icon }, idx) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }} className="metric-card surface-card-hover flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-blue-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-500/20'
                }`}
              >
                {change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Incident Marquee */}
      <div className="surface-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shrink-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Incident Stream:
          </div>
          <div className="flex-1 overflow-hidden text-xs text-slate-600 dark:text-slate-300">
            <div className="animate-ticker flex whitespace-nowrap gap-12 font-medium">
              <span>🚨 8 mins ago: Pothole reported in West Sector → Routed to Public Works</span>
              <span>🗑️ 14 mins ago: Waste overflow in Metro Ward → Sanitation crew dispatched</span>
              <span>💧 19 mins ago: Water leakage in South Avenue → Water Supply engineer allocated</span>
              <span>💡 24 mins ago: Street light outage in Central Ward → Electricity repair in progress</span>
              <span>🚨 8 mins ago: Pothole reported in West Sector → Routed to Public Works</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Trend Area Chart */}
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <p className="section-kicker">Resolution Velocity</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Incidents vs Redressal Velocity</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Filed</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Resolved</span>
            </div>
          </div>
          <div className="mt-6 h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complaintData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="complaintFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  }}
                />
                <Area type="monotone" dataKey="complaints" stroke="#0ea5e9" fill="url(#complaintFill)" strokeWidth={2.5} name="Total Filed" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolveFill)" strokeWidth={2.5} name="Total Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="surface-card p-6 md:p-8">
          <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
            <p className="section-kicker">Department Breakdown</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Active Grievance Mix</h2>
          </div>
          <div className="mt-6 h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={95} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} name="Active Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive GIS Ward Map & Officer SLA Inspector */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-6 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="section-kicker">Interactive GIS Grid</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Ward Map & Officer Dispatch</h2>
              </div>
            </div>
            <span className="pill text-[11px]">
              <Radio className="h-3 w-3 text-emerald-500" /> 4 Wards Synced
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            {/* Ward Selector List */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Ward Area
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {wardData.map((ward) => (
                  <button
                    key={ward.id}
                    onClick={() => setSelectedWard(ward)}
                    type="button"
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      selectedWard.id === ward.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900'
                    }`}
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">{ward.id}</p>
                    <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{ward.name}</p>
                  </button>
                ))}
              </div>

              {/* Inspector Card */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Designated Officer</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedWard.officer}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-slate-200/80 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Resolution Time</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedWard.responseTime}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-slate-200/80 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Pending Issues</span>
                  <span className="font-bold text-amber-600">{selectedWard.pending}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-slate-200/80 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">In Progress SLA</span>
                  <span className="font-bold text-sky-600">{selectedWard.progressing}</span>
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-slate-200/80 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Resolved Cases</span>
                  <span className="font-bold text-emerald-600">{selectedWard.completed}</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG GIS Map Visualizer */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="absolute inset-0 soft-grid opacity-60" />
              <div className="relative flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  OSM GIS Vector Grid
                </span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Active: {selectedWard.id}
                </span>
              </div>

              <div className="relative mt-4">
                <svg viewBox="0 0 200 120" className="h-44 w-full select-none">
                  {[
                    { id: 'W-01', points: '10,10 95,10 85,55 10,50' },
                    { id: 'W-02', points: '95,10 190,10 180,50 85,55' },
                    { id: 'W-03', points: '10,50 85,55 95,110 10,110' },
                    { id: 'W-04', points: '85,55 180,50 190,110 95,110' },
                  ].map(({ id, points }) => (
                    <g
                      key={id}
                      onClick={() => setSelectedWard(wardData.find((w) => w.id === id)!)}
                      className="cursor-pointer group"
                    >
                      <polygon
                        points={points}
                        className={`transition-all duration-300 ${
                          selectedWard.id === id
                            ? 'fill-blue-500/30 stroke-blue-600 stroke-[2.5]'
                            : 'fill-white/70 stroke-slate-300 stroke-[1.5] hover:fill-blue-100/50 dark:fill-slate-900/60 dark:stroke-slate-700 dark:hover:fill-slate-800'
                        }`}
                      />
                      <text
                        x={id === 'W-02' || id === 'W-04' ? '124' : '36'}
                        y={id === 'W-03' || id === 'W-04' ? '84' : '33'}
                        className="fill-slate-900 font-mono text-[9px] font-bold dark:fill-white"
                      >
                        {id}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Animated Alert Dots */}
                <span className="absolute left-8 top-6 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" title="Critical Drainage" />
                <span className="absolute right-12 top-10 h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" title="Active Road Repair" />
                <span className="absolute bottom-6 left-16 h-2.5 w-2.5 rounded-full bg-emerald-500" title="Resolved Lighting" />
              </div>

              <div className="relative mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> In Work</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Services Directory */}
        <div className="surface-card p-6 md:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <PhoneCall className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="section-kicker">Emergency Dispatch</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Municipal Hotlines</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.code}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{contact.name}</span>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                      {contact.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{contact.desc}</p>
                </div>
                <a
                  href={`tel:${contact.code}`}
                  className="rounded-full bg-white px-3.5 py-1.5 font-mono text-xs font-black text-blue-700 shadow-sm border border-slate-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-400 transition"
                >
                  {contact.code}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}