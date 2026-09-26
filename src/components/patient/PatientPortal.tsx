import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PatientRegistrationWizard } from './PatientRegistrationWizard';
import { PatientQueueTracker } from './PatientQueueTracker';
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

  const [activeSubTab, setActiveSubTab] = useState<'TRACK' | 'REGISTER' | 'CARD' | 'JOURNEY'>('TRACK');
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

  // Active track ticket: default to newly registered or Rajesh Sharma's ticket GM-042
  const activeTokenNum = registeredResult?.ticket?.tokenNumber || 'GM-042';
  const myTicket = registeredResult?.ticket || state.tickets.find((t) => t.tokenNumber === 'GM-042') || state.tickets[state.tickets.length - 1];

  const [liveJourneyData, setLiveJourneyData] = useState<any | null>(null);

  React.useEffect(() => {
    fetch(`/api/queue/track?tokenNumber=${encodeURIComponent(activeTokenNum)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLiveJourneyData(data.data);
        }
      })
      .catch((err) => console.warn('Journey fetch error:', err));
  }, [activeTokenNum, activeSubTab]);

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

      {/* SUB-TAB 1: LIVE QUEUE TRACKER (ALL VALUES FROM BACKEND DATA) */}
      {activeSubTab === 'TRACK' && (
        <PatientQueueTracker
          initialTokenNumber={registeredResult?.ticket?.tokenNumber || myTicket?.tokenNumber || 'GM-042'}
          onNavigateToRegister={() => setActiveSubTab('REGISTER')}
        />
      )}

      {/* SUB-TAB 2: COMPLETE ONLINE SELF-REGISTRATION WORKFLOW */}
      {activeSubTab === 'REGISTER' && (
        <PatientRegistrationWizard
          onComplete={(res) => setRegisteredResult(res)}
          onNavigateToTrack={() => setActiveSubTab('TRACK')}
        />
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

      {/* SUB-TAB 4: JOURNEY TIMELINE (FROM BACKEND DATA) */}
      {activeSubTab === 'JOURNEY' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Outpatient Journey & Clinical Milestones
              </h3>
              <p className="text-xs text-slate-500">
                Tracking Token <strong className="font-mono text-blue-700">{liveJourneyData?.tokenNumber || activeTokenNum}</strong> · {liveJourneyData?.patientName || 'Rajesh Sharma'}
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('TRACK')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Live Queue</span>
            </button>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {(liveJourneyData?.journey || [
              { stage: 'REGISTRATION', title: 'Online OPD Self-Registration', timestamp: 'Today · 08:35 AM', status: 'COMPLETED', detail: 'Token allocated via SwasthSetu Digital Grid' },
              { stage: 'TRIAGE', title: 'Nurse Station Vitals Assessment', timestamp: 'Today · 08:40 AM', status: 'COMPLETED', detail: 'Vitals recorded: BP 122/82 mmHg, SpO2 98%, Pulse 76 bpm' },
              { stage: 'QUEUE', title: 'OPD Waiting Queue & Corridor Calling', timestamp: 'In Progress', status: 'IN_PROGRESS', detail: 'Waiting outside Room 102. 3 patients ahead.' },
              { stage: 'CONSULTATION', title: 'Doctor Medical Consultation', timestamp: 'Upcoming', status: 'UPCOMING', detail: 'Dr. Alok Verma, MD (Internal Medicine)' },
              { stage: 'PHARMACY', title: 'Hospital Pharmacy Dispensation', timestamp: 'Pending', status: 'UPCOMING', detail: 'Medications collected at Central Pharmacy Counter 2' },
            ]).map((item: any, idx: number) => {
              const isDone = item.status === 'COMPLETED';
              const isInProgress = item.status === 'IN_PROGRESS';
              return (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                      isDone
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : isInProgress
                        ? 'bg-blue-600 ring-4 ring-blue-100 animate-pulse'
                        : 'bg-slate-300 ring-4 ring-slate-100'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 block">{item.timestamp}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isDone ? 'bg-emerald-50 text-emerald-700' : isInProgress ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 mt-0.5">{item.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{item.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
