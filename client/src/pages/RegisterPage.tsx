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
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await registerUser({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: 'Citizen',
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account registered successfully on MongoDB ledger! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard/citizen');
      }, 600);
    } else {
      setErrorMsg(res.message || 'Registration failed. Please check form values.');
    }
  });

  return (
    <div className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Left Side: Brand and Security */}
        <div className="glass-card p-8 md:p-10 flex flex-col justify-between">
          <div>
            <span className="gov-badge">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Citizen Portal Registration
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Create Your Civic Profile
            </h1>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Join thousands of enrolled citizens in shaping an accountable and clean smart city with instant grievance lodgement and real-time MongoDB database synchronization.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Zero spam guarantee · Encrypted personal data</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <UserPlus className="h-5 w-5 text-blue-600 shrink-0" />
                <span>Instant access to citizen redressal status receipts</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
            <p className="font-bold text-blue-900 dark:text-blue-300">⚡ Automated Verification</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Profiles are stored in MongoDB and activated immediately without manual approval delays.
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="surface-card p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Register</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fill in your contact information below.
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
                <label className="section-kicker block">Full Name *</label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="e.g. Ramesh Kumar"
                    {...register('name', { required: true })}
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="section-kicker block">Email Address *</label>
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
                <label className="section-kicker block">Mobile Phone Number *</label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="+91 98765 43210"
                    type="tel"
                    {...register('phone', { required: true })}
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="section-kicker block">Create Secure Password *</label>
                <div className="relative mt-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Minimum 8 characters"
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

              <button
                className="btn-primary w-full gap-2 mt-4 py-3.5"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registering Profile...
                  </>
                ) : (
                  <>
                    Complete Registration <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
            Already have an active account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}