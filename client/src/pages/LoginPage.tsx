import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import { SwachhBharatLogo } from '../components/layout/SwachhBharatLogo';
import { CaptchaBox } from '../components/common/CaptchaBox';

export function LoginPage() {
  const [email, setEmail] = useState('citizen@smartcity.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [currentCaptcha, setCurrentCaptcha] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const { login, quickLoginAsRole } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    if (enteredCaptcha.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      setErrorMsg('Invalid Captcha code. Please enter the characters shown in the box.');
      return;
    }

    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication verified. Redirecting to workspace...');
      setTimeout(() => {
        navigate('/dashboard/citizen');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  const demoLogin = async (role: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await quickLoginAsRole(role);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(`Authenticated as ${role.toUpperCase()}. Loading workspace...`);
      setTimeout(() => {
        navigate(`/dashboard/${role}`);
      }, 400);
    } else {
      navigate(`/dashboard/${role}`);
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        
        {/* Left Side: National SSO & Trust Info */}
        <div className="gov-panel p-8 border-2 border-[#0A2540] flex flex-col justify-between dark:border-slate-800 bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GovernmentEmblem className="h-12 w-12" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block font-hindi">
                  भारत सरकार · Govt. of India
                </span>
                <h2 className="text-base font-black uppercase text-[#0A2540] dark:text-white">
                  Jan Parichay SSO Gateway
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="gov-badge font-mono text-[9px]">GIGW 3.0 SSO</span>
              <span className="gov-badge-green font-mono text-[9px]">STQC Certified</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unified authentication gateway for citizens, ward officers, and municipal administrators. Access your active grievances, field work orders, and department analytics with single sign-on security.
            </p>

            {/* Statutory Cyber Notice */}
            <div className="mt-6 rounded-lg bg-amber-50 p-3.5 border border-amber-300 text-xs text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                Statutory Security Advisory:
              </p>
              <p className="text-[11px] leading-relaxed">
                Unauthorized access to this government portal is strictly prohibited and punishable under Section 43 & Section 66 of the Information Technology Act 2000.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 dark:border-slate-800">
            <p>Your account is protected with advanced security standards.</p>
          </div>
        </div>

        {/* Right Side: Login Form Card styled after Reference Image 3 */}
        <div className="rounded-2xl border-2 border-[#1f7a7a]/40 bg-[#d8eabf] p-8 shadow-2xl text-slate-900">
          <div className="flex flex-col items-center text-center mb-6">
            <GovernmentEmblem className="h-12 w-12 mb-2" />
            <h1 className="text-xl font-black text-[#1a5b5b] tracking-tight">
              Smart City Citizen & Official Login
            </h1>
            <p className="text-xs font-bold text-slate-600 font-hindi mt-0.5">
              स्मार्ट सिटी नागरिक एवं आधिकारिक पोर्टल लॉगिन
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 pr-10 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-900"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Captcha Box (Reference Image 3) */}
            <div className="pt-1">
              <CaptchaBox onCodeChange={setCurrentCaptcha} />
            </div>

            {/* Enter Captcha */}
            <div>
              <input
                type="text"
                value={enteredCaptcha}
                onChange={(e) => setEnteredCaptcha(e.target.value)}
                placeholder="Enter Captcha"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-bold uppercase text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm tracking-wider"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-100/80 p-2 rounded-lg border border-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold bg-emerald-100/80 p-2 rounded-lg border border-emerald-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#208b8b] hover:bg-[#197575] active:scale-[0.99] py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => alert('Password reset instructions sent to registered government email/mobile.')}
                className="text-[#1a6464] hover:underline"
              >
                Forgot password?
              </button>

              <Link to="/register" className="text-[#1a6464] hover:underline">
                Register Here
              </Link>
            </div>
          </form>

          {/* Quick Demo Workspace Jurisdictions */}
          <div className="mt-6 pt-4 border-t border-[#1f7a7a]/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2.5 text-center">
              Quick 1-Click Role Workspace (Demo Access)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => demoLogin('citizen')}
                className="btn-gov-outline py-2 text-left justify-start bg-white"
              >
                👤 Citizen View
              </button>
              <button
                type="button"
                onClick={() => demoLogin('officer')}
                className="btn-gov-outline py-2 text-left justify-start bg-white"
              >
                🛠️ Ward Officer
              </button>
              <button
                type="button"
                onClick={() => demoLogin('dept-head')}
                className="btn-gov-outline py-2 text-left justify-start bg-white"
              >
                🏢 Dept Head
              </button>
              <button
                type="button"
                onClick={() => demoLogin('admin')}
                className="btn-gov-outline py-2 text-left justify-start bg-white"
              >
                🏛️ Municipal Admin
              </button>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}