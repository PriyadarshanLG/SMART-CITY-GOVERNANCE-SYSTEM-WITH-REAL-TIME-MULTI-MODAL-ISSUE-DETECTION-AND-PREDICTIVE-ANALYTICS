import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  PhoneCall,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Search,
  CheckCircle2,
  LocateFixed,
  Clock,
  AlertCircle,
  PlusCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  MapPinned,
  Radio,
  FileText,
  Check,
  X,
  Layers,
  Wrench,
  Zap,
  Activity,
  UserCheck,
  Landmark,
  Bell,
  BellRing,
  Send,
  Upload,
  Image as ImageIcon,
  Share2,
  CornerDownRight,
  ArrowUpRight,
  ChevronDown,
  ArrowLeft,
  Filter,
  Eye,
  SlidersHorizontal,
  TrendingUp,
  AlertTriangle,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useComplaints, seedSampleComplaintsForDemo, clearAllComplaints } from '../lib/complaintsStore';
import type { ComplaintRecord } from '../types/complaint';

export const ALL_DEPARTMENTS = [
  'Public Works Department (PWD)',
  'Municipal Corporation',
  'Tourism Department',
  'Agriculture Department',
];

export const DEPARTMENT_METADATA = [
  {
    id: 'Public Works Department (PWD)',
    shortName: 'PWD',
    icon: '🚧',
    officer: 'Er. D. Kulkarni',
    designation: 'Executive Engineer (PWD Division)',
    phone: '+91 8172-268800',
    email: 'pwd.hassan@smartcity.gov.in',
    subAreas: ['Roads, Bridges & Potholes', 'Government Buildings & Infrastructure', 'Traffic Signals & Road Safety'],
    themeColor: 'amber',
  },
  {
    id: 'Municipal Corporation',
    shortName: 'Municipal Corp',
    icon: '🏢',
    officer: 'Er. Manjunath Swamy',
    designation: 'Chief Municipal Executive (CMC)',
    phone: '+91 8172-264500',
    email: 'municipal.hassan@smartcity.gov.in',
    subAreas: [
      'Waste Management & Sanitation',
      'Water Supply & Sewage Pipelines',
      'Electricity & Street Lights',
      'Parks, Gardens & Public Spaces',
      'Animal Services & Stray Cattle',
    ],
    themeColor: 'blue',
  },
  {
    id: 'Tourism Department',
    shortName: 'Tourism Dept',
    icon: '🏖️',
    officer: 'Smt. Radhika Shenoy',
    designation: 'Director of District Tourism & Heritage',
    phone: '+91 8172-265510',
    email: 'tourism.hassan@smartcity.gov.in',
    subAreas: ['Heritage Sites & Monuments', 'Tourist Info Signboards & Pathways', 'Visitor Amenities & Sanitation'],
    themeColor: 'purple',
  },
  {
    id: 'Agriculture Department',
    shortName: 'Agriculture Dept',
    icon: '🌾',
    officer: 'Dr. H. M. Lingaraju',
    designation: 'Assistant Director of Agriculture (Plant Protection)',
    phone: '+91 8172-263300',
    email: 'agriculture.hassan@smartcity.gov.in',
    subAreas: [
      'Farmer Direct Crop Disease Advisory',
      'Coconut & Palm Pest Diagnosis',
      'Arecanut Fungal Rot Control',
      'Paddy, Coffee & Sugarcane Protection',
    ],
    themeColor: 'emerald',
  },
];

