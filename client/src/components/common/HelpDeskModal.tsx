import { PhoneCall, Building2, MapPin, User, X, Landmark, Compass } from 'lucide-react';

interface HelpDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDeskModal({ isOpen, onClose }: HelpDeskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-red-500/40 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          aria-label="Close Help Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Red Emergency Department Badge */}
        <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white font-black text-2xl shadow-lg shadow-red-600/30 shrink-0">
            <PhoneCall className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400 block">
              Official District Helplines & Department Directory
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Emergency Department Contact Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hassan District Grievance Cell & Officer Helpline Registry
            </p>
          </div>
        </div>

        {/* Directory Cards List */}
        <div className="space-y-3.5 text-xs">
          
          {/* Card 1: Hassan City Corporation (Municipal Corporation) */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Hassan City Corporation (Municipal Corporation)
                </h3>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Municipal Corp
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
              <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>B M Road, Santhepet Circle, Hassan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="tel:08172260700"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-amber-300 dark:border-amber-800 hover:border-amber-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Landline:</span>
                <span className="text-amber-600 dark:text-amber-400">08172-260700</span>
              </a>
              <a
                href="tel:7411110719"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-amber-300 dark:border-amber-800 hover:border-amber-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Mobile:</span>
                <span className="text-amber-600 dark:text-amber-400">7411110719</span>
              </a>
            </div>
          </div>

          {/* Card 2: PWD Division, Hassan */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  NATESH, PWD Division, Hassan
                </h3>
              </div>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                PWD Division
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="tel:08172268437"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-blue-300 dark:border-blue-800 hover:border-blue-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Office Tel:</span>
                <span className="text-blue-600 dark:text-blue-400">08172-268437</span>
              </a>
              <a
                href="tel:9448330112"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-blue-300 dark:border-blue-800 hover:border-blue-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Mobile:</span>
                <span className="text-blue-600 dark:text-blue-400">9448330112</span>
              </a>
            </div>
          </div>

          {/* Card 3: Hassan Agriculture Department */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Agriculture Department, Hassan
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Agriculture
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href="tel:8884009271"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Deputy Director of Agriculture:</span>
                <span className="text-emerald-600 dark:text-emerald-400">8884009271</span>
              </a>

              <a
                href="tel:8884010075"
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
              >
                <span className="text-[11px] text-slate-500">Agriculture Officer (TO):</span>
                <span className="text-emerald-600 dark:text-emerald-400">8884010075</span>
              </a>
            </div>
          </div>

          {/* Card 4: Dept of Tourism, Govt. of Karnataka */}
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Dept of Tourism, Govt. of Karnataka
                </h3>
              </div>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                Tourism Dept
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
              <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>AVK College Road, Hassan</span>
            </div>

            <a
              href="tel:08172268862"
              className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
            >
              <span className="text-[11px] text-slate-500">Tourism Office Helpline:</span>
              <span className="text-indigo-600 dark:text-indigo-400">08172-268862</span>
            </a>
          </div>

          {/* Card 5: Deputy Director, Hassan */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Dr. K. H. Veerabadraih, Deputy Director, Hassan
                </h3>
              </div>
              <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Deputy Director
              </span>
            </div>

            <a
              href="tel:08172234415"
              className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-950 p-2.5 border border-purple-300 dark:border-purple-800 hover:border-purple-500 transition shadow-sm font-mono font-bold text-slate-900 dark:text-white"
            >
              <span className="text-[11px] text-slate-500">Office Phone:</span>
              <span className="text-purple-600 dark:text-purple-400">08172-234415</span>
            </a>
          </div>

        </div>

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black px-6 py-2.5 hover:opacity-90 transition"
          >
            Close Emergency Directory
          </button>
        </div>
      </div>
    </div>
  );
}
