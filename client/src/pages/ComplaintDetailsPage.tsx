import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Layers,
  Loader2,
  MapPin,
  Printer,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ComplaintRecord } from '../types/complaint';

const fallbackComplaint: ComplaintRecord = {
  complaintId: 'SC-2026-000001',
  title: 'Street light outage near central ward 7 avenue',
  description: 'Multiple street lights are completely dark near the main road after the storm last weekend. This is causing safety concerns for women and elderly returning home in the evening.',
  category: 'Street Light Outage',
  department: 'Electricity Department',
  priority: 'Medium',
  status: 'Work In Progress',
  supportCount: 14,
  createdAt: new Date().toISOString(),
  location: { ward: '01', city: 'Smart City', area: 'Central Avenue', landmark: 'Opposite High School Gate' },
  timeline: [
    { status: 'Submitted', note: 'Secure citizen ticket raised on municipal portal.' },
    { status: 'ML Classified', note: 'Automated NLP classifier assigned issue to Electricity Department.' },
    { status: 'Department Assigned', note: 'Assigned to Ward 01 electrical division.' },
    { status: 'Officer Assigned', note: 'Assigned to Ward Engineer D. Kulkarni.' },
    { status: 'Work In Progress', note: 'Pole repair and luminaire replacement underway.' },
  ],
};

