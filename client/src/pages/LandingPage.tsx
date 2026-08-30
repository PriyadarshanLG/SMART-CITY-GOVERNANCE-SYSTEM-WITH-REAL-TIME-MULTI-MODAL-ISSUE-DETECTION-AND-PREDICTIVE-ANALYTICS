import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Cpu,
  FileText,
  Landmark,
  Layers,
  MapPinned,
  Megaphone,
  PhoneCall,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: 'Secure Citizen Audit',
    text: 'Encrypted submission with verified tracking tokens, safeguarding citizen data privacy.',
    badge: 'Security',
  },
  {
    icon: MapPinned,
    title: 'Geospatial Ward Mapping',
    text: 'Ward-level geo-tagging with GIS boundary mapping and real-time alert pins.',
    badge: 'GIS Intel',
  },
  {
    icon: Zap,
    title: 'Automated ML Routing',
    text: 'Real-time NLP categorizes grievance urgency and routes directly to respective engineers.',
    badge: 'AI Powered',
  },
  {
    icon: Megaphone,
    title: 'Public Bulletins',
    text: 'Official announcements on drainage drives, road works, and water line maintenance.',
    badge: 'Broadcasts',
  },
];

const stats = [
  { value: '18,423', label: 'Grievances Filed', change: '+12% this month', border: 'border-l-orange-500' },
  { value: '14,218', label: 'Redressed Cases', change: '84.8% SLA rate', border: 'border-l-emerald-500' },
  { value: '2,106', label: 'Active in Queue', change: 'Avg 9.4h resolution', border: 'border-l-blue-500' },
  { value: '120+', label: 'Covered Wards', change: '100% GIS mapped', border: 'border-l-amber-500' },
];

const workflowSteps = [
  { step: '01', title: 'File Issue', desc: 'Submit issue with location, description, and optional photo in under 60 seconds.' },
  { step: '02', title: 'ML Classifier', desc: 'Auto-detects department, category, and priority using local machine learning.' },
  { step: '03', title: 'Ward Officer Action', desc: 'Assigned to ward engineer with strict SLA turnaround deadlines.' },
  { step: '04', title: 'Audit & Closure', desc: 'Before/after photo audit with citizen confirmation and rating.' },
];

