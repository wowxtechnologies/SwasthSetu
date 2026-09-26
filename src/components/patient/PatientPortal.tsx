import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  CreditCard,
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
  ArrowRight
} from 'lucide-react';
import { LanguageCode, TriagePriority } from '../../types';

export const PatientPortal: React.FC = () => {
  const { state, registerPatient } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'REGISTER' | 'TRACK' | 'CARD' | 'JOURNEY'>('TRACK');

  // Registration Form State
  const [lang, setLang] = useState<LanguageCode>('hi');
  const [phone, setPhone] = useState('9876543210');
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [dob, setDob] = useState('1988-06-14');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [selectedFacility, setSelectedFacility] = useState('FAC-RAIPUR');
  const [selectedDept, setSelectedDept] = useState('DEP-GENMED');
  const [visitReason, setVisitReason] = useState('High fever and throat congestion for 2 days');
  const [priority, setPriority] = useState<TriagePriority>('ROUTINE');
  const [registeredResult, setRegisteredResult] = useState<any | null>(null);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
        setPrintFeedback('Token slip sent to printer');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    } catch (err) {
      console.warn('Printing unavailable in iframe sandbox:', err);
      setPrintFeedback('Digital slip ready - screenshot or save token number');
      setTimeout(() => setPrintFeedback(null), 4000);
    }
  };

  // Active track ticket: default to Rajesh Sharma's ticket GM-042 or newly registered
  const myTicket = registeredResult?.ticket || state.tickets.find((t) => t.tokenNumber === 'GM-042') || state.tickets[state.tickets.length - 1];
  const myQueue = state.queues.find((q) => q.departmentId === myTicket?.departmentId) || state.queues[0];

  // Calculate patients ahead
  const waitingTicketsInDept = state.tickets.filter(
    (t) => t.departmentId === myTicket?.departmentId && t.status === 'WAITING'
  );
  const myIndexInWaiting = waitingTicketsInDept.findIndex((t) => t.ticketId === myTicket?.ticketId);
  const patientsAhead = myIndexInWaiting >= 0 ? myIndexInWaiting : 0;
  const estimatedWait = Math.max(5, (patientsAhead + 1) * myQueue.avgServiceTimeMinutes);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerPatient({
      fullName,
      phone,
      dateOfBirth: dob,
      gender,
      villageOrCity: 'Civil Lines, Raipur',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
      preferredLanguage: lang,
      departmentId: selectedDept,
      facilityId: selectedFacility,
      visitReason,
      priorityStatus: priority,
      registrationSource: 'WEB',
    });
    setRegisteredResult(res);
    setActiveSubTab('TRACK');
  };

  const languages = [
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  return (
    <div className="space-y-6">
      {/* Patient Navigation Sub-Bar */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveSubTab('TRACK')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'TRACK' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Live Queue Tracker</span>
        </button>
        <button
          onClick={() => setActiveSubTab('REGISTER')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'REGISTER' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Online Self-Registration</span>
        </button>
        <button
          onClick={() => setActiveSubTab('CARD')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'CARD' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Digital Health Card (ABHA)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('JOURNEY')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'JOURNEY' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Patient Journey Timeline</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE QUEUE TRACKER */}
      {activeSubTab === 'TRACK' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Focus: My Queue Ticket */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
                <Clock className="w-72 h-72 text-white" />
              </div>

              <div className="flex items-center justify-between border-b border-blue-700/60 pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                    Active Outpatient Token
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {state.facilities.find((f) => f.facilityId === myTicket?.facilityId)?.name || 'District Hospital Raipur'}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold">
                  {myTicket?.status === 'CALLED' ? '🔔 NOW CALLING' : myTicket?.status === 'IN_CONSULTATION' ? 'In Consultation' : myTicket?.status === 'COMPLETED' ? 'Completed' : 'Waiting in Queue'}
                </span>
              </div>

              {/* Big Token Display */}
              <div className="text-center py-4">
                <span className="text-xs uppercase tracking-widest text-slate-300 font-bold block mb-1">
                  YOUR ASSIGNED TOKEN
                </span>
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white mb-2 drop-shadow-md">
                  {myTicket ? myTicket.tokenNumber : 'GM-042'}
                </div>
                <div className="text-sm font-semibold text-teal-200">
                  {myTicket?.patientName} · General Medicine (Room 104)
                </div>
              </div>

              {/* Live Telemetry Tickers */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-blue-700/60 text-center">
                <div className="bg-blue-950/40 backdrop-blur-xs rounded-xl p-3 border border-blue-700/40">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">Now Calling</span>
                  <span className="text-2xl font-black font-mono text-amber-300">
                    {myQueue.currentTokenNumber || 'GM-038'}
                  </span>
                </div>
                <div className="bg-blue-950/40 backdrop-blur-xs rounded-xl p-3 border border-blue-700/40">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">Ahead of You</span>
                  <span className="text-2xl font-black font-mono text-white">
                    {patientsAhead}
                  </span>
                  <span className="text-[10px] text-blue-300 block">patients</span>
                </div>
                <div className="bg-blue-950/40 backdrop-blur-xs rounded-xl p-3 border border-blue-700/40">
                  <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">Est. Wait</span>
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    ~{estimatedWait}m
                  </span>
                  <span className="text-[10px] text-blue-300 block">approximated</span>
                </div>
              </div>

              {/* Notice */}
              <div className="mt-5 text-center text-xs text-blue-200/80 bg-blue-950/30 rounded-xl py-2 px-3">
                Please remain seated near Room 104. An audio announcement will chime when your token is called.
              </div>
            </div>

            {/* Live Journey Progress Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Live OPD Encounter Progression
              </h4>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Self-Registration & Token Allocation', desc: 'Completed online via Web Portal', status: 'DONE' },
                  { step: '2', title: 'OPD Corridor Queue', desc: `Waiting for Room 104 (${patientsAhead} ahead)`, status: myTicket?.status === 'WAITING' ? 'CURRENT' : 'DONE' },
                  { step: '3', title: 'Doctor Consultation & Diagnosis', desc: 'Dr. Alok Verma, MD (Internal Medicine)', status: myTicket?.status === 'IN_CONSULTATION' || myTicket?.status === 'CALLED' ? 'CURRENT' : myTicket?.status === 'COMPLETED' ? 'DONE' : 'PENDING' },
                  { step: '4', title: 'Hospital Pharmacy Dispensation', desc: 'Collect prescribed medicines at Counter 2', status: myTicket?.status === 'COMPLETED' ? 'CURRENT' : 'PENDING' },
                  { step: '5', title: 'Visit Concluded & Digital Record Saved', desc: 'Encounter stored in Ayushman Digital Health Grid', status: 'PENDING' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.status === 'DONE' ? 'bg-emerald-600 text-white' : item.status === 'CURRENT' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.status === 'DONE' ? '✓' : item.step}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: QR Nonce & Instructions */}
          <div className="md:col-span-5 space-y-6">
            {/* QR Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Fast Doctor Verification QR
              </span>
              <div className="inline-block p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl mb-3 shadow-inner">
                {/* SVG QR Code Simulation */}
                <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100">
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
                  {/* Pattern dots */}
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

              <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 py-1 px-3 rounded-lg inline-block mb-3">
                {myTicket?.registrationId || 'REG-20260926-0042'}
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Scan this at the doctor's desk or pharmacy counter to retrieve registration data securely without physical paperwork.
              </p>

              {printFeedback && (
                <div className="mb-3 p-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  {printFeedback}
                </div>
              )}

              <button
                onClick={handlePrint}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Physical Token Slip</span>
              </button>
            </div>

            {/* Helpline Contacts */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-2">
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

      {/* SUB-TAB 2: ONLINE SELF-REGISTRATION FORM */}
      {activeSubTab === 'REGISTER' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Online OPD Patient Self-Registration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select hospital, department, and receive instant token and digital barcode.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Language Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-1.5">
                Preferred Language / भाषा चुनें
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {languages.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => setLang(l.code as any)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${
                      lang === l.code ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name (मरीज़ का नाम)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (10 Digits)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Facility & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hospital / Clinic</label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {state.facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {state.departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.name} ({d.roomNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for Visit / Primary Symptoms (बीमारी के लक्षण)
              </label>
              <textarea
                required
                rows={2}
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Describe fever duration, pain location, or past medications..."
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Triage Priority</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPriority('ROUTINE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    priority === 'ROUTINE' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Routine Outpatient
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('URGENT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    priority === 'URGENT' ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Urgent / Acute Symptoms
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>Submit & Generate OPD Token</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: DIGITAL HEALTH CARD (ABHA) */}
      {activeSubTab === 'CARD' && (
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-900 text-white rounded-3xl p-6 shadow-2xl border border-blue-800/80 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-800/60 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-bold text-xs">
                  ABHA
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                    National Health Authority
                  </h4>
                  <p className="text-[10px] text-teal-300 font-medium">Ayushman Digital Health Card</p>
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>

            {/* Profile Row */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-teal-500 text-white flex items-center justify-center text-xl font-bold border-2 border-white/20 shrink-0">
                RS
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Rajesh Sharma
                </h3>
                <div className="text-xs text-blue-200 mt-0.5">
                  Age: 38 yrs · Gender: MALE · Blood: B+
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 98765 43210
                </div>
              </div>
            </div>

            {/* ABHA / Patient ID Number */}
            <div className="bg-blue-950/60 border border-blue-700/50 rounded-xl p-3 mb-4 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                PATIENT IDENTIFICATION NUMBER
              </span>
              <span className="text-xl font-black font-mono tracking-wider text-teal-300">
                PAT-20260926-4891
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 border-t border-blue-800/60 pt-3">
              <div>
                <span className="text-slate-400 block text-[10px]">District & State:</span>
                <span className="font-semibold text-white">Raipur, Chhattisgarh</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Known Allergies:</span>
                <span className="font-bold text-red-300">Penicillin (Severe)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              Print Digital Health Card
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: JOURNEY TIMELINE */}
      {activeSubTab === 'JOURNEY' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Historical Outpatient Journey Timeline
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            End-to-end lifecycle history for Patient PAT-20260926-4891 (Rajesh Sharma)
          </p>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-100"></span>
              <span className="text-[10px] font-mono text-slate-400 block">Today · 08:35 AM</span>
              <div className="font-bold text-xs text-slate-900">Online OPD Self-Registration</div>
              <div className="text-[11px] text-slate-500">Token GM-042 allocated at District Hospital Raipur (Room 104)</div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-4 ring-blue-100"></span>
              <span className="text-[10px] font-mono text-slate-400 block">Today · 08:14 AM</span>
              <div className="font-bold text-xs text-slate-900">Previous OPD Consultation Completed</div>
              <div className="text-[11px] text-slate-500">Dr. Alok Verma diagnosed Acute URI (J06.9). Prescribed Paracetamol, Cetirizine, and ORS.</div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-300 border-2 border-white ring-4 ring-slate-100"></span>
              <span className="text-[10px] font-mono text-slate-400 block">Sept 20, 2026 · 09:30 AM</span>
              <div className="font-bold text-xs text-slate-900">ABHA Digital Health Profile Issued</div>
              <div className="text-[11px] text-slate-500">Card generated at PHC Abhanpur kiosk terminal.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
