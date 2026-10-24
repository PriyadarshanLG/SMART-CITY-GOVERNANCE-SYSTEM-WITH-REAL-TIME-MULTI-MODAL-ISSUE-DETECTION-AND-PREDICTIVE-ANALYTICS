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
  UserCheck,
  Video,
  VideoOff,
  Search,
  Volume2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { addComplaintRecord } from '../lib/complaintsStore';
import { FIXED_CITY_LOCATION, getCurrentPositionAsync } from '../lib/geoHelper';
import { GoogleMapView } from '../components/common/GoogleMapView';

interface ReverseGeocodedLocation {
  area: string;
  address: string;
  city: string;
  district: string;
  state: string;
}

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

type ComplaintPriority = 'High' | 'Medium' | 'Low';
interface ClassificationSuggestion {
  category: string;
  department: string;
  priority: ComplaintPriority;
  departmentReason: string;
  priorityReason: string;
  method: 'rule-based';
}

const HASSAN_REPRESENTATIVES = [
  { name: 'Shreyas M. Patel', role: 'Current MP · Hassan Lok Sabha', detail: 'Indian National Congress (INC)' },
  { name: 'C. N. Balakrishna', role: 'MLA · Shravanabelagola', detail: 'Janata Dal (Secular)' },
  { name: 'K. M. Shivalingegowda', role: 'MLA · Arasikere', detail: 'Indian National Congress (INC)' },
  { name: 'H. K. Suresh', role: 'MLA · Belur', detail: 'Bharatiya Janata Party (BJP)' },
  { name: 'H. S. Swaroop Prakash', role: 'MLA · Hassan', detail: 'Janata Dal (Secular)' },
  { name: 'H. D. Revanna', role: 'MLA · Holenarsipura', detail: 'Janata Dal (Secular)' },
  { name: 'A. Manju', role: 'MLA · Arkalgud', detail: 'Janata Dal (Secular)' },
  { name: 'Cement Manju', role: 'MLA · Sakleshpur', detail: 'Bharatiya Janata Party (BJP)' },
  { name: 'Smt K. S. Lathakumari, I.A.S', role: 'Deputy Commissioner & District Magistrate', detail: 'District Administration · Hassan' },
  { name: 'Shubham Shukla, I.A.S', role: 'Chief Executive Officer', detail: 'Zilla Panchayat · Hassan' },
  { name: 'Shubhanwita, I.P.S', role: 'Superintendent of Police', detail: 'Hassan District Police' },
];