export function DashboardPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { complaints, updateStatus, transferComplaint } = useComplaints();

  // Distinguish Active Role
  const activeRole = (role ?? 'citizen').toLowerCase();
  const isAdminView =
    activeRole.includes('admin') ||
    (user?.role === 'Admin') ||
    (typeof window !== 'undefined' && localStorage.getItem('smartcity_selected_dept') === 'Administration / Municipal Commissioner');

  const isOfficerView =
    !isAdminView &&
    (activeRole.includes('officer') ||
      activeRole.includes('dept') ||
      (user?.role && user.role !== 'Citizen'));

  // Selected Department for department staff (persisted from Login or selector)
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartcity_selected_dept');
      if (saved && saved !== 'Administration / Municipal Commissioner') return saved;
    }
    return 'Public Works Department (PWD)';
  });

  // Admin Specific States (All Departments vs Drill-down into particular department)
  const [selectedAdminDept, setSelectedAdminDept] = useState<string>('all'); // 'all' | department name
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'ongoing' | 'solved' | 'pending' | 'high_priority'>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminWardFilter, setAdminWardFilter] = useState('all');
  const [selectedDossierComplaint, setSelectedDossierComplaint] = useState<ComplaintRecord | null>(null);
  const [adminNoticeSuccess, setAdminNoticeSuccess] = useState('');

  // Citizen Dashboard States
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'track'>('overview');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingIdInput, setTrackingIdInput] = useState('');

  // Live GPS Map States for Citizen Dashboard
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0042, lng: 76.1018 });
  const [liveAddress, setLiveAddress] = useState<string>('Hassan Ward 04, Central Ring Road');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const handleDetectLiveGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsDetectingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGPS(false);
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          setLiveCoords({ lat: newLat, lng: newLng });
          setLiveAddress(`Live GPS: Lat ${newLat.toFixed(4)}°, Lng ${newLng.toFixed(4)}°`);
        },
        () => {
          setIsDetectingGPS(false);
          setLiveCoords({ lat: 13.0042, lng: 76.1018 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Department Dashboard States (Per Sketch: Complaints, Details, Completed + Share Image, Other Complaints + Push)
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');

  // Completed Modal & Share Image of Work Done
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [workDoneImage, setWorkDoneImage] = useState<string | null>(null);
  const [workDoneRemarks, setWorkDoneRemarks] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState('');

  // Push to Respective Department State
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [targetPushDept, setTargetPushDept] = useState<string>('Municipal Corporation');
  const [targetPushComplaint, setTargetPushComplaint] = useState<ComplaintRecord | null>(null);
  const [pushSuccessMsg, setPushSuccessMsg] = useState('');

  // Notifications State (Dynamic based on real complaints)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifications = useMemo(() => {
    if (complaints.length === 0) {
      return [
        { id: 1, text: '🟢 All queues clear. Smart City real-time issue monitoring active.', time: 'Just now', unread: false },
      ];
    }
    return complaints.slice(0, 3).map((c, i) => ({
      id: i + 1,
      text: `${c.priority === 'High' ? '🚨' : '📋'} ${c.department}: #${c.complaintId} - ${c.title}`,
      time: 'Live',
      unread: c.status !== 'Resolved' && c.status !== 'Completed',
    }));
  }, [complaints]);

  // Citizen registered info
  const userDistrict = useMemo(() => user?.district || user?.city || 'Hassan', [user]);
  const userCity = useMemo(() => user?.city || user?.district || 'Hassan', [user]);
  const userState = useMemo(() => user?.state || 'Karnataka', [user]);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') !== 'light';
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Helper: Normalize department match
  const matchesDepartment = (deptString: string, targetDept: string) => {
    const d = (deptString || '').toLowerCase();
    const t = targetDept.toLowerCase();
    if (t.includes('pwd') || t.includes('public works')) {
      return d.includes('public works') || d.includes('pwd') || d.includes('road');
    }
    if (t.includes('municipal')) {
      return (
        d.includes('municipal') ||
        d.includes('sanitation') ||
        d.includes('water') ||
        d.includes('electricity') ||
        d.includes('drainage') ||
        d.includes('waste')
      );
    }
    if (t.includes('tourism')) {
      return d.includes('tourism') || d.includes('heritage');
    }
    if (t.includes('agriculture')) {
      return d.includes('agriculture') || d.includes('crop') || d.includes('farmer');
    }
    return d === t;
  };

  // Real-time dynamic filtering of department complaints for Officer View
  const activeDeptComplaints = useMemo(() => {
    return complaints.filter((c) => matchesDepartment(c.department, selectedDepartment));
  }, [complaints, selectedDepartment]);

  // Real-time dynamic unassigned/other complaints
  const otherComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const d = (c.department || '').toLowerCase();
      return d.includes('other') || d.includes('unassigned') || d.includes('unclassified');
    });
  }, [complaints]);

  // Active Selected Complaint Detail for Officer View
  const activeSelectedComplaint = useMemo(() => {
    return (
      activeDeptComplaints.find((c) => c.complaintId === selectedComplaintId) ||
      activeDeptComplaints[0] ||
      complaints[0]
    );
  }, [activeDeptComplaints, complaints, selectedComplaintId]);

  // Admin Department-Wise Metrics
  const adminDeptMetrics = useMemo(() => {
    return DEPARTMENT_METADATA.map((dept) => {
      const deptComplaints = complaints.filter((c) => matchesDepartment(c.department, dept.id));
      const total = deptComplaints.length;
      const solved = deptComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Completed' || c.status === 'Citizen Verified').length;
      const ongoing = deptComplaints.filter((c) => c.status === 'Work In Progress' || c.status === 'Work Started' || c.status === 'Department Assigned').length;
      const pending = deptComplaints.filter((c) => c.status === 'Pending' || c.status === 'Submitted').length;
      const highPriority = deptComplaints.filter((c) => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Completed').length;
      const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 100;

      return {
        ...dept,
        total,
        solved,
        ongoing,
        pending,
        highPriority,
        resolutionRate,
        complaints: deptComplaints,
      };
    });
  }, [complaints]);

  // Admin Filtered Complaints List (When viewing a specific department or all)
  const adminFilteredComplaints = useMemo(() => {
    let list = complaints;
    if (selectedAdminDept !== 'all') {
      list = list.filter((c) => matchesDepartment(c.department, selectedAdminDept));
    }

    if (adminStatusFilter === 'ongoing') {
      list = list.filter((c) => c.status === 'Work In Progress' || c.status === 'Work Started' || c.status === 'Department Assigned');
    } else if (adminStatusFilter === 'solved') {
      list = list.filter((c) => c.status === 'Resolved' || c.status === 'Completed' || c.status === 'Citizen Verified');
    } else if (adminStatusFilter === 'pending') {
      list = list.filter((c) => c.status === 'Pending' || c.status === 'Submitted');
    } else if (adminStatusFilter === 'high_priority') {
      list = list.filter((c) => c.priority === 'High');
    }

    if (adminSearchQuery.trim()) {
      const q = adminSearchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.citizenName || '').toLowerCase().includes(q) ||
          (c.location?.area || '').toLowerCase().includes(q)
      );
    }

    if (adminWardFilter !== 'all') {
      list = list.filter((c) => (c.location?.ward || '').toLowerCase().includes(adminWardFilter.toLowerCase()));
    }

    return list;
  }, [complaints, selectedAdminDept, adminStatusFilter, adminSearchQuery, adminWardFilter]);

  // Overall City Stats for Admin Overview
  const totalCityComplaints = complaints.length;
  const solvedCityCount = useMemo(
    () => complaints.filter((c) => c.status === 'Resolved' || c.status === 'Completed' || c.status === 'Citizen Verified').length,
    [complaints]
  );
  const ongoingCityCount = useMemo(
    () => complaints.filter((c) => c.status === 'Work In Progress' || c.status === 'Work Started' || c.status === 'Department Assigned').length,
    [complaints]
  );
  const pendingCityCount = useMemo(
    () => complaints.filter((c) => c.status === 'Pending' || c.status === 'Submitted').length,
    [complaints]
  );
  const overallResolutionRate = totalCityComplaints > 0 ? Math.round((solvedCityCount / totalCityComplaints) * 100) : 100;

  // Handlers for Officer Actions
  const handleMarkOnProcess = async (complaintId: string) => {
    await updateStatus(complaintId, 'Work In Progress', 'Field engineer dispatched to site. Repair machinery and crew active.');
  };

  const handleWorkDoneFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWorkDoneImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCompletion = async () => {
    if (!workDoneImage) {
      alert('Please upload a photo of the completed work before closing this ticket.');
      return;
    }

    if (!activeSelectedComplaint) return;

    setIsSubmittingCompletion(true);
    await updateStatus(
      activeSelectedComplaint.complaintId,
      'Resolved',
      `✅ Work completed by Ward Officer. Verification photo uploaded: "${workDoneRemarks || 'Repair executed according to municipal standard.'}"`,
      workDoneImage,
      workDoneRemarks
    );

    setIsSubmittingCompletion(false);
    setCompletionSuccess('Work done image verified! Complaint marked as COMPLETED & synced with citizen view.');
    setTimeout(() => {
      setIsCompleteModalOpen(false);
      setCompletionSuccess('');
      setWorkDoneImage(null);
      setWorkDoneRemarks('');
    }, 1200);
  };

  const handlePushToDepartment = async () => {
    if (!targetPushComplaint) return;

    await transferComplaint(targetPushComplaint.complaintId, targetPushDept);

    setPushSuccessMsg(`Complaint ${targetPushComplaint.complaintId} transferred to ${targetPushDept}!`);
    setTimeout(() => {
      setIsPushModalOpen(false);
      setPushSuccessMsg('');
      setTargetPushComplaint(null);
    }, 1200);
  };

  // District statistics computed live for Citizen View
  const districtComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const cityMatch = (c.location?.city || '').toLowerCase().includes(userCity.toLowerCase());
      const distMatch = (c.location?.district || '').toLowerCase().includes(userDistrict.toLowerCase());
      return cityMatch || distMatch || true;
    });
  }, [complaints, userCity, userDistrict]);

  const solvedCount = useMemo(() => {
    return districtComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Completed' || c.status === 'Citizen Verified').length;
  }, [districtComplaints]);

  const ongoingCount = useMemo(() => {
    return districtComplaints.filter((c) => c.status === 'Work In Progress' || c.status === 'Work Started' || c.status === 'Department Assigned' || c.status === 'Submitted').length;
  }, [districtComplaints]);

  // Admin Quick Action: Issue Notice to Officer
  const handleIssueNotice = (complaintId: string, deptName: string) => {
    setAdminNoticeSuccess(`Official Executive Notice dispatched to ${deptName} regarding ticket #${complaintId}.`);
    setTimeout(() => setAdminNoticeSuccess(''), 3000);
  };

  // =========================================================================
  // VIEW 1: 🏛️ ADMINISTRATION / MUNICIPAL COMMISSIONER COMMAND CENTER
  // Shows all 4 department boxes first; clicking one shows all complaints for that department
  // =========================================================================
  if (isAdminView) {
    const activeAdminDeptMeta = DEPARTMENT_METADATA.find((d) => d.id === selectedAdminDept);

    return (
      <div className="dashboard-shell min-h-screen w-full bg-slate-900 text-slate-100 font-sans pb-16 transition-colors duration-300">
        {/* Top Government Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

        {/* ------------------------------------------------------------------- */}
        {/* ADMIN HEADER                                                        */}
        {/* ------------------------------------------------------------------- */}
        <header className="dashboard-panel sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl transition-colors">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Left: Administration Branding */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25">
                <Landmark className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    🏛️ Municipal Commissioner Command Desk
                  </span>
                  <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-indigo-400 border border-indigo-500/20">
                    Admin Oversight
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-black text-white">
                  Smart City Governance & Inter-Departmental Control Room
                </h1>
              </div>
            </div>

            {/* Right: Department Filter Tabs + Theme + Notifications + Sign Out */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Button 1: Report Complaint */}
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">+ Report Grievance</span>
              </button>

              {/* Button 2: Quick Demo Data Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (complaints.length === 0) {
                    seedSampleComplaintsForDemo();
                  } else {
                    clearAllComplaints();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition shadow-sm"
                title="Click to toggle sample complaints across all 4 departments for demo preview"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden sm:inline">{complaints.length === 0 ? '⚡ Load Demo Data' : 'Clear Data'}</span>
              </button>

              {/* Button 3: View Role Switcher */}
              <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/citizen')}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/officer')}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition"
                >
                  Officer
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm"
                >
                  Admin Desk
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition"
                >
                  <BellRing className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline">Alerts</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                    {complaints.length}
                  </span>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">Administration Alerts</span>
                      <span className="text-[10px] text-slate-400">City SLA Status</span>
                    </div>
                    <div className="divide-y divide-slate-800 mt-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="py-2 text-xs space-y-0.5">
                          <p className="text-slate-200">{n.text}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark / Light Toggle */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>

              {/* Sign Out */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 text-red-400 hover:bg-red-900/50 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Department Switcher Strip */}
          <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Select View:
              </span>

              <button
                type="button"
                onClick={() => setSelectedAdminDept('all')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition shrink-0 ${
                  selectedAdminDept === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>🏛️ All 4 Departments Overview</span>
              </button>

              {DEPARTMENT_METADATA.map((dept) => {
                const isSelected = selectedAdminDept === dept.id;
                const dComplaintsCount = complaints.filter((c) => matchesDepartment(c.department, dept.id)).length;

                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedAdminDept(dept.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{dept.icon}</span>
                    <span>{dept.shortName}</span>
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                      {dComplaintsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------------- */}
        {/* MAIN BODY: ADMIN DASHBOARD                                          */}
        {/* ------------------------------------------------------------------- */}
        <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
          
          {/* Admin Notice Success Banner */}
          {adminNoticeSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between"
            >
              <span>{adminNoticeSuccess}</span>
              <button type="button" onClick={() => setAdminNoticeSuccess('')}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* City-Wide Executive KPI Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Grievances
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{totalCityComplaints}</span>
                <span className="text-[10px] text-slate-400">Across 4 Departments</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                ⚡ Work In Progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{ongoingCityCount}</span>
                <span className="text-[10px] text-amber-500/80">Active Field Crews</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-4">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                ✅ Solved with Proof
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">{solvedCityCount}</span>
                <span className="text-[10px] text-emerald-500/80">Verified Repairs</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-4">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                ⏳ Pending Triage
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-400">{pendingCityCount}</span>
                <span className="text-[10px] text-blue-500/80">Awaiting Dispatch</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-indigo-900/30 bg-indigo-950/20 p-4">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                🎯 SLA Resolution Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-indigo-400">{overallResolutionRate}%</span>
                <span className="text-[10px] text-indigo-400/80">City Benchmark</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION A: ALL DEPARTMENTS BOXES (When selectedAdminDept === 'all')*/}
          {/* ================================================================= */}
          {selectedAdminDept === 'all' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Municipal Departments Control Units</span>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                      4 Departments Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click on any department card to inspect complaints, ongoing work, solved status, and officer dispatch.
                  </p>
                </div>
              </div>

              {/* 4 Rich Department Boxes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {adminDeptMetrics.map((dept) => (
                  <motion.div
                    key={dept.id}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4 hover:border-indigo-500/60 transition cursor-pointer group"
                    onClick={() => setSelectedAdminDept(dept.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-2xl shadow-md group-hover:scale-110 transition-transform">
                          {dept.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                            Department Unit
                          </span>
                          <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition">
                            {dept.id}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-400 block">
                          {dept.resolutionRate}%
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Resolution</span>
                      </div>
                    </div>

                    {/* Officer & Jurisdiction Info */}
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">In-Charge Officer:</span>
                        <span className="font-bold text-white">{dept.officer}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500">Official Contact:</span>
                        <span className="font-mono text-[11px] text-indigo-400">{dept.phone}</span>
                      </div>
                    </div>

                    {/* Sub-Areas / Functions Covered */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Jurisdiction & Problem Scope:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dept.subAreas.map((area, i) => (
                          <span
                            key={i}
                            className="rounded-xl bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Complaints Metrics Strip (Total, Ongoing, Solved, Pending) */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Total</span>
                        <span className="text-base font-black text-white">{dept.total}</span>
                      </div>
                      <div className="rounded-xl bg-amber-950/30 p-2 border border-amber-900/30">
                        <span className="text-[10px] text-amber-400 block uppercase">Ongoing</span>
                        <span className="text-base font-black text-amber-400">{dept.ongoing}</span>
                      </div>
                      <div className="rounded-xl bg-emerald-950/30 p-2 border border-emerald-900/30">
                        <span className="text-[10px] text-emerald-400 block uppercase">Solved</span>
                        <span className="text-base font-black text-emerald-400">{dept.solved}</span>
                      </div>
                      <div className="rounded-xl bg-blue-950/30 p-2 border border-blue-900/30">
                        <span className="text-[10px] text-blue-400 block uppercase">Pending</span>
                        <span className="text-base font-black text-blue-400">{dept.pending}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdminDept(dept.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 py-2.5 text-xs font-bold text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm"
                    >
                      <span>Inspect {dept.shortName} Grievances & Officers ({dept.total} Tickets)</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION B: PARTICULAR DEPARTMENT DRILL-DOWN (ADMINISTRATION VIEW) */}
          {/* Shows full list of complaints, solved/ongoing/pending, and details*/}
          {/* ================================================================= */}
          {selectedAdminDept !== 'all' && activeAdminDeptMeta && (
            <div className="space-y-6">
              {/* Back to All Departments + Dept Header */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedAdminDept('all')}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      title="Back to All Departments"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-2xl shadow-md">
                      {activeAdminDeptMeta.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                          Department Administrative Oversight
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[9px] font-black text-emerald-400 border border-emerald-500/20">
                          Live Queue
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white">
                        {activeAdminDeptMeta.id}
                      </h2>
                    </div>
                  </div>

                  {/* Officer Info */}
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400 block">Designated Officer In-Charge:</span>
                    <span className="font-bold text-white block">{activeAdminDeptMeta.officer}</span>
                    <span className="text-[11px] text-indigo-400 font-mono">{activeAdminDeptMeta.phone}</span>
                  </div>
                </div>

                {/* Sub-Filters and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setAdminStatusFilter('all')}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        adminStatusFilter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      All ({adminDeptMetrics.find((d) => d.id === selectedAdminDept)?.total || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminStatusFilter('ongoing')}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        adminStatusFilter === 'ongoing'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      ● Ongoing ({adminDeptMetrics.find((d) => d.id === selectedAdminDept)?.ongoing || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminStatusFilter('solved')}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        adminStatusFilter === 'solved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      ● Solved ({adminDeptMetrics.find((d) => d.id === selectedAdminDept)?.solved || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        adminStatusFilter === 'pending'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      ● Pending ({adminDeptMetrics.find((d) => d.id === selectedAdminDept)?.pending || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminStatusFilter('high_priority')}
                      className={`rounded-xl px-3 py-1.5 font-bold transition ${
                        adminStatusFilter === 'high_priority'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      🔥 High Priority ({adminDeptMetrics.find((d) => d.id === selectedAdminDept)?.highPriority || 0})
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      placeholder="Search Token, Citizen, Area..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Grievance Management Cards / Table */}
              <div className="space-y-3">
                {adminFilteredComplaints.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-400">No complaints matching the selected filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminStatusFilter('all');
                        setAdminSearchQuery('');
                      }}
                      className="text-xs text-indigo-400 underline font-bold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  adminFilteredComplaints.map((item, idx) => {
                    const isSolved = item.status === 'Resolved' || item.status === 'Completed' || item.status === 'Citizen Verified';
                    const isOngoing = item.status === 'Work In Progress' || item.status === 'Work Started' || item.status === 'Department Assigned';

                    return (
                      <div
                        key={item.complaintId}
                        className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                      >
                        {/* Row 1: Number, Token, Status & Priority */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-indigo-400">
                              #{idx + 1}
                            </span>
                            <span className="font-mono text-xs font-black text-white">
                              {item.complaintId}
                            </span>
                            <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                              {item.category}
                            </span>
                            {item.cropType && (
                              <span className="rounded-full bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                Crop: {item.cropType}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                                item.priority === 'High'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : item.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}
                            >
                              {item.priority} Priority
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
                                isSolved
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : isOngoing
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}
                            >
                              {isSolved ? '● Solved' : isOngoing ? '● Ongoing' : '● Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Headline, Description & Location */}
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-black text-white">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                            <span>📍 <strong>Location:</strong> {item.location?.area || 'BM Road Area'} ({item.location?.ward || 'Ward 04'})</span>
                            <span>👤 <strong>Citizen:</strong> {item.citizenName || 'Concerned Citizen'} ({item.citizenPhone || '+91 98765 43210'})</span>
                            <span>🕒 <strong>Reported:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
                          </div>
                        </div>

                        {/* Row 3: Photo Proofs & Administrative Quick Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                          {/* Photo badges */}
                          <div className="flex items-center gap-2">
                            {item.imageUrl && (
                              <span className="flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2.5 py-1 rounded-xl">
                                <ImageIcon className="h-3.5 w-3.5" />
                                <span>Citizen Photo Attached</span>
                              </span>
                            )}
                            {item.resolvedImageUrl && (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded-xl font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Officer Work-Done Photo Verified</span>
                              </span>
                            )}
                          </div>

                          {/* Admin Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* View Full Dossier */}
                            <button
                              type="button"
                              onClick={() => setSelectedDossierComplaint(item)}
                              className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-400" />
                              <span>View Dossier & Photos</span>
                            </button>

                            {/* Expedite / Send Warning Notice */}
                            <button
                              type="button"
                              onClick={() => handleIssueNotice(item.complaintId, item.department)}
                              className="flex items-center gap-1 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 px-3 py-1.5 text-xs font-bold text-amber-300 transition"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>Issue Officer Notice</span>
                            </button>

                            {/* Mark Resolved Directly */}
                            {!isSolved && (
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateStatus(item.complaintId, 'Resolved', 'Marked resolved by Municipal Commissioner Executive Order.');
                                }}
                                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Admin Resolve</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>

        {/* ===================================================================== */}
        {/* MODAL: ADMIN FULL DOSSIER PREVIEW (CITIZEN & WORK DONE PHOTOS)         */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {selectedDossierComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDossierComplaint(null)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5"
              >
                <button
                  type="button"
                  onClick={() => setSelectedDossierComplaint(null)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                    Grievance Audit Dossier
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    #{selectedDossierComplaint.complaintId} — {selectedDossierComplaint.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Department</span>
                    <span className="font-bold text-white">{selectedDossierComplaint.department}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                    <span className="font-bold text-amber-400">{selectedDossierComplaint.status}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Citizen Name</span>
                    <span className="font-bold text-white">{selectedDossierComplaint.citizenName || 'Citizen'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Ward / Area</span>
                    <span className="font-bold text-white">{selectedDossierComplaint.location?.ward || 'Ward 04'}</span>
                  </div>
                </div>

                {/* Photos Grid: Citizen Attached vs Officer Completed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      📷 Citizen Photo Evidence:
                    </span>
                    {selectedDossierComplaint.imageUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center justify-center max-h-48">
                        <img
                          src={selectedDossierComplaint.imageUrl}
                          alt="Citizen Proof"
                          className="max-h-44 object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                        No photo attached by citizen
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      ✅ Officer Completed Work Done Photo:
                    </span>
                    {selectedDossierComplaint.resolvedImageUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-emerald-800/80 bg-slate-950 p-2 flex items-center justify-center max-h-48">
                        <img
                          src={selectedDossierComplaint.resolvedImageUrl}
                          alt="Work Done Proof"
                          className="max-h-44 object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-amber-900/40 p-6 text-center text-xs text-amber-500">
                        Work in progress / Completion photo not yet submitted by officer
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Audit Trail & Officer Timeline:
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {(selectedDossierComplaint.timeline || []).map((t, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 text-xs border border-slate-800">
                        <div className="flex justify-between font-bold text-white">
                          <span>{t.status}</span>
                          <span className="text-[10px] text-slate-500">
                            {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Recently'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedDossierComplaint(null)}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    Close Dossier
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 🚧 DEPARTMENT OFFICER OPERATIONAL DASHBOARD (Matching Sketch)
  // Header: Department dropdown, Notifications
  // Section 1: Complaints (1, 2, 3...) -> 1. Details -> [On Process] [Completed -> Share Image]
  // Section 2: Other complaints (1, 2, 3...) -> [Push to respective department]
  // =========================================================================
  if (isOfficerView) {
    return (
      <div className="dashboard-shell min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
        {/* Top Government Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

        {/* ------------------------------------------------------------------- */}
        {/* HEADER: "departments" & "Notifications" (Per Sketch)                 */}
        {/* ------------------------------------------------------------------- */}
        <header className="dashboard-panel sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            {/* Left: Department Logo & Department Selector */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold shadow-md shadow-indigo-500/25">
                <Landmark className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    JanSeva · Department Portal
                  </span>
                  <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Official Console
                  </span>
                </div>

                {/* Department Dropdown Selector from Sketch */}
                <div className="relative inline-block">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer pr-5 appearance-none hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                        Department: {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: Notifications & Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Button 1: Report Complaint */}
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">+ Report Grievance</span>
              </button>

              {/* Button 2: Quick Demo Data Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (complaints.length === 0) {
                    seedSampleComplaintsForDemo();
                  } else {
                    clearAllComplaints();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition shadow-sm"
                title="Click to toggle sample complaints across all 4 departments for demo preview"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span className="hidden sm:inline">{complaints.length === 0 ? '⚡ Load Demo Data' : 'Clear Data'}</span>
              </button>

              {/* Button 3: View Role Switcher */}
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/citizen')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm"
                >
                  Officer Console
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/admin')}
                  className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Admin Desk
                </button>
              </div>

              {/* Notifications Button from Sketch */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <BellRing className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                    {activeDeptComplaints.length}
                  </span>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Department Alerts</span>
                      <span className="text-[10px] text-slate-400">Live SLA Queue</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="py-2 text-xs space-y-0.5">
                          <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark / Light Mode Switcher */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>

              {/* Sign out */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------------- */}
        {/* MAIN BODY: DEPARTMENT OPERATIONAL VIEW (Per Sketch)                 */}
        {/* ------------------------------------------------------------------- */}
        <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-8">
          
          {/* ================================================================= */}
          {/* SECTION 1: COMPLAINTS (1, 2, 3...) & 1. DETAILS                   */}
          {/* ================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Complaints</span>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {activeDeptComplaints.length} Assigned
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Citizen grievances logged under {selectedDepartment}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  ● Work in Progress
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  ● Completed Proof
                </span>
              </div>
            </div>

            {/* Layout: Left Column (Numbered Complaints List 1, 2, 3...) | Right Column (Details Box) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: NUMBERED COMPLAINTS LIST (1., 2., 3...) */}
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Department Queue ({activeDeptComplaints.length})
                </span>

                {activeDeptComplaints.map((item, index) => {
                  const isSelected = activeSelectedComplaint?.complaintId === item.complaintId;
                  const isResolved = item.status === 'Resolved' || item.status === 'Completed';

                  return (
                    <div
                      key={item.complaintId}
                      onClick={() => setSelectedComplaintId(item.complaintId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black shrink-0">
                          {index + 1}
                        </span>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 truncate">
                              {item.complaintId}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.2 text-[9px] font-extrabold uppercase ${
                                isResolved
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span>📍 {item.location?.area || 'Ward Sector'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: 1. DETAILS BOX WITH ON PROCESS & COMPLETED (SHARE IMAGE) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-6 space-y-5">
                {activeSelectedComplaint ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          1. Details :
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          #{activeSelectedComplaint.complaintId}
                        </span>
                      </div>

                      <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-black text-red-600 dark:text-red-400 border border-red-500/20 uppercase">
                        {activeSelectedComplaint.priority} Priority
                      </span>
                    </div>

                    {/* Headline & Description */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {activeSelectedComplaint.title}
                      </h3>
                      <p className="mt-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {activeSelectedComplaint.description}
                      </p>
                    </div>

                    {/* Citizen & Location Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Complainant</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                          {activeSelectedComplaint.citizenName || 'Concerned Citizen'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {activeSelectedComplaint.citizenPhone || '+91 98450 11223'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                          {activeSelectedComplaint.location?.area || 'BM Road Area'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {activeSelectedComplaint.location?.ward || 'Ward 04'} · {activeSelectedComplaint.location?.city || 'Hassan'}
                        </span>
                      </div>
                    </div>

                    {/* Photo of issue */}
                    {activeSelectedComplaint.imageUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Attached Photo of Problem:
                        </span>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center p-2">
                          <img
                            src={activeSelectedComplaint.imageUrl}
                            alt="Problem Proof"
                            className="max-h-44 object-contain rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    {/* Work Done Photo Proof if Completed */}
                    {activeSelectedComplaint.resolvedImageUrl && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Work Completed & Photo Uploaded:</span>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-slate-950 max-h-48 flex items-center justify-center p-2">
                          <img
                            src={activeSelectedComplaint.resolvedImageUrl}
                            alt="Work Done Proof"
                            className="max-h-44 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {/* ACTION BUTTONS FROM SKETCH: [On Process] & [Completed] */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleMarkOnProcess(activeSelectedComplaint.complaintId)}
                        className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
                      >
                        <Clock className="h-4 w-4" />
                        <span>On Process (Work Started)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCompleteModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Completed (Share Image)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-12">Select a complaint from the queue.</p>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: OTHER COMPLAINTS (1, 2, 3...) & PUSH TO DEPARTMENT     */}
          {/* ================================================================= */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Other complaints</span>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {otherComplaints.length} Unclassified / Misrouted
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complaints filed without specific department tagging — Review and push to designated department
                </p>
              </div>
            </div>

            {/* Other Complaints Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherComplaints.map((item, idx) => (
                <div
                  key={item.complaintId}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-300 dark:bg-slate-800 text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">
                          {item.complaintId}
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                        {item.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span>📍 {item.location?.area || 'Central Area'}</span>
                    </div>
                  </div>

                  {/* PUSH TO RESPECTIVE DEPARTMENT BUTTON (From Sketch) */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetPushComplaint(item);
                        setIsPushModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Push to respective department</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ===================================================================== */}
        {/* MODAL: COMPLETED WORK (SHARE IMAGE OF WORK DONE)                       */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {isCompleteModalOpen && activeSelectedComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCompleteModalOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-colors space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Share Image of Work Done & Resolve
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Before completing Ticket #{activeSelectedComplaint.complaintId}, upload photo proof of the completed work.
                  </p>
                </div>

                {completionSuccess ? (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {completionSuccess}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        1. Upload Completed Work Photo Proof (Mandatory)
                      </label>

                      {workDoneImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 max-h-56 flex items-center justify-center">
                          <img src={workDoneImage} alt="Work done proof" className="max-h-52 object-contain rounded-xl" />
                          <button
                            type="button"
                            onClick={() => setWorkDoneImage(null)}
                            className="absolute top-3 right-3 rounded-full bg-red-600 p-1 text-white shadow-md hover:bg-red-700 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer bg-slate-50 dark:bg-slate-950/60 transition group">
                          <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition mb-2" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Click to capture / upload work completed photo
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or Camera Snapshot</span>
                          <input type="file" accept="image/*" onChange={handleWorkDoneFileUpload} className="hidden" />
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        2. Official Resolution Remarks
                      </label>
                      <textarea
                        rows={2}
                        value={workDoneRemarks}
                        onChange={(e) => setWorkDoneRemarks(e.target.value)}
                        placeholder="e.g. Bitumen asphalt laid across 30m stretch. Surface tested and leveled."
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsCompleteModalOpen(false)}
                        className="rounded-xl border border-slate-300 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmCompletion}
                        disabled={isSubmittingCompletion || !workDoneImage}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {isSubmittingCompletion ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>Confirm & Complete Ticket</span>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* MODAL: PUSH TO RESPECTIVE DEPARTMENT                                  */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {isPushModalOpen && targetPushComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPushModalOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-colors space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setIsPushModalOpen(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Push to Respective Department
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Transfer #{targetPushComplaint.complaintId} to designated municipal wing
                  </p>
                </div>

                {pushSuccessMsg ? (
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {pushSuccessMsg}
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {targetPushComplaint.title}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        📍 {targetPushComplaint.location?.area}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Select Target Department
                      </label>
                      <select
                        value={targetPushDept}
                        onChange={(e) => setTargetPushDept(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      >
                        {ALL_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPushModalOpen(false)}
                        className="rounded-xl border border-slate-300 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handlePushToDepartment}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Push to Department</span>
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

  // =========================================================================
  // VIEW 3: 👤 CITIZEN DASHBOARD (Matching Handwritten Wireframe)
  // Header: Citizen details & Profile
  // Left Column: Report complaint & Track GRIEVANCE buttons + District summary
  // Right Column: Recent complaints of the city
  // =========================================================================
  return (
    <div className="dashboard-shell min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      {/* Top Government Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

      {/* ------------------------------------------------------------------- */}
      {/* CITIZEN HEADER (Clean Single-Row Layout: Branding | Nav Items | Profile, Sun/Moon, Logout) */}
      {/* ------------------------------------------------------------------- */}
      <header className="dashboard-panel sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-3 flex-wrap">
          {/* Left: Branding & City Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold shadow-md shadow-blue-500/25">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  JanSeva · Citizen Portal
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {userCity} City Grievance Redressal
              </h1>
            </div>
          </div>

          {/* Center/Right Navigation Bar per Wireframe Sketch */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
            {/* Nav Item 1: Overview */}
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              Overview
            </button>

            {/* Nav Item 2: Complaints */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('overview');
                const el = document.getElementById('recent-complaints-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              Complaints
            </button>

            {/* Nav Item 3: Tracking ID */}
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-1"
            >
              <Search className="h-3.5 w-3.5 text-blue-500" />
              <span>Tracking ID</span>
            </button>

            {/* Nav Item 4: Emergency Helpline Number */}
            <a
              href="tel:18004252026"
              className="px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-1 shrink-0 font-extrabold"
              title="Toll-Free Emergency Grievance Helpline"
            >
              <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
              <span>Helpline: 1800-425-2026</span>
            </a>

            {/* Nav Item 5: Profile (Beside Helpline Number) */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="View Citizen Profile & Municipal Registration"
            >
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Profile</span>
            </button>

            {/* Nav Item 6: Sun/Moon Theme Switcher (Beside Helpline Number) */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Nav Item 7: Sign Out Symbol (Beside Helpline Number) */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* HIGH-VISIBILITY DIMMED RED SCROLLING ALERT TICKER LINE BELOW HEADER */}
      {/* ------------------------------------------------------------------- */}
      <div className="w-full bg-slate-950 dark:bg-slate-950/95 border-y border-red-500/40 py-2.5 px-4 shadow-lg flex items-center gap-3 overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-red-600 to-rose-700 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-red-600/30 z-20">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span>URGENT ALERTS</span>
        </div>

        <div className="overflow-hidden flex-1 relative flex items-center z-10">
          <div className="animate-marquee text-xs font-mono font-bold text-amber-300 dark:text-amber-200 tracking-wide">
            <span>🚨 HEAVY RAINFALL WARNING: Emergency response crews deployed for Ward 04 & Central Market sector &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
            <span>⚡ LIVE SLA MONITORING: All civic complaints automatically routed to designated Ward Engineers with 24-hr resolution tracking &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
            <span>📞 MUNICIPAL HELPLINE: Toll-free 24/7 hotline 1800-425-2026 active for emergency flood & power outage reports &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
            <span>🌾 AGRICULTURE ADVISORY: Coconut & Paddy crop fungal rot diagnostic advisory active for Hassan district farmers</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CITIZEN BODY: TWO COLUMN LAYOUT                                     */}
      {/* ------------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* ------------------------------------------------------------------- */}
        {/* TOP SECTION GRID: LEFT WELCOME CARD (7 cols) + RIGHT LIVE MAP (5 cols) */}
        {/* ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Welcome Card (Resized to 7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-7 text-white shadow-xl shadow-blue-500/10 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-blue-100 backdrop-blur-sm">
                  JanSeva Citizen Command Desk
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                Welcome back, {user?.name || 'Citizen'} 👋
              </h2>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Real-time multi-department issue detection, GPS geo-tagging, and 5-day SLA escalation monitoring across {userCity}.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-white/15 mt-4">
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs sm:text-sm font-black text-blue-700 hover:bg-blue-50 hover:shadow-lg active:scale-95 transition shrink-0 shadow-md"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Report New Grievance</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur-sm"
              >
                <Search className="h-4 w-4 text-blue-200" />
                <span>Track Token</span>
              </button>
            </div>
          </div>

          {/* Right: Live GPS Map Card (5 cols - in the leftover top space!) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl space-y-3 flex flex-col justify-between">
            
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 px-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-4 w-4 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📍 Live GPS Location Map</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Real-time Ward Jurisdiction GPS</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectLiveGPS}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-xl transition border border-blue-500/20"
                title="Detect Live Browser Geolocation"
              >
                <LocateFixed className="h-3 w-3" />
                <span>{isDetectingGPS ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>

            {/* Map View / Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 h-36 w-full shadow-inner group">
              <iframe
                title="Live Citizen Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${liveCoords.lng - 0.02},${liveCoords.lat - 0.02},${liveCoords.lng + 0.02},${liveCoords.lat + 0.02}&layer=mapnik&marker=${liveCoords.lat},${liveCoords.lng}`}
                className="w-full h-full opacity-90 group-hover:opacity-100 transition"
              />

              {/* Floating Address Overlay Badge */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md rounded-xl p-2 text-white text-[10px] border border-slate-700/80 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="font-bold truncate text-slate-200">{liveAddress || `${userCity} Ward 04, Central Ring Road`}</span>
                </div>
                <span className="font-mono text-[9px] text-amber-400 font-bold shrink-0 pl-1">
                  {liveCoords.lat.toFixed(4)}°N, {liveCoords.lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* Footer Info Pill */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-600 dark:text-slate-400">Jurisdiction: <strong className="text-slate-900 dark:text-white font-bold">{userCity} Municipal Corp</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" /> Active Geofence
              </span>
            </div>
          </div>
        </div>

        {/* Two Columns per Sketch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Actions & District Summary */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Top Action Cards: Report Complaint & Track Grievance */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/report')}
                className="w-full flex items-center justify-between rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-left text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-200 block">
                      AI Powered Grievance Filing
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Report complaint
                    </h3>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition" />
              </button>

              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="w-full flex items-center justify-between rounded-3xl border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-left hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg active:scale-[0.98] transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Live Token Verification
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Track GRIEVANCE
                    </h3>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* District Summary */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      📍 {userDistrict} District
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Local Jurisdiction Statistics</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">No. of complaints register</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Total logged in {userDistrict}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{districtComplaints.length}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">Solved</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Redressed & verified cases</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{solvedCount}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 font-bold">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">Ongoing</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">Assigned to field officers</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{ongoingCount}</span>
                </div>
              </div>
            </div>

            {/* Right Side Pin Location Widget per Sketch */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      📍 Pin Location & Live GPS
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Smart Ward Municipal Geofence</p>
                  </div>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Active Jurisdiction:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{userCity}, Ward 04</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Lat: 13.0042° N</span>
                  <span>Lng: 76.1018° E</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Geofence Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> Live Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Complaints of the City */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Recent complaints of the city</span>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      📍 {userCity}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Grievances filed by citizens in your locality & their live redressal state
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/report')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0 shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>File Issue</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {districtComplaints.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-8 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">No Public Grievances Logged in {userCity} Yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      The municipal queue is clear. Click "+ Report Complaint" to log a new issue or load demo grievances.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/report')}
                        className="rounded-2xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                      >
                        + Report Complaint
                      </button>
                      <button
                        type="button"
                        onClick={() => seedSampleComplaintsForDemo()}
                        className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>⚡ Load Demo Grievances</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  districtComplaints.map((item) => {
                    const isSolved = item.status === 'Resolved' || item.status === 'Completed';
                    const isOngoing = item.status === 'Work In Progress' || item.status === 'Work Started';

                    // 25% opacity background colors based on grievance status:
                    // Registered = Red (25% transparency)
                    // Ongoing = Yellow / Amber (25% transparency)
                    // Completed / Solved = Green (25% transparency)
                    const cardBgStyle = isSolved
                      ? 'bg-emerald-500/25 dark:bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-500/80 shadow-emerald-500/5'
                      : isOngoing
                      ? 'bg-amber-500/25 dark:bg-amber-950/40 border-amber-500/40 hover:border-amber-500/80 shadow-amber-500/5'
                      : 'bg-red-500/25 dark:bg-red-950/40 border-red-500/40 hover:border-red-500/80 shadow-red-500/5';

                    const statusPillStyle = isSolved
                      ? 'bg-emerald-600 text-white border-emerald-400/40'
                      : isOngoing
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300/40'
                      : 'bg-red-600 text-white border-red-400/40';

                    return (
                      <div
                        key={item.complaintId}
                        onClick={() => navigate(`/complaints/${item.complaintId}`)}
                        className={`rounded-2xl border p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group ${cardBgStyle}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                              {item.complaintId}
                            </span>
                            <span className="rounded-full bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              {item.category}
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${statusPillStyle}`}
                          >
                            {isSolved ? '● Solved' : isOngoing ? '● Ongoing' : '● Registered'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                          {item.title}
                        </h4>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-900/10 dark:border-white/10">
                          <span className="font-semibold">📍 {item.location?.area || 'Central Area'}</span>
                          <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            <span>Track Progress</span>
                            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Citizen Track Modal */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrackModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors space-y-4"
            >
              <button
                type="button"
                onClick={() => setIsTrackModalOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-base font-black text-slate-900 dark:text-white">Track Grievance Status</h3>
              <div className="relative">
                <input
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. SC-2026-000109)..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (trackingIdInput.trim()) {
                    navigate(`/complaints/${trackingIdInput.trim().toUpperCase()}`);
                  }
                }}
                className="w-full rounded-2xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Track Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
