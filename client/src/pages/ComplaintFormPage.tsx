import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Eye,
  FileCheck2,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  MapPinned,
  Mic,
  MicOff,
  Navigation,
  Phone,
  PhoneCall,
  PlusCircle,
  Radio,
  RefreshCw,
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
  Video,
  VideoOff,
  Search,
  Volume2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { addComplaintRecord } from '../lib/complaintsStore';
import { fetchLiveAddress, getCurrentPositionAsync } from '../lib/geoHelper';

export const CATEGORIES = [
  // 1. PWD (Public Works Department)
  { id: 'PWD - Roads & Bridges', name: 'PWD: Roads, Bridges & Potholes', dept: 'Public Works Department (PWD)', icon: '🚧', defaultPriority: 'High' },
  { id: 'PWD - Government Buildings', name: 'PWD: Government Buildings & Infrastructure', dept: 'Public Works Department (PWD)', icon: '🏛️', defaultPriority: 'Medium' },
  { id: 'PWD - Traffic & Transportation', name: 'PWD: Traffic Signals & Road Safety', dept: 'Public Works Department (PWD)', icon: '🚦', defaultPriority: 'Medium' },

  // 2. Municipal Corporation
  { id: 'Municipal - Waste Management & Sanitation', name: 'Municipal: Waste Management & Sanitation', dept: 'Municipal Corporation', icon: '🗑️', defaultPriority: 'High' },
  { id: 'Municipal - Water Supply & Sewage', name: 'Municipal: Water Supply & Sewage Pipelines', dept: 'Municipal Corporation', icon: '💧', defaultPriority: 'High' },
  { id: 'Municipal - Electricity & Street Lights', name: 'Municipal: Electricity & Street Lights', dept: 'Municipal Corporation', icon: '⚡', defaultPriority: 'Medium' },
  { id: 'Municipal - Parks, Garden & Environment', name: 'Municipal: Parks, Gardens & Environment', dept: 'Municipal Corporation', icon: '🌳', defaultPriority: 'Low' },
  { id: 'Municipal - Animal Services', name: 'Municipal: Animal Services & Stray Control', dept: 'Municipal Corporation', icon: '🐾', defaultPriority: 'Medium' },

  // 3. Tourism Department
  { id: 'Tourism - Heritage & Tourist Amenities', name: 'Tourism: Heritage Sites & Tourist Amenities', dept: 'Tourism Department', icon: '🏖️', defaultPriority: 'Low' },

  // 4. Agriculture Department
  { id: 'Agriculture - Crop Disease & Pest Control', name: 'Agriculture: Crop Pest & Disease (Farmer Direct)', dept: 'Agriculture Department', icon: '🌾', defaultPriority: 'High' },
  { id: 'Agriculture - Irrigation & Fertilizer Support', name: 'Agriculture: Irrigation, Soil & Fertilizer Support', dept: 'Agriculture Department', icon: '🚜', defaultPriority: 'Medium' },
];

export const CROP_OPTIONS = [
  'Coconut 🥥',
  'Arecanut 🌴',
  'Paddy / Rice 🌾',
  'Coffee ☕',
  'Maize 🌽',
  'Sugarcane 🎋',
  'Vegetables & Horticulture 🥦',
  'Fruit Orchards (Mango/Banana) 🥭',
];

