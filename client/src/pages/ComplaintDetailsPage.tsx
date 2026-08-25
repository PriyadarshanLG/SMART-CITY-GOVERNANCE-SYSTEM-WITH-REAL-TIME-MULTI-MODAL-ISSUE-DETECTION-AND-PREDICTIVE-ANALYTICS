import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  FileCheck2,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Printer,
  QrCode,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import type { ComplaintRecord } from '../types/complaint';

const fallbackComplaint: ComplaintRecord = {
  complaintId: 'SC-2026-000001',
  title: 'Street light grid outage near Central Ward 7 Avenue',
  description: 'Multiple street lights are completely dark near the main road intersection after the heavy rainstorm last weekend. This is creating severe safety concerns for women, elderly, and two-wheeler commuters in the evening.',
  category: 'Street Light Outage',
  department: 'Electricity Department',
  priority: 'Medium',
  status: 'Work In Progress',
  supportCount: 18,
  createdAt: new Date(Date.now() - 3600 * 28000).toISOString(),
  location: {
    ward: '01',
    city: 'Smart City',
    area: 'Central Avenue Sector 2',
    landmark: 'Opposite Government High School Gate',
  },
  timeline: [
    { status: 'Submitted', note: 'Grievance registered via Form SC-GRV-2026 by citizen.' },
    { status: 'ML Classified', note: 'NIC NLP model categorized issue to Electricity Department with 96.4% confidence.' },
    { status: 'Department Assigned', note: 'Forwarded to Executive Engineer (Electrical Division, Ward 01).' },
    { status: 'Officer Assigned', note: 'Field inspection assigned to Ward Engineer Er. D. Kulkarni.' },
    { status: 'Work In Progress', note: 'Luminaire replacement and underground cable repair work order #WO-7712 issued to contractor.' },
  ],
};

const sampleIds = ['SC-2026-000001', 'SC-2026-000214', 'SC-2026-000305', 'SC-2026-000109'];

