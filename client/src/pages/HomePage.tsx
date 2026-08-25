import { useEffect, useState } from 'react';
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
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Globe2,
  Landmark,
  Layers,
  Map,
  MapPin,
  PhoneCall,
  Radio,
  Search,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
  Zap,
} from 'lucide-react';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import { Link } from 'react-router-dom';

const complaintData = [
  { month: 'Jan', complaints: 92, resolved: 80 },
  { month: 'Feb', complaints: 118, resolved: 90 },
  { month: 'Mar', complaints: 143, resolved: 110 },
  { month: 'Apr', complaints: 167, resolved: 125 },
  { month: 'May', complaints: 154, resolved: 130 },
  { month: 'Jun', complaints: 183, resolved: 150 },
];

const categories = [
  { name: 'Road Damage (PWD)', count: 286, color: '#0A2540' },
  { name: 'Solid Waste & Sanitation', count: 194, color: '#15803D' },
  { name: 'Water Pipeline Leaks', count: 173, color: '#0284C7' },
  { name: 'Drainage & Culverts', count: 149, color: '#7C3AED' },
  { name: 'Streetlight Grid', count: 122, color: '#D97706' },
];

const wardData = [
  { id: 'W-01', name: 'Central Ward (Civil Lines)', pending: 12, progressing: 5, completed: 88, officer: 'Er. D. Kulkarni, AEE', phone: '080-223401', responseTime: '6.2 hrs', slaCompliance: '92.4%' },
  { id: 'W-02', name: 'West Sector (Gandhi Nagar)', pending: 8, progressing: 6, completed: 62, officer: 'Er. S. Patil, AEE', phone: '080-223402', responseTime: '8.4 hrs', slaCompliance: '88.1%' },
  { id: 'W-03', name: 'South Avenue (Subhash Nagar)', pending: 15, progressing: 3, completed: 42, officer: 'Er. P. Nair, AEE', phone: '080-223403', responseTime: '11.1 hrs', slaCompliance: '78.5%' },
  { id: 'W-04', name: 'Metro Ward (Indira Nagar)', pending: 4, progressing: 5, completed: 94, officer: 'Er. R. Sharma, AEE', phone: '080-223404', responseTime: '5.0 hrs', slaCompliance: '95.2%' },
];

const publicHearings = [
  { ward: 'Ward 01 & 02', date: 'Every Thursday, 11:00 AM', venue: 'Central Town Hall Auditorium', presiding: 'Municipal Commissioner & AEEs' },
  { ward: 'Ward 03 & 04', date: 'Every Tuesday, 03:00 PM', venue: 'Metro Sector Community Center', presiding: 'Joint Commissioner & Executive Engineers' },
];

export function HomePage() {
  const [selectedWard, setSelectedWard] = useState(wardData[0]!);
  const [liveStats, setLiveStats] = useState({
    total: 18423,
    resolved: 15620,
    inProgress: 2803,
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

  return (
    <div className="page-shell py-8 space-y-8">
      
      {/* Official Municipal Command Header */}
      <div className="gov-panel p-6 border-t-8 border-t-[#0A2540] dark:border-t-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <GovernmentEmblem className="h-14 w-14 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="gov-badge font-mono">GIS COMMAND CENTER</span>
                <span className="gov-badge-green font-mono text-[9px]">LIVE TELEMETRY</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A2540] dark:text-white mt-1">
                Ward-Level GIS Analytics & Municipal Operations Center
              </h1>
              <h2 className="font-hindi text-xs font-bold text-slate-600 dark:text-slate-400">
                वार्ड स्तरीय जीआईएस विश्लेषण, निवारण गतिशीलता एवं नगर नियंत्रण केंद्र
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/report" className="btn-gov-saffron text-xs">
              Lodge New Grievance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Grievances Registered', value: liveStats.total.toLocaleString(), sub: 'CPGRAMS Synced', border: 'border-l-[#0A2540]' },
          { label: 'Statutory Redressals', value: liveStats.resolved.toLocaleString(), sub: 'Within SLA Deadlines', border: 'border-l-emerald-600' },
          { label: 'Active Field Repairs', value: liveStats.inProgress.toLocaleString(), sub: 'Under Active Work Orders', border: 'border-l-amber-600' },
          { label: 'Municipal SLA Rate', value: `${liveStats.slaRate}%`, sub: 'Target: >90% SLA', border: 'border-l-blue-600' },
        ].map((item) => (
          <div key={item.label} className={`gov-panel border-l-4 p-4 ${item.border}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{item.label}</span>
            <span className="font-mono text-2xl font-black text-[#0A2540] dark:text-white mt-1 block">{item.value}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Ward Telemetry & Jurisdiction Scorecard */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left: Ward Intelligence Matrix */}
        <div className="gov-panel p-6 border border-slate-300 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0A2540] dark:text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#0A2540] dark:text-white">
                Ward Jurisdictions & Officer Scorecards
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Select Ward for Profile</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {wardData.map((ward) => (
              <button
                key={ward.id}
                type="button"
                onClick={() => setSelectedWard(ward)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedWard.id === ward.id
                    ? 'border-[#0A2540] bg-blue-50/70 shadow-sm dark:border-blue-400 dark:bg-blue-950/40 ring-1 ring-[#0A2540]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-[#0A2540] dark:text-amber-400">{ward.id}</span>
                  <span className="gov-badge-green font-mono text-[9px]">{ward.slaCompliance} SLA</span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">{ward.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{ward.officer}</p>

                <div className="mt-3 flex items-center justify-between text-[10px] border-t border-slate-200/80 pt-2 dark:border-slate-800">
                  <span className="text-amber-700 font-bold">{ward.pending} Active Queue</span>
                  <span className="text-emerald-700 font-bold">{ward.completed} Resolved</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Ward Detail Card */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 dark:border-slate-800">
              <span className="font-black text-[#0A2540] dark:text-white uppercase">
                Active Ward Profile: {selectedWard.name}
              </span>
              <span className="font-mono text-slate-500">Helpline: {selectedWard.phone}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Assistant Executive Engineer</span>
                <b className="text-slate-900 dark:text-white">{selectedWard.officer}</b>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Mean Turnaround (MTTR)</span>
                <b className="font-mono text-emerald-700 dark:text-emerald-400">{selectedWard.responseTime}</b>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Citizen Charter Grade</span>
                <b className="text-blue-700 dark:text-blue-400">Class-A Municipal Division</b>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Category Distribution & Trends */}
        <div className="space-y-6">
          
          <div className="gov-panel p-6 border border-slate-300 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0A2540] dark:text-white mb-4">
              Monthly Redressal & Resolution Velocity
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" stroke="#0A2540" fill="#0A2540" fillOpacity={0.15} name="Registered" />
                  <Area type="monotone" dataKey="resolved" stroke="#15803D" fill="#15803D" fillOpacity={0.3} name="Redressed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Public Grievance Hearings Schedule */}
          <div className="gov-panel p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="h-4 w-4 text-amber-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Official Municipal Public Hearing Schedule
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {publicHearings.map((h, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{h.ward}</span>
                    <span className="font-mono text-amber-700 dark:text-amber-400">{h.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1"><b>Venue:</b> {h.venue}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5"><b>Presiding:</b> {h.presiding}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}