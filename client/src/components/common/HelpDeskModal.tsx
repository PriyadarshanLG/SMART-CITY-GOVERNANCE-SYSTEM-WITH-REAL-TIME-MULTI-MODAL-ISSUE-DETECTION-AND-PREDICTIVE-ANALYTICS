import { PhoneCall, ShieldCheck, HelpCircle, X, ArrowRight, FilePlus2, Search, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HelpDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDeskModal({ isOpen, onClose }: HelpDeskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-red-600 bg-white p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-500 hover:bg-slate-100 transition"
          aria-label="Close Help Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Red Emergency Badge */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white font-black text-xl shadow-md">
            ❓
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              24x7 Citizen Helpdesk & Support
            </span>
            <h2 className="text-lg font-black text-slate-900">
              How Can We Help You Today?
            </h2>
            <p className="text-xs font-hindi text-slate-500">
              नागरिक सहायता एवं आपातकालीन संपर्क केंद्र
            </p>
          </div>
        </div>

        {/* Emergency Helplines */}
        <div className="space-y-4 text-xs">
          
          <div className="rounded-xl bg-red-50 p-4 border border-red-200">
            <span className="font-bold text-red-900 flex items-center gap-1.5 mb-2">
              <PhoneCall className="h-4 w-4 text-red-600" />
              Toll-Free Emergency Helpline Numbers:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex justify-between bg-white p-2 rounded border border-red-100">
                <span className="text-slate-600">National Emergency:</span>
                <b className="font-mono text-red-700">112</b>
              </div>
              <div className="flex justify-between bg-white p-2 rounded border border-red-100">
                <span className="text-slate-600">Grievance Desk:</span>
                <b className="font-mono text-red-700">1800-11-2026</b>
              </div>
              <div className="flex justify-between bg-white p-2 rounded border border-red-100">
                <span className="text-slate-600">Water Supply:</span>
                <b className="font-mono text-blue-700">1916</b>
              </div>
              <div className="flex justify-between bg-white p-2 rounded border border-red-100">
                <span className="text-slate-600">Electricity Fault:</span>
                <b className="font-mono text-amber-700">1912</b>
              </div>
            </div>
          </div>

          {/* Quick Guidance Cards */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Common Citizen Queries:
            </h3>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition">
              <p className="font-bold text-slate-900">How do I file a road pothole or streetlight issue?</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click <b>Lodge Grievance</b> in the header or on the landing page, fill out Form SC-GRV-2026 with location and optional photo, and submit to receive your 14-digit GRN tracking code.
              </p>
              <Link
                to="/report"
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
              >
                Open Grievance Form ➔
              </Link>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition">
              <p className="font-bold text-slate-900">What if my complaint is past the SLA deadline?</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Every grievance has guaranteed turnaround under the Citizen Charter. If overdue, open your Grievance Dossier and click <b>Escalate to Lokayukta / Commissioner</b>.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-gov-primary text-xs px-5 py-2"
            >
              Close Helpdesk
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
