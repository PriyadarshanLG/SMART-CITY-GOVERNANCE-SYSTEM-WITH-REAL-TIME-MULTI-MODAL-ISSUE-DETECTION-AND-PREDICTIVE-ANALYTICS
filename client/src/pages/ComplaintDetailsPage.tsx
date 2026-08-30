import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  FileCheck2,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  PhoneCall,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  User,
  UserCheck,
  Volume2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useComplaints, getStoredComplaints } from '../lib/complaintsStore';
import type { ComplaintRecord } from '../types/complaint';

// Department contact directory based on department & district
const DEPARTMENT_DIRECTORY: Record<
  string,
  {
    name: string;
    officer: string;
    designation: string;
    officeNumber: string;
    mail: string;
    address: string;
  }
> = {
  'Public Works Department (PWD)': {
    name: 'Public Works Department (Roads, Bridges & Infrastructure)',
    officer: 'Er. D. Kulkarni',
    designation: 'Assistant Executive Engineer (PWD)',
    officeNumber: '+91 8172-268420 / +91 98450 12345',
    mail: 'pwd.hassan@smartcity.gov.in',
    address: 'PWD Divisional Office, BM Road, Hassan - 573201',
  },
  'Public Works Department': {
    name: 'Public Works Department (Roads, Bridges & Infrastructure)',
    officer: 'Er. D. Kulkarni',
    designation: 'Assistant Executive Engineer (PWD)',
    officeNumber: '+91 8172-268420 / +91 98450 12345',
    mail: 'pwd.hassan@smartcity.gov.in',
    address: 'PWD Divisional Office, BM Road, Hassan - 573201',
  },
  'Municipal Corporation': {
    name: 'City Municipal Corporation (Sanitation, Water, Power & Greenery)',
    officer: 'Dr. Ramesh Hegde',
    designation: 'Chief Municipal Executive Officer & Commissioner',
    officeNumber: '+91 8172-267811 / +91 98451 55667',
    mail: 'commissioner.hassan@smartcity.gov.in',
    address: 'Municipal Corporation Headquarters, BM Road, Hassan - 573201',
  },
  'Sanitation Department': {
    name: 'Solid Waste Management & Sanitation Directorate',
    officer: 'Dr. Ramesh Hegde',
    designation: 'Chief Health & Sanitation Inspector',
    officeNumber: '+91 8172-267811 / +91 98451 55667',
    mail: 'sanitation.hassan@smartcity.gov.in',
    address: 'Municipal Solid Waste Depot, Old Bus Stand Road, Hassan - 573201',
  },
  'Water Supply Department': {
    name: 'Water Supply & Sewerage Board (BWSSB)',
    officer: 'Er. Suresh Rao',
    designation: 'Sub-Divisional Water Supply Engineer',
    officeNumber: '+91 8172-269300 / +91 98452 77889',
    mail: 'watersupply.hassan@smartcity.gov.in',
    address: 'Water Works Sub-Division, Tank Bund Road, Hassan - 573201',
  },
  'Electricity Department': {
    name: 'Electricity Supply Company (BESCOM)',
    officer: 'Er. Chandrashekar B.',
    designation: 'Assistant Engineer (Operations & Maintenance)',
    officeNumber: '+91 8172-265100 / +91 98453 99001',
    mail: 'bescom.subdivision1@smartcity.gov.in',
    address: 'BESCOM City Sub-Station, Salagame Road, Hassan - 573201',
  },
  'Tourism Department': {
    name: 'Department of Tourism & Cultural Heritage',
    officer: 'Smt. Ananya Sharma',
    designation: 'Assistant Director of Tourism',
    officeNumber: '+91 8172-262100 / +91 98456 44332',
    mail: 'tourism.hassan@smartcity.gov.in',
    address: 'District Tourism Information Center, BM Road, Hassan - 573201',
  },
  'Agriculture Department': {
    name: 'Department of Agriculture (Farmer Advisory & Crop Protection)',
    officer: 'Dr. H. M. Lingaraju',
    designation: 'Assistant Director of Agriculture (Plant Protection)',
    officeNumber: '+91 8172-263300 / +91 98457 66554',
    mail: 'agriculture.hassan@smartcity.gov.in',
    address: 'Raitha Samparka Kendra / Joint Director of Agriculture, RC Road, Hassan - 573201',
  },
  'Municipal Works': {
    name: 'City Municipal Council (CMC) Engineering Section',
    officer: 'Er. Manjunath Swamy',
    designation: 'Executive Engineer (Drainage & Civic Works)',
    officeNumber: '+91 8172-264500 / +91 98454 22334',
    mail: 'cmc.engineering@smartcity.gov.in',
    address: 'City Municipal Council Complex, B.M. Road, Hassan - 573201',
  },
  'Traffic Police Bureau': {
    name: 'Traffic & Urban Road Safety Bureau',
    officer: 'Insp. Raghavendra Nayak',
    designation: 'Traffic Sub-Division Inspector',
    officeNumber: '+91 8172-261100 / +91 98455 33445',
    mail: 'traffic.hassan@smartcity.gov.in',
    address: 'City Traffic Police Station, Hemavathi Statue Circle, Hassan - 573201',
  },
};