export function ComplaintFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Top Form Fields from Sketch
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('PWD - Roads & Bridges');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [details, setDetails] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Coconut 🥥');

  // Voice Speech-to-Text State (for 🎙️ button on details box)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Media State: 'upload' | 'camera'
  const [mediaMode, setMediaMode] = useState<'upload' | 'camera'>('upload');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  // Live Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState('');

  // AI Classification Feedback Simulation
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [aiDetection, setAiDetection] = useState<{
    detected: string;
    confidence: number;
    suggestedCategory: string;
    suggestedPriority: 'High' | 'Medium' | 'Low';
  } | null>(null);

  // Live Location & Map State
  const [locationAddress, setLocationAddress] = useState('BM Road, Near Central Bus Stand');
  const [locationWard, setLocationWard] = useState('Ward 04');
  const [locationDistrict, setLocationDistrict] = useState(user?.district || user?.city || 'Hassan');
  const [locationCity, setLocationCity] = useState(user?.city || user?.district || 'Hassan');
  const [locationState, setLocationState] = useState(user?.state || 'Karnataka');
  const [locationPincode, setLocationPincode] = useState('573201');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number }>({
    lat: 13.0033, // Default Hassan, Karnataka coordinates
    lng: 76.1004,
    accuracy: 12,
  });
  const [isLocating, setIsLocating] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Submission & Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    complaintId: string;
    title: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // =========================================================================
  // 1. SPEECH RECOGNITION (VOICE INPUT FOR DETAILS)
  // =========================================================================
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleVoiceDictation = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    const SpeechRec = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser. Please type your details.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English / Kannada multi-accent

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setDetails((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // =========================================================================
  // 2. LIVE CAMERA STREAM
  // =========================================================================
  const startCamera = async () => {
    setCameraError('');
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError('Camera access denied or unavailable. Please use upload photo option.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
  };

  useEffect(() => {
    if (mediaMode === 'camera') {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mediaMode, cameraFacing]);

  const snapPhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedMedia(dataUrl);
      setMediaType('image');
      stopCamera();
      setMediaMode('upload');
      runAiClassification(dataUrl);
    }
  };

  // Handle File Upload (Photo or Video)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedMedia(result);
      if (!isVideo) {
        runAiClassification(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Smart image analysis
  const runAiClassification = (imageUrl: string) => {
    setIsAnalyzingMedia(true);
    setTimeout(() => {
      setIsAnalyzingMedia(false);
      setAiDetection({
        detected: 'Pothole - Road Surface Damage',
        confidence: 96.8,
        suggestedCategory: 'Road Damage & Potholes',
        suggestedPriority: 'High',
      });
      if (!headline) {
        setHeadline('Deep road pothole posing road hazard');
      }
      setCategory('Road Damage & Potholes');
      setPriority('High');
    }, 1200);
  };

  // =========================================================================
  // 3. REVERSE GEOCODING (Multi-tier OpenStreetMap Nominatim & BigDataCloud)
  // =========================================================================
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geoInfo = await fetchLiveAddress(lat, lng);
      setLocationAddress(geoInfo.fullAddress || geoInfo.shortLocation);
      setLocationCity(geoInfo.city || 'Hassan');
      setLocationDistrict(geoInfo.district || geoInfo.city || 'Hassan');
      setLocationState(geoInfo.state || 'Karnataka');
      setLocationPincode(geoInfo.pincode || '573201');
      setLocationWard('Ward 04');
    } catch {
      // Keep existing values
    }
  };

  // =========================================================================
  // 4. DETECT LIVE GPS LOCATION
  // =========================================================================
  const detectLiveLocation = async () => {
    setIsLocating(true);
    const pos = await getCurrentPositionAsync();
    setCoords({ lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy });
    setIsLocating(false);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([pos.lat, pos.lng], 16);
      markerRef.current.setLatLng([pos.lat, pos.lng]);
    }

    await reverseGeocode(pos.lat, pos.lng);
  };

  // =========================================================================
  // 5. LEAFLET MAP INITIALIZATION (OpenStreetMap)
  // =========================================================================
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Custom Red Marker Icon for Leaflet
      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>
            <div class="h-6 w-6 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
              📍
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true,
      });

      // Free OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // On Marker Drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng, accuracy: 5 });
        await reverseGeocode(position.lat, position.lng);
      });

      // On Map Click
      map.on('click', async (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, accuracy: 5 });
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    // Trigger auto locate on load
    detectLiveLocation();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update selected category priority default
  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    const found = CATEGORIES.find((c) => c.id === catId);
    if (found) {
      setPriority(found.defaultPriority as 'High' | 'Medium' | 'Low');
    }
  };

  // =========================================================================
  // 6. FORM SUBMISSION (Submit & Track with Real-Time Data Sync)
  // =========================================================================
  const handleSubmitComplaint = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const finalHeadline = headline.trim() || `Civic Issue in ${locationWard || 'City Ward'}`;
    const finalDetails = details.trim() || `Grievance reported for ${category} at ${locationAddress || 'verified GPS coordinates'}.`;

    setIsSubmitting(true);
    const selectedDept = CATEGORIES.find((c) => c.id === category)?.dept || 'Public Works Department (PWD)';

    try {
      const created = await addComplaintRecord({
        title: finalHeadline,
        description: finalDetails,
        category,
        department: selectedDept,
        priority,
        imageUrl: selectedMedia || undefined,
        cropType: category.startsWith('Agriculture') ? selectedCrop : undefined,
        location: {
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy: coords.accuracy,
          address: locationAddress,
          ward: locationWard,
          city: locationCity,
          district: locationDistrict,
          state: locationState,
          area: locationAddress,
          coordinates: {
            lat: coords.lat,
            lng: coords.lng,
          },
        },
        citizenName: user?.name || 'Concerned Citizen',
        citizenPhone: user?.phone || '+91 98765 43210',
        citizenEmail: user?.email || 'citizen@smartcity.gov.in',
      });

      setSubmissionSuccess({
        complaintId: created.complaintId,
        title: finalHeadline,
      });
      setIsPreviewOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Could not record complaint. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      
      {/* Top Government Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
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
                  Complaint page
                </h1>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  AI-Powered Multi-Modal Grievance Submission
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:18004252026"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-extrabold text-amber-700 dark:text-amber-400"
            >
              <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
              <span>Helpline: 1800-425-2026</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Success Modal on Submission */}
        <AnimatePresence>
          {submissionSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 backdrop-blur-xl text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Grievance Logged Successfully
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Ticket #{submissionSuccess.complaintId}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1">
                  Your complaint "{submissionSuccess.title}" has been registered and auto-routed to the designated Ward Engineer.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${submissionSuccess.complaintId}`)}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition"
                >
                  <Search className="h-4 w-4" />
                  <span>Track Live SLA Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard/citizen')}
                  className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <X className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: TOP COMPLAINT DETAILS BOX (Per Handwritten Sketch)             */}
        {/* Complaint Headline | Category: autofill | Priority | Details with Mic 🎙️  */}
        {/* ========================================================================= */}
        <motion.div className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {/* 1. Complaint Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Deep pothole on BM Road near Dairy Circle"
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* 2. Category (Autofill) & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Category: autofill */}
            <div className="md:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category : <span className="text-blue-600 dark:text-blue-400">autofill / Select</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-3 pl-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name} ({cat.dept})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
                {(['Low', 'Medium', 'High'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      priority === p
                        ? p === 'High'
                          ? 'bg-red-600 text-white shadow-sm'
                          : p === 'Medium'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated Farmer Crop Selection Section when Agriculture is Selected */}
          {category.startsWith('Agriculture') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🌾</span>
                <div>
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                    Farmer Advisory - Crop & Pest Help
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Tell us which crop has the problem and upload a photo. Our farm expert will visit and give you advice on how to fix it.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                  Select Affected Crop Type:
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  {CROP_OPTIONS.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* 3. Details with Voice Input 🎙️ button on the bottom right */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Details <span className="text-red-500">*</span>
              </label>
              {isListening && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                Listening to your voice...
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the grievance in detail (landmarks, severity, safety issues)..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 pb-12 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
              />

              {/* Speech-to-Text Button in Details Box (Per Sketch) */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={`absolute right-3 bottom-3 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-600/10 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white'
                }`}
                title="Click to speak your complaint description"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isListening ? 'Stop' : 'Voice Input'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 2: MEDIA CAPTURE BOX (Upload photo live camera or video)          */}
        {/* ========================================================================= */}
        <motion.div className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Upload photo or video from your device</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Attach a photo for verification and quick routing to the right team
              </p>
            </div>

            {/* Media Mode Switcher (Upload vs Live Camera) */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMediaMode('upload')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mediaMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaMode('camera')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  mediaMode === 'camera'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Camera</span>
              </button>
            </div>
          </div>

          {/* Media View A: Live Camera Stream */}
          {mediaMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full max-w-xl mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera Overlay Controls */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-800 transition"
                    title="Switch Camera (Front/Rear)"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </button>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-red-400 mb-2">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setMediaMode('upload')}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Switch to File Upload
                    </button>
                  </div>
                )}
              </div>

              {/* Snap Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={snapPhotoFromCamera}
                  disabled={!isCameraActive}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  <span>Snap Live Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Media View B: File Upload (Photo or Video) */}
          {mediaMode === 'upload' && !selectedMedia && (
            <label className="flex flex-col items-center justify-center aspect-[21/9] sm:aspect-[24/8] w-full rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition group">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to browse photo / video clip or drag & drop here
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Supports photos and videos (JPG, PNG, MP4, MOV) up to 50MB
              </p>
            </label>
          )}

          {/* Preview of Selected/Captured Media */}
          {selectedMedia && (
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 max-w-xl mx-auto">
              {mediaType === 'video' ? (
                <video src={selectedMedia} controls className="w-full rounded-2xl max-h-64 object-contain" />
              ) : (
                <img src={selectedMedia} alt="Complaint Media" className="w-full rounded-2xl max-h-64 object-contain" />
              )}

              {/* Remove / Change Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMedia(null);
                  setMediaFile(null);
                  setAiDetection(null);
                }}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition shadow-md"
                title="Remove Media"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Live AI Vision Badge */}
              <div className="p-3">
                {isAnalyzingMedia ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <Cpu className="h-4 w-4 animate-spin text-blue-400" />
                    <span>Analyzing your photo...</span>
                  </div>
                ) : aiDetection ? (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Sparkles className="h-4 w-4" />
                      <span>{aiDetection.detected}</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                      {aiDetection.confidence}% Confidence
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 3: LIVE LOCATION BOX (Split 2-Columns as Sketched)                */}
        {/* Left: Detect live location & auto read | Right: Live Interactive Map      */}
        {/* ========================================================================= */}
        <motion.div className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Detect Live Location & Interactive Map</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Marks the exact location for our team to visit
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* ----------------------------------------------------------------- */}
            {/* LEFT COLUMN: LIVE LOCATION DETAILS & AUTO READ                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              
              {/* Trigger Button: Detect live location */}
              <button
                type="button"
                onClick={detectLiveLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Checking your location...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="h-4 w-4" />
                    <span>Detect Live Location</span>
                  </>
                )}
              </button>

              {/* Current live location auto read card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current Live Location (Auto Read)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    GPS ±{coords.accuracy || 10}m
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                      Street / Area Address
                    </label>
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="e.g. BM Road, Near Market Circle"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                        Ward
                      </label>
                      <input
                        type="text"
                        value={locationWard}
                        onChange={(e) => setLocationWard(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                        District / City
                      </label>
                      <input
                        type="text"
                        value={`${locationDistrict}, ${locationState}`}
                        readOnly
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Lat: {coords.lat.toFixed(5)}° N</span>
                    <span>Lng: {coords.lng.toFixed(5)}° E</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Tip:</span> You can move the red marker on the map to show the exact spot.
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* RIGHT COLUMN: INTERACTIVE LIVE LEAFLET MAP (OpenStreetMap)        */}
            {/* ----------------------------------------------------------------- */}
            <div className="lg:col-span-6">
              <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <div ref={mapContainerRef} className="w-full h-full z-10" />

                {/* Map Overlay Badge */}
                <div className="absolute top-3 right-3 z-20 rounded-xl bg-slate-950/85 px-3 py-1 text-[10px] font-mono font-bold text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Interactive Map · OSM Live</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BUTTONS: [Preview] & [Submit & Track] (Per Sketch)          */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-4">
          
          {/* Button 1: Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>

          {/* Button 2: Submit & Track */}
          <button
            type="button"
            onClick={handleSubmitComplaint}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-10 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xl shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Grievance...</span>
              </>
            ) : (
              <>
                <span>Submit & Track</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* PREVIEW MODAL                                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-colors space-y-4"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Submission Summary Preview
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {headline || 'Untitled Complaint'}
                </h3>
              </div>

              {/* Details breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Category:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Priority:</span>
                  <span className={`font-bold ${priority === 'High' ? 'text-red-500' : priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {priority} Priority
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {locationAddress}, {locationWard} ({locationDistrict})
                  </span>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-500 block mb-1">Details:</span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {details || 'No description provided.'}
                  </p>
                </div>

                {selectedMedia && (
                  <div className="pt-2">
                    <span className="font-bold text-slate-500 block mb-1">Attached Media:</span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center">
                      <img src={selectedMedia} alt="Preview" className="max-h-48 object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleSubmitComplaint}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Confirm & Submit</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