export function ComplaintFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Top Form Fields from Sketch
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('PWD - Roads & Bridges');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [department, setDepartment] = useState('Public Works Department (PWD)');
  const [details, setDetails] = useState('');
  const [suggestion, setSuggestion] = useState<ClassificationSuggestion | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [hasManualDepartmentOverride, setHasManualDepartmentOverride] = useState(false);
  const [hasManualPriorityOverride, setHasManualPriorityOverride] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Coconut 🥥');

  // Voice recording and Google Speech-to-Text state.
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechNotice, setSpeechNotice] = useState('');
  const [speechError, setSpeechError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);

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
  const [locationAddress, setLocationAddress] = useState(FIXED_CITY_LOCATION.address);
  const [locationArea, setLocationArea] = useState(FIXED_CITY_LOCATION.area);
  const [locationDistrict, setLocationDistrict] = useState(FIXED_CITY_LOCATION.district);
  const [locationCity, setLocationCity] = useState(FIXED_CITY_LOCATION.city);
  const [locationState, setLocationState] = useState(FIXED_CITY_LOCATION.state);
  const isLookingUpArea = false;
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number }>(FIXED_CITY_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [hasLiveLocation, setHasLiveLocation] = useState(false);
  const [hasConfirmedLocation, setHasConfirmedLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Submission & Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    complaintId: string;
    title: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setSpeechSupported(Boolean(navigator.mediaDevices && typeof window.MediaRecorder !== 'undefined'));
    return () => {
      if (recordingTimeoutRef.current !== null) window.clearTimeout(recordingTimeoutRef.current);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.onerror = null;
        if (mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      }
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopVoiceRecording = (reachedLimit = false) => {
    if (recordingTimeoutRef.current !== null) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (reachedLimit) setSpeechNotice('Recording reached the 55-second limit. Transcribing the audio now.');
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  const startVoiceRecording = async () => {
    setSpeechError('');
    setSpeechNotice('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setSpeechSupported(false);
      setSpeechError('Audio recording is not supported in this browser. Please use an up-to-date browser or type your description.');
      return;
    }

    const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg']
      .find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) {
      setSpeechError('This browser cannot record an audio format supported by Google Speech-to-Text. Try the latest Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        if (recordingTimeoutRef.current !== null) {
          window.clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        setIsRecording(false);
        setSpeechError('Audio recording failed. Check your microphone and try again.');
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        setIsRecording(false);

        const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        audioChunksRef.current = [];
        if (audio.size === 0) {
          setSpeechError('No audio was recorded. Allow microphone access and try speaking again.');
          return;
        }

        setIsTranscribing(true);
        setSpeechError('');
        try {
          const contentType = audio.type.split(';')[0] || 'audio/webm';
          const response = await api.post<{ transcript: string }>('/speech/transcribe', audio, {
            headers: { 'Content-Type': contentType },
          });
          const transcript = response.data.transcript.trim();
          if (!transcript) {
            setSpeechError('Google could not detect speech in that recording. Try again in a quieter place.');
            return;
          }
          setDetails((previous) => `${previous.trim()}${previous.trim() ? ' ' : ''}${transcript}`);
          setSpeechNotice('Voice transcription added. Review and edit it before submitting.');
        } catch (error) {
          const message = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message
              || (!error.response
                ? 'Cannot reach the Smart City server. Start the backend with npm run dev --workspace server, then try again.'
                : `Transcription request failed (HTTP ${error.response.status}). Please try again.`)
            : error instanceof Error
              ? error.message
              : 'Transcription failed. Please try again.';
          setSpeechError(message);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(1000);
      setIsRecording(true);
      recordingTimeoutRef.current = window.setTimeout(() => stopVoiceRecording(true), 55_000);
    } catch (error) {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      const name = error instanceof DOMException ? error.name : '';
      setSpeechError(name === 'NotAllowedError' || name === 'PermissionDeniedError'
        ? 'Microphone access is blocked. Allow microphone access in your browser, then try again.'
        : name === 'NotFoundError'
          ? 'No microphone was found. Connect or enable a microphone and try again.'
          : 'Could not start recording. Check your microphone permission and try again.');
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      void startVoiceRecording();
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
  // 4. DETECT LIVE GPS LOCATION
  // =========================================================================
  const detectLiveLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const pos = await getCurrentPositionAsync();
      setCoords({ ...FIXED_CITY_LOCATION, accuracy: pos.accuracy });
      setHasLiveLocation(true);
      setHasConfirmedLocation(true);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not get your current location.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    void detectLiveLocation();
  }, []);

  useEffect(() => {
    const title = headline.trim();
    const description = details.trim();
    if (!title && !description) {
      setSuggestion(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsClassifying(true);
      try {
        const response = await api.post<{ classification: ClassificationSuggestion }>('/complaints/classify', {
          title,
          description,
        });
        const nextSuggestion = response.data.classification;
        setSuggestion(nextSuggestion);
        if (!hasManualDepartmentOverride) setDepartment(nextSuggestion.department);
        if (!hasManualPriorityOverride) setPriority(nextSuggestion.priority);
      } catch (error) {
        console.error('Could not classify complaint description:', error);
      } finally {
        setIsClassifying(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [details, headline, hasManualDepartmentOverride, hasManualPriorityOverride]);

  // Update selected category priority default
  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    const found = CATEGORIES.find((c) => c.id === catId);
    if (found) {
      setDepartment(found.dept);
      setHasManualDepartmentOverride(true);
      setPriority(found.defaultPriority as 'High' | 'Medium' | 'Low');
      setHasManualPriorityOverride(true);
    }
  };

  // =========================================================================
  // 6. FORM SUBMISSION (Submit & Track with Real-Time Data Sync)
  // =========================================================================
  const handleSubmitComplaint = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!hasConfirmedLocation) {
      setErrorMessage('Detect your location or select a point on the map before submitting this complaint.');
      return;
    }

    const finalHeadline = headline.trim() || `Civic Issue in ${locationArea || locationCity || 'your area'}`;
    const finalDetails = details.trim() || `Grievance reported for ${category} at ${locationAddress || 'verified GPS coordinates'}.`;

    setIsSubmitting(true);
    try {
      const created = await addComplaintRecord({
        title: finalHeadline,
        description: finalDetails,
        category,
        department,
        priority,
        imageUrl: selectedMedia || undefined,
        cropType: category.startsWith('Agriculture') ? selectedCrop : undefined,
        location: {
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy: coords.accuracy,
          address: locationAddress,
          city: locationCity,
          district: locationDistrict,
          state: locationState,
          area: locationArea,
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Report and track a local issue
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
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Citizen services</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">Report a civic issue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Describe the problem, add a photo if you have one, and pin its location. We’ll route it to the right team.
              </p>
              </div>
              <a href="tel:18004252026" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300">
                <PhoneCall className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Need help? 1800-425-2026
              </a>
            </div>
            <aside className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 border-b border-indigo-200/70 pb-2 dark:border-indigo-900/60">
                <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-900 dark:text-indigo-200">
                    Hassan Representatives
                  </h3>
                  <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80">Active public officials</p>
                </div>
              </div>
              <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {HASSAN_REPRESENTATIVES.map((representative) => (
                  <div key={representative.name} className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 dark:bg-slate-900/70">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {representative.name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-extrabold text-slate-900 dark:text-white">{representative.name}</p>
                      <p className="truncate text-[9px] font-semibold text-slate-600 dark:text-slate-300">{representative.role}</p>
                      <p className="truncate text-[9px] text-slate-500 dark:text-slate-400">{representative.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
          <ol className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            {[
              { number: '01', label: 'Describe issue', icon: FileText },
              { number: '02', label: 'Add a photo', icon: Camera },
              { number: '03', label: 'Set location', icon: MapPin },
            ].map(({ number, label, icon: Icon }, index) => (
              <li key={number} className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="mr-1 hidden text-[10px] font-semibold text-slate-400 sm:inline">{number}</span>
                  <span className={`font-medium ${index === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        
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
                  Your complaint "{submissionSuccess.title}" has been registered and routed to the relevant municipal team.
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
        <motion.div id="describe-issue" className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-start gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">01</span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Tell us what happened</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">A clear description helps the right department respond sooner.</p>
            </div>
          </div>
          
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

            <div className="md:col-span-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Department <span className="text-blue-600 dark:text-blue-400">suggested / editable</span>
              </label>
              <input
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setHasManualDepartmentOverride(true);
                }}
                list="complaint-departments"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-3 px-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                aria-label="Complaint department"
              />
              <datalist id="complaint-departments">
                {Array.from(new Set(CATEGORIES.map((item) => item.dept))).map((item) => <option key={item} value={item} />)}
                <option value="Sanitation Department" />
                <option value="Roads and Infrastructure" />
                <option value="Water Supply Department" />
                <option value="Electricity Department" />
                <option value="Public Safety Department" />
                <option value="Municipal Corporation" />
              </datalist>
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
                    onClick={() => {
                      setPriority(p);
                      setHasManualPriorityOverride(true);
                    }}
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Details <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">You can speak or type</span>
            </div>

            <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={toggleVoiceRecording}
                disabled={!speechSupported || isTranscribing}
                className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isRecording
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500'
                }`}
                aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                aria-pressed={isRecording}
              >
                {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isTranscribing ? 'Transcribing…' : isRecording ? 'Stop recording' : 'Record description'}</span>
              </button>
            </div>

            {isRecording && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200" role="status" aria-live="polite">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" />
                Recording… Speak clearly, then select Stop recording. Maximum 55 seconds.
              </div>
            )}
            {isTranscribing && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200" role="status" aria-live="polite">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending the recording securely to Google for transcription…
              </div>
            )}

            <div className="relative">
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the grievance in detail (landmarks, severity, safety issues)..."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950/70 dark:text-white"
                aria-describedby="voice-help"
              />
            </div>
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs dark:border-blue-900/60 dark:bg-blue-950/30">
              <div className="flex items-center justify-between gap-2 font-bold text-blue-900 dark:text-blue-200">
                <span>Automatic Complaint Classification (Rule-Based)</span>
                {isClassifying && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Classifying" />}
              </div>
              {suggestion ? (
                <div className="mt-2 space-y-1 text-blue-800 dark:text-blue-300">
                  <p><strong>Suggested:</strong> {suggestion.department} · {suggestion.priority} priority</p>
                  <p>{suggestion.departmentReason}</p>
                  <p>{suggestion.priorityReason}</p>
                  {(hasManualDepartmentOverride || hasManualPriorityOverride) && (
                    <button
                      type="button"
                      className="mt-1 font-bold underline"
                      onClick={() => {
                        setDepartment(suggestion.department);
                        setPriority(suggestion.priority);
                        setHasManualDepartmentOverride(false);
                        setHasManualPriorityOverride(false);
                      }}
                    >
                      Use these suggestions
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-blue-800 dark:text-blue-300">Enter a headline or description to receive explainable suggestions.</p>
              )}
            </div>
            {speechError && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200" role="alert">
                {speechError}
              </p>
            )}
            {speechNotice && (
              <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200" role="status">
                {speechNotice}
              </p>
            )}
            <p id="voice-help" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Record a description in English, ಕನ್ನಡ, or हिन्दी; Google identifies the language automatically. Your audio is sent to Google Speech-to-Text after you stop recording and is not attached to the complaint.
              {!speechSupported && ' Audio recording is not supported in this browser. Please use an up-to-date browser or type your description.'}
            </p>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 2: MEDIA CAPTURE BOX (Upload photo live camera or video)          */}
        {/* ========================================================================= */}
        <motion.div id="add-evidence" className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          
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
        <motion.div id="set-location" className="form-section" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          
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
                    {hasConfirmedLocation ? 'Live location' : 'Location not set'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                      Street / Landmark
                    </label>
                    <input
                      type="text"
                      value={locationAddress}
                      readOnly
                      placeholder="e.g. BM Road, Near Market Circle"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                        Area
                      </label>
                      <input
                        type="text"
                        value={locationArea}
                        readOnly
                        placeholder={isLookingUpArea ? 'Finding nearby area…' : 'Area name from your location'}
                        aria-label="Area name"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
                        <span>Lat: {FIXED_CITY_LOCATION.lat.toFixed(5)}° N</span>
                        <span>Lng: {FIXED_CITY_LOCATION.lng.toFixed(5)}° E</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Area lookup: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-slate-600 dark:hover:text-slate-300">OpenStreetMap contributors</a>
                  </p>
                </div>
              </div>

              {locationError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300" role="alert">
                  {locationError}
                </p>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Fixed location:</span> Navkis College of Engineering, Hassan.
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* RIGHT COLUMN: INTERACTIVE GOOGLE MAP                              */}
            {/* ----------------------------------------------------------------- */}
            <div className="lg:col-span-6">
              <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <GoogleMapView
                  center={{ lat: coords.lat, lng: coords.lng }}
                  markerTitle="Complaint location"
                  onLocationChange={undefined}
                  className="z-10 h-full w-full"
                />
                <div className="absolute top-3 right-3 z-20 rounded-xl bg-slate-950/85 px-3 py-1 text-[10px] font-mono font-bold text-white backdrop-blur-md shadow-md">
                  Live location
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
                    {[locationArea, locationAddress, locationDistrict].filter(Boolean).join(', ')}
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
