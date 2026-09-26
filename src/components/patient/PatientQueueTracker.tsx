import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Volume2,
  VolumeX,
  Stethoscope,
  Activity,
  Heart,
  Search,
  BellRing,
  User,
  Zap,
} from 'lucide-react';

interface QueueJourneyMilestone {
  stage: string;
  title: string;
  timestamp: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  detail: string;
}

interface BackendQueueTelemetry {
  tokenNumber: string;
  ticketId: string;
  registrationId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  doctorName: string;
  currentTokenNumber: string;
  queueStatus: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  sequenceNumber: number;
  currentServingSequence: number;
  patientsAhead: number;
  avgServiceTimeMinutes: number;
  estimatedWaitMinutes: number;
  totalWaitingInDept: number;
  issuedAt: string;
  calledAt: string | null;
  completedAt: string | null;
  vitals?: {
    bp: string;
    pulse: number;
    spo2: number;
    tempF: number;
  };
  journey: QueueJourneyMilestone[];
  lastUpdated: string;
}

interface PatientQueueTrackerProps {
  initialTokenNumber?: string;
  onNavigateToRegister?: () => void;
}

export const PatientQueueTracker: React.FC<PatientQueueTrackerProps> = ({
  initialTokenNumber = 'GM-042',
  onNavigateToRegister,
}) => {
  const [activeToken, setActiveToken] = useState<string>(initialTokenNumber);
  const [tokenSearchInput, setTokenSearchInput] = useState<string>('');
  const [queueData, setQueueData] = useState<BackendQueueTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoPoll, setAutoPoll] = useState<boolean>(true);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState<boolean>(true);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [advancingQueue, setAdvancingQueue] = useState<boolean>(false);

  // Fetch live queue telemetry directly from backend API
  const fetchQueueData = useCallback(async (token: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/queue/track?tokenNumber=${encodeURIComponent(token)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch queue data (HTTP ${response.status})`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        setQueueData(json.data);

        // Check if token was just called
        if (json.data.queueStatus === 'CALLED' && voiceAlertsEnabled) {
          playAudioAnnouncement(json.data.tokenNumber, json.data.roomNumber);
        }
      } else {
        throw new Error(json.message || 'No queue telemetry found for this token');
      }
    } catch (err: any) {
      console.warn('[QueueTracker] API fetch error:', err);
      setErrorMessage(err.message || 'Unable to fetch real-time queue status from backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [voiceAlertsEnabled]);

  // Initial load & token change
  useEffect(() => {
    fetchQueueData(activeToken);
  }, [activeToken, fetchQueueData]);

  // Periodic polling every 6 seconds from backend data
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      fetchQueueData(activeToken, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPoll, activeToken, fetchQueueData]);

  // Audio Speech Synthesis Announcement
  const playAudioAnnouncement = (token: string, room: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = `टोकन संख्या ${token}. कृपया ओपीडी कक्ष ${room} में जाएं. Token number ${token}, please proceed to ${room}.`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio speech unavailable in strict sandbox
    }
  };

  // Advance queue on the backend (simulates doctor calling next ticket)
  const handleSimulateCallNext = async () => {
    setAdvancingQueue(true);
    try {
      const deptId = queueData?.departmentId || 'DEP-GENMED';
      const response = await fetch('/api/queue/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: deptId }),
      });
      const json = await response.json();
      if (json.success) {
        // Re-fetch fresh telemetry immediately
        await fetchQueueData(activeToken, true);
      }
    } catch (err) {
      console.error('Call-next simulation error:', err);
    } finally {
      setAdvancingQueue(false);
    }
  };

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
        setPrintFeedback('Token slip sent to physical printer.');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    } catch {
      setPrintFeedback('Digital slip confirmed: Screenshot or save your token number.');
      setTimeout(() => setPrintFeedback(null), 4000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenSearchInput.trim()) {
      setActiveToken(tokenSearchInput.trim().toUpperCase());
      setTokenSearchInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Deck & Live Telemetry Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Backend Synced
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Live REST Polling: <strong className={autoPoll ? 'text-emerald-600' : 'text-slate-400'}>{autoPoll ? '6s Active' : 'Paused'}</strong>
            </span>
            {queueData && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                · Updated: {new Date(queueData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Patient Outpatient Queue Dashboard
            {isRefreshing && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
          </h2>
        </div>

        {/* Quick Search & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Token Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                value={tokenSearchInput}
                onChange={(e) => setTokenSearchInput(e.target.value)}
                placeholder="Search Token (e.g. GM-040)"
                className="w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              title="Search Token"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Voice Alert Toggle */}
          <button
            onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              voiceAlertsEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title="Audio Call Chime Alerts"
          >
            {voiceAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchQueueData(activeToken)}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Simulate Doctor Call Next (Testing Tool) */}
          <button
            onClick={handleSimulateCallNext}
            disabled={advancingQueue}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            title="Simulates attending doctor calling the next ticket in queue"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${advancingQueue ? 'animate-spin' : ''}`} />
            <span>Advance Queue</span>
          </button>
        </div>
      </div>

      {/* Preset Token Selector (Quick Switch between different queue positions) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Sample Tokens:
        </span>
        {[
          { token: 'GM-042', label: 'GM-042 (Rajesh Sharma · 3 ahead)', color: 'border-blue-300 bg-blue-50 text-blue-900' },
          { token: 'GM-039', label: 'GM-039 (Kavita · In Consultation)', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
          { token: 'GM-040', label: 'GM-040 (Farooq · 1 ahead)', color: 'border-amber-300 bg-amber-50 text-amber-900' },
          { token: 'GM-043', label: 'GM-043 (Ramesh · 4 ahead)', color: 'border-slate-300 bg-slate-50 text-slate-800' },
          { token: 'GM-038', label: 'GM-038 (Completed)', color: 'border-slate-200 bg-slate-100 text-slate-600' },
        ].map((item) => (
          <button
            key={item.token}
            onClick={() => setActiveToken(item.token)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
              activeToken === item.token ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : item.color
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => fetchQueueData(activeToken)}
            className="font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN DASHBOARD */}
      {queueData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT 7 COLUMNS: ACTIVE TOKEN HERO CARD & QUEUE TELEMETRY */}
          <div className="md:col-span-7 space-y-6">
            {/* Primary Hero Queue Ticket Card */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-800/80">
              {/* Background watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
                <Clock className="w-72 h-72 text-white" />
              </div>

              {/* Facility & Calling Status Pill */}
              <div className="flex items-center justify-between border-b border-blue-800/80 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                    {queueData.facilityName}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {queueData.departmentName} ({queueData.roomNumber})
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      queueData.queueStatus === 'CALLED'
                        ? 'bg-emerald-500 text-slate-950 animate-bounce shadow-lg shadow-emerald-500/40'
                        : queueData.queueStatus === 'IN_CONSULTATION'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-400'
                        : queueData.queueStatus === 'COMPLETED'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    }`}
                  >
                    {queueData.queueStatus === 'CALLED' ? (
                      <>
                        <BellRing className="w-3.5 h-3.5" />
                        <span>🔔 NOW CALLING</span>
                      </>
                    ) : queueData.queueStatus === 'IN_CONSULTATION' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span>In Consultation</span>
                      </>
                    ) : queueData.queueStatus === 'COMPLETED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span>Waiting in Queue</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Prominent Outpatient Token Number */}
              <div className="text-center py-4">
                <span className="text-xs uppercase tracking-widest text-slate-300 font-bold block mb-1">
                  YOUR OUTPATIENT TOKEN NUMBER
                </span>
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white mb-2 drop-shadow-md">
                  {queueData.tokenNumber}
                </div>
                <div className="text-sm font-semibold text-teal-200 flex items-center justify-center gap-2">
                  <span>{queueData.patientName}</span>
                  <span>•</span>
                  <span className="font-mono text-xs text-blue-200">ID: {queueData.patientId}</span>
                </div>
              </div>

              {/* 3 Telemetry Ticker Boxes (All Values From Backend Data) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-blue-800/80 text-center">
                <div className="bg-blue-950/60 backdrop-blur-xs rounded-2xl p-3.5 border border-blue-700/50">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">
                    Now Inside Room
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-300">
                    {queueData.currentTokenNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">serving</span>
                </div>

                <div className="bg-blue-950/60 backdrop-blur-xs rounded-2xl p-3.5 border border-blue-700/50">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">
                    Patients Ahead
                  </span>
                  <span className="text-2xl font-black font-mono text-white">
                    {queueData.patientsAhead}
                  </span>
                  <span className="text-[10px] text-blue-300 block mt-0.5">
                    {queueData.patientsAhead === 1 ? 'patient' : 'patients'}
                  </span>
                </div>

                <div className="bg-blue-950/60 backdrop-blur-xs rounded-2xl p-3.5 border border-blue-700/50">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">
                    Est. Wait Time
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    ~{queueData.estimatedWaitMinutes}m
                  </span>
                  <span className="text-[10px] text-blue-300 block mt-0.5">
                    ~{queueData.avgServiceTimeMinutes}m / patient
                  </span>
                </div>
              </div>

              {/* Status Notice Banner */}
              <div className="mt-5 text-center text-xs text-blue-100 bg-blue-950/50 rounded-2xl py-2.5 px-4 border border-blue-800/40">
                {queueData.queueStatus === 'CALLED' ? (
                  <strong className="text-amber-300">
                    Attention: Your token has been called! Please proceed immediately into {queueData.roomNumber}.
                  </strong>
                ) : queueData.queueStatus === 'COMPLETED' ? (
                  <span>Consultation finished. Proceed to Central Pharmacy Counter 2 for medication issue.</span>
                ) : (
                  <span>
                    Please remain seated in the OPD waiting corridor near {queueData.roomNumber}. Doctor on duty: <strong>{queueData.doctorName}</strong>.
                  </span>
                )}
              </div>
            </div>

            {/* PATIENT JOURNEY TIMELINE (FROM BACKEND DATA) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Patient Outpatient Journey
                  </h4>
                  <p className="text-xs text-slate-500">
                    Real-time clinical encounter status tracked in SwasthSetu Health Grid
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                  Stage {queueData.journey.filter((j) => j.status === 'COMPLETED').length + 1} of 5
                </span>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                {queueData.journey.map((item, idx) => {
                  const isDone = item.status === 'COMPLETED';
                  const isInProgress = item.status === 'IN_PROGRESS';
                  return (
                    <div key={idx} className="relative">
                      {/* Step Circle Marker */}
                      <span
                        className={`absolute -left-[33px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ${
                          isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isInProgress
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </span>

                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-xs font-bold text-slate-900">
                          {item.title}
                        </div>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700'
                              : isInProgress
                              ? 'bg-blue-50 text-blue-700 animate-pulse'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: DIGITAL PASS, QR, APPOINTMENT DETAILS */}
          <div className="md:col-span-5 space-y-6">
            {/* Scannable Token QR Code Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Fast Doctor Verification Barcode
              </span>

              {/* Visual High-Resolution QR Representation */}
              <div className="inline-block p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl mb-3 shadow-inner">
                <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                  <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                  <rect x="13" y="13" width="9" height="9" fill="#0f172a" />
                  <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                  <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                  <rect x="78" y="13" width="9" height="9" fill="#0f172a" />
                  <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                  <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                  <rect x="13" y="78" width="9" height="9" fill="#0f172a" />
                  {/* Random Pattern Dots */}
                  <rect x="35" y="10" width="8" height="8" fill="#0f172a" />
                  <rect x="50" y="10" width="8" height="8" fill="#0f172a" />
                  <rect x="40" y="25" width="10" height="8" fill="#0f172a" />
                  <rect x="55" y="35" width="12" height="8" fill="#0f172a" />
                  <rect x="35" y="50" width="8" height="14" fill="#0f172a" />
                  <rect x="50" y="65" width="14" height="8" fill="#0f172a" />
                  <rect x="70" y="50" width="10" height="10" fill="#0f172a" />
                  <rect x="70" y="70" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="80" width="8" height="8" fill="#0f172a" />
                </svg>
              </div>

              <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 py-1 px-3 rounded-lg inline-block mb-3">
                {queueData.registrationId}
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Scan this code at the Doctor's Workstation or Pharmacy Desk to instantly pull up your clinical file without physical paper.
              </p>

              {printFeedback && (
                <div className="mb-3 p-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  {printFeedback}
                </div>
              )}

              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Physical Thermal Token Slip</span>
              </button>
            </div>

            {/* Clinical Appointment Card Details */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3.5 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block border-b border-slate-100 pb-2">
                Encounter Details
              </span>

              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-slate-900">{queueData.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Room:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {queueData.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attending Doctor:</span>
                <span className="font-bold text-slate-900">{queueData.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Triage Priority:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    queueData.priority === 'EMERGENCY'
                      ? 'bg-rose-100 text-rose-800'
                      : queueData.priority === 'URGENT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {queueData.priority}
                </span>
              </div>

              {queueData.vitals && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-[11px] mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recorded Triage Vitals:
                  </span>
                  <div className="flex justify-between text-slate-700">
                    <span>Blood Pressure: <strong>{queueData.vitals.bp}</strong></span>
                    <span>Pulse: <strong>{queueData.vitals.pulse} bpm</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Oxygen SpO2: <strong>{queueData.vitals.spo2}%</strong></span>
                    <span>Body Temp: <strong>{queueData.vitals.tempF}°F</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Helpline Contacts */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                Hospital Emergency Support
              </span>
              <div className="flex items-center justify-between text-slate-600">
                <span>National Emergency:</span>
                <span className="font-bold text-red-600 font-mono">112</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Free Ambulance Service:</span>
                <span className="font-bold text-red-600 font-mono">108</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>National Health Helpline:</span>
                <span className="font-bold text-slate-900 font-mono">1075</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
