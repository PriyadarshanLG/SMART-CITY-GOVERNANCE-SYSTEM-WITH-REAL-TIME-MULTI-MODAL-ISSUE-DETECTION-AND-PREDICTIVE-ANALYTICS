import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
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

interface LoginValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit } = useForm<LoginValues>({
    defaultValues: {
      email: 'citizen@smartcity.gov.in',
      password: 'Password@123',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { login, quickLoginAsRole } = useAuth();

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(values.email, values.password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication verified. Redirecting to workspace...');
      setTimeout(() => {
        navigate('/dashboard/citizen');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  });

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
      // Fallback navigation if server offline
      navigate(`/dashboard/${role}`);
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Side: GovTech Trust & Features */}
        <div className="glass-card p-8 md:p-10 flex flex-col justify-between">
          <div>
            <span className="gov-badge">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure Civic Authentication
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Sign In to Your Civic Workspace
            </h1>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Access your personalized citizen grievance dashboard, ward officer work queues, and municipal telemetry connected directly to MongoDB.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>JWT-Authenticated 256-bit encrypted session</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <Lock className="h-5 w-5 text-blue-600 shrink-0" />
                <span>MongoDB persistent profiles with granular audit trails</span>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Demo Evaluation Profiles */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              ⚡ 1-Click Instant Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => demoLogin('citizen')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left font-bold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition disabled:opacity-50"
              >
                👤 Citizen View
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => demoLogin('officer')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left font-bold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition disabled:opacity-50"
              >
                👷 Ward Officer
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => demoLogin('dept-head')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left font-bold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition disabled:opacity-50"
              >
                📊 Dept Head
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => demoLogin('admin')}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left font-bold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition disabled:opacity-50"
              >
                ⚙️ System Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="surface-card p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Sign In</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to manage grievances and monitor updates.
            </p>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="section-kicker block">Email Address</label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="citizen@smartcity.gov.in"
                    type="email"
                    {...register('email', { required: true })}
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="section-kicker block">Password</label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: true })}
                  />
                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                  Remember this device
                </label>
                <span className="font-semibold text-blue-600 hover:underline cursor-pointer dark:text-blue-400">
                  Password: Password@123
                </span>
              </div>

              <button
                className="btn-primary w-full gap-2 mt-4 py-3.5"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
            Do not have a registered profile yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}