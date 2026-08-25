import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Globe2,
  Menu,
  Moon,
  PhoneCall,
  ShieldCheck,
  Sun,
  UserCheck,
  X,
  FilePlus2,
  Search,
  BarChart3,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Check,
  Award,
  Landmark,
  Eye,
  Type,
  FileText,
  Lock,
} from 'lucide-react';
import { GovernmentEmblem } from './GovernmentEmblem';
import { Assistant } from './Assistant';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Portal Home', hindiLabel: 'मुख्य पृष्ठ', icon: Landmark },
  { to: '/report', label: 'Lodge Grievance', hindiLabel: 'शिकायत दर्ज करें', icon: FilePlus2, badge: 'Form SC-2026' },
  { to: '/complaints/SC-2026-000001', label: 'Track Ref / GRN', hindiLabel: 'स्थिति ट्रैक करें', icon: Search },
  { to: '/home', label: 'GIS Ward Operations', hindiLabel: 'वार्ड मानचित्र व नियंत्रण', icon: BarChart3 },
];

const roles = [
  { id: 'citizen', label: 'Citizen (नागरिक)', desc: 'File & track municipal grievances' },
  { id: 'officer', label: 'Ward Officer / JE (वार्ड अधिकारी)', desc: 'Field inspection & repair SLA' },
  { id: 'dept-head', label: 'Dept Head / AEE (विभागाध्यक्ष)', desc: 'Department triage & approvals' },
  { id: 'admin', label: 'Municipal Admin (प्रशासक)', desc: 'Central audit & GIS ward config' },
];

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

