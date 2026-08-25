import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BellRing,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Download,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  Globe2,
  HelpCircle,
  Landmark,
  Layers,
  Lock,
  MapPinned,
  Megaphone,
  PhoneCall,
  QrCode,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import { SwachhBharatLogo } from '../components/layout/SwachhBharatLogo';
import { GovernmentLoginModal } from '../components/auth/GovernmentLoginModal';
import { GovernmentRegisterModal } from '../components/auth/GovernmentRegisterModal';
import { HelpDeskModal } from '../components/common/HelpDeskModal';
import { useAuth } from '../context/AuthContext';

const nationalInitiatives = [
  { name: 'Smart Cities Mission', code: 'SCM', desc: 'MoHUA Govt of India' },
  { name: 'Swachh Bharat Urban 2.0', code: 'SBM-U', desc: 'Garbage Free Cities' },
  { name: 'CPGRAMS Redressal', code: 'CPGRAMS', desc: 'National Grievance Portal' },
  { name: 'Digital India', code: 'DI', desc: 'Power To Empower' },
  { name: 'AMRUT 2.0', code: 'AMRUT', desc: 'Water & Sanitation Mission' },
];

const citizenCharterTable = [
  { dept: 'Public Works Dept (PWD)', type: 'Road Potholes & Cratering', sla: '48 Hours', officer: 'Junior Engineer (Roads)', escalate: 'Executive Engineer (PWD)' },
  { dept: 'Water Supply (BWSSB)', type: 'Pipeline Leakage / Contamination', sla: '12 Hours', officer: 'Assistant Engineer (Water)', escalate: 'Executive Engineer (Water)' },
  { dept: 'Electricity Board', type: 'Street Light Outage / Cable Break', sla: '24 Hours', officer: 'Sub-Division Engineer', escalate: 'Superintending Engineer' },
  { dept: 'Sanitation & SWM', type: 'Garbage Mound / Waste Overflow', sla: '08 Hours', officer: 'Health Inspector (Ward)', escalate: 'Chief Health Officer' },
  { dept: 'Stormwater Drainage', type: 'Drain Choke / Desilting Blockage', sla: '36 Hours', officer: 'Drainage Nodal Officer', escalate: 'Joint Commissioner' },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Lodge Grievance',
    hindi: 'शिकायत दर्ज करें',
    desc: 'Submit municipal issue with auto-GPS coordinates, ward selection, and optional photo in under 60 seconds.',
    icon: FilePlus2,
  },
  {
    step: '02',
    title: 'NIC NLP Triage',
    hindi: 'एआई वर्गीकरण',
    desc: 'Machine learning model automatically classifies issue category, priority level, and routes directly to the ward engineer.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Ward Officer Action',
    hindi: 'अधिकारी निवारण',
    desc: 'Assigned Assistant Executive Engineer conducts field inspection and dispatches remediation work orders under SLA countdown.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Audit & Citizen Sign-off',
    hindi: 'सत्यापन व समापन',
    desc: 'Remediation completed with before/after photo verification, digital audit trail, and citizen satisfaction feedback.',
    icon: Award,
  },
];

const publicNotices = [
  {
    date: '25-Aug-2026',
    ref: 'MN-NOT-2026/841',
    title: 'Monsoon Preparedness: 24x7 Emergency Desilting of Primary Stormwater Drains in Wards 01-12.',
    dept: 'Engineering Division',
    badge: 'Urgent Circular',
  },
  {
    date: '22-Aug-2026',
    ref: 'MN-NOT-2026/839',
    title: 'Notification of Monthly Municipal Public Grievance Hearing at Town Hall on Thursday 11:00 AM.',
    dept: 'Administration',
    badge: 'Public Hearing',
  },
  {
    date: '18-Aug-2026',
    ref: 'MN-NOT-2026/827',
    title: 'Advisory on Digital Grievance Submission: STQC Mandated Aadhaar Masking on Photo Uploads.',
    dept: 'IT & e-Governance',
    badge: 'Advisory',
  },
];

