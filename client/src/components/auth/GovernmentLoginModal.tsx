import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CaptchaBox } from '../common/CaptchaBox';
import { GovernmentEmblem } from '../layout/GovernmentEmblem';
import { useNavigate } from 'react-router-dom';

interface GovernmentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function GovernmentLoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: GovernmentLoginModalProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('citizen@smartcity.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [currentCaptcha, setCurrentCaptcha] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    if (enteredCaptcha.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      setErrorMsg('Invalid Captcha code. Please enter the characters shown.');
      return;
    }

    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Authenticated successfully. Redirecting...');
      setTimeout(() => {
        onClose();
        navigate('/dashboard/citizen');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card styled to match Reference Image 3 */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#1f7a7a]/40 bg-[#d8eabf] p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-700 hover:bg-black/10 transition"
          aria-label="Close Login Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Government & Smart City Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <GovernmentEmblem className="h-12 w-12 mb-2" />
          <h2 className="text-xl font-black text-[#1a5b5b] tracking-tight">
            Smart City Citizen & Official Login
          </h2>
          <p className="text-xs font-bold text-slate-600 font-hindi mt-0.5">
            स्मार्ट सिटी नागरिक एवं आधिकारिक पोर्टल लॉगिन
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Enter Captcha Input */}
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

          {/* Login Submit Button (Teal/Emerald) */}
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

          {/* Bottom Links (Forgot Password? & Register Here) */}
          <div className="flex items-center justify-between pt-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => alert('Password reset link will be sent to your registered government mobile/email.')}
              className="text-[#1a6464] hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#1a6464] hover:underline"
            >
              Register Here
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