const FONT_SCALES = [
  { id: 'sm', label: 'A-', scale: '92%', name: 'Small' },
  { id: 'md', label: 'A', scale: '100%', name: 'Standard' },
  { id: 'lg', label: 'A+', scale: '108%', name: 'Large' },
  { id: 'xl', label: 'A++', scale: '116%', name: 'Extra Large' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, quickLoginAsRole } = useAuth();

  // Accessibility States
  const [darkMode, setDarkMode] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('theme') === 'dark' : false));
  const [highContrast, setHighContrast] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('highContrast') === 'true' : false));
  const [fontScaleId, setFontScaleId] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('fontScaleId') || 'md' : 'md'));
  const [selectedLang, setSelectedLang] = useState('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Layout UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // High Contrast effect
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('highContrast', String(highContrast));
  }, [highContrast]);

  // Font scale effect
  useEffect(() => {
    const found = FONT_SCALES.find((f) => f.id === fontScaleId) ?? FONT_SCALES[1]!;
    document.documentElement.style.setProperty('--font-scale', found.scale);
    localStorage.setItem('fontScaleId', fontScaleId);
  }, [fontScaleId]);

  // Route change resets
  useEffect(() => {
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  const activeRoleMatch = useMemo(() => {
    const match = location.pathname.match(/^\/dashboard\/([^/]+)/);
    return match?.[1]?.toLowerCase() ?? 'citizen';
  }, [location.pathname]);

  const currentRoleInfo = useMemo(() => {
    return roles.find((r) => r.id === activeRoleMatch) || roles[0];
  }, [activeRoleMatch]);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Skip to Main Content Link for GIGW / Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-xs focus:font-black focus:text-slate-950 focus:shadow-xl"
      >
        Skip to main content / मुख्य सामग्री पर जाएं
      </a>

      {/* Official Indian National Tricolor Header Strip */}
      <div className="gov-header-ribbon" />

      {/* GIGW Official Top Utility & Accessibility Bar */}
      <section className="border-b border-slate-200 bg-[#0A2540] text-white py-1.5 text-[11px] select-none dark:border-slate-800 dark:bg-[#051322]">
        <div className="page-shell flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Official Government of India Identity */}
          <div className="flex items-center gap-2">
            <span className="font-hindi font-semibold text-amber-300">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold tracking-wide text-slate-200">Government of India</span>
            <span className="hidden md:inline text-slate-400">·</span>
            <span className="hidden md:inline text-slate-300">Smart City Municipal Corporation</span>
          </div>

          {/* Right: Accessibility Controls & Utilities */}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            
            {/* Live IST Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-amber-300/90 font-mono">
              <span>⏰</span>
              <span>{currentTime || 'IST'}</span>
            </div>

            <div className="hidden sm:block h-3 w-px bg-slate-700" />

            {/* Font Size Adjusters (A- | A | A+ | A++) */}
            <div className="flex items-center gap-0.5 bg-slate-800/80 rounded border border-slate-700 px-1 py-0.5" title="Adjust Text Size (GIGW)">
              <span className="text-[9px] text-slate-400 px-1 hidden sm:inline">Text:</span>
              {FONT_SCALES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontScaleId(f.id)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${
                    fontScaleId === f.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={`${f.name} Size (${f.scale})`}
                  aria-label={`Set font size to ${f.name}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="High Contrast Accessibility View"
            >
              {highContrast ? '⚡ High Contrast ON' : 'High Contrast'}
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle display theme"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-300" />}
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-semibold text-slate-200 hover:bg-slate-700 transition"
                title="Select Portal Language"
              >
                <Globe2 className="h-3 w-3 text-amber-400" />
                <span>{languages.find((l) => l.code === selectedLang)?.native || 'English'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-2xl z-50 animate-in fade-in duration-100">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setSelectedLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition ${
                        selectedLang === l.code
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.native}</span>
                      {selectedLang === l.code && <Check className="h-3 w-3 text-slate-950" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Toll-Free Link */}
            <a
              href="tel:1800112026"
              className="hidden xl:inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition text-[10px]"
            >
              <PhoneCall className="h-3 w-3 text-amber-400" />
              <span>Helpline: 1800-11-2026</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Sovereign Portal Header with Crest & Branding (Only on Internal Pages) */}
      {!isLandingPage && (
        <>
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-[#081220]/95">
        <div className="page-shell py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* National Emblem & Bilingual Title */}
            <button
              className="flex items-center gap-3.5 text-left group focus:outline-none"
              onClick={() => navigate('/')}
              type="button"
            >
              {/* Ashoka Lion Crest SVG */}
              <GovernmentEmblem className="h-12 w-12 flex-shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform" />

              <div className="border-l border-slate-200 pl-3.5 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-hindi text-xs sm:text-sm font-black text-[#0A2540] dark:text-amber-300">
                    स्मार्ट सिटी लोक शिकायत एवं निवारण प्रणाली
                  </span>
                  <span className="hidden sm:inline-flex items-center rounded-sm bg-blue-50 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-widest text-[#0A2540] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    MoHUA
                  </span>
                </div>

                <span className="block text-xs sm:text-sm font-extrabold tracking-tight text-[#0A2540] dark:text-white leading-tight">
                  Smart City Public Grievance Redressal Portal
                </span>

                <span className="hidden md:block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Ministry of Housing & Urban Affairs · Digital India Citizen Governance Initiative
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 xl:flex bg-slate-100/90 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex flex-col items-start px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#0A2540] text-white shadow-sm dark:bg-blue-600'
                          : 'text-slate-700 hover:text-[#0A2540] hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-amber-500 px-1 text-[8px] font-extrabold text-slate-950">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] opacity-75 font-hindi font-normal">
                      {item.hindiLabel}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Actions: Role Workspace Switcher & Login */}
            <div className="hidden items-center gap-2 lg:flex">
              
              {/* Role Jurisdiction Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition shadow-sm"
                  title="Switch Active Jurisdiction Role"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#0A2540] dark:text-amber-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 leading-none">View Mode</span>
                    <span className="capitalize leading-tight font-extrabold">{user ? user.name : currentRoleInfo?.label}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-300 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-950 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Switch Role Jurisdiction / कार्यक्षेत्र
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={async () => {
                          await quickLoginAsRole(r.id);
                          navigate(`/dashboard/${r.id}`);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex flex-col items-start px-3 py-2 rounded-lg text-left transition ${
                          activeRoleMatch === r.id
                            ? 'bg-blue-50 text-[#0A2540] dark:bg-blue-950/60 dark:text-blue-300 font-bold border-l-4 border-l-[#0A2540] dark:border-l-blue-400'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center justify-between w-full">
                          {r.label}
                          {activeRoleMatch === r.id && (
                            <span className="h-2 w-2 rounded-full bg-[#0A2540] dark:bg-blue-400" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {r.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MeriPehchaan / Government Portal Login */}
              {isAuthenticated ? (
                <button
                  className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition"
                  onClick={logout}
                  type="button"
                >
                  Logout ({user?.role})
                </button>
              ) : (
                <button
                  className="btn-gov-primary"
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Official Login
                </button>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden shadow-sm"
              onClick={() => setMobileMenuOpen((current) => !current)}
              type="button"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden animate-in fade-in duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-2">
                Navigation & Portals
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#0A2540] dark:text-blue-400" />
                      <div>
                        <div>{item.label}</div>
                        <div className="text-[10px] font-normal text-slate-500 font-hindi">{item.hindiLabel}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Switch Jurisdiction</p>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        navigate(`/dashboard/${r.id}`);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold text-left border ${
                        activeRoleMatch === r.id
                          ? 'border-[#0A2540] bg-blue-50 text-[#0A2540] dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3">
                <button
                  className="btn-gov-primary w-full py-3"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  <Lock className="h-3.5 w-3.5 mr-1 inline" />
                  Jan Parichay SSO / Official Login
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Official Government Live Gazette & Notice Ticker (चलती सूचना) */}
      <section className="border-y border-amber-500/30 bg-[#0A2540] text-amber-300 py-2 text-xs select-none dark:bg-[#061424]">
        <div className="page-shell flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-white text-[10px] flex-shrink-0 bg-[#D97706] px-2.5 py-1 rounded">
            <span className="animate-ping h-2 w-2 rounded-full bg-white inline-block" />
            <span>Gazette / सूचना</span>
          </div>

          <div className="overflow-hidden flex-1 relative">
            <div className={`whitespace-nowrap font-medium text-[11px] sm:text-xs ${tickerPaused ? '' : 'animate-ticker'}`}>
              <span className="inline-flex items-center gap-1.5 mr-12 text-slate-200">
                <span className="font-bold text-amber-400">🏛️ WARD HEARING:</span> Public grievance hearing with Municipal Commissioner scheduled for Thursday 11:00 AM at HQ.
              </span>
              <span className="inline-flex items-center gap-1.5 mr-12 text-slate-200">
                <span className="font-bold text-emerald-400">⚡ SLA GUARANTEE:</span> 100% potholes reported via Form SC-2026 guaranteed redressal inspection within 48 hours.
              </span>
              <span className="inline-flex items-center gap-1.5 mr-12 text-slate-200">
                <span className="font-bold text-red-400">🚨 MONSOON DESILTING:</span> Ward 01 to Ward 05 stormwater drains undergoing 24x7 automated desilting.
              </span>
              <span className="inline-flex items-center gap-1.5 mr-12 text-slate-200">
                <span className="font-bold text-blue-400">💧 WATER SUPPLY:</span> Pipeline overhaul in South Avenue completed; normal pressure restored.
              </span>
            </div>
          </div>

          {/* Ticker Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setTickerPaused((prev) => !prev)}
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
              title={tickerPaused ? 'Play Ticker' : 'Pause Ticker'}
              aria-label={tickerPaused ? 'Play Gazette ticker' : 'Pause Gazette ticker'}
            >
              {tickerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Main Viewport Content */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Comprehensive Official GIGW Government Footer */}
      <footer className="mt-auto border-t-2 border-[#0A2540] bg-[#0A2540] text-slate-300 dark:border-slate-800 dark:bg-[#05111F]">
        
        {/* National Initiatives Strip */}
        <div className="border-b border-slate-700/80 bg-[#06182B] py-6">
          <div className="page-shell flex flex-wrap items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-3">
              <GovernmentEmblem className="h-10 w-10 text-white" inverted />
              <div>
                <p className="font-bold text-white text-sm">Smart Cities Mission · Digital India</p>
                <p className="text-slate-400 text-[11px]">Ministry of Housing and Urban Affairs (MoHUA), Government of India</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="gov-badge-saffron bg-amber-500/20 text-amber-300 border-amber-500/40">
                STQC Certified
              </span>
              <span className="gov-badge-green bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                GIGW 3.0 Compliant
              </span>
              <span className="gov-badge bg-blue-500/20 text-blue-300 border-blue-500/40">
                CPGRAMS Interoperable
              </span>
              <span className="gov-badge bg-purple-500/20 text-purple-300 border-purple-500/40">
                ISO 9001:2015
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="page-shell py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            
            {/* Col 1: About Portal */}
            <div>
              <p className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                About JanSeva Portal
              </p>
              <p className="leading-relaxed text-slate-300 text-[11px]">
                The Smart City Public Grievance Redressal System is an official municipal platform enabling citizens to lodge, track, and audit civic grievances with guaranteed SLA redressal timelines.
              </p>
              <div className="mt-4 space-y-1.5 text-[11px] text-slate-400">
                <p><b>Portal Version:</b> v3.4.2 (GIGW 3.0)</p>
                <p><b>NIC Hosted:</b> National Informatics Centre Cloud</p>
                <p><b>Security:</b> 256-bit TLS / STQC Audited</p>
              </div>
            </div>

            {/* Col 2: Citizen Portals */}
            <div>
              <p className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                Citizen Portals & Services
              </p>
              <ul className="space-y-2 text-[11px]">
                <li><NavLink to="/report" className="hover:text-amber-400 transition">📝 Lodge Grievance (Form SC-GRV-2026)</NavLink></li>
                <li><NavLink to="/complaints/SC-2026-000001" className="hover:text-amber-400 transition">🔍 Track Grievance Status by Ref ID</NavLink></li>
                <li><NavLink to="/home" className="hover:text-amber-400 transition">🗺️ Ward-wise GIS Map & Field Ops</NavLink></li>
                <li><NavLink to="/dashboard/citizen" className="hover:text-amber-400 transition">📊 Citizen Grievance Dashboard</NavLink></li>
                <li><a href="#charter" onClick={() => navigate('/')} className="hover:text-amber-400 transition">📜 Citizen Charter (नागरिक अधिकार पत्र)</a></li>
              </ul>
            </div>

            {/* Col 3: Emergency Helplines */}
            <div>
              <p className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                National & City Helplines
              </p>
              <ul className="space-y-2 text-[11px]">
                <li className="flex justify-between"><span>National Emergency Helpline:</span> <b className="font-mono text-amber-300">112</b></li>
                <li className="flex justify-between"><span>Municipal Grievance Toll-Free:</span> <b className="font-mono text-amber-300">1800-11-2026</b></li>
                <li className="flex justify-between"><span>Water Supply & Sewage (BWSSB):</span> <b className="font-mono text-white">1916</b></li>
                <li className="flex justify-between"><span>Electricity Fault Hotline:</span> <b className="font-mono text-white">1912</b></li>
                <li className="flex justify-between"><span>Women Safety Crisis Desk:</span> <b className="font-mono text-white">1091</b></li>
                <li className="flex justify-between"><span>Disaster & Flood Control Room:</span> <b className="font-mono text-white">1077</b></li>
              </ul>
            </div>

            {/* Col 4: Official GIGW Policies */}
            <div>
              <p className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                Statutory & Compliance
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li><a href="#" className="hover:text-amber-400 transition">Right to Information (RTI / सूचना का अधिकार)</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Terms of Use & Disclaimer</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Privacy & Data Governance Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Hyperlinking Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Copyright & Content Attribution Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Web Information Manager (WIM)</a></li>
              </ul>
              <div className="mt-4 pt-3 border-t border-slate-700 text-[10px] text-slate-400">
                <b>National Portal:</b> <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">india.gov.in</a>
              </div>
            </div>

          </div>

          {/* Bottom Legal & Visitor Audit */}
          <div className="mt-10 border-t border-slate-700/80 pt-6 flex flex-col gap-3 text-slate-400 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p>© 2026 Smart City Municipal Corporation, Ministry of Housing & Urban Affairs, Govt. of India.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Designed in accordance with Guidelines for Indian Government Websites (GIGW 3.0).</p>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span><b>Last Updated:</b> 25 Aug 2026</span>
              <span>•</span>
              <span><b>Total Visitors:</b> <span className="font-mono font-bold text-amber-300">4,892,104</span></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Official Multilingual Virtual Citizen Assistant */}
      <Assistant />
    </div>
  );
}
