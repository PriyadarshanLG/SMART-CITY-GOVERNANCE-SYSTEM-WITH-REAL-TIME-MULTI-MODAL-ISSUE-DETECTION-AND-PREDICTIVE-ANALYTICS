import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GovernmentEmblem } from '../components/layout/GovernmentEmblem';
import { CaptchaBox } from '../components/common/CaptchaBox';

const INDIAN_STATES = [
  { code: 'KA-29', name: 'Karnataka', districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi'] },
  { code: 'DL-01', name: 'Delhi NCR', districts: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi'] },
  { code: 'MH-02', name: 'Maharashtra', districts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik'] },
  { code: 'TN-33', name: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { code: 'UP-32', name: 'Uttar Pradesh', districts: ['Lucknow', 'Noida', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj'] },
  { code: 'GJ-24', name: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
  { code: 'TS-36', name: 'Telangana', districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { code: 'WB-19', name: 'West Bengal', districts: ['Kolkata', 'Howrah', 'North 24 Parganas', 'Darjeeling'] },
  { code: 'RJ-14', name: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
  { code: 'KL-09', name: 'Kerala', districts: ['Thiruvananthapuram', 'Kochi / Ernakulam', 'Kozhikode', 'Thrissur'] },
];

const WARDS = [
  'Central Ward (Civil Lines)',
  'West Sector (Gandhi Nagar)',
  'South Avenue (Subhash Nagar)',
  'Metro Ward (Indira Nagar)',
  'North Extension (Vivekananda Layout)',
  'Industrial Sector (Peenya Hub)',
];

export function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [stateCode, setStateCode] = useState('KA-29');
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru Urban');
  const [selectedCity, setSelectedCity] = useState('Central Ward (Civil Lines)');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);

  const [currentCaptcha, setCurrentCaptcha] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const found = INDIAN_STATES.find((s) => s.name === stateName);
    if (found) {
      setStateCode(found.code);
      setSelectedDistrict(found.districts[0] || '');
    }
  };

  const currentDistricts = INDIAN_STATES.find((s) => s.name === selectedState)?.districts || [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !mobileNumber.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (enteredCaptcha.trim().toUpperCase() !== currentCaptcha.toUpperCase()) {
      setErrorMsg('Invalid Captcha. Please enter the characters shown in the box.');
      return;
    }

    setIsLoading(true);

    const res = await registerUser({
      name: fullName.trim(),
      email: email.trim(),
      phone: mobileNumber.trim(),
      stateCode: stateCode.trim(),
      state: selectedState,
      district: selectedDistrict,
      city: selectedCity,
      password: password || 'Password@123',
      role: 'Citizen',
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account registered & saved in database! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } else {
      setErrorMsg(res.message || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        
        {/* Card styled directly after Reference Image 4 */}
        <div className="rounded-2xl border-2 border-[#1f7a7a]/40 bg-[#d8eabf] p-8 shadow-2xl text-slate-900">
          
          {/* Top Government Emblem & Smart City Header Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <GovernmentEmblem className="h-12 w-12 mb-2" />
            <h1 className="text-xl font-black text-[#1a5b5b] tracking-tight">
              Smart City Citizen Registration Application
            </h1>
            <p className="text-xs font-hindi font-semibold text-slate-600">
              स्मार्ट सिटी मिशन · नागरिक खाता पंजीकरण
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Enter your Full Name */}
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your Full Name"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
            </div>

            {/* Enter your Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
            </div>

            {/* Enter your Mobile Number */}
            <div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your Mobile Number"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
            </div>

            {/* State Code Instruction Advisory */}
            <div className="pt-0.5">
              <p className="text-[11px] font-bold text-[#446b38] leading-tight mb-1">
                State code is required. Retrieve it from the State Login Profile and enter here.
              </p>
              <input
                type="text"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                placeholder="Enter State Code (e.g. KA-29)"
                required
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-bold uppercase text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              />
            </div>

            {/* Select State */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Select District */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              >
                {currentDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Select City / Ward */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-lg border border-slate-400/80 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#1f7a7a] focus:ring-1 focus:ring-[#1f7a7a] shadow-sm"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
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

            {/* Captcha Box (Reference Image 4) */}
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
                  Saving to Database...
                </>
              ) : (
                'Register Account'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-[#1a6464] hover:underline">
                Back To Login
              </Link>
            </div>
          </form>

        </div>

      </motion.div>
    </div>
  );
}