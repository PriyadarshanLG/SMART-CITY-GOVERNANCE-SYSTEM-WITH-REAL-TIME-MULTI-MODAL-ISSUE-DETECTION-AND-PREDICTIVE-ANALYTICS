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
  LayoutDashboard,
  BarChart3,
} from 'lucide-react';
import { Assistant } from './Assistant';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', icon: Building2 },
  { to: '/home', label: 'Analytics & GIS', icon: BarChart3 },
  { to: '/report', label: 'Report Grievance', icon: FilePlus2 },
  { to: '/complaints/SC-2026-000001', label: 'Track Ref ID', icon: Search },
];

const roles = [
  { id: 'citizen', label: 'Citizen', desc: 'File & track civic issues' },
  { id: 'officer', label: 'Ward Officer', desc: 'Field dispatch & repair SLA' },
  { id: 'dept-head', label: 'Dept Head', desc: 'Department routing & metrics' },
  { id: 'admin', label: 'System Admin', desc: 'ML models & city wards' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, quickLoginAsRole } = useAuth();
  const [darkMode, setDarkMode] = useState(() => (typeof window !== 'undefined' ? window.localStorage.getItem('theme') === 'dark' : false));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Close dropdown on outside route change
  useEffect(() => {
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const activeRoleMatch = useMemo(() => {
    const match = location.pathname.match(/^\/dashboard\/([^/]+)/);
    return match?.[1]?.toLowerCase() ?? 'citizen';
  }, [location.pathname]);

  const currentRoleInfo = useMemo(() => {
    return roles.find((r) => r.id === activeRoleMatch) || roles[0];
  }, [activeRoleMatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Tricolor Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-sm" />

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="page-shell py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo & Portal Branding */}
            <button
              className="flex items-center gap-3 text-left group focus:outline-none"
              onClick={() => navigate('/')}
              type="button"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-950" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                    JanSeva · Smart City
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Gov Portal
                  </span>
                </div>
                <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Grievance Redressal System
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1.5 lg:flex bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Actions & Role Switcher */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {/* Demo Workspace Role Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                  title="Switch active role workspace"
                >
                  <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="capitalize">{user ? user.name : currentRoleInfo?.label || 'Citizen'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active Workspace View
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
                        className={`w-full flex flex-col items-start px-3 py-2 rounded-xl text-left transition ${
                          activeRoleMatch === r.id
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center justify-between w-full">
                          {r.label}
                          {activeRoleMatch === r.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
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

              {/* Theme Toggle Button */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                onClick={() => setDarkMode((current) => !current)}
                type="button"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>

              {/* Auth Login / Logout Button */}
              {isAuthenticated ? (
                <button
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/50 transition"
                  onClick={logout}
                  type="button"
                >
                  Logout
                </button>
              ) : (
                <button
                  className="btn-primary px-5 py-2.5 text-xs font-bold"
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  Portal Login
                </button>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              onClick={() => setMobileMenuOpen((current) => !current)}
              type="button"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Subheader Status Strip */}
          <div className="mt-3 hidden items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-2 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-300 lg:flex">
            <span className="inline-flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">ISO 9001 / Digital India</span> Certified Municipal Grievance Workflow
            </span>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                English · हिन्दी · ಕನ್ನಡ
              </span>
              <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
              <span className="inline-flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-amber-500" />
                Toll Free: 1800-425-2026
              </span>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen ? (
            <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden animate-in fade-in duration-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 text-blue-600" />
                    {item.label}
                  </NavLink>
                );
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Switch Dashboard View</p>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        navigate(`/dashboard/${r.id}`);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left border ${
                        activeRoleMatch === r.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  className="btn-secondary flex-1 px-4 py-2.5 text-xs"
                  onClick={() => setDarkMode((current) => !current)}
                  type="button"
                >
                  {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400 mr-1.5 inline" /> : <Moon className="h-3.5 w-3.5 mr-1.5 inline" />}
                  {darkMode ? 'Light' : 'Dark'}
                </button>
                <button
                  className="btn-primary flex-1 px-4 py-2.5 text-xs"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  Login
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Official Municipal Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
        <div className="page-shell py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm">
                  SC
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">Smart City Portal</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Unified municipal service and public grievance platform ensuring 100% transparent tracking, ML classification, and citizen-first accountability.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">All municipal servers operational</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Quick Portals</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><NavLink to="/report" className="hover:text-blue-600 dark:hover:text-blue-400 transition">File a Public Complaint</NavLink></li>
                <li><NavLink to="/complaints/SC-2026-000001" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Track Reference Audit</NavLink></li>
                <li><NavLink to="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition">GIS Ward Intelligence & Maps</NavLink></li>
                <li><NavLink to="/dashboard/citizen" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Citizen Dashboard</NavLink></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Emergency Helplines</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex justify-between"><span>National Emergency:</span> <b className="font-mono text-slate-900 dark:text-white">112</b></li>
                <li className="flex justify-between"><span>Police Dispatch:</span> <b className="font-mono text-slate-900 dark:text-white">100</b></li>
                <li className="flex justify-between"><span>Fire & Rescue:</span> <b className="font-mono text-slate-900 dark:text-white">101</b></li>
                <li className="flex justify-between"><span>Ambulance / Health:</span> <b className="font-mono text-slate-900 dark:text-white">108</b></li>
                <li className="flex justify-between"><span>Water & Sewage Hotline:</span> <b className="font-mono text-slate-900 dark:text-white">1916</b></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">GovTech Compliance</p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Data protected under National Data Governance Policy. ML models run locally on citizen grievance triage with zero PII retention on inference.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Digital India Compliance Verified
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-col gap-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Smart City Municipal Corporation. All rights reserved.</p>
            <p>Designed for citizen trust, faster triage, and SLA municipal accountability.</p>
          </div>
        </div>
      </footer>

      {/* Floating Sahayak Assistant */}
      <Assistant />
    </div>
  );
}