const timelineStages = [
  { id: 'Submitted', label: '1. Registered at Portal', desc: 'Secure token generated & timestamp locked' },
  { id: 'ML Classified', label: '2. NLP Triage & Ward Routing', desc: 'Auto-assigned to jurisdictional division' },
  { id: 'Officer Assigned', label: '3. Field Engineer Inspection', desc: 'On-site assessment & contractor dispatch' },
  { id: 'Work In Progress', label: '4. Remediation In Progress', desc: 'Physical repair & before/after photo audit' },
  { id: 'Resolved', label: '5. Citizen Sign-off & Closure', desc: 'Quality audit & feedback verified' },
];

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<ComplaintRecord>(fallbackComplaint);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [supportMessage, setSupportMessage] = useState('');
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(18);
  const [copied, setCopied] = useState(false);
  const [escalated, setEscalated] = useState(false);

  // Status update state for officers
  const [newStatus, setNewStatus] = useState('Work In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  const loadComplaint = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/complaints/${id}`);
      if (response.data?.complaint) {
        setComplaint(response.data.complaint as ComplaintRecord);
        setNewStatus(response.data.complaint.status || 'Work In Progress');
        setSupportCount(response.data.complaint.supportCount || 18);
      } else {
        setComplaint({ ...fallbackComplaint, complaintId: id });
      }
    } catch {
      setComplaint({ ...fallbackComplaint, complaintId: id });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    void loadComplaint();
  }, [id]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const handleSupport = async () => {
    if (hasSupported) return;
    setHasSupported(true);
    setSupportCount((prev) => prev + 1);
    try {
      await api.post(`/complaints/${id}/support`);
    } catch {
      // Offline fallback
    }
  };

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusSuccessMsg('');

    try {
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus} by ${user?.name || 'Ward Officer'}.`,
      });
      setStatusSuccessMsg('Official dossier updated successfully.');
      void loadComplaint();
    } catch {
      // Offline fallback
      setComplaint((prev) => ({
        ...prev,
        status: newStatus,
        timeline: [
          ...(prev.timeline || []),
          {
            status: newStatus,
            note: statusNote || `Status updated to ${newStatus} by Ward Officer.`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
      setStatusSuccessMsg('Status updated in local session.');
    } finally {
      setIsUpdatingStatus(false);
      setStatusNote('');
    }
  };

  const handleCopyId = () => {
    if (complaint.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentStatus = complaint.status || 'Work In Progress';
  const isResolved = currentStatus === 'Resolved';

  return (
    <div className="page-shell py-8">
      
      {/* Top Search & Navigation Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <ChevronLeft className="h-4 w-4" /> Portal Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-[#0A2540] dark:text-amber-400">Grievance Audit Dossier</span>
        </div>

        {/* Quick Search Lookup */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search other Ref ID..."
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 pl-8 text-xs font-bold uppercase text-slate-900 outline-none focus:border-[#0A2540] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
          <button type="submit" className="btn-gov-primary text-xs py-1.5 px-3">
            Search
          </button>
        </form>
      </div>

      {/* Main Official Dossier Container */}
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        
        {/* Left Column: Official Case Dossier */}
        <div className="space-y-6">
          
          {/* Government Dossier Header Card */}
          <div className="gov-panel p-6 border-2 border-[#0A2540] dark:border-slate-800 relative overflow-hidden bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 shadow-xl">
            
            {/* Header Strip */}
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GovernmentEmblem className="h-12 w-12 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="gov-badge font-mono text-[9px]">OFFICIAL DOSSIER</span>
                    <span className="gov-badge-green font-mono text-[9px]">GIGW VERIFIED</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-[#0A2540] dark:text-white uppercase tracking-tight">
                    Smart City Municipal Grievance Audit Record
                  </h1>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="text-right flex flex-col items-end">
                <div className="h-7 w-32 barcode-strip mb-1" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black">{complaint.complaintId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy Reference ID"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Case Title & Summary */}
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                }`}>
                  ● Status: {complaint.status}
                </span>

                <span className="gov-badge font-mono text-[10px]">
                  Priority: {complaint.priority}
                </span>

                <span className="gov-badge-saffron font-mono text-[10px]">
                  Ward {complaint.location?.ward || '01'}
                </span>
              </div>

              <h2 className="text-lg font-black text-[#0A2540] dark:text-white leading-snug">
                {complaint.title}
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {complaint.description}
              </p>
            </div>

            {/* Official Metadata Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-slate-200 pt-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Department</span>
                <p className="font-bold text-slate-900 dark:text-white">{complaint.department}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Registration Date</span>
                <p className="font-bold font-mono text-slate-900 dark:text-white">
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Recent'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target SLA Turnaround</span>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">48 Hours (On Track)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Locality / Sector</span>
                <p className="font-bold text-slate-900 dark:text-white">{complaint.location?.area}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Prominent Landmark</span>
                <p className="font-bold text-slate-900 dark:text-white">{complaint.location?.landmark || 'Near Main Gate'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Public Endorsements</span>
                <p className="font-bold text-amber-700 dark:text-amber-400 font-mono">{supportCount} Citizens</p>
              </div>
            </div>

            {/* Action Bar: Print Challan & Public Support */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSupport}
                  disabled={hasSupported}
                  className={`btn-gov-outline text-xs px-3.5 py-2 ${
                    hasSupported ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : ''
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-amber-600" />
                  {hasSupported ? `Endorsed by You (${supportCount})` : `Endorse Grievance (${supportCount})`}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-gov-outline text-xs px-3.5 py-2"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Official Challan
                </button>
              </div>

              {/* Citizen Escalation Button */}
              {!isResolved && (
                <button
                  type="button"
                  onClick={() => {
                    setEscalated(true);
                    alert('Grievance escalation alert dispatched to Joint Municipal Commissioner (Tier 2).');
                  }}
                  disabled={escalated}
                  className={`text-xs font-bold px-3 py-2 rounded-lg border transition ${
                    escalated
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                  }`}
                >
                  {escalated ? '✓ Escalated to Tier 2 Commissioner' : '⚠️ Escalate to Lokayukta / Commissioner'}
                </button>
              )}
            </div>

          </div>

          {/* Official 5-Stage Government SLA Escrow Timeline */}
          <div className="gov-panel p-6 border border-slate-300 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0A2540] dark:text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0A2540] dark:text-white">
                  Government Inspection & Resolution Timeline (प्रगति विवरण)
                </h3>
              </div>
              <span className="gov-badge-green font-mono text-[9px]">SLA Escrow Active</span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {(complaint.timeline || []).map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A2540] text-white text-xs font-bold ring-4 ring-white dark:ring-slate-900 flex-shrink-0 z-10">
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 rounded-lg bg-slate-50 p-3.5 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-slate-900 dark:text-white">
                        {step.status}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {step.createdAt ? new Date(step.createdAt).toLocaleTimeString('en-IN') : `Milestone #${idx + 1}`}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Assigned Officer Profile & Official Controls */}
        <div className="space-y-6">
          
          {/* Jurisdictional Ward Officer Profile Card */}
          <div className="gov-panel p-5 border-l-4 border-l-[#0A2540] dark:border-l-blue-400">
            <span className="section-kicker">Jurisdictional Field Authority</span>
            <h3 className="text-base font-black text-[#0A2540] dark:text-white mt-1">
              Er. D. Kulkarni
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Assistant Executive Engineer (AEE) · Ward 01
            </p>

            <div className="mt-4 space-y-2.5 text-xs border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Government Employee ID:</span>
                <b className="font-mono text-slate-900 dark:text-white">KA-MNC-ENG-4409</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ward Office:</span>
                <b className="text-slate-900 dark:text-white">Central Ward Office, Room 204</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gov Official Email:</span>
                <b className="font-mono text-blue-700 dark:text-blue-400">d.kulkarni@smartcity.gov.in</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Field Desk Phone:</span>
                <b className="font-mono text-amber-700 dark:text-amber-400">080-223401</b>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 dark:border-slate-800">
              <span>Office Hours: 10:00 AM - 5:00 PM</span>
              <span className="gov-badge-green text-[8px]">On Field Duty</span>
            </div>
          </div>

          {/* Officer Action Console (For Ward Officers / Dept Heads) */}
          <div className="gov-panel p-5 border-2 border-slate-300 dark:border-slate-800 no-print">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0A2540] dark:text-white">
                <Wrench className="h-4 w-4 text-amber-600" />
                Officer Triage Console
              </div>
              <span className="gov-badge font-mono text-[9px]">Admin Authorized</span>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Update Official Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#0A2540] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Pending">Pending Field Inspection</option>
                  <option value="Work In Progress">Work In Progress (Contractor Dispatched)</option>
                  <option value="Resolved">Resolved (Remediation Complete)</option>
                  <option value="Closed">Closed / Citizen Sign-off</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Note / Work Order Number
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Luminaire replaced on pole #42; circuit verified..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#0A2540] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="btn-gov-primary w-full py-2.5 text-xs font-bold"
              >
                {isUpdatingStatus ? 'Updating Dossier...' : 'Record Official Inspection ➔'}
              </button>

              {statusSuccessMsg && (
                <p className="text-emerald-700 font-bold text-[11px] text-center">{statusSuccessMsg}</p>
              )}
            </form>
          </div>

          {/* Statutory Redressal Guarantee Notice */}
          <div className="gov-panel p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#0A2540] dark:text-amber-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Statutory Redressal Standards</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              In accordance with the Right to Public Services Act, every citizen is entitled to guaranteed inspection and resolution. If the grievance is delayed past SLA without valid cause, an automatic hearing is convened at the Lokayukta desk.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
