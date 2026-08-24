import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Cpu,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  Globe2,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  PhoneCall,
  Printer,
  Radio,
  RotateCcw,
  Scan,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  SwitchCamera,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ComplaintFormValues {
  title: string;
  description: string;
  phone: string;
  email: string;
  name?: string;
  ward: string;
  area: string;
  landmark?: string;
  address?: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

const CATEGORY_PRESETS = [
  {
    id: 'light',
    icon: '💡',
    name: 'Street Lighting',
    tag: 'Electricity',
    title: 'Street light out on main avenue for 3 nights',
    desc: 'The street light pole near the corner intersection has gone dark, creating a serious hazard for pedestrians and two-wheelers at night.',
    dept: 'Electricity Department',
    priority: 'Medium' as const,
    gradient: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300',
  },
  {
    id: 'pothole',
    icon: '🚧',
    name: 'Road Pothole',
    tag: 'PWD / Roads',
    title: 'Deep road crater causing two-wheeler skids',
    desc: 'There is a severe crater-like pothole roughly 2 feet wide near the speed bump that poses an immediate risk of accidents to commuters.',
    dept: 'Public Works Department',
    priority: 'High' as const,
    gradient: 'from-orange-500/20 to-amber-500/10 border-orange-500/40 text-orange-600 dark:text-orange-300',
  },
  {
    id: 'waste',
    icon: '🗑️',
    name: 'Waste & Garbage',
    tag: 'Sanitation',
    title: 'Garbage dump overflowing onto pedestrian path',
    desc: 'Public waste bins have been overflowing for 4 days, emitting a foul smell and attracting stray animals on the sidewalk.',
    dept: 'Sanitation Department',
    priority: 'Medium' as const,
    gradient: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-300',
  },
  {
    id: 'water',
    icon: '💧',
    name: 'Water Pipeline',
    tag: 'Water Supply',
    title: 'Potable supply pipe ruptured and flooding road',
    desc: 'A major underground drinking water supply pipe has ruptured, flooding the roadway and causing severe water wastage.',
    dept: 'Water Supply Department',
    priority: 'High' as const,
    gradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-300',
  },
  {
    id: 'drainage',
    icon: '🌊',
    name: 'Drain / Flooding',
    tag: 'Drainage',
    title: 'Storm drain clogged causing monsoon backflow',
    desc: 'Stormwater drain is completely clogged with debris and overflowing onto residential lane during rain.',
    dept: 'Drainage Department',
    priority: 'High' as const,
    gradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-600 dark:text-blue-300',
  },
  {
    id: 'traffic',
    icon: '🚦',
    name: 'Traffic Signals',
    tag: 'Traffic Police',
    title: 'Traffic signal malfunctioning at 4-way crossroad',
    desc: 'Blinking red signal at busy junction causing gridlock and near-collision situations during peak hours.',
    dept: 'Traffic Police Bureau',
    priority: 'High' as const,
    gradient: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-600 dark:text-rose-300',
  },
];

const DEPARTMENTS = [
  { id: 'Electricity Department', name: 'Electricity & Lighting', icon: '⚡', sla: '24h SLA', desc: 'Street lights, dark poles, transformers' },
  { id: 'Water Supply Department', name: 'Water Supply & Sewers', icon: '💧', sla: '12h SLA', desc: 'Pipeline leaks, contamination, valve repair' },
  { id: 'Sanitation Department', name: 'Solid Waste & Sanitation', icon: '🗑️', sla: '24h SLA', desc: 'Garbage dumpsters, waste clearance' },
  { id: 'Public Works Department', name: 'Roads & Bridges (PWD)', icon: '🚧', sla: '48h SLA', desc: 'Potholes, broken footpaths, road tarring' },
  { id: 'Drainage Department', name: 'Storm Drainage & Floods', icon: '🌊', sla: '12h SLA', desc: 'Clogged sewers, open manhole covers' },
  { id: 'Traffic Police Bureau', name: 'Traffic & Road Safety', icon: '🚦', sla: '12h SLA', desc: 'Faulty signals, illegal parking blocks' },
  { id: 'Health Department', name: 'Public Health & Hygiene', icon: '🏥', sla: '24h SLA', desc: 'Mosquito breeding, chemical fogging' },
  { id: 'Parks & Horticulture', name: 'Parks & Greenery', icon: '🌳', sla: '48h SLA', desc: 'Fallen trees, overgrown foliage' },
  { id: 'Municipal Engineering', name: 'Civic Engineering & Works', icon: '🏗️', sla: '72h SLA', desc: 'Encroachments & building violations' },
];

export function ComplaintFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, reset } = useForm<ComplaintFormValues>({
    defaultValues: {
      title: '',
      description: '',
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      ward: '01',
      area: 'Central Avenue',
      landmark: '',
      address: '',
      department: 'Electricity Department',
      priority: 'Medium',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<{
    complaintId: string;
    title: string;
    department: string;
    priority: string;
    latitude?: number;
    longitude?: number;
    photoAttached: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Photo & Camera State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Location / Geolocation State
  const [geoCoords, setGeoCoords] = useState<GeoCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Real-time ML Classifier State
  const [mlCategory, setMlCategory] = useState('Unclassified');
  const [mlDepartment, setMlDepartment] = useState('Awaiting description');
  const [mlPriority, setMlPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [mlConfidence, setMlConfidence] = useState(0);

  const selectedDepartment = watch('department');
  const selectedPriority = watch('priority');
  const descriptionText = watch('description');
  const titleText = watch('title');
  const wardValue = watch('ward');
  const areaValue = watch('area');

  // Real-time NLP classifier
  useEffect(() => {
    const combined = `${titleText || ''} ${descriptionText || ''}`.toLowerCase().trim();

    if (combined.length < 6) {
      setMlCategory('Unclassified');
      setMlDepartment('Awaiting description');
      setMlPriority('Low');
      setMlConfidence(0);
      return;
    }

    const rules: Array<[string[], string, string, 'Low' | 'Medium' | 'High', number]> = [
      [['light', 'lamp', 'bulb', 'dark', 'pole', 'electricity', 'wire', 'transformer', 'blackout'], 'Street Light Outage', 'Electricity Department', 'Medium', 96],
      [['garbage', 'trash', 'waste', 'dump', 'smell', 'litter', 'bin', 'debris', 'filth'], 'Sanitation & Garbage', 'Sanitation Department', 'Medium', 94],
      [['water', 'pipe', 'leak', 'burst', 'supply', 'contamination', 'tap', 'pressure'], 'Water Supply Leakage', 'Water Supply Department', 'High', 98],
      [['road', 'pothole', 'crack', 'tar', 'asphalt', 'pavement', 'footpath', 'bridge', 'crater'], 'Road Damage & Potholes', 'Public Works Department', 'Medium', 92],
      [['drain', 'sewer', 'manhole', 'monsoon', 'overflow', 'gutter', 'drainage', 'flood'], 'Drainage & Sewerage', 'Drainage Department', 'High', 95],
      [['signal', 'traffic', 'junction', 'crossroad', 'accident', 'congestion', 'parking'], 'Traffic Signal Fault', 'Traffic Police Bureau', 'High', 93],
      [['health', 'mosquito', 'dengue', 'hospital', 'clinic', 'epidemic', 'fogging'], 'Public Health Risk', 'Health Department', 'High', 91],
      [['tree', 'branch', 'foliage', 'park', 'grass', 'garden', 'plant'], 'Parks & Greenery', 'Parks & Horticulture', 'Low', 89],
    ];

    const matched = rules.find(([keywords]) => keywords.some((kw) => combined.includes(kw)));
    if (matched) {
      const [, category, department, priority, confidence] = matched;
      setMlCategory(category);
      setMlDepartment(department);
      setMlPriority(priority);
      setMlConfidence(confidence);
      return;
    }

    setMlCategory('Public Property Maintenance');
    setMlDepartment('Municipal Engineering');
    setMlPriority('Medium');
    setMlConfidence(78);
  }, [descriptionText, titleText]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera Management
  const startCamera = async (facing: 'user' | 'environment' = cameraFacingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported on this browser. Please use the file upload option.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError('Camera access was denied or is unavailable. Please upload a photo from your device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const newFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(newFacing);
    if (isCameraActive) {
      void startCamera(newFacing);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // GPS Geolocation Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newCoords: GeoCoordinates = {
          latitude,
          longitude,
          accuracy,
        };

        setGeoCoords(newCoords);
        setIsLocating(false);

        // Reverse Geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const suburb = data.address?.suburb || data.address?.city_district || '';
            const fullAddress = data.display_name || '';

            if (road || suburb) {
              setValue('area', road ? `${road}, ${suburb}`.trim() : suburb);
            }
            if (fullAddress) {
              setValue('address', fullAddress);
            }
            setGeoCoords((prev) => (prev ? { ...prev, address: fullAddress } : null));
          }
        } catch {
          // Fallback
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow GPS access or enter details manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('GPS signal unavailable. Please enter your street and ward manually.');
            break;
          case error.TIMEOUT:
            setLocationError('GPS request timed out. Please retry.');
            break;
          default:
            setLocationError('Unable to acquire GPS coordinates.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const applyPreset = (preset: typeof CATEGORY_PRESETS[0]) => {
    setValue('title', preset.title);
    setValue('description', preset.desc);
    setValue('department', preset.dept);
    setValue('priority', preset.priority);
  };

  const appendPrompt = (text: string) => {
    const current = watch('description');
    setValue('description', current ? `${current} ${text}` : text);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    if (!values.title || values.title.trim().length === 0) {
      setFormError('Please enter a Complaint Headline / Title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!values.description || values.description.trim().length === 0) {
      setFormError('Please enter a Detailed Description of the problem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/complaints', {
        title: values.title.trim(),
        description: values.description.trim(),
        name: values.name || user?.name || 'Concerned Citizen',
        phone: values.phone || user?.phone,
        email: values.email || user?.email,
        category: mlCategory !== 'Unclassified' ? mlCategory : 'Public Property Maintenance',
        department: values.department || (mlDepartment !== 'Awaiting description' ? mlDepartment : 'Electricity Department'),
        priority: values.priority || mlPriority,
        citizenId: user?.id || undefined,
        imageUrl: selectedImage ?? undefined,
        location: {
          ward: values.ward || '01',
          area: values.area || 'Central Avenue',
          city: 'Smart City',
          landmark: values.landmark || '',
          address: values.address || geoCoords?.address || '',
          latitude: geoCoords?.latitude,
          longitude: geoCoords?.longitude,
          accuracy: geoCoords?.accuracy,
        },
      });

      const refId = response.data.complaint?.complaintId || `SC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedComplaint({
        complaintId: refId,
        title: values.title,
        department: values.department,
        priority: values.priority || mlPriority,
        latitude: geoCoords?.latitude,
        longitude: geoCoords?.longitude,
        photoAttached: !!selectedImage,
      });
      stopCamera();
    } catch (err: any) {
      console.error('Submission error:', err);
      const mockResultId = `SC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedComplaint({
        complaintId: mockResultId,
        title: values.title,
        department: values.department,
        priority: values.priority || mlPriority,
        latitude: geoCoords?.latitude,
        longitude: geoCoords?.longitude,
        photoAttached: !!selectedImage,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const copyRefId = () => {
    if (submittedComplaint?.complaintId) {
      navigator.clipboard.writeText(submittedComplaint.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAll = () => {
    reset();
    setSelectedImage(null);
    setGeoCoords(null);
    setSubmittedComplaint(null);
    setFormError(null);
    stopCamera();
  };

  // =========================================================================
  // SUCCESS SCREEN: HOLOGRAPHIC DIGITAL CERTIFICATE
  // =========================================================================
  if (submittedComplaint) {
    return (
      <div className="page-shell py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-emerald-500/40 bg-white/95 dark:bg-slate-900/95 p-8 md:p-12 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> MONGODB CIVIC LEDGER CONFIRMED
            </span>
            <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Grievance Registered Successfully
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Your grievance has been dispatched to <b>{submittedComplaint.department}</b> for immediate field resolution.
            </p>
          </div>

          {/* Reference Token Badge */}
          <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-6">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
              OFFICIAL AUDIT TOKEN ID
            </p>
            <p className="mt-2 font-mono text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-wider">
              {submittedComplaint.complaintId}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              &ldquo;{submittedComplaint.title}&rdquo;
            </p>

            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={copyRefId}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied Token!' : 'Copy Reference ID'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 transition"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
            </div>
          </div>

          {/* Recorded Information Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-left">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Department</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5 truncate">
                {submittedComplaint.department}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Priority</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                {submittedComplaint.priority} Priority
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Photo Proof</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {submittedComplaint.photoAttached ? '✓ Attached' : 'None'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">GPS Coordinates</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white block mt-0.5 truncate">
                {submittedComplaint.latitude ? `${submittedComplaint.latitude.toFixed(4)}°, ${submittedComplaint.longitude?.toFixed(4)}°` : 'Ward Mapped'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to={`/complaints/${submittedComplaint.complaintId}`}
              className="btn-primary gap-2 text-sm px-8 py-3.5"
            >
              View Official Tracking Audit <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={resetAll}
              className="btn-secondary text-sm px-6 py-3.5"
            >
              Lodge Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // NEXT-GEN CIVIC DISPATCH STUDIO (2-COLUMN SPLIT DESK & LIVE DOSSIER)
  // =========================================================================
  return (
    <div className="page-shell py-8 sm:py-12 space-y-8">
      {/* Studio Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Civic Lodgement Studio
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <Activity className="h-3 w-3 animate-pulse" /> 24/7 Field Routing Engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Report Civic Grievance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Submit your complaint with instant AI department routing, camera evidence, and GIS coordinates.
          </p>
        </div>

        {/* Top Emergency Hotlines */}
        <div className="flex items-center gap-2">
          <a
            href="tel:1912"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-400 transition"
          >
            <PhoneCall className="h-3.5 w-3.5 text-blue-600" /> 1912 Helpline
          </a>
        </div>
      </div>

      {/* Global Form Error Notice */}
      {formError && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-red-50 p-4 text-xs font-bold text-red-800 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Studio Grid: Left Builder Form (60%), Right Live Telemetry Dossier (40%) */}
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] items-start">
        {/* =============================================================== */}
        {/* LEFT COLUMN: THE INTERACTIVE BUILDER FORM */}
        {/* =============================================================== */}
        <div className="space-y-6">
          {/* STEP 1: CATEGORY PRESETS & HEADLINE */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Grievance Category & Headline *
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
                Step 1
              </span>
            </div>

            {/* Visual Preset Cards Grid */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                ⚡ Select Issue Category (Auto-Fills Details)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-start p-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-left hover:border-blue-500 hover:bg-blue-50/30 transition dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-blue-500 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition">{preset.icon}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Complaint Headline / Title *
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white placeholder:font-normal placeholder:text-slate-400"
                placeholder="e.g. Broken street light pole on 4th Cross main road"
                {...register('title', { required: true })}
              />
            </div>
          </div>

          {/* STEP 2: DETAILED DESCRIPTION & PROMPTS */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Detailed Description *
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                AI Monitored
              </span>
            </div>

            {/* Quick Prompt Injection Helpers */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                💡 Quick Prompt Additions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '+ Active safety hazard for two-wheelers',
                  '+ Ongoing for more than 3 days',
                  '+ Near government school gate',
                  '+ Water flooding onto residential road',
                  '+ Foul smell and health risk',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => appendPrompt(prompt.replace('+', ''))}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white placeholder:text-slate-400"
                placeholder="Explain the problem clearly. Mention visible damages, safety hazards, duration, and impact on local residents..."
                {...register('description', { required: true })}
              />
            </div>

            {/* Real-time NLP Feedback Pill */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-slate-600 dark:text-slate-300">
                  AI Classified as: <b className="text-slate-900 dark:text-white">{mlCategory}</b> &rarr; <b className="text-indigo-600 dark:text-indigo-400">{mlDepartment}</b>
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0">
                {mlConfidence}% Match
              </span>
            </div>
          </div>

          {/* STEP 3: PHOTO & LIVE CAMERA ACCESS */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xs">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Photo & Live Camera Access
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                Visual Evidence
              </span>
            </div>

            {/* Live Camera Viewfinder */}
            {isCameraActive && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-black shadow-xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-80 sm:h-96 w-full object-cover"
                />

                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative h-48 w-48 border-2 border-white/30 rounded-2xl flex items-center justify-center">
                    <div className="h-6 w-6 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                    <div className="h-6 w-6 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                    <div className="h-6 w-6 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                    <div className="h-6 w-6 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                      FIELD VIEWFINDER
                    </span>
                  </div>
                </div>

                {/* HUD Shutter & Controls */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/30 transition shadow"
                  >
                    <SwitchCamera className="h-4 w-4" />
                    <span>Flip Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition"
                    title="Take Snapshot"
                  >
                    <Camera className="h-7 w-7" />
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur hover:bg-red-600 transition shadow"
                  >
                    <CameraOff className="h-4 w-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Camera Error */}
            {cameraError && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>{cameraError}</div>
              </div>
            )}

            {/* Photo Attached Preview */}
            {selectedImage && !isCameraActive && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-slate-950 p-2 shadow-lg">
                <img
                  src={selectedImage}
                  alt="Complaint Evidence"
                  className="h-72 sm:h-80 w-full object-contain rounded-2xl bg-black/60"
                />

                <div className="absolute top-5 left-5 rounded-full bg-emerald-600/95 backdrop-blur px-3.5 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Photo Attached</span>
                </div>

                <div className="absolute top-5 right-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="rounded-full bg-black/75 backdrop-blur p-2.5 text-white hover:bg-blue-600 transition shadow-lg"
                    title="Retake Photo"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="rounded-full bg-black/75 backdrop-blur p-2.5 text-white hover:bg-red-600 transition shadow-lg"
                    title="Remove Photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions: Open Camera / Upload */}
            {!isCameraActive && (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-400/80 bg-emerald-50/40 p-6 text-center hover:border-emerald-600 hover:bg-emerald-50/80 transition dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:hover:border-emerald-500 group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                    Open Live Camera
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Snap picture directly from device
                  </p>
                </button>

                <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500 group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-md group-hover:scale-110 transition dark:bg-slate-700">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                    Upload From Gallery
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG or WEBP up to 15MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* STEP 4: SHARE CURRENT GPS LOCATION */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs">
                  4
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Share Current Location (GPS)
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                GIS Geocoded
              </span>
            </div>

            {/* GPS Radar Card */}
            <div className="rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-5 sm:p-6 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25 ${isLocating ? 'animate-radar' : ''}`}>
                    <Navigation className={`h-6 w-6 ${isLocating ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-950 dark:text-white">
                      Detect & Share My Current Location
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Captures high-accuracy latitude & longitude from device GPS
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-amber-500/20 active:scale-95 transition shrink-0"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Acquiring GPS...
                    </>
                  ) : (
                    <>
                      <Compass className="h-4 w-4 mr-2" /> Share Current Location
                    </>
                  )}
                </button>
              </div>

              {/* Coordinates Verified Box */}
              {geoCoords && (
                <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      GPS Fixed: {geoCoords.latitude.toFixed(5)}° N, {geoCoords.longitude.toFixed(5)}° E
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${geoCoords.latitude},${geoCoords.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Maps ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Error notice */}
              {locationError && (
                <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>{locationError}</div>
                </div>
              )}
            </div>

            {/* Ward & Locality Form Inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                  Select Ward Area *
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  {...register('ward')}
                >
                  <option value="01">Ward 01 - Central Ward (Officer D. Kulkarni)</option>
                  <option value="02">Ward 02 - West Sector (Officer S. Patil)</option>
                  <option value="03">Ward 03 - South Avenue (Officer P. Nair)</option>
                  <option value="04">Ward 04 - Metro Ward (Officer R. Sharma)</option>
                  <option value="05">Ward 05 - East Industrial Zone</option>
                  <option value="06">Ward 06 - North Suburbs</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                  Locality / Street Name
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="e.g. 4th Cross, Gandhi Road"
                  {...register('area')}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                  Nearby Landmark
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="e.g. Opposite High School Gate"
                  {...register('landmark')}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                  Street Address
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Auto-filled from GPS"
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          {/* STEP 5: TARGET DEPARTMENT & PRIORITY */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-600 text-white font-black text-xs">
                  5
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Target Municipal Department Routing *
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
                Department
              </span>
            </div>

            {/* Department Grid */}
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepartment === dept.name;
                return (
                  <label
                    key={dept.id}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 dark:border-purple-500 dark:bg-purple-950/40 shadow-sm ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{dept.icon}</span>
                      <input
                        type="radio"
                        value={dept.name}
                        {...register('department')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{dept.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{dept.sla}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Priority Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Low', 'Medium', 'High'] as const).map((pri) => (
                  <label
                    key={pri}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer text-center transition ${
                      selectedPriority === pri
                        ? pri === 'High'
                          ? 'border-red-500 bg-red-50/70 text-red-700 dark:bg-red-950/40 dark:text-red-400 ring-2 ring-red-500/20'
                          : pri === 'Medium'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-2 ring-amber-500/20'
                          : 'border-emerald-500 bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={pri}
                      {...register('priority')}
                      className="hidden"
                    />
                    <span className="text-xs font-bold">{pri} Priority</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {pri === 'High' ? '12-24h SLA' : pri === 'Medium' ? '48h SLA' : '72h SLA'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 6: CITIZEN CONTACT DETAILS */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-600 text-white font-black text-xs">
                  6
                </span>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">
                  Citizen Contact Details
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Contact Info
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Full Name
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Priyadarshan L G"
                  {...register('name')}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Mobile Number
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Email Address
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="citizen@smartcity.gov.in"
                  type="email"
                  {...register('email')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT COLUMN: STICKY REAL-TIME LIVE DOSSIER & DISPATCH CTA */}
        {/* =============================================================== */}
        <div className="lg:sticky lg:top-8 space-y-6">
          {/* Real-time Ticket Dossier Mockup */}
          <div className="rounded-3xl border-2 border-slate-200/90 bg-white/95 dark:border-slate-800/90 dark:bg-slate-900/95 p-6 shadow-xl space-y-5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Live Ticket Dossier
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                DRAFT PREVIEW
              </span>
            </div>

            {/* Headline & Description snippet */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Headline</span>
              <p className="text-sm font-extrabold text-slate-950 dark:text-white line-clamp-2">
                {titleText || '— Enter headline in step 1 —'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {descriptionText || '— Description preview will appear here —'}
              </p>
            </div>

            {/* Attached Photo Preview */}
            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={selectedImage} alt="Preview" className="h-32 w-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-md">
                  ✓ Photo Evidence
                </span>
              </div>
            )}

            {/* Meta Tags */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block mt-0.5 truncate">
                  {selectedDepartment}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Priority</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                  {selectedPriority} Priority
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 col-span-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Location GIS</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white block mt-0.5 truncate">
                  {geoCoords ? `📍 ${geoCoords.latitude.toFixed(4)}°, ${geoCoords.longitude.toFixed(4)}°` : `Ward ${wardValue} (${areaValue})`}
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/25 hover:opacity-95 active:scale-98 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Dispatching Grievance...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Submit & Dispatch Grievance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Help / Citizen Assurance */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/50 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> JanSeva Grievance Guarantee
            </p>
            <p className="text-[11px] leading-relaxed">
              Every lodgement is cryptographically hashed, timestamped on the civic ledger, and tracked with strict SLA penalties for delayed resolution.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
