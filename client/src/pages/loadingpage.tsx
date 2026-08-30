import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  PhoneCall,
  Sun,
  Moon,
  Radio,
  LogOut,
  Shield,
  MapPin,
  Camera,
  BarChart3,
  Check,
  X,
  Clock,
  ThumbsUp,
  MapPinned,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Landmark,
  UserCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type WorkflowStepKey = '01' | '02' | '03' | '04';
type ModalStep = 'select' | 'citizen-login' | 'citizen-register' | 'department-login';

export function LoadingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, registerUser, quickLoginAsRole, logout } = useAuth();

  // Auth Modal State: 'select' | 'citizen-login' | 'citizen-register' | 'department-login'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select');

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Fields - Citizen Registration (Per handwritten sketch)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regState, setRegState] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCaptchaInput, setRegCaptchaInput] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Captcha Codes
  const [loginCaptchaCode, setLoginCaptchaCode] = useState('');
  const [regCaptchaCode, setRegCaptchaCode] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Interactive How-it-Works step selector
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<WorkflowStepKey>('01');

  const [selectedDeptLogin, setSelectedDeptLogin] = useState<string>('Public Works Department (PWD)');

  // Live Telemetry & Location State
  const [systemUptime, setSystemUptime] = useState(99.98);
  const [activeNodes, setActiveNodes] = useState(120);
  const [liveLocation, setLiveLocation] = useState<{
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    locality?: string;
  } | null>(null);

  // Theme state: dark / light
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return true; // default dark
    }
    return true;
  });

  // Generate random 5-character Captcha
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const refreshLoginCaptcha = () => {
    setLoginCaptchaCode(generateCaptcha());
    setLoginCaptchaInput('');
  };

  const refreshRegCaptcha = () => {
    setRegCaptchaCode(generateCaptcha());
    setRegCaptchaInput('');
  };

  useEffect(() => {
    refreshLoginCaptcha();
    refreshRegCaptcha();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Live Location Detection
  useEffect(() => {
    async function detectLiveLocation() {
      try {
        const ipRes = await fetch('https://ipwho.is/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.success && ipData.latitude && ipData.longitude) {
            setLiveLocation({
              city: ipData.city || 'Bengaluru',
              region: ipData.region || 'Karnataka',
              latitude: Number(ipData.latitude),
              longitude: Number(ipData.longitude),
            });
            if (!regCity) setRegCity(ipData.city || 'Bengaluru');
            if (!regState) setRegState(ipData.region || 'Karnataka');
          }
        }
      } catch {
        // Fallback
      }

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
              );
              if (res.ok) {
                const data = await res.json();
                setLiveLocation({
                  city: data.city || data.locality || 'Bengaluru',
                  region: data.principalSubdivision || 'Karnataka',
                  latitude: lat,
                  longitude: lon,
                  locality: data.locality,
                });
                if (!regCity) setRegCity(data.city || data.locality || 'Bengaluru');
                if (!regState) setRegState(data.principalSubdivision || 'Karnataka');
                if (!regDistrict) setRegDistrict(data.locality || 'Central District');
              }
            } catch {
              setLiveLocation((prev) => (prev ? { ...prev, latitude: lat, longitude: lon } : null));
            }
          },
          () => {},
          { timeout: 3500, maximumAge: 0 }
        );
      }
    }

    void detectLiveLocation();
  }, []);

  // Telemetry cycle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemUptime((prev) => +(99.95 + Math.random() * 0.04).toFixed(2));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRoleDashboardRedirect = (roleStr?: string, targetDept?: string) => {
    const chosenDept = targetDept || selectedDeptLogin;
    if (typeof window !== 'undefined' && chosenDept) {
      window.localStorage.setItem('smartcity_selected_dept', chosenDept);
    }
    const r = (roleStr || user?.role || 'Citizen').toLowerCase();
    if (chosenDept.includes('Administration') || r.includes('admin')) {
      navigate('/dashboard/admin');
    } else if (r.includes('head')) {
      navigate('/dashboard/dept-head');
    } else if (r.includes('officer') || modalStep === 'department-login') {
      navigate('/dashboard/officer');
    } else {
      navigate('/dashboard/citizen');
    }
  };

  // Open Modal
  const openPortalModal = () => {
    setModalStep('select');
    setErrorMessage('');
    setSuccessMessage('');
    refreshLoginCaptcha();
    refreshRegCaptcha();
    setIsAuthModalOpen(true);
  };

  // Login Handler (Citizen or Department login with Captcha)
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter your mail ID and password.');
      return;
    }

    if (loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase()) {
      setErrorMessage('Security Captcha does not match. Please try again.');
      refreshLoginCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      if (modalStep === 'department-login') {
        localStorage.setItem('smartcity_selected_dept', selectedDeptLogin);
        // Department Login Support
        const result = await login(loginEmail.trim(), loginPassword);
        if (result.success) {
          setSuccessMessage(`Authenticated as ${selectedDeptLogin}! Redirecting...`);
          setTimeout(() => {
            setIsAuthModalOpen(false);
            handleRoleDashboardRedirect(selectedDeptLogin.includes('Administration') ? 'admin' : 'officer', selectedDeptLogin);
          }, 600);
        } else {
          // Demo fallback for instant testing with universal credentials
          const demoRole = selectedDeptLogin.includes('Administration') ? 'admin' : 'officer';
          await quickLoginAsRole(demoRole);
          setSuccessMessage(`Authenticated for ${selectedDeptLogin}! Loading workspace...`);
          setTimeout(() => {
            setIsAuthModalOpen(false);
            handleRoleDashboardRedirect(demoRole, selectedDeptLogin);
          }, 600);
        }
      } else {
        const result = await login(loginEmail.trim(), loginPassword);
        if (result.success) {
          setSuccessMessage('Authentication verified! Loading citizen workspace...');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            handleRoleDashboardRedirect('citizen');
          }, 600);
        } else {
          setErrorMessage(result.message || 'Authentication failed. Please verify email and password.');
          refreshLoginCaptcha();
        }
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      refreshLoginCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // Citizen Registration Handler (Per handwritten sketch)
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please enter your Name, Mail ID, and Password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Security constraint: Password must be at least 6 characters.');
      return;
    }

    if (regCaptchaInput.trim().toUpperCase() !== regCaptchaCode.toUpperCase()) {
      setErrorMessage('Security Captcha does not match. Please try again.');
      refreshRegCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || undefined,
        state: regState.trim() || undefined,
        district: regDistrict.trim() || undefined,
        city: regCity.trim() || undefined,
        role: 'Citizen',
      });

      if (result.success) {
        setSuccessMessage('Citizen account created successfully! Launching citizen portal...');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          handleRoleDashboardRedirect('Citizen');
        }, 800);
      } else {
        setErrorMessage(result.message || 'Registration failed. Email might already exist.');
        refreshRegCaptcha();
      }
    } catch {
      setErrorMessage('Failed to register citizen account. Please retry.');
      refreshRegCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="home"
      className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans scroll-smooth transition-colors duration-300"
    >
      {/* Top Government Tricolor Accent Strip */}
      <div className="relative z-40 h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

      {/* ========================================================================= */}
      {/* HEADER NAVIGATION ([Logo] Home  About  How it works  Login)              */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          
          {/* Logo & Portal Branding */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Building2 className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                  JanSeva · Smart City
                </span>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Gov AI
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition">
                Multi-Modal Grievance System
              </h1>
            </div>
          </a>

          {/* Navigation Links from the sketch */}
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition"
            >
              How it works
            </button>

            {/* Helpline (desktop only) */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-slate-900 dark:text-white">1800-425-2026</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* LOGIN BUTTON from the sketch */}
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => handleRoleDashboardRedirect(user.role)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Portal:</span> {user.role}
              </button>
            ) : (
              <button
                type="button"
                onClick={openPortalModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION WITH PHOTO/IMAGE BACKGROUND                       */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] w-full flex items-center justify-center overflow-hidden">
        
        {/* Background Generated Smart City Hero Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/smart-city-hero.jpg"
            alt="Smart City Intelligent Infrastructure"
            className="w-full h-full object-cover object-center scale-105 animate-in fade-in duration-1000"
          />
          
          {/* Multi-layered Dark Gradient Overlays for High Contrast in both themes */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/45 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/85" />
          
          {/* Subtle Grid Lines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f610_1px,transparent_1px),linear-gradient(to_bottom,#3b82f610_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center space-y-8">
          
          {/* Live Mission Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-slate-950/85 px-4 py-1.5 text-xs font-bold text-blue-300 backdrop-blur-xl shadow-lg"
          >
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>JanSeva 2026 · Smart City AI Grievance & Predictive Analytics</span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 max-w-4xl"
          >
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] drop-shadow-md">
              Civic Governance,{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Intelligently Automated.
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Report municipal issues with real-time photo & video AI classification, GIS ward boundary routing, automated SLA dispatch, and predictive urban maintenance.
            </p>
          </motion.div>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
            >
              <Camera className="h-4 w-4" />
              <span>Report Civic Grievance</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={openPortalModal}
                className="flex items-center gap-2 rounded-2xl border border-blue-400/40 bg-slate-900/80 px-7 py-3.5 text-sm font-bold text-blue-200 hover:bg-slate-800 hover:text-white backdrop-blur-md transition shadow-lg"
              >
                <Lock className="h-4 w-4" />
                <span>Portal Login</span>
              </button>
            )}
          </motion.div>

          {/* Floating Glassmorphic Telemetry Cards Over the Hero */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="w-full max-w-5xl pt-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/75 p-3.5 backdrop-blur-xl text-left shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SLA Compliance</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-400">99.4%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Strict Civic Target</span>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/75 p-3.5 backdrop-blur-xl text-left shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GIS Wards Mapped</span>
                <span className="text-lg sm:text-2xl font-black text-blue-400">{activeNodes}/120</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% Boundary Linked</span>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/75 p-3.5 backdrop-blur-xl text-left shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Redressal</span>
                <span className="text-lg sm:text-2xl font-black text-indigo-300">9.4 Hours</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">-38% vs Manual</span>
              </div>

              <div className="rounded-2xl border border-slate-800/90 bg-slate-950/75 p-3.5 backdrop-blur-xl text-left shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">System Uptime</span>
                <span className="text-lg sm:text-2xl font-black text-amber-400">{systemUptime}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Gov Cloud 24/7</span>
              </div>
            </div>

            {/* Live Regional Geolocation Bar */}
            <div className="mt-3 rounded-2xl bg-slate-950/85 border border-emerald-500/30 p-3 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-xl">
              <div className="flex items-center gap-2 text-emerald-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 animate-bounce" />
                <span className="font-semibold">
                  Live Regional Node:{' '}
                  <span className="text-white font-bold">
                    {liveLocation ? `${liveLocation.locality || liveLocation.city}, ${liveLocation.region}` : 'Connecting Municipal Grid...'}
                  </span>
                  {liveLocation && (
                    <span className="text-[10px] font-mono text-emerald-400/90 ml-1.5 hidden sm:inline">
                      ({liveLocation.latitude.toFixed(4)}° N, {liveLocation.longitude.toFixed(4)}° E)
                    </span>
                  )}
                </span>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold px-2.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                ● Telemetry Online
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: ABOUT SECTION (Explicit Sketch Section: "About")               */}
      {/* ========================================================================= */}
      <section id="about" className="relative z-10 w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/90 py-20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              About The Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Next-Generation Civic Intelligence & Governance
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Designed under the National Smart Cities Mission to bridge citizens and municipal departments through automated computer vision, predictive maintenance, and verifiable SLA tracking.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-6 backdrop-blur-xl hover:border-blue-500/50 hover:shadow-lg transition group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4 group-hover:scale-110 transition">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Multi-Modal AI Vision</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Processes photos, videos, audio notes, and text reports to auto-classify department, estimate severity, and filter duplicate incidents instantly.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>YOLOv8 + NLP Triaging</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-6 backdrop-blur-xl hover:border-emerald-500/50 hover:shadow-lg transition group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4 group-hover:scale-110 transition">
                <MapPinned className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Geospatial GIS Mapping</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Precise geo-tagging with ward boundary mapping ensures complaints land directly in the queue of the designated local field engineer.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>120+ Ward Grid Polygons</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-6 backdrop-blur-xl hover:border-purple-500/50 hover:shadow-lg transition group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-4 group-hover:scale-110 transition">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Predictive Analytics</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Forecasts recurring infrastructure hot-spots (monsoon waterlogging, pipeline leaks, street-light faults) before citizen inconvenience occurs.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Proactive Civic Maintenance</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-6 backdrop-blur-xl hover:border-amber-500/50 hover:shadow-lg transition group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Transparent Audit Trails</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every grievance requires before/after photo verification from ward officers, citizen confirmation, and rating feedback before SLA closure.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Zero-Tamper SLA Clock</span>
              </div>
            </div>
          </div>

          {/* Quick Impact Counters */}
          <div className="mt-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl transition-colors">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">18,400+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Grievances Redressed</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">99.4%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">SLA Strict Compliance</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">120 Wards</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Real-Time GIS Coverage</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-300">4.8 / 5.0</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Citizen Satisfaction Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: HOW IT WORKS (Explicit Sketch Section: "How it works")        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative z-10 w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950 py-20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Civic Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How The Smart City Grievance Engine Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              From instant citizen capture to automated multi-modal AI dispatch, field engineer resolution, and citizen sign-off in 4 transparent steps.
            </p>
          </div>

          {/* 4 Interactive Workflow Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div
              onClick={() => setActiveWorkflowStep('01')}
              className={`rounded-3xl p-6 border transition cursor-pointer relative ${
                activeWorkflowStep === '01'
                  ? 'border-blue-500 bg-white dark:bg-blue-950/30 shadow-xl ring-1 ring-blue-500/50'
                  : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-mono font-black text-sm shadow-md">
                  01
                </span>
                <Camera className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Capture & Geo-Tag</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Citizen uploads a photo, video clip, or audio note. The app automatically tags GPS latitude, longitude, and ward code in seconds.
              </p>
              <span className="inline-block mt-4 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Multi-Modal Input →
              </span>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveWorkflowStep('02')}
              className={`rounded-3xl p-6 border transition cursor-pointer relative ${
                activeWorkflowStep === '02'
                  ? 'border-indigo-500 bg-white dark:bg-indigo-950/30 shadow-xl ring-1 ring-indigo-500/50'
                  : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-mono font-black text-sm shadow-md">
                  02
                </span>
                <Cpu className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI Triaging & Deduplication</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deep vision models classify category, check if this issue was already reported nearby to prevent duplicate queue flooding, and assign severity score.
              </p>
              <span className="inline-block mt-4 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Automated NLP & Vision →
              </span>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveWorkflowStep('03')}
              className={`rounded-3xl p-6 border transition cursor-pointer relative ${
                activeWorkflowStep === '03'
                  ? 'border-purple-500 bg-white dark:bg-purple-950/30 shadow-xl ring-1 ring-purple-500/50'
                  : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white font-mono font-black text-sm shadow-md">
                  03
                </span>
                <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Ward Engineer SLA Dispatch</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Routed immediately to the designated Ward Officer mobile console with a strict SLA deadline timer. Real-time SMS/WhatsApp updates to citizen.
              </p>
              <span className="inline-block mt-4 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Guaranteed Turnaround →
              </span>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveWorkflowStep('04')}
              className={`rounded-3xl p-6 border transition cursor-pointer relative ${
                activeWorkflowStep === '04'
                  ? 'border-emerald-500 bg-white dark:bg-emerald-950/30 shadow-xl ring-1 ring-emerald-500/50'
                  : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-mono font-black text-sm shadow-md">
                  04
                </span>
                <ThumbsUp className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Audit & Citizen Sign-Off</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Field engineer uploads resolution proof photo. Citizen verifies and provides star rating, closing the loop and feeding predictive urban models.
              </p>
              <span className="inline-block mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Verified Closure ✓
              </span>
            </div>
          </div>

          {/* Workflow CTA */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition"
            >
              <Camera className="h-4 w-4" />
              <span>Report a Civic Issue Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: FOOTER (Explicit Sketch Section: "Footer")                     */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-900 dark:bg-slate-950 pt-14 pb-8 text-xs text-slate-400 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
            
            {/* Col 1 & 2: Branding & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/30">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">JanSeva Smart City Governance</h4>
                  <p className="text-[11px] text-slate-400">Real-Time Multi-Modal AI Redressal Platform</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Empowering transparent, AI-driven civic grievance resolution across municipal wards with verifiable audit trails, SLA compliance, and predictive infrastructure analytics.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Municipal Network Operational · 99.98% System Health</span>
              </div>
            </div>

            {/* Col 3: Quick Links */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Portal Navigation</h5>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('home')}
                    className="hover:text-white transition"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('about')}
                    className="hover:text-white transition"
                  >
                    About The Platform
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-white transition"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/report')}
                    className="hover:text-white transition"
                  >
                    Report Civic Grievance
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Municipal Departments */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Departments</h5>
              <ul className="space-y-2 text-slate-400">
                <li>Roads & Urban Infrastructure</li>
                <li>Solid Waste Management</li>
                <li>Water Supply & Sewage (BWSSB)</li>
                <li>Electrical & Lighting (BESCOM)</li>
                <li>Public Health & Sanitation</li>
              </ul>
            </div>

            {/* Col 5: Emergency & Helplines */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Helpline & Support</h5>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>1800-425-2026 (Toll-Free)</span>
                </li>
                <li>Women & Child Helpline: 1091</li>
                <li>Disaster Control Room: 1077</li>
                <li>Email: support@smartcity.gov.in</li>
                <li>Language: English · Hindi · Kannada</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Back to Top */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span>© 2026 JanSeva Smart City Mission. All rights reserved.</span>
              <span>•</span>
              <span>ISO 9001:2015 Certified</span>
              <span>•</span>
              <span>Digital India Initiative</span>
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <span>Back to Top</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* AUTH MODAL: STACKED SELECTION -> CITIZEN LOGIN / REGISTER vs DEPT LOGIN   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl transition-colors"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Already Authenticated State */}
              {isAuthenticated && user ? (
                <div className="space-y-5 py-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Logged In
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      handleRoleDashboardRedirect(user.role);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    <span>Launch {user.role} Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out Current Session</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated State: Step-by-Step Flow */
                <div className="space-y-4">
                  
                  {/* Feedback Banners */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300 flex items-start gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}

                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{successMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ========================================================================= */}
                  {/* STEP 1: PORTAL SELECTION (2 Vertically Stacked Boxes: Top & Bottom)       */}
                  {/* ========================================================================= */}
                  {modalStep === 'select' && (
                    <motion.div
                      key="step-select"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4 py-2"
                    >
                      <div className="text-center space-y-1 mb-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-2">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          Select Login Portal
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Choose your designated access gateway to continue
                        </p>
                      </div>

                      {/* 2 Stacked Boxes (Top: Citizen Login, Bottom: Department Login) */}
                      <div className="space-y-3.5">
                        {/* Top Box: Citizen Login */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('citizen-login');
                            setErrorMessage('');
                            setSuccessMessage('');
                            refreshLoginCaptcha();
                          }}
                          className="w-full flex items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 text-left hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
                              <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                Citizen Login
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Public grievance filing, live GPS tracking & SLA feedback
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition" />
                        </button>

                        {/* Bottom Box: Department Login */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('department-login');
                            setErrorMessage('');
                            setSuccessMessage('');
                            refreshLoginCaptcha();
                          }}
                          className="w-full flex items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 text-left hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                              <Landmark className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                Department Login
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Ward Officers, Department Heads & Municipal Staff
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ========================================================================= */}
                  {/* STEP 2A: CITIZEN LOGIN (Mail ID, Password, Enter Captcha, Login button)    */}
                  {/* Below that: "New here? Register"                                          */}
                  {/* ========================================================================= */}
                  {modalStep === 'citizen-login' && (
                    <motion.div
                      key="step-citizen-login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('select');
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to Portals</span>
                        </button>
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Citizen Portal
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          Citizen Login
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Enter your registered email ID and password to access your account
                        </p>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                        {/* 1. Mail id */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Mail ID
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="citizen@smartcity.gov.in"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 2. Password */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 3. Enter Captcha */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Enter Captcha
                          </label>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2 font-mono font-black text-base tracking-[0.3em] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 select-none shadow-inner">
                              {loginCaptchaCode}
                            </div>

                            <button
                              type="button"
                              onClick={refreshLoginCaptcha}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Refresh Captcha"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>

                            <input
                              type="text"
                              required
                              value={loginCaptchaInput}
                              onChange={(e) => setLoginCaptchaInput(e.target.value)}
                              placeholder="Enter Captcha"
                              className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 px-3 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 4. Login Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Cpu className="h-4 w-4 animate-spin" />
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <>
                              <span>Login</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>

                        {/* Demo Autofill Helper */}
                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginEmail('citizen@smartcity.gov.in');
                              setLoginPassword('Password@123');
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            Fill Citizen Demo Credentials
                          </button>
                        </div>

                        {/* Below Login: "New here? Register" Option */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            New here?{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setModalStep('citizen-register');
                                setErrorMessage('');
                                setSuccessMessage('');
                                refreshRegCaptcha();
                              }}
                              className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Register</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ========================================================================= */}
                  {/* STEP 2B: CITIZEN REGISTER (Per handwritten sketch)                         */}
                  {/* Name, Phone number, Mail id, State, District, city, Password, Captcha,    */}
                  {/* Register button, Back to login link                                       */}
                  {/* ========================================================================= */}
                  {modalStep === 'citizen-register' && (
                    <motion.div
                      key="step-citizen-register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('citizen-login');
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to Login</span>
                        </button>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Register Page
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          Citizen Registration
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Fill out the form below to create your official citizen account
                        </p>
                      </div>

                      <form onSubmit={handleRegisterSubmit} className="space-y-3">
                        {/* 1. Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Enter full name"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 2. Phone number & 3. Mail id */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              Phone number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="tel"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              Mail ID
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="citizen@example.com"
                                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. State & 5. District & 6. City (From handwritten sketch) */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              required
                              value={regState}
                              onChange={(e) => setRegState(e.target.value)}
                              placeholder="Karnataka"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              District
                            </label>
                            <input
                              type="text"
                              required
                              value={regDistrict}
                              onChange={(e) => setRegDistrict(e.target.value)}
                              placeholder="Bengaluru"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              required
                              value={regCity}
                              onChange={(e) => setRegCity(e.target.value)}
                              placeholder="Bengaluru"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 7. Password */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Password (Min 6 characters)
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type={showRegPassword ? 'text' : 'password'}
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Create strong password"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 8. Captcha Enter (From handwritten sketch) */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Captcha Enter
                          </label>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-1.5 font-mono font-black text-base tracking-[0.3em] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 select-none shadow-inner">
                              {regCaptchaCode}
                            </div>

                            <button
                              type="button"
                              onClick={refreshRegCaptcha}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Refresh Captcha"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>

                            <input
                              type="text"
                              required
                              value={regCaptchaInput}
                              onChange={(e) => setRegCaptchaInput(e.target.value)}
                              placeholder="Enter captcha"
                              className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2 px-3 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 9. Register Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Cpu className="h-4 w-4 animate-spin" />
                              <span>Registering Citizen Profile...</span>
                            </>
                          ) : (
                            <>
                              <span>Register</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>

                        {/* 10. Back to login (From handwritten sketch) */}
                        <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setModalStep('citizen-login');
                              setErrorMessage('');
                              setSuccessMessage('');
                              refreshLoginCaptcha();
                            }}
                            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            ← Back to login
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* ========================================================================= */}
                  {/* STEP 2C: DEPARTMENT LOGIN (User ID, Password, Enter Captcha, Login)       */}
                  {/* ========================================================================= */}
                  {modalStep === 'department-login' && (
                    <motion.div
                      key="step-dept-login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setModalStep('select');
                            setErrorMessage('');
                            setSuccessMessage('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to Portals</span>
                        </button>
                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Department Portal
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-indigo-500" />
                          <span>Department Staff Login</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Official municipal access for Administration, PWD, Municipal Corporation, Tourism & Agriculture
                        </p>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                        {/* 1. DEPARTMENT SELECTOR (Per Audio: select for the department) */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            Department : <span className="text-indigo-600 dark:text-indigo-400">Select Your Department</span>
                          </label>
                          <div className="relative">
                            <select
                              value={selectedDeptLogin}
                              onChange={(e) => setSelectedDeptLogin(e.target.value)}
                              className="w-full appearance-none rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 py-2.5 pl-4 pr-10 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                            >
                              <option value="Administration / Municipal Commissioner">🏛️ Administration / Municipal Commissioner (Top Level)</option>
                              <option value="Public Works Department (PWD)">🚧 Public Works Department (PWD)</option>
                              <option value="Municipal Corporation">🏢 Municipal Corporation (Sanitation, Water, Power, Parks)</option>
                              <option value="Tourism Department">🏖️ Tourism Department</option>
                              <option value="Agriculture Department">🌾 Agriculture Department (Farmer Advisory)</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* 1-Click Quick Department Selector Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {[
                            { name: '🏛️ Administration', full: 'Administration / Municipal Commissioner', id: 'admin@smartcity.gov.in' },
                            { name: '🚧 PWD', full: 'Public Works Department (PWD)', id: 'pwd@smartcity.gov.in' },
                            { name: '🏢 Municipal Corp', full: 'Municipal Corporation', id: 'municipal@smartcity.gov.in' },
                            { name: '🏖️ Tourism', full: 'Tourism Department', id: 'tourism@smartcity.gov.in' },
                            { name: '🌾 Agriculture', full: 'Agriculture Department', id: 'agriculture@smartcity.gov.in' },
                          ].map((item) => (
                            <button
                              key={item.full}
                              type="button"
                              onClick={() => {
                                setSelectedDeptLogin(item.full);
                                setLoginEmail(item.id);
                                setLoginPassword('Password@123');
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                                selectedDeptLogin === item.full
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-1 ring-indigo-500'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>

                        {/* 2. Official Mail ID / User ID */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Official Mail ID / User ID
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="dept@smartcity.gov.in"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 3. Password */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Universal testing password: <code className="font-mono text-indigo-600 dark:text-indigo-400">Password@123</code></span>
                        </div>

                        {/* 4. Security Captcha */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                            Enter Security Captcha
                          </label>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2 font-mono font-black text-base tracking-[0.3em] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 select-none shadow-inner">
                              {loginCaptchaCode}
                            </div>

                            <button
                              type="button"
                              onClick={refreshLoginCaptcha}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                              title="Refresh Captcha"
                            >
                              <RotateCw className="h-4 w-4" />
                            </button>

                            <input
                              type="text"
                              required
                              value={loginCaptchaInput}
                              onChange={(e) => setLoginCaptchaInput(e.target.value)}
                              placeholder="Enter Captcha"
                              className="flex-1 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-2.5 px-3 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                          </div>
                        </div>

                        {/* 5. Login Button */}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Cpu className="h-4 w-4 animate-spin" />
                              <span>Authenticating Staff...</span>
                            </>
                          ) : (
                            <>
                              <span>Login to Department Portal</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
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