export function LandingPage() {
  const [complaintId, setComplaintId] = useState('');
  const [trackerError, setTrackerError] = useState('');
  const [simpleMode, setSimpleMode] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('simpleMode') === 'true' : false));
  const navigate = useNavigate();

  useEffect(() => {
    const handleModeChange = () => {
      setSimpleMode(localStorage.getItem('simpleMode') === 'true');
    };

    window.addEventListener('simple-mode-change', handleModeChange);
    return () => window.removeEventListener('simple-mode-change', handleModeChange);
  }, []);

  const toggleSimpleMode = () => {
    const nextMode = !simpleMode;
    setSimpleMode(nextMode);
    localStorage.setItem('simpleMode', String(nextMode));
    window.dispatchEvent(new Event('simple-mode-change'));
  };

  const handleTrackSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaintId.trim()) {
      setTrackerError('Please enter a valid Reference ID.');
      return;
    }

    navigate(`/complaints/${complaintId.trim()}`);
  };

  // Simplified / High Accessibility / Senior Citizen Mode
  if (simpleMode) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 animate-in fade-in duration-300 select-none">
        {/* Toggle back button */}
        <div className="flex justify-end">
          <button
            onClick={toggleSimpleMode}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            ← Switch to Standard Portal (मानक पोर्टल)
          </button>
        </div>

        {/* Simplified Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl md:p-12 text-center">
          <div className="mb-4 flex justify-center gap-1.5">
            <span className="h-2 w-12 rounded-full bg-[#FF9933]" />
            <span className="h-2 w-12 rounded-full bg-white" />
            <span className="h-2 w-12 rounded-full bg-[#138808]" />
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
            स्मार्ट सिटी नागरिक सहायता केंद्र
          </h1>
          <h2 className="mt-2 text-lg font-bold uppercase tracking-wider text-blue-300 md:text-xl">
            Smart City Simplified Grievance Helpdesk
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            यह सरल मोड उन नागरिकों के लिए है जो बिना किसी जटिलता के अपनी समस्याओं को दर्ज करना और ट्रैक करना चाहते हैं।
            <span className="mt-1 block text-xs text-slate-400">
              (Report issues or track grievance status with high-contrast, easy-to-read interfaces.)
            </span>
          </p>
        </section>

        {/* Simplified Action Cards */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* File Complaint Card */}
          <div className="surface-card flex flex-col justify-between border-t-8 border-t-blue-600 p-6 shadow-lg md:p-8 dark:border-t-blue-500">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-3xl">
                📝
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">File a Grievance</h3>
              <h4 className="mt-0.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                नई शिकायत दर्ज करें
              </h4>
              <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300 md:text-sm">
                Report broken street lights, potholes, pipeline water leaks, or uncollected garbage. The system routes it to the designated department automatically.
              </p>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="btn-primary mt-8 w-full py-4 text-sm font-bold gap-2"
              type="button"
            >
              Start Grievance Form / शुरू करें <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Track Complaint Card */}
          <div className="surface-card flex flex-col justify-between border-t-8 border-t-emerald-600 p-6 shadow-lg md:p-8 dark:border-t-emerald-500">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 text-3xl">
                🔍
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Track Grievance</h3>
              <h4 className="mt-0.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                शिकायत की स्थिति देखें
              </h4>
              <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300 md:text-sm">
                Enter your Reference ID (e.g. SC-2026-000001) to view officer timeline, current status, and print the official audit receipt.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="mt-8 space-y-3">
              <input
                type="text"
                value={complaintId}
                onChange={(event) => {
                  setComplaintId(event.target.value);
                  setTrackerError('');
                }}
                placeholder="e.g. SC-2026-000001"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-bold tracking-wide text-slate-900 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-emerald-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition"
              >
                Find Status / खोजें
              </button>
              {trackerError && <p className="text-center text-xs font-bold text-red-600">{trackerError}</p>}
            </form>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="surface-card border-l-4 border-l-orange-500 p-6 md:p-8">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              🚨 Emergency Helplines (आपातकालीन नंबर)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click to dial directly for life-critical responses.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['National Emergency', '112', 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900'],
              ['Police Dept', '100', 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900'],
              ['Ambulance / Health', '108', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'],
            ].map(([label, value, styles]) => (
              <a
                key={label}
                href={`tel:${value}`}
                className={`flex flex-col items-center justify-center rounded-2xl border p-4 transition-transform hover:scale-105 ${styles}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
                <span className="mt-1 font-mono text-2xl font-black">{value}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Top Live Emergency Ticker */}
      <div className="w-full overflow-hidden border-y border-amber-400/20 bg-slate-950 py-2.5 text-xs text-amber-400 dark:bg-black dark:text-amber-400 select-none">
        <div className="flex animate-ticker gap-12 whitespace-nowrap font-medium tracking-wide">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-red-400">MONSOON ALERT:</span> Special drainage and sewer clearance drive underway in Ward 01 & Ward 03.
          </span>
          <span className="flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider">PUBLIC HEARING:</span> Ward-level municipal grievance session scheduled for Thursday 11:00 AM.
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider">REPAIR UPDATE:</span> High-tension electricity line restored in Metro Sector; street light grid 100% operational.
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold uppercase tracking-wider text-red-400">MONSOON ALERT:</span> Special drainage and sewer clearance drive underway in Ward 01 & Ward 03.
          </span>
          <span className="flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider">PUBLIC HEARING:</span> Ward-level municipal grievance session scheduled for Thursday 11:00 AM.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative page-shell pt-12 pb-16">
        {/* Background ambient glows */}
        <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/15" />
        <div className="pointer-events-none absolute right-1/4 top-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-600/15" />

        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Left Column: Hero Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="gov-badge">
                🇮🇳 Official Citizen Redressal Portal
              </span>
              <button
                onClick={toggleSimpleMode}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
              >
                ♿ Simplified Senior Mode / सरल मोड
              </button>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white leading-[1.08]">
              Transparent Civic Redressal for a <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-sky-300">Smart Society</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base font-normal">
              Official municipal grievance registration platform. File civic disputes, potholes, lighting faults, or sanitation requests. Grievances are classified automatically using Machine Learning and routed to designated field officers for accountable resolution.
            </p>

            {/* Quick Grievance Reference Lookup Box */}
            <div className="mt-8 glass-card border-l-4 border-l-blue-600 p-5 shadow-sm dark:border-l-blue-500">
              <form onSubmit={handleTrackSubmit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Track Grievance / Ref ID Status
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Sample: SC-2026-000001</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={complaintId}
                      onChange={(event) => {
                        setComplaintId(event.target.value);
                        setTrackerError('');
                      }}
                      placeholder="Enter 14-digit Reference ID..."
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 pl-10 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-3 text-xs"
                  >
                    Track Status
                  </button>
                </div>
                {trackerError && <p className="text-xs font-semibold text-red-600 mt-1">{trackerError}</p>}
              </form>
            </div>

            {/* Primary CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/report" className="btn-primary gap-2 text-xs">
                File a Complaint <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/complaints/SC-2026-000001" className="btn-secondary gap-2 text-xs">
                <Search className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> View Sample Audit
              </Link>
              <Link to="/home" className="btn-secondary gap-2 text-xs">
                <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Explore GIS Analytics
              </Link>
            </div>

            {/* Live Stats Row */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className={`surface-card border-l-4 p-4 ${item.border}`}>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <span className="mt-2 inline-block text-[10px] font-semibold text-slate-400 dark:text-slate-500">{item.change}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Interactive Operations Hub Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-card overflow-hidden p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              {/* Header inside Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-300 border border-blue-500/30">
                    Civic Operations Hub
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live ML Node
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold">Intelligent Triage Surface</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Automated routing classifies citizen inputs with 95.8% accuracy into respective municipal departments.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-medium">
                  {['Public Works', 'Sanitation', 'Water Supply', 'Electricity'].map((dept) => (
                    <div key={dept} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-white/90 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> {dept}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Triage Activity List */}
              <div className="mt-6 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recent System Dispatches
                </p>
                {[
                  { id: 'SC-000001', category: 'Street Light Outage', ward: 'Ward 01', dept: 'Electricity', status: 'Work Started', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300' },
                  { id: 'SC-000214', category: 'Garbage Mound', ward: 'Ward 04', dept: 'Sanitation', status: 'Assigned', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300' },
                  { id: 'SC-000109', category: 'Road Damage / Pothole', ward: 'Ward 02', dept: 'Public Works', status: 'Resolved', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">{item.id}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{item.category}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.dept} · {item.ward}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-Column Feature Grid */}
      <section className="page-shell py-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="section-kicker">Core System Architecture</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            Built for Transparency and Speed
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Every step is designed to eliminate bureaucratic delay, prioritize critical civic disputes, and keep the public informed.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-card glass-card-hover p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{feature.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Step-by-Step */}
      <section className="page-shell py-12">
        <div className="surface-card p-8 md:p-12">
          <div className="max-w-2xl">
            <p className="section-kicker">End-to-End Workflow</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              How a Grievance is Resolved
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              From submission to on-site municipal verification, track the guaranteed 4-step SLA progression.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                <span className="text-3xl font-black text-blue-600/30 dark:text-blue-400/30 font-mono">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.desc}</p>
                {index < 3 && (
                  <span className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 text-xs font-bold">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="page-shell pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-xl md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
                Join 61,000+ Citizens
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold">Ready to improve your neighborhood?</h2>
              <p className="mt-2 max-w-xl text-xs sm:text-sm text-blue-100">
                File complaints, monitor repairs in real time, and hold municipal departments accountable.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/report" className="rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-blue-700 shadow hover:bg-blue-50 transition">
                Register Grievance Now
              </Link>
              <Link to="/home" className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition">
                View Ward Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
