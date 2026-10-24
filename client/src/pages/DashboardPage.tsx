import { useEffect, useMemo, useState, useRef, type FormEvent, type ChangeEvent } from 'react';
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
  Navigation,
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
import { WeatherWidget } from '../components/common/WeatherWidget';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { LocationMapCard } from '../components/common/LocationMapCard';
import { GoogleMapView } from '../components/common/GoogleMapView';
import { useLanguage } from '../context/LanguageContext';
import { FIXED_CITY_LOCATION, formatLocationFromCoordinates, getCurrentPositionAsync } from '../lib/geoHelper';
import { useDepartmentAlerts } from '../lib/alertsStore';

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
  const { t } = useLanguage();
  const { complaints, updateStatus, transferComplaint } = useComplaints();
  const { alerts, broadcastAlert } = useDepartmentAlerts();

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
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number }>(FIXED_CITY_LOCATION);
  const [liveAddress, setLiveAddress] = useState<string>(FIXED_CITY_LOCATION.address);
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [detectedDistrict, setDetectedDistrict] = useState<string>('');
  const [detectedState, setDetectedState] = useState<string>('');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [hasLiveLocation, setHasLiveLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleDetectLiveGPS = async () => {
    setIsDetectingGPS(true);
    setLocationError('');
    try {
      const pos = await getCurrentPositionAsync();
      setLiveCoords({ lat: pos.lat, lng: pos.lng });
      setHasLiveLocation(true);
      setLiveAddress(formatLocationFromCoordinates(pos.lat, pos.lng).fullAddress);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not update your location.');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      setIsDetectingGPS(true);
      try {
        const pos = await getCurrentPositionAsync();
        if (!isMounted) return;
        setLiveCoords({ lat: pos.lat, lng: pos.lng });
        setHasLiveLocation(true);
        if (!isMounted) return;
        setLiveAddress(formatLocationFromCoordinates(pos.lat, pos.lng).fullAddress);
      } catch (error) {
        if (isMounted) {
          setLocationError(error instanceof Error ? error.message : 'Could not detect your location.');
        }
      } finally {
        if (isMounted) setIsDetectingGPS(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Department Dashboard States (Per Sketch: Complaints, Details, Completed + Share Image, Other Complaints + Push)
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');

  // Completed Modal & Dual Photo Upload (Upload Photo vs Live Camera Snapshot)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [workDoneImage, setWorkDoneImage] = useState<string | null>(null);
  const [workDoneRemarks, setWorkDoneRemarks] = useState('');
  const [workDoneMediaMode, setWorkDoneMediaMode] = useState<'upload' | 'camera'>('upload');
  const [isWorkDoneCameraActive, setIsWorkDoneCameraActive] = useState(false);
  const [workDoneCameraError, setWorkDoneCameraError] = useState('');
  const workDoneVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState('');
  const [onProcessSuccessMsg, setOnProcessSuccessMsg] = useState('');

  const startWorkDoneCamera = async () => {
    setWorkDoneCameraError('');
    try {
      if (workDoneVideoRef.current && workDoneVideoRef.current.srcObject) {
        const stream = workDoneVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (workDoneVideoRef.current) {
        workDoneVideoRef.current.srcObject = stream;
        await workDoneVideoRef.current.play();
        setIsWorkDoneCameraActive(true);
      }
    } catch {
      setWorkDoneCameraError('Camera access denied or unavailable. Please use file upload option.');
      setIsWorkDoneCameraActive(false);
    }
  };

  const stopWorkDoneCamera = () => {
    if (workDoneVideoRef.current && workDoneVideoRef.current.srcObject) {
      const stream = workDoneVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      workDoneVideoRef.current.srcObject = null;
    }
    setIsWorkDoneCameraActive(false);
  };

  useEffect(() => {
    if (isCompleteModalOpen && workDoneMediaMode === 'camera') {
      void startWorkDoneCamera();
    } else {
      stopWorkDoneCamera();
    }
    return () => {
      stopWorkDoneCamera();
    };
  }, [isCompleteModalOpen, workDoneMediaMode]);

  const snapWorkDonePhoto = () => {
    if (!workDoneVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = workDoneVideoRef.current.videoWidth || 640;
    canvas.height = workDoneVideoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(workDoneVideoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setWorkDoneImage(dataUrl);
      stopWorkDoneCamera();
      setWorkDoneMediaMode('upload');
    }
  };

  // Push to Respective Department State
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [targetPushDept, setTargetPushDept] = useState<string>('Municipal Corporation');
  const [targetPushComplaint, setTargetPushComplaint] = useState<ComplaintRecord | null>(null);
  const [pushSuccessMsg, setPushSuccessMsg] = useState('');

  // Broadcast Department Alert Modal State (Allows every department to share alert messages to citizens)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [newAlertDept, setNewAlertDept] = useState<string>(selectedDepartment || 'Public Works Department (PWD)');
  const [newAlertIcon, setNewAlertIcon] = useState<string>('🚨');
  const [newAlertCategory, setNewAlertCategory] = useState<'warning' | 'emergency' | 'advisory' | 'info'>('warning');
  const [newAlertMessage, setNewAlertMessage] = useState<string>('');
  const [alertPostSuccess, setAlertPostSuccess] = useState<string>('');

  const handlePostDepartmentAlert = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newAlertMessage.trim()) return;

    broadcastAlert({
      department: newAlertDept,
      icon: newAlertIcon,
      category: newAlertCategory,
      message: newAlertMessage.trim(),
      postedBy: `${newAlertDept} Officer`,
    });

    setAlertPostSuccess(`🚨 Alert broadcasted to all citizens live under header marquee!`);
    setTimeout(() => {
      setIsAlertModalOpen(false);
      setAlertPostSuccess('');
      setNewAlertMessage('');
    }, 1500);
  };

  // Profile Modal State & My Complaints Filtering
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'complaints'>('profile');

  const myComplaints = useMemo(() => {
    if (!user) return complaints;
    const filtered = complaints.filter(
      (c) =>
        (user.email && c.citizenEmail === user.email) ||
        (user.phone && c.citizenPhone === user.phone) ||
        (user.name && c.citizenName === user.name)
    );
    return filtered.length > 0 ? filtered : complaints;
  }, [complaints, user]);

  // Notifications State (Dynamic based on real complaints)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifications = useMemo(() => {
    if (complaints.length === 0) {
      return [
        { id: 1, text: '🟢 All teams ready. Tracking complaints in real-time.', time: 'Just now', unread: false },
      ];
    }
    return complaints.slice(0, 3).map((c, i) => ({
      id: i + 1,
      text: `${c.priority === 'High' ? '🚨' : '📋'} ${c.department}: #${c.complaintId} - ${c.title}`,
      time: 'Live',
      unread: c.status !== 'Resolved' && c.status !== 'Completed',
    }));
  }, [complaints]);

  // Citizen location info (live detected GPS location takes priority over registered profile)
  const userDistrict = useMemo(() => detectedDistrict || user?.district || user?.city || 'Hassan', [detectedDistrict, user]);
  const userCity = useMemo(() => detectedCity || user?.city || user?.district || 'Hassan', [detectedCity, user]);
  const userState = useMemo(() => detectedState || user?.state || 'Karnataka', [detectedState, user]);

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
      null
    );
  }, [activeDeptComplaints, selectedComplaintId]);

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
    await updateStatus(complaintId, 'Work Started', '⚡ Field team dispatched. Work is now underway (Work Started).');
    setOnProcessSuccessMsg(`⚡ Status updated to Work Started (In Progress) for ticket #${complaintId}!`);
    setTimeout(() => setOnProcessSuccessMsg(''), 4000);
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
      alert('Please upload or snap a photo of the completed work before closing this ticket.');
      return;
    }

    if (!activeSelectedComplaint) return;

    setIsSubmittingCompletion(true);
    await updateStatus(
      activeSelectedComplaint.complaintId,
      'Completed',
      `✅ Work is Completed & verified by Ward Officer. Proof photo uploaded: "${workDoneRemarks || 'Repair executed according to municipal standard.'}"`,
      workDoneImage,
      workDoneRemarks
    );

    setIsSubmittingCompletion(false);
    setCompletionSuccess(`🎉 Work is Completed! Ticket #${activeSelectedComplaint.complaintId} marked as COMPLETED & RESOLVED.`);
    setTimeout(() => {
      setIsCompleteModalOpen(false);
      setCompletionSuccess('');
      setWorkDoneImage(null);
      setWorkDoneRemarks('');
      stopWorkDoneCamera();
    }, 1500);
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
    setAdminNoticeSuccess(`Official notice sent to ${deptName} about ticket #${complaintId}.`);
    setTimeout(() => setAdminNoticeSuccess(''), 3000);
  };

  // =========================================================================
  // VIEW 1: 🏛️ ADMINISTRATION / MUNICIPAL COMMISSIONER COMMAND CENTER
  // Shows all 4 department boxes first; clicking one shows all complaints for that department
  // =========================================================================
  if (isAdminView) {
    const activeAdminDeptMeta = DEPARTMENT_METADATA.find((d) => d.id === selectedAdminDept);

    return (
      <div className={`dashboard-shell admin-dashboard min-h-screen w-full bg-slate-950 text-slate-100 font-sans pb-16 transition-colors duration-300 ${darkMode ? 'admin-dashboard-dark' : 'admin-dashboard-light'}`}>
        {/* Top Government Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

        {/* ------------------------------------------------------------------- */}
        {/* ADMIN HEADER                                                        */}
        {/* ------------------------------------------------------------------- */}
        <header className="dashboard-panel sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl transition-colors">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between sm:px-6 lg:px-8">
            {/* Left: Administration Branding */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/25">
                <Landmark className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Municipal administration
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-400 border border-emerald-500/20">
                    City overview
                  </span>
                </div>
                <h1 className="truncate text-sm font-semibold text-white sm:text-base">
                  Operations dashboard
                </h1>
              </div>
            </div>

            {/* Right: Department Filter Tabs + Theme + Notifications + Sign Out */}
            <div className="grid grid-cols-4 items-center gap-2 lg:flex lg:flex-nowrap lg:justify-end lg:gap-2">
              <div className="col-span-2 justify-self-start lg:col-span-1">
                <LanguageSwitcher variant={darkMode ? 'dark' : 'light'} />
              </div>
              {/* Button 1: Report Complaint */}
              <button
                type="button"
                onClick={() => navigate('/report')}
                aria-label={t('admin.report')}
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg bg-blue-600 p-0 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 lg:h-auto lg:w-auto lg:gap-1.5 lg:rounded-xl lg:px-3 lg:py-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{t('admin.report')}</span>
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-0 text-xs font-bold text-indigo-400 shadow-sm transition hover:bg-indigo-500/20 lg:h-auto lg:w-auto lg:gap-1.5 lg:rounded-xl lg:px-3 lg:py-1.5"
                title="Click to toggle sample complaints across all 4 departments for demo preview"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span className="hidden lg:inline">{complaints.length === 0 ? '⚡ Load Demo Data' : 'Clear Data'}</span>
              </button>

              {/* Button 3: View Role Switcher */}
              <div className="hidden xl:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold">
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
                  aria-label="Open administration alerts"
                  className="flex h-9 w-9 items-center justify-center justify-self-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-0 text-xs font-bold text-slate-200 transition hover:bg-slate-800 lg:h-auto lg:w-auto lg:rounded-xl lg:px-3 lg:py-1.5"
                >
                  <BellRing className="h-4 w-4 text-amber-500" />
                  <span className="hidden lg:inline">Alerts</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                    {complaints.length}
                  </span>
                </button>

                {isNotificationsOpen && (
                  <div className="fixed inset-x-3 bottom-4 z-[60] max-h-[60dvh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl animate-in fade-in duration-150 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(70vh,32rem)] sm:w-80">
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-red-900/40 bg-red-950/30 text-red-400 transition hover:bg-red-900/50"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Department Switcher Strip */}
          <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-2 sm:px-6 lg:px-8 overflow-x-auto">
            <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Departments
              </span>

              <button
                type="button"
                onClick={() => setSelectedAdminDept('all')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition shrink-0 ${
                  selectedAdminDept === 'all'
                    ?                     'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>All departments</span>
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
          
          <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-900/70 px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-300">City operations · Hassan</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Department performance</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Review incoming reports, monitor field progress, and compare resolution across municipal teams.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300 sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live complaint data
              </div>
            </div>
          </section>

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
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total complaints
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{totalCityComplaints}</span>
                <span className="text-[10px] text-slate-400">Across 4 Departments</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                In progress
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{ongoingCityCount}</span>
                <span className="text-[10px] text-amber-500/80">Active Field Crews</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-4">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Resolved
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">{solvedCityCount}</span>
                <span className="text-[10px] text-emerald-500/80">Verified Repairs</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-4">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">
                Awaiting action
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-400">{pendingCityCount}</span>
                <span className="text-[10px] text-blue-500/80">Awaiting Dispatch</span>
              </div>
            </div>

            <div className="col-span-2 xl:col-span-1 rounded-2xl border border-indigo-900/30 bg-indigo-950/20 p-4">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                Resolution rate
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
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>Departments</span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                      4 Departments Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a department to review its complaint queue and resolution performance.
                  </p>
                </div>
              </div>

              {/* 4 Rich Department Boxes Grid */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {adminDeptMetrics.map((dept) => (
                  <motion.div
                    key={dept.id}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm space-y-4 hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer group"
                    onClick={() => setSelectedAdminDept(dept.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-xl">
                          {dept.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                          Department
                          </span>
                          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                            {dept.id}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-emerald-400 block">
                          {dept.resolutionRate}%
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Resolved</span>
                      </div>
                    </div>

                    {/* Officer & Jurisdiction Info */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
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
                        Handles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dept.subAreas.map((area, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-400"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Complaints Metrics Strip (Total, Ongoing, Solved, Pending) */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
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
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900/80 text-[11px] text-slate-400">
                            <div className="flex flex-wrap items-center gap-4">
                              <span>📍 <strong>Location:</strong> {item.location?.area || 'BM Road Area'} ({item.location?.ward || 'Ward 04'})</span>
                              <span>👤 <strong>Citizen:</strong> {item.citizenName || 'Concerned Citizen'} ({item.citizenPhone || '+91 98765 43210'})</span>
                              <span>🕒 <strong>Reported:</strong> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
                            </div>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${item.location?.coordinates?.lat || FIXED_CITY_LOCATION.lat},${item.location?.coordinates?.lng || FIXED_CITY_LOCATION.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-blue-600/90 hover:bg-blue-600 text-white shadow-sm transition shrink-0"
                              title="Navigate to issue location via Google Maps"
                            >
                              <Navigation className="h-3 w-3" />
                              <span>Navigate GPS</span>
                            </a>
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
                                <span>Team Completed & Verified Work</span>
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
    const departmentResolvedCount = activeDeptComplaints.filter((item) =>
      ['Resolved', 'Completed', 'Citizen Verified'].includes(item.status)
    ).length;
    const departmentInProgressCount = activeDeptComplaints.filter((item) =>
      ['Work In Progress', 'Work Started'].includes(item.status)
    ).length;
    const departmentPendingCount = activeDeptComplaints.filter((item) =>
      ['Pending', 'Submitted', 'ML Classified', 'Department Assigned', 'Officer Assigned'].includes(item.status)
    ).length;
    const departmentHighPriorityCount = activeDeptComplaints.filter((item) =>
      item.priority === 'High' && !['Resolved', 'Completed', 'Citizen Verified'].includes(item.status)
    ).length;

    return (
      <div className="dashboard-shell min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
        {/* Top Government Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

        {/* ------------------------------------------------------------------- */}
        {/* HEADER: "departments" & "Notifications" (Per Sketch)                 */}
        {/* ------------------------------------------------------------------- */}
        <header className="dashboard-panel sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 xl:flex-row xl:items-center xl:justify-between sm:px-6 lg:px-8">
            {/* Left: Department Logo & Department Selector */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold shadow-md shadow-indigo-500/25">
                <Landmark className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 sm:inline">
                    JanSeva · Department services
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Staff portal
                  </span>
                </div>

                {/* Department Dropdown Selector from Sketch */}
                <div className="relative inline-block">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="max-w-[min(68vw,26rem)] truncate text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none cursor-pointer pr-5 appearance-none hover:text-indigo-600 dark:hover:text-indigo-400 transition sm:max-w-[min(58vw,26rem)] sm:text-base"
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
            <div className="grid grid-cols-4 items-center gap-2 xl:flex xl:flex-nowrap xl:justify-end xl:gap-2">
              <div className="col-span-2 justify-self-start xl:col-span-1">
                <LanguageSwitcher variant={darkMode ? 'dark' : 'light'} />
              </div>
              {/* Button 1: Report Complaint */}
              <button
                type="button"
                onClick={() => navigate('/report')}
                aria-label={t('admin.report')}
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg bg-blue-600 p-0 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 xl:h-auto xl:w-auto xl:gap-1.5 xl:rounded-xl xl:px-3 xl:py-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('admin.report')}</span>
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-0 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-500/20 dark:text-indigo-400 xl:h-auto xl:w-auto xl:gap-1.5 xl:rounded-xl xl:px-3 xl:py-1.5"
                title="Click to toggle sample complaints across all 4 departments for demo preview"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span className="hidden xl:inline">{complaints.length === 0 ? '⚡ Load Demo Data' : 'Clear Data'}</span>
              </button>

              {/* Broadcast Emergency Department Alert Message Button */}
              <button
                type="button"
                onClick={() => {
                  setNewAlertDept(selectedDepartment || 'Public Works Department (PWD)');
                  setIsAlertModalOpen(true);
                }}
                aria-label="Broadcast department alert"
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-orange-500/40 bg-orange-500/10 p-0 text-xs font-black text-orange-600 shadow-sm transition hover:bg-orange-500/20 dark:text-orange-400 xl:h-auto xl:w-auto xl:gap-1.5 xl:rounded-xl xl:px-3.5 xl:py-1.5"
                title="Publish real-time alert message visible to all citizens under header marquee"
              >
                <Bell className="h-3.5 w-3.5 text-orange-500" />
                <span className="hidden xl:inline">+ Broadcast Alert</span>
              </button>

              {/* Button 3: View Role Switcher */}
              <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 text-xs font-bold">
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
                  aria-label="Open department notifications"
                  className="flex h-9 w-9 items-center justify-center justify-self-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 p-0 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 xl:h-auto xl:w-auto xl:rounded-xl xl:px-3 xl:py-1.5"
                >
                  <BellRing className="h-4 w-4 text-amber-500" />
                  <span className="hidden xl:inline">Notifications</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                    {activeDeptComplaints.length}
                  </span>
                </button>

                {isNotificationsOpen && (
                  <div className="fixed inset-x-3 bottom-4 z-[60] max-h-[60dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in duration-150 dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(70vh,32rem)] sm:w-80">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Department Alerts</span>
                      <span className="text-[10px] text-slate-400">Queue</span>
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
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
        <main className="mx-auto max-w-7xl space-y-5 px-4 pt-6 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-300">Department workspace</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Service queue</h1>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{selectedDepartment} · Hassan district</p>
              </div>
              <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Queue updates as complaints are filed
              </p>
            </div>
          </section>

          <section aria-label="Department complaint summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Assigned', value: activeDeptComplaints.length, color: 'text-slate-900 dark:text-white', accent: 'bg-slate-400' },
              { label: 'Awaiting action', value: departmentPendingCount, color: 'text-blue-700 dark:text-blue-300', accent: 'bg-blue-500' },
              { label: 'In progress', value: departmentInProgressCount, color: 'text-amber-700 dark:text-amber-300', accent: 'bg-amber-500' },
              { label: 'High priority', value: departmentHighPriorityCount, color: 'text-rose-700 dark:text-rose-300', accent: 'bg-rose-500' },
            ].map((metric) => (
              <div key={metric.label} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className={`absolute inset-y-0 left-0 w-1 ${metric.accent}`} />
                <p className="pl-1 text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                <p className={`mt-2 pl-1 text-2xl font-semibold tabular-nums ${metric.color}`}>{metric.value}</p>
              </div>
            ))}
          </section>

          {/* ================================================================= */}
          {/* SECTION 1: COMPLAINTS (1, 2, 3...) & 1. DETAILS                   */}
          {/* ================================================================= */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Complaint queue</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {activeDeptComplaints.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Review new reports and update field-work progress.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
                  In progress · {departmentInProgressCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/20">
                  Resolved · {departmentResolvedCount}
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
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-5 space-y-5">
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

                    {/* Citizen Complainant Info */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Complainant Contact</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                        👤 {activeSelectedComplaint.citizenName || 'Concerned Citizen'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        📞 {activeSelectedComplaint.citizenPhone || '+91 98450 11223'}
                      </span>
                    </div>

                    {/* Department Interactive Location & Google Maps Navigation */}
                    <LocationMapCard
                      location={activeSelectedComplaint.location}
                      title="Department Crew Live GPS Navigation Target"
                      showEmbedMap={true}
                    />

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
                    {onProcessSuccessMsg && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 animate-bounce">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{onProcessSuccessMsg}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleMarkOnProcess(activeSelectedComplaint.complaintId)}
                        className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition shadow-sm ${
                          activeSelectedComplaint.status === 'Work Started' || activeSelectedComplaint.status === 'Work In Progress'
                            ? 'bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>
                          {activeSelectedComplaint.status === 'Work Started' || activeSelectedComplaint.status === 'Work In Progress'
                            ? '⚡ Work Started (In Progress)'
                            : 'On Process (Start Work)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCompleteModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-extrabold text-white transition shadow-sm"
                      >
                        <Check className="h-4 w-4" />
                        <span>Completed (Share Image)</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {activeDeptComplaints.length ? 'Choose a complaint to review' : 'No complaints in this queue'}
                    </p>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {activeDeptComplaints.length
                        ? 'The report details, location, and available actions will appear here.'
                        : `New reports assigned to ${selectedDepartment} will appear here.`}
                    </p>
                  </div>
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
                        1. Attach Completed Work Photo Proof (Mandatory)
                      </label>

                      {/* Dual Option Selectors: Upload Photo vs Live Photo from Camera */}
                      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setWorkDoneMediaMode('upload');
                            stopWorkDoneCamera();
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition ${
                            workDoneMediaMode === 'upload'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>📁 Upload Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWorkDoneMediaMode('camera')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition ${
                            workDoneMediaMode === 'camera'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>📸 Live Camera Snapshot</span>
                        </button>
                      </div>

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
                      ) : workDoneMediaMode === 'camera' ? (
                        <div className="space-y-2">
                          <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                            <video ref={workDoneVideoRef} playsInline className="w-full h-full object-cover" />
                            {workDoneCameraError && (
                              <p className="absolute text-xs text-red-400 p-3 bg-slate-950/90 rounded-xl text-center">
                                {workDoneCameraError}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={snapWorkDonePhoto}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition shadow-md shadow-emerald-600/25"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Capture Photo Now</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer bg-slate-50 dark:bg-slate-950/60 transition group">
                          <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition mb-2" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Click to browse / upload work completed photo
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG file from device</span>
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

        {/* ===================================================================== */}
        {/* MODAL: BROADCAST DEPARTMENT EMERGENCY ALERT TO CITIZENS                */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {isAlertModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAlertModalOpen(false)}
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
                  onClick={() => setIsAlertModalOpen(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 font-bold shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Broadcast Department Alert Message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Publish live ticker alert visible to all citizens below header bar
                    </p>
                  </div>
                </div>

                {alertPostSuccess ? (
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-4 text-center text-xs font-bold text-orange-600 dark:text-orange-400 animate-pulse">
                    {alertPostSuccess}
                  </div>
                ) : (
                  <form onSubmit={handlePostDepartmentAlert} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        value={newAlertDept}
                        onChange={(e) => setNewAlertDept(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                      >
                        {ALL_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Alert Badge Icon
                        </label>
                        <select
                          value={newAlertIcon}
                          onChange={(e) => setNewAlertIcon(e.target.value)}
                          className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                          <option value="🚨">🚨 Emergency Warning</option>
                          <option value="⚡">⚡ Active Outage / Repair</option>
                          <option value="📞">📞 Hotline Advisory</option>
                          <option value="🌾">🌾 Agriculture Advisory</option>
                          <option value="📢">📢 General Announcement</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Severity Level
                        </label>
                        <select
                          value={newAlertCategory}
                          onChange={(e) => setNewAlertCategory(e.target.value as any)}
                          className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                          <option value="warning">High Priority Warning</option>
                          <option value="emergency">Critical Emergency</option>
                          <option value="advisory">Public Advisory</option>
                          <option value="info">Information</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Alert Message Text (Mandatory)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newAlertMessage}
                        onChange={(e) => setNewAlertMessage(e.target.value)}
                        placeholder="e.g. Water pipeline maintenance on Ring Road. Supply paused till 4 PM."
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAlertModalOpen(false)}
                        className="rounded-xl border border-slate-300 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2 text-xs font-bold text-white transition shadow-md shadow-orange-600/25"
                      >
                        <Bell className="h-4 w-4" />
                        <span>Broadcast Alert to Citizens</span>
                      </button>
                    </div>
                  </form>
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
    <div className="dashboard-shell min-h-screen w-full bg-[#eef1f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      {/* Top Government Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-white to-emerald-600" />

      {/* ------------------------------------------------------------------- */}
      {/* CITIZEN HEADER (Clean Single-Row Layout: Branding | Nav Items | Profile, Sun/Moon, Logout) */}
      {/* ------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#102b45] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Branding & City Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shrink-0">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-300">
                      JanSeva · Citizen Portal
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 live-dot" />
              </div>
              <h1 className="text-sm sm:text-[15px] font-semibold text-white leading-tight">
                {t('brand.cityGrievance', { city: detectedCity || userCity })}
              </h1>
            </div>
          </div>

          {/* Center/Right Navigation Bar per Wireframe Sketch */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`nav-chip px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                  activeTab === 'overview'
                    ? 'bg-white text-[#102b45] shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {t('nav.overview')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  const el = document.getElementById('recent-complaints-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="nav-chip px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                {t('nav.complaints')}
              </button>

              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="nav-chip px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5 text-orange-300" />
                <span>{t('nav.trackingId')}</span>
              </button>
            </div>

            <a
              href="tel:18004252026"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 shrink-0"
              title="Toll-Free Emergency Grievance Helpline"
            >
              <PhoneCall className="h-3.5 w-3.5 text-amber-300" />
              <span>{t('nav.helpline')}</span>
            </a>

            {/* Prominent Multi-Language Switcher (EN / ಕನ್ನಡ) */}
            <LanguageSwitcher variant="dark" />

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              title="View Citizen Profile & Municipal Registration"
            >
              <User className="h-3.5 w-3.5 text-orange-300" />
              <span>{t('nav.profile')}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-slate-200" />}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:border-red-300/30 hover:bg-red-500/15 hover:text-red-200"
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
      <div className="flex w-full items-center gap-3 overflow-hidden border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="z-20 flex shrink-0 items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
          <span>{t('alerts')}</span>
        </div>

        <div className="overflow-hidden flex-1 relative flex items-center z-10">
          <div className="animate-marquee flex items-center gap-6 text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-6 shrink-0">
              {alerts.map((alt) => (
                <span key={`ticker-1-${alt.id}`} className="flex items-center gap-2">
                  <span>
                    {alt.icon || '•'} <strong className="text-amber-700 dark:text-amber-300">[{alt.department.split(' ')[0]}]:</strong> {alt.message}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6 shrink-0">
              {alerts.map((alt) => (
                <span key={`ticker-2-${alt.id}`} className="flex items-center gap-2">
                  <span>
                    {alt.icon || '•'} <strong className="text-amber-700 dark:text-amber-300">[{alt.department.split(' ')[0]}]:</strong> {alt.message}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CITIZEN BODY: TWO COLUMN LAYOUT                                     */}
      {/* ------------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* ------------------------------------------------------------------- */}
        {/* STANDALONE WELCOME BOX & STANDALONE WEATHER BOX (OUTSIDE SIDE-BY-SIDE) */}
        {/* ------------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col items-stretch gap-5 lg:flex-row"
        >
          {/* Left: Standalone Welcome Box */}
          <div className="flex-1 min-w-0">
            <div className="hero-shell flex h-full flex-col justify-center px-5 py-6 sm:px-7 sm:py-7">
              <div className="hero-content flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="hero-brand text-[10px] font-semibold uppercase">
                      {t('brand.portal')}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {t('hero.welcomeBack')}
                    </p>
                    <h2 className="hero-title">
                      {user?.name || t('citizen')}
                    </h2>
                  </div>

                  <p className="hero-subtext">
                    {t('hero.body')}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/report')}
                      className="hero-cta-primary"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{t('hero.report')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTrackModalOpen(true)}
                      className="hero-cta-secondary"
                    >
                      <Search className="h-4 w-4 text-slate-500" />
                      <span>{t('hero.trackToken')}</span>
                    </button>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col items-end sm:w-[270px] lg:w-[290px]">
                  <div className="map-panel relative group w-full h-[180px] sm:h-[195px] lg:h-[210px]">
                    <GoogleMapView
                      center={liveCoords}
                      markerTitle="Your current location"
                      className="h-full w-full"
                    />

                    <div className="map-badge">
                      <span className={`h-1.5 w-1.5 rounded-full ${hasLiveLocation ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>{hasLiveLocation ? t('map.live') : isDetectingGPS ? t('map.detecting') : 'Location unavailable'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLiveGPS}
                      className="map-button"
                      title="Detect Current Location"
                    >
                      <LocateFixed className="h-3 w-3 text-sky-300" />
                      <span>{isDetectingGPS ? t('map.detecting') : t('map.detect')}</span>
                    </button>
                  </div>
                  {locationError && (
                    <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
                      {locationError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Standalone Live Weather (Top) & Yellow Help Desk (Bottom) Card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
            className="flex w-full shrink-0 flex-col justify-stretch lg:w-[320px]"
          >
            <WeatherWidget
              lat={liveCoords.lat}
              lng={liveCoords.lng}
              onLocationUpdate={() => {
                setLiveCoords(FIXED_CITY_LOCATION);
                setLiveAddress(FIXED_CITY_LOCATION.address);
                setHasLiveLocation(true);
                setLocationError('');
              }}
            />
          </motion.div>
        </motion.div>

        {/* Two Columns per Sketch */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
          className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12"
        >
          
          {/* Left Column: Actions & District Summary */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* District Summary */}
            <div className="glass-card space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t('district.title', { district: userDistrict })}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('district.sub')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="stat-row flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t('district.registered')}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('district.logged', { district: userDistrict })}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{districtComplaints.length}</span>
                </div>

                <div className="stat-row flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">{t('district.solved')}</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">{t('district.solvedSub')}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{solvedCount}</span>
                </div>

                <div className="stat-row flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 font-bold">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">{t('district.ongoing')}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">{t('district.ongoingSub')}</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{ongoingCount}</span>
                </div>
              </div>
            </div>

            {/* Right Side Pin Location Widget per Sketch */}
            <div className="glass-card space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      📍 {t('gps.title')}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('gps.sub')}</p>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">{t('gps.jurisdiction')}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-right truncate max-w-[200px]" title={liveAddress}>{liveAddress}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Lat: {liveCoords.lat.toFixed(4)}° {liveCoords.lat >= 0 ? 'N' : 'S'}</span>
                  <span>Lng: {liveCoords.lng.toFixed(4)}° {liveCoords.lng >= 0 ? 'E' : 'W'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{t('gps.geofence')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Radio className="h-3 w-3 animate-pulse" /> {isDetectingGPS ? 'Detecting GPS...' : t('gps.live')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Complaints of the City */}
          <div className="lg:col-span-7 space-y-4">
            <div id="recent-complaints-section" className="glass-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
                    <span>{t('recent.title')}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <MapPin className="h-3 w-3" />
                      {userCity}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('recent.sub')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/report')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0 shadow-sm shadow-blue-500/20"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>{t('recent.fileIssue')}</span>
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
                      ? 'border-slate-200 border-l-emerald-500 dark:border-slate-700 dark:border-l-emerald-500'
                      : isOngoing
                      ? 'border-slate-200 border-l-amber-500 dark:border-slate-700 dark:border-l-amber-400'
                      : 'border-slate-200 border-l-rose-500 dark:border-slate-700 dark:border-l-rose-400';

                    const statusPillStyle = isSolved
                      ? 'bg-emerald-600 text-white border-emerald-400/40 font-black'
                      : isOngoing
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300/40'
                      : 'bg-red-600 text-white border-red-400/40 font-black';

                    // Image display logic per user instruction:
                    // If Solved -> show solved work photo proof (or fallback solved image)
                    // If Ongoing / Registered -> show citizen uploaded problem photo (or fallback problem image)
                    const displayImage = isSolved
                      ? (item.resolvedImageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80')
                      : (item.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=200&auto=format&fit=crop&q=80');

                    const imageBadgeText = isSolved ? '✅ Solved' : '📷 Problem';

                    return (
                      <div
                        key={item.complaintId}
                        onClick={() => navigate(`/complaints/${item.complaintId}`)}
                        className={`complaint-row group cursor-pointer rounded-xl border border-l-4 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${cardBgStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          
                          {/* Image Thumbnail inside the box */}
                          <div                           className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm sm:h-16 sm:w-16 dark:border-slate-700 dark:bg-slate-800">
                            <img
                              src={displayImage}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[8px] font-black text-white text-center py-0.5 px-0.5 truncate">
                              {imageBadgeText}
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                                  {item.complaintId}
                                </span>
                                <span className="rounded-full bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 truncate max-w-[140px]">
                                  {item.category}
                                </span>
                              </div>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border shadow-sm shrink-0 ${statusPillStyle}`}
                              >
                                {isSolved ? '● Solved' : isOngoing ? '● Ongoing' : '● Registered'}
                              </span>
                            </div>

                            <h4 className="line-clamp-2 text-xs font-semibold leading-5 text-slate-900 transition group-hover:text-blue-700 sm:text-sm dark:text-white dark:group-hover:text-blue-300">
                              {item.title}
                            </h4>

                            <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-900/10 dark:border-white/10">
                              <span className="font-semibold truncate">📍 {item.location?.area || 'Central Area'}</span>
                              <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition shrink-0">
                                <span>{t('track.progress')}</span>
                                <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </motion.div>
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

              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('track.title')}</h3>
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

      {/* Citizen Profile & My Complaints Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-colors space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white font-black text-xl shadow-md shadow-orange-500/25 shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {user?.name || 'Registered Citizen'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || 'citizen@smartcity.gov.in'}
                  </p>
                </div>
              </div>

              {/* Dual Tab Toggle: My Profile Details vs My Complaints */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('profile')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition ${
                    profileActiveTab === 'profile'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Registration Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileActiveTab('complaints')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition ${
                    profileActiveTab === 'complaints'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>My Complaints ({myComplaints.length})</span>
                </button>
              </div>

              {/* TAB 1: REGISTRATION DETAILS */}
              {profileActiveTab === 'profile' && (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      Verified Citizen Account Details
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Full Name</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{user?.name || 'Concerned Citizen'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Mobile Phone</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{user?.phone || '+91 98765 43210'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Email Address</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{user?.email || 'citizen@smartcity.gov.in'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Portal Role</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Verified Citizen</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Current Location</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{detectedCity || userCity}, {detectedDistrict || userDistrict}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Member Status</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">Active Registered Citizen</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileActiveTab('complaints')}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>View My Submitted Complaints</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 px-3.5 py-2 font-bold text-xs transition border border-red-500/20"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MY COMPLAINTS & COMPLAINT IDS */}
              {profileActiveTab === 'complaints' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Grievances Logged By You ({myComplaints.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        navigate('/report');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>File New Complaint</span>
                    </button>
                  </div>

                  {myComplaints.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-2">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No complaints registered yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          navigate('/report');
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        Lodge Grievance Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {myComplaints.map((item) => {
                        const isSolved = item.status === 'Resolved' || item.status === 'Completed' || item.status === 'Citizen Verified';
                        const isOngoing = item.status === 'Work In Progress' || item.status === 'Work Started' || item.status === 'Department Assigned';

                        const badgeStyle = isSolved
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isOngoing
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';

                        return (
                          <div
                            key={item.complaintId}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 space-y-2 hover:border-blue-500 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                  Ticket #{item.complaintId}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {item.category}
                                </span>
                              </div>

                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                                {isSolved ? '● Completed' : isOngoing ? '● Work Started' : '● Registered'}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </h4>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
                              <span>📍 {item.location?.area || 'Local Area'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsProfileModalOpen(false);
                                  navigate(`/complaints/${item.complaintId}`);
                                }}
                                className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>Track Live SLA</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