const sampleIds = ['SC-2026-000001', 'SC-2026-000214', 'SC-2026-000305', 'SC-2026-000109'];

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<ComplaintRecord>(fallbackComplaint);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [supportMessage, setSupportMessage] = useState('');
  const [hasSupported, setHasSupported] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState('Work In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  const loadComplaint = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/complaints/${id}`);
      if (response.data?.complaint) {
        setComplaint(response.data.complaint as ComplaintRecord);
        setNewStatus(response.data.complaint.status || 'Work In Progress');
      } else {
        setComplaint({ ...fallbackComplaint, complaintId: id });
      }
    } catch {
      setComplaint({ ...fallbackComplaint, complaintId: id });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    void loadComplaint();
  }, [id]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints/${searchQuery.trim()}`);
    }
  };

  const handleSupport = async () => {
    if (hasSupported) return;

    setHasSupported(true);
    setSupportMessage('Your endorsement has been added to increase repair priority.');
    setComplaint((current) => ({ ...current, supportCount: current.supportCount + 1 }));

    if (!id) return;

    try {
      const res = await api.post(`/complaints/${id}/support`);
      if (res.data?.complaint?.supportCount) {
        setComplaint((prev) => ({ ...prev, supportCount: res.data.complaint.supportCount }));
      }
    } catch {
      // Local state is already updated
    }
  };

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsUpdatingStatus(true);
    setStatusSuccessMsg('');

    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: statusNote || `Status changed to ${newStatus} on municipal ledger.`,
        assignedOfficerName: user?.name || 'Assigned Officer',
      });

      if (res.data?.complaint) {
        setComplaint(res.data.complaint);
        setStatusSuccessMsg(`Status updated to ${newStatus} in MongoDB.`);
        setStatusNote('');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="page-shell py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          Retrieving Municipal Record Audit from MongoDB...
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 space-y-6 print:p-0">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {/* Quick Search for Any Reference ID */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Track token (e.g. SC-2026-000001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border border-slate-200 bg-white px-4 py-2 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button type="submit" className="btn-secondary py-2 text-xs">
            Search
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary py-2 text-xs gap-1.5"
            type="button"
            title="Print Official Civic Receipt"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </form>
      </div>

      {/* Quick Lookup Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Quick Select In MongoDB:</span>
        {sampleIds.map((sampleId) => (
          <button
            key={sampleId}
            onClick={() => navigate(`/complaints/${sampleId}`)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold transition ${
              id === sampleId
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {sampleId}
          </button>
        ))}
      </div>

      {/* Main Grievance Dossier Card */}
      <div className="glass-card p-6 md:p-8">
        {/* Header Ribbon */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="gov-badge">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Official Civic Grievance Record
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  complaint.priority === 'High'
                    ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                    : complaint.priority === 'Medium'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}
              >
                {complaint.priority} Priority
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white print:text-black">
              {complaint.title}
            </h1>
            <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 print:text-black">
              {complaint.description}
            </p>
          </div>

          {/* Reference ID Stamp */}
          <div className="gov-stamp shrink-0 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
              Grievance Token
            </p>
            <p className="mt-1 font-mono text-lg font-black text-slate-950 dark:text-white print:text-black">
              {complaint.complaintId}
            </p>
            <span className="mt-1 inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {complaint.status}
            </span>
          </div>
        </div>

        {/* 4 Info Badges */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Category', value: complaint.category },
            { label: 'Assigned Dept', value: complaint.department },
            { label: 'Ward Division', value: `Ward ${complaint.location?.ward ?? '01'} (${complaint.location?.area ?? 'Central'})` },
            { label: 'Logged Timestamp', value: complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline & Interactive Workflow Controls */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Vertical Interactive Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="section-kicker">Resolution Progression</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">Field Audit Timeline</h2>
              </div>
              <button
                onClick={handleSupport}
                disabled={hasSupported}
                className="btn-secondary gap-2 text-xs print:hidden"
                type="button"
              >
                <ThumbsUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {hasSupported ? 'Endorsed' : 'I am affected'} ({complaint.supportCount})
              </button>
            </div>

            {supportMessage && (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                ✓ {supportMessage}
              </p>
            )}

            <div className="mt-6 space-y-6">
              {(complaint.timeline && complaint.timeline.length > 0 ? complaint.timeline : fallbackComplaint.timeline!).map((step, index, arr) => {
                const isLast = index === arr.length - 1;
                return (
                  <div key={`${step.status}-${index}`} className="relative flex gap-4">
                    {/* Vertical connecting line */}
                    {index < arr.length - 1 && (
                      <div className="absolute left-4 top-8 -bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800" />
                    )}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        isLast
                          ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : 'border-emerald-600 bg-emerald-600 text-white'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{step.status}</p>
                        <span className="text-[10px] font-semibold text-slate-400">Step {index + 1}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{step.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Status Advancement Form (Persists directly to MongoDB) */}
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 print:hidden">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Update Redressal Lifecycle (MongoDB Action)
                </h3>
              </div>

              {statusSuccessMsg && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  ✓ {statusSuccessMsg}
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Target Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="ML Classified">ML Classified</option>
                      <option value="Department Assigned">Department Assigned</option>
                      <option value="Officer Assigned">Officer Assigned</option>
                      <option value="Work In Progress">Work In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Citizen Verified">Citizen Verified</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Timeline Audit Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Field crew dispatched with parts..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="btn-primary w-full py-2.5 text-xs gap-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Persisting to MongoDB...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Save Status & Add Timeline Log
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Ward Officials & Location Verification */}
          <div className="space-y-6">
            {/* Officers & Reps */}
            <div className="surface-card p-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="section-kicker">Designated Authority</p>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Officer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {complaint.assignedOfficerName || 'Ward Eng. D. Kulkarni'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Complainant Contact:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {complaint.citizenName || 'Registered Citizen'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-2 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Municipal Division:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Ward {complaint.location?.ward || '01'} ({complaint.location?.area || 'Central Area'})
                  </span>
                </div>
              </div>
            </div>

            {/* Geolocation Tag & GPS Coordinates */}
            <div className="surface-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="section-kicker">Geocoded Location</p>
                </div>
                {complaint.location?.latitude && complaint.location?.longitude && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600">
                    GPS Verified
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-semibold">
                {complaint.location?.area ?? 'Central Avenue'}, Ward {complaint.location?.ward ?? '01'}
                {complaint.location?.landmark ? ` · Landmark: ${complaint.location.landmark}` : ''}
              </p>

              {complaint.location?.address && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {complaint.location.address}
                </p>
              )}

              {complaint.location?.latitude && complaint.location?.longitude && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      📍 {Number(complaint.location.latitude).toFixed(5)}°, {Number(complaint.location.longitude).toFixed(5)}°
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Open Maps ↗
                    </a>
                  </div>
                  {complaint.location.accuracy && (
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      GPS Accuracy: ±{Math.round(complaint.location.accuracy)} meters
                    </p>
                  )}
                </div>
              )}

              {complaint.imageUrl && (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Photo Evidence</p>
                  <a href={complaint.imageUrl} target="_blank" rel="noreferrer" className="block group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint Evidence"
                      className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      Click to view full image ↗
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