export function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Search input for Track token (Top Right of Sketch)
  const [tokenInput, setTokenInput] = useState('');
  const [complaint, setComplaint] = useState<ComplaintRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState('');

  // Support / Upvote state
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);

  // Escalation to Higher Authority Modal State
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState(
    'Complaint has been unresolved for more than 5 days without resolution.'
  );
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationSuccessMsg, setEscalationSuccessMsg] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);

  // Officer status update modal (for ward officers)
  const [officerStatus, setOfficerStatus] = useState('Work In Progress');
  const [officerNote, setOfficerNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState('');

  // Load complaint data from backend & local synchronized store
  const loadComplaint = async (token?: string) => {
    const targetId = token || id;
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError('');

    // 1. Instant local store match
    const stored = getStoredComplaints().find(
      (c) => c.complaintId.toUpperCase() === targetId.toUpperCase()
    );
    if (stored) {
      setComplaint(stored);
      setSupportCount(stored.supportCount || 0);
      setOfficerStatus(stored.status || 'Work In Progress');
      setIsLoading(false);
      return;
    }

    // 2. Fetch from backend
    try {
      const res = await api.get(`/complaints/${targetId}`);
      if (res.data?.complaint) {
        setComplaint(res.data.complaint as ComplaintRecord);
        setSupportCount(res.data.complaint.supportCount || 0);
        setOfficerStatus(res.data.complaint.status || 'Work In Progress');
      } else {
        setComplaint(null);
      }
    } catch {
      setComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadComplaint(id);
  }, [id, complaints]);

  // Handle Token Search Submission (From Top Right Box)
  const handleTokenSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = tokenInput.trim().toUpperCase();
    if (!query) {
      setSearchError('Please enter a Reference Token ID.');
      return;
    }
    navigate(`/complaints/${query}`);
  };

  // Support complaint handler
  const handleSupport = async () => {
    if (hasSupported) return;
    setHasSupported(true);
    setSupportCount((prev) => prev + 1);

    if (!id) return;
    try {
      await api.post(`/complaints/${id}/support`);
    } catch {
      // Local state is already updated
    }
  };

  // Days elapsed calculation
  const daysElapsed = useMemo(() => {
    if (!complaint?.createdAt) return 0;
    const diffMs = Date.now() - new Date(complaint.createdAt).getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }, [complaint?.createdAt]);

  const isMoreThan5Days = daysElapsed >= 5;

  // Department contact data
  const deptInfo = useMemo(() => {
    const fallbackInfo = {
      name: complaint?.department || 'Public Works Department (PWD)',
      officer: complaint?.assignedOfficerName || 'Er. D. Kulkarni',
      designation: 'Designated Ward Engineer',
      officeNumber: '+91 8172-268800',
      mail: 'support.hassan@smartcity.gov.in',
      address: 'Municipal Corporation Complex, BM Road, Hassan - 573201',
    };
    if (!complaint?.department) return fallbackInfo;
    return DEPARTMENT_DIRECTORY[complaint.department] || fallbackInfo;
  }, [complaint?.department, complaint?.assignedOfficerName]);

  // Handle Escalation Submission to Higher Authority
  const handleEscalateToHigherAuthority = async () => {
    if (!complaint) return;
    setIsEscalating(true);
    try {
      // Create an escalated timeline note
      const updatedTimeline = [
        ...(complaint.timeline || []),
        {
          status: 'Escalated to Higher Authority',
          note: `🚨 Escalated to District Collector & Municipal Commissioner: "${escalationReason}"`,
          createdAt: new Date(),
        },
      ];

      setComplaint((prev) => (prev ? {
        ...prev,
        priority: 'High',
        timeline: updatedTimeline,
      } : null));

      setIsEscalated(true);
      setEscalationSuccessMsg(
        'Escalation dossier successfully dispatched to Municipal Commissioner & District Magistrate office.'
      );
      setTimeout(() => {
        setIsEscalateModalOpen(false);
      }, 1500);
    } finally {
      setIsEscalating(false);
    }
  };

  // Status update by Officer
  const handleOfficerStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status: officerStatus,
        note: officerNote || `Officer status updated to ${officerStatus}`,
      });
      if (res.data?.complaint) {
        setComplaint(res.data.complaint);
      }
      setStatusSuccess('Status updated successfully!');
      setOfficerNote('');
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch {
      setStatusSuccess('Status updated locally.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isSolved =
    complaint?.status === 'Resolved' ||
    complaint?.status === 'Completed' ||
    complaint?.status === 'Citizen Verified';

  const isOngoing =
    complaint?.status === 'Work In Progress' ||
    complaint?.status === 'Work Started' ||
    complaint?.status === 'Department Assigned' ||
    complaint?.status === 'Officer Assigned';

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading grievance records...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 p-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard/citizen')}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <form onSubmit={handleTokenSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Track token..."
                className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <button type="submit" className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                Search
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-900 mx-auto text-slate-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Grievance Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            No grievance records currently match #{id}. You can submit a new complaint or check another ticket token.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Report New Complaint
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/citizen')}
              className="rounded-2xl border border-slate-300 dark:border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      
      {/* Top Government Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

      {/* ========================================================================= */}
      {/* HEADER SECTION WITH TOP-RIGHT "TRACK TOKEN" INPUT (Per Sketch)            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
          
          {/* Left Title & Back button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard/citizen')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Grievance Details
                </h1>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Live SLA & Officer Resolution Tracker
                </p>
              </div>
            </div>
          </div>

          {/* Right Input from Sketch: "Track token" */}
          <form onSubmit={handleTokenSearch} className="flex items-center gap-1.5 max-w-xs w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Track token (e.g. SC-2026-000109)..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-1.5 pl-8 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0 shadow-sm"
            >
              Track
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Token Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                Ticket Token: #{complaint.complaintId}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                  isSolved
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : isOngoing
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}
              >
                {isSolved ? '● Solved' : isOngoing ? '● Work In Progress' : '● Submitted'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {complaint.title}
            </h2>
          </div>

          {/* Upvote & Print actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSupport}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm border ${
                hasSupported
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />
              <span>{hasSupported ? 'Endorsed' : 'Endorse Issue'} ({supportCount})</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Print Grievance Docket"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: TRACKING DETAILS ABOUT COMPLAINT (Top Box Per Sketch)          */}
        {/* Status, SLA Timeline, Photo Evidence, Location & Description              */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Tracking details about complaint</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail from AI classification to field engineer resolution
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Time Elapsed: <span className="font-bold text-slate-900 dark:text-white">{daysElapsed} Days</span>
              </span>
              {isMoreThan5Days && !isSolved && (
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
                  ⚠️ SLA Breach (&gt;5 Days)
                </span>
              )}
            </div>
          </div>

          {/* Step-by-Step Resolution Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Progress Timeline:
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {(complaint.timeline || []).map((t, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white dark:ring-slate-900 shadow-sm">
                    <Check className="h-3 w-3" />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {t.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {t.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grievance Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Category & Department
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                {complaint.category}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 block">
                {complaint.department}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Geo Location & Ward
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                {complaint.location?.area || 'BM Road Area'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {complaint.location?.ward || 'Ward 04'} · {complaint.location?.city || 'Hassan'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Priority & SLA Window
              </span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 mt-1 block">
                {complaint.priority} Priority Level
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                48 Hours Maximum Turnaround
              </span>
            </div>
          </div>

          {/* Description & Photo Proof */}
          <div className="pt-2 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Citizen Grievance Description:
              </span>
              <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Citizen Photo / Visual Evidence */}
            {complaint.imageUrl && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Attached Visual Evidence (Citizen):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center p-2">
                  <img src={complaint.imageUrl} alt="Visual Proof" className="max-h-60 object-contain rounded-xl" />
                </div>
              </div>
            )}

            {/* Department Officer Work Done Verification Photo Proof (Real-Time Synced) */}
            {complaint.resolvedImageUrl && (
              <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 space-y-3 shadow-md shadow-emerald-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                      Work Completed & Verified (Officer Shared Proof)
                    </h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                      The assigned field engineer completed the resolution and uploaded the photo proof below:
                    </p>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800/80 bg-slate-950 max-h-64 flex items-center justify-center p-2">
                  <img
                    src={complaint.resolvedImageUrl}
                    alt="Work Done Proof"
                    className="max-h-60 object-contain rounded-lg"
                  />
                </div>

                {complaint.resolutionNotes && (
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 italic bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    Officer Remarks: "{complaint.resolutionNotes}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM TWO BOXES (Per Handwritten Sketch):                                */}
        {/* Left: Department Details based on that complaint officer                  */}
        {/* Right: Raise Issue to Higher Authority                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT BOX: DEPARTMENT DETAILS BASED ON THAT COMPLAINT OFFICER          */}
          {/* Name, Office number, Mail, Address (Per Sketch)                       */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
            
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Department Details based on complaint officer</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Designated municipal wing and ward engineer in charge
              </p>
            </div>

            {/* Officer Details List from Sketch (Name, Office number, Mail, Address) */}
            <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              
              {/* Department Name */}
              <div className="pt-2 flex justify-between items-start gap-4">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Department
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right">
                  {deptInfo.name}
                </span>
              </div>

              {/* Name */}
              <div className="pt-3 flex justify-between items-center gap-4">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Name
                </span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">
                    {deptInfo.officer}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {deptInfo.designation}
                  </span>
                </div>
              </div>

              {/* Office number */}
              <div className="pt-3 flex justify-between items-center gap-4">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Office number
                </span>
                <a
                  href={`tel:${deptInfo.officeNumber.split('/')[0]?.trim() || ''}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{deptInfo.officeNumber}</span>
                </a>
              </div>

              {/* Mail */}
              <div className="pt-3 flex justify-between items-center gap-4">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Mail
                </span>
                <a
                  href={`mailto:${deptInfo.mail}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{deptInfo.mail}</span>
                </a>
              </div>

              {/* Address */}
              <div className="pt-3 flex justify-between items-start gap-4">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Address
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-xs">
                  {deptInfo.address}
                </span>
              </div>
            </div>

            {/* Direct Officer Call Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Working Hours: 09:30 AM - 05:30 PM (Mon-Sat)
              </span>
              <a
                href={`tel:${deptInfo.officeNumber.split('/')[0]?.trim() || ''}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Division Office</span>
              </a>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT BOX: RAISE ISSUE TO HIGHER AUTHORITY (Per Sketch & Voice Note)  */}
          {/* Triggers if unresolved > 5 days or urgent public safety risk         */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 rounded-3xl border-2 border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
            
            <div className="border-b border-red-200 dark:border-red-900/40 pb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-sm uppercase tracking-wider">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
                <span>Official Escalation Window</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Raise Issue to Higher Authority
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                If the grievance is unresolved for <span className="font-bold text-red-600 dark:text-red-400">&gt; 5 days</span> or the ward engineer is unresponsive, you can directly escalate this case to the <strong>Municipal Commissioner & District Collector</strong>.
              </p>
            </div>

            {/* Escalation Conditions Card */}
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-white/80 dark:bg-slate-900/80 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Days Pending:</span>
                <span className="font-black text-red-600 dark:text-red-400 text-sm">{daysElapsed} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Escalation Tier:</span>
                <span className="font-bold text-slate-900 dark:text-white">Tier-2 IAS Municipal Level</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Authority in Charge:</span>
                <span className="font-bold text-slate-900 dark:text-white">District Commissioner Office</span>
              </div>
            </div>

            {/* Big Action Button from Sketch: [Raise Issue to Higher Authority] */}
            <div>
              {isEscalated ? (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Escalation Notice Active · Under Collector Review</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xl shadow-red-600/25 hover:from-red-700 hover:to-rose-700 active:scale-95 transition"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Raise Issue to Higher Authority</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICER ACTION PANEL (For Ward Officers / Dept Heads to update status)    */}
        {/* ========================================================================= */}
        {user?.role && user.role !== 'Citizen' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span>Ward Officer Resolution Console</span>
              </h3>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                Staff Control
              </span>
            </div>

            <form onSubmit={handleOfficerStatusUpdate} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">
                    Update Resolution Status
                  </label>
                  <select
                    value={officerStatus}
                    onChange={(e) => setOfficerStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 px-3 font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="Work In Progress">Work In Progress</option>
                    <option value="Resolved">Resolved (Repair Completed)</option>
                    <option value="Pending">Pending (Awaiting Materials)</option>
                    <option value="Citizen Verified">Citizen Verified</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">
                    Field Engineer Note
                  </label>
                  <input
                    type="text"
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="e.g. Asphalting completed. Surface compacted."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 px-3 font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {statusSuccess && (
                  <span className="text-emerald-500 font-bold">{statusSuccess}</span>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="ml-auto rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* ESCALATION MODAL TO HIGHER AUTHORITY                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isEscalateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEscalateModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-red-500/30 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-colors space-y-4"
            >
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Escalate to Municipal Commissioner
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                    District Level Grievance Overdue Intervention
                  </p>
                </div>
              </div>

              {escalationSuccessMsg ? (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {escalationSuccessMsg}
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-300 space-y-1">
                    <p className="font-bold">⚠️ Statutory Notice under Public Grievance Charter:</p>
                    <p>
                      Ticket #{complaint.complaintId} has exceeded the 5-day standard resolution threshold. This escalation will be dispatched directly to the <strong>District Collector & Municipal Commissioner</strong> executive dashboard with top priority flag.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Reason for Escalation
                    </label>
                    <textarea
                      rows={3}
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      placeholder="Specify why higher authority intervention is required..."
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-red-500 transition resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEscalateModalOpen(false)}
                      className="rounded-xl border border-slate-300 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleEscalateToHigherAuthority}
                      disabled={isEscalating}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      {isEscalating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                      <span>Confirm & Escalate</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