export function LandingPage() {
  const [activeNoticeTab, setActiveNoticeTab] = useState<'notices' | 'gazette' | 'tenders'>('notices');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'about' | 'how-it-works' | 'sla'>('home');

  // Modal Triggers
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id: string, tabName: 'home' | 'about' | 'how-it-works' | 'sla') => {
    setActiveNavTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18]">
      
      {/* 1. Official Swachhata / Smart City Secondary Navigation Bar (Reference Image 1 & 2) */}
      <section className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm dark:border-slate-800 dark:bg-[#0A1628]">
        <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-1.5">
          
          {/* Left: Official Government Logo */}
          <div className="flex items-center">
            <GovernmentEmblem className="h-10 w-10 flex-shrink-0" />
          </div>

          {/* Right Navigation Items matching Reference Image 1 & 2 */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-wrap">
            
            {/* HOME Tab (Teal Highlight like Image 1) */}
            <button
              type="button"
              onClick={() => scrollToSection('hero-section', 'home')}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition rounded-md ${
                activeNavTab === 'home'
                  ? 'bg-[#1F7A7A] text-white shadow-sm'
                  : 'text-slate-800 hover:text-[#1F7A7A] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              HOME
            </button>

            {/* ABOUT Tab */}
            <button
              type="button"
              onClick={() => scrollToSection('about-section', 'about')}
              className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition rounded-md ${
                activeNavTab === 'about'
                  ? 'bg-[#1F7A7A] text-white shadow-sm'
                  : 'text-slate-800 hover:text-[#1F7A7A] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ABOUT
            </button>

            {/* HOW IT WORKS Tab */}
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works-section', 'how-it-works')}
              className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition rounded-md ${
                activeNavTab === 'how-it-works'
                  ? 'bg-[#1F7A7A] text-white shadow-sm'
                  : 'text-slate-800 hover:text-[#1F7A7A] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              HOW IT WORKS
            </button>

            {/* SLA Tab */}
            <button
              type="button"
              onClick={() => scrollToSection('sla-section', 'sla')}
              className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition rounded-md ${
                activeNavTab === 'sla'
                  ? 'bg-[#1F7A7A] text-white shadow-sm'
                  : 'text-slate-800 hover:text-[#1F7A7A] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              SLA
            </button>

            {/* LOGIN / REGISTER Buttons */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard/citizen')}
                className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded-md border border-emerald-300 hover:bg-emerald-100 transition dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                My Account ({user?.name?.split(' ')[0]})
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-800 hover:text-[#1F7A7A] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-md transition"
                >
                  LOGIN
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#1F7A7A] bg-[#1F7A7A]/10 hover:bg-[#1F7A7A]/20 rounded-md transition border border-[#1F7A7A]/30"
                >
                  REGISTER
                </button>
              </>
            )}

            {/* Prominent Red Pill: Click here for help (Reference Image 1 & 2) */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#E50914] px-4 py-2 text-xs font-black tracking-wide text-white shadow-md hover:bg-[#C10811] active:scale-95 transition ml-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Click here for help</span>
            </button>

          </div>

        </div>
      </section>

      {/* 2. Hero Banner inspired by Reference Image 2 (Split Civic Worker Visual + Angular Green MoHUA Card) */}
      <section id="hero-section" className="relative min-h-[calc(100vh-82px)] flex flex-col lg:flex-row bg-[#152e25] text-white overflow-hidden">
        
        {/* Left Side: Municipal Civic Worker Photo */}
        <div className="relative w-full lg:w-[45%] min-h-[300px] lg:min-h-full overflow-hidden flex-shrink-0">
          <img
            src="/images/swachhata_hero_worker.jpg"
            alt="Indian Municipal Worker smiling warmly"
            className="h-full w-full object-cover object-[center_12%] opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Right Side: Solid Angular Green Box Housing ALL Text & Elements */}
        <div
          className="relative w-full lg:w-[55%] flex-1 bg-gradient-to-br from-[#72a868] via-[#5c9951] to-[#407f37] flex items-center shadow-2xl -mt-6 lg:mt-0 z-10"
          style={{
            clipPath: 'polygon(min(60px, 8%) 0, 100% 0, 100% 100%, 0% 100%)',
          }}
        >
          {/* Subtle circular civic insignia vector watermark */}
          <svg className="absolute right-6 top-8 h-[400px] w-[400px] text-white/10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 A40 40 0 0 0 10 50 A40 40 0 0 0 50 90 A40 40 0 0 0 90 50 A40 40 0 0 0 50 10 Z M50 20 A30 30 0 1 1 20 50 A30 30 0 0 1 50 20 Z" />
          </svg>

          {/* ALL Foreground Content strictly padded inside the Green Box */}
          <div className="relative z-20 py-8 lg:py-12 pl-8 sm:pl-16 lg:pl-20 pr-6 sm:pr-10 w-full max-w-2xl space-y-4">
            
            {/* Official Project Emblem Card (Image 2) */}
            <div className="rounded-xl bg-white/95 backdrop-blur-sm p-3.5 shadow-lg border border-slate-200 text-slate-900 flex items-center gap-3.5 max-w-md">
              <GovernmentEmblem className="h-11 w-11 flex-shrink-0" />
              <div className="text-left leading-tight">
                <span className="font-hindi text-[10px] font-black uppercase text-[#0A2540] block">
                  स्मार्ट सिटी लोक शिकायत एवं नगरीय शासन प्रणाली
                </span>
                <span className="font-hindi text-[9px] font-bold text-slate-600 block">
                  भारत सरकार · GOVERNMENT OF INDIA
                </span>
                <span className="text-[10px] font-black uppercase text-slate-900 block tracking-tight">
                  Smart City Governance System
                </span>
                <span className="text-[8px] font-bold uppercase text-slate-600 block tracking-wider">
                  Real-Time Multi-Modal Issue Detection & Predictive Analytics
                </span>
              </div>
            </div>

            {/* Main Headline & Mission Text */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-white drop-shadow-md leading-tight">
                Welcome to the Smart City Governance System
              </h1>
              <p className="font-hindi text-sm font-bold text-amber-200 drop-shadow">
                स्मार्ट सिटी लोक शिकायत, बहु-माध्यमिक समस्या निवारण एवं पूर्वानुमानात्मक विश्लेषण प्रणाली
              </p>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed drop-shadow-sm pt-1">
                Smart City Governance System with Real-Time Multi-Modal Issue Detection and Predictive Analytics — empowering citizens, ward engineers, and municipal authorities with automated GIS issue routing, SLA tracking, and predictive urban governance.
              </p>
            </div>

            {/* Action Buttons (Neatly aligned in uniform row inside green box) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('about-section', 'about')}
                className="h-11 px-5 rounded-lg bg-white text-xs font-black uppercase tracking-wider text-[#1F7A7A] shadow-md hover:bg-slate-50 transition active:scale-95 flex items-center justify-center"
              >
                Know More
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/report');
                  } else {
                    setLoginModalOpen(true);
                  }
                }}
                className="h-11 px-5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <FilePlus2 className="h-4 w-4" />
                <span>Lodge Grievance (Form SC-2026)</span>
              </button>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="h-11 px-5 rounded-lg bg-[#1F7A7A] hover:bg-[#197575] text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Sign In / Register</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/citizen')}
                  className="h-11 px-5 rounded-lg bg-[#1F7A7A] hover:bg-[#197575] text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>My Dashboard ➔</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about-section" className="page-shell py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <span className="section-kicker">About Smart Cities Governance Mission</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white mt-1">
              Unified AI-Powered Smart City Grievance & Municipal Portal
            </h2>
            <p className="font-hindi text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
              आवासन और शहरी कार्य मंत्रालय एवं स्मार्ट सिटी मिशन की संयुक्त पहल
            </p>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The Smart City Platform serves as a transparent civic redressal bridge connecting citizens directly with ward-level executive engineers. Every complaint is analyzed via AI multi-modal detection, tracked under statutory Citizen Charter SLA guarantees, and resolved with verifiable public audit accountability.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="gov-panel p-3.5 border-l-4 border-l-[#1F7A7A]">
                <b className="font-black text-[#1F7A7A] block text-base font-mono">100% GIS Ward Mapped</b>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">All 120+ wards with GPS boundaries</span>
              </div>
              <div className="gov-panel p-3.5 border-l-4 border-l-amber-600">
                <b className="font-black text-amber-700 block text-base font-mono">84.8% SLA Redressal</b>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Average resolution under 9.4 hours</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/home');
                  } else {
                    setLoginModalOpen(true);
                  }
                }}
                className="btn-gov-primary text-xs"
              >
                Explore GIS Ward Intelligence ➔
              </button>
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="btn-gov-outline text-xs"
              >
                Helpline & FAQ Desk
              </button>
            </div>
          </div>

          {/* Quick Registration & Login Card Showcase */}
          <div className="gov-panel p-6 border-2 border-slate-300 dark:border-slate-800 bg-[#d8eabf]/40 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#1F7A7A]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0A2540] dark:text-white">
                  Quick Portal Access
                </h3>
              </div>
              <span className="gov-badge-green text-[9px]">GIGW 3.0 SSO</span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
              Access your registered citizen grievances, ward officer field tasks, and municipal department metrics:
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setLoginModalOpen(true)}
                className="w-full btn-gov-primary py-3 text-xs font-black flex items-center justify-center gap-2 bg-[#208b8b] hover:bg-[#197575]"
              >
                <Lock className="h-4 w-4" />
                Sign In with Email & Captcha
              </button>

              <button
                type="button"
                onClick={() => setRegisterModalOpen(true)}
                className="w-full btn-gov-outline py-3 text-xs font-black flex items-center justify-center gap-2 bg-white"
              >
                <FileCheck2 className="h-4 w-4 text-[#1F7A7A]" />
                Register New Citizen Account (प्रपत्र पंजीकरण)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works-section" className="bg-slate-100/80 dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="page-shell">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="section-kicker">Transparent Civic Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white mt-1">
              How Smart City Redressal Works
            </h2>
            <p className="font-hindi text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              शिकायत पंजीकरण से लेकर निस्तारण एवं नागरिक सत्यापन की 4-चरणीय प्रक्रिया
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="gov-panel p-5 border-t-4 border-t-[#1F7A7A] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1F7A7A]/10 text-[#1F7A7A] font-black">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono font-black text-xl text-slate-300 dark:text-slate-700">{step.step}</span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <h4 className="font-hindi text-[11px] font-bold text-[#1F7A7A]">
                      {step.hindi}
                    </h4>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      ✓ Statutory Milestone
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SLA SECTION (Citizen Charter Table) */}
      <section id="sla-section" className="page-shell py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="section-kicker">Citizen Charter · नागरिक अधिकार पत्र</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2540] dark:text-white mt-1">
              Guaranteed Service Level Agreements (SLA)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-hindi">
              नगर निगम सेवा गारंटी अधिनियम 2026 के अंतर्गत वैधानिक निस्तारण समयसीमा
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/report');
              } else {
                setLoginModalOpen(true);
              }
            }}
            className="btn-gov-saffron text-xs self-start md:self-auto flex items-center gap-1.5"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            File Grievance Now
          </button>
        </div>

        <div className="gov-panel overflow-hidden border border-slate-300 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A2540] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Grievance Category</th>
                  <th className="px-4 py-3 text-center">Guaranteed SLA</th>
                  <th className="px-4 py-3">Designated Officer</th>
                  <th className="px-4 py-3">Escalation Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {citizenCharterTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-[#0A2540] dark:text-blue-400">{row.dept}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.type}</td>
                    <td className="px-4 py-3 text-center font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">{row.sla}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.officer}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{row.escalate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. GAZETTE, NOTICES & TENDERS SECTION */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="page-shell">
          <div className="gov-panel p-6 border-2 border-slate-300 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A2540] text-white">
                  <Megaphone className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0A2540] dark:text-white">
                    Official Gazette, Circulars & Public Notices
                  </h3>
                  <p className="text-[11px] font-hindi text-slate-500">
                    विभागीय आदेश, सूचनाएं एवं नागरिक परिपत्र
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNoticeTab('notices')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeNoticeTab === 'notices'
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Public Notices
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNoticeTab('gazette')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeNoticeTab === 'gazette'
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Gazette Orders
                </button>
              </div>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {publicNotices.map((notice, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-lg transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="gov-badge font-mono text-[9px]">{notice.ref}</span>
                      <span className="gov-badge-saffron text-[9px]">{notice.badge}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{notice.dept}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {notice.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">{notice.date}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading gazette order ${notice.ref}...`)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-[#0A2540] hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modals */}
      <GovernmentLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />

      <GovernmentRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      <HelpDeskModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

    </div>
  );
}
