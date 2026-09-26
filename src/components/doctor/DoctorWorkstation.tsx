import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QueueTicket, PrescriptionItem } from '../../types';
import {
  Stethoscope,
  Search,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Pill,
  Activity,
  Plus,
  Trash2,
  Send,
  Eye,
  Phone,
  ShieldAlert,
  Sparkles,
  QrCode,
  User,
  Heart,
  ChevronRight,
  Check,
  Volume2
} from 'lucide-react';

export const DoctorWorkstation: React.FC = () => {
  const { state, callNextTicket, completeConsultation } = useApp();

  // Active Department is General Medicine for Doctor Workspace
  const currentDept = state.departments.find((d) => d.code === 'GM') || state.departments[0];
  const deptTickets = state.tickets.filter((t) => t.departmentId === currentDept.departmentId);

  const waitingTickets = deptTickets
    .filter((t) => t.status === 'WAITING')
    .sort((a, b) => {
      const pOrder = { EMERGENCY: 0, URGENT: 1, ROUTINE: 2 };
      return pOrder[a.priority] - pOrder[b.priority] || a.sequenceNumber - b.sequenceNumber;
    });

  const activeTicket = deptTickets.find((t) => t.status === 'CALLED' || t.status === 'IN_CONSULTATION') || null;
  const completedTickets = deptTickets.filter((t) => t.status === 'COMPLETED');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fetchedRegistration, setFetchedRegistration] = useState<any | null>(null);

  // Active Consultation State
  const [chiefComplaint, setChiefComplaint] = useState('Acute fever and sore throat for 3 days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fever', 'Sore Throat', 'Body Ache']);
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('78');
  const [tempF, setTempF] = useState('100.4');
  const [weightKg, setWeightKg] = useState('68');
  const [spo2, setSpo2] = useState('98');
  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Tract Infection (ICD-10 J06.9)');
  const [clinicalNotes, setClinicalNotes] = useState('Patient febrile with pharyngeal congestion. Chest clear bilaterally. Hydration emphasized.');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      medicineId: 'MED-PCM-500',
      medicineName: 'Paracetamol 500mg Tablets',
      dosage: '1 tab TDS (thrice daily)',
      durationDays: 3,
      quantity: 10,
      instructions: 'Take after food with warm water',
    },
    {
      medicineId: 'MED-CET-10',
      medicineName: 'Cetirizine 10mg Tablets',
      dosage: '1 tab OD (bedtime)',
      durationDays: 5,
      quantity: 5,
      instructions: 'Take at night before sleeping',
    },
    {
      medicineId: 'MED-ORS',
      medicineName: 'ORS (Oral Rehydration Salts) Sachets',
      dosage: '1 sachet in 1 liter clean water',
      durationDays: 2,
      quantity: 2,
      instructions: 'Maintain adequate electrolyte fluid intake',
    }
  ]);
  const [orderedLabTests, setOrderedLabTests] = useState<string[]>(['Complete Blood Count (CBC)']);
  const [activeQueueTab, setActiveQueueTab] = useState<'WAITING' | 'ACTIVE' | 'COMPLETED'>('WAITING');
  const [consultationSuccessMsg, setConsultationSuccessMsg] = useState('');

  // Universal Patient Search
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const clean = q.toLowerCase();
    const results = state.registrations.filter((r) => {
      const matchToken = r.tokenNumber.toLowerCase().includes(clean);
      const matchPatientId = r.patientId.toLowerCase().includes(clean);
      const matchRegId = r.registrationId.toLowerCase().includes(clean);
      const matchName = r.patientName.toLowerCase().includes(clean);
      const patient = state.patients.find((p) => p.patientId === r.patientId);
      const matchPhone = patient?.phone.includes(clean);
      const matchQr = r.qrCodeData.toLowerCase().includes(clean);
      return matchToken || matchPatientId || matchRegId || matchName || matchPhone || matchQr;
    });
    setSearchResults(results.slice(0, 6));
  };

  const handleFetchRegistration = (reg: any) => {
    const patient = state.patients.find((p) => p.patientId === reg.patientId);
    setFetchedRegistration({ ...reg, patient });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCallNext = () => {
    const ticket = callNextTicket(currentDept.departmentId);
    if (ticket) {
      const reg = state.registrations.find((r) => r.ticketId === ticket.ticketId);
      if (reg) {
        handleFetchRegistration(reg);
      }
      setActiveQueueTab('ACTIVE');
    }
  };

  const handleCompleteEncounter = () => {
    if (!activeTicket) return;

    completeConsultation({
      ticketId: activeTicket.ticketId,
      chiefComplaint,
      symptoms: selectedSymptoms,
      vitals: {
        bpSystolic: Number(bpSystolic),
        bpDiastolic: Number(bpDiastolic),
        pulse: Number(pulse),
        tempF: Number(tempF),
        weightKg: Number(weightKg),
        spo2: Number(spo2),
      },
      diagnosis,
      clinicalNotes,
      prescriptionItems,
      labTests: orderedLabTests,
    });

    setConsultationSuccessMsg(
      `Consultation for ${activeTicket.patientName} (${activeTicket.tokenNumber}) completed! Prescription dispatched to Pharmacy Dispensary.`
    );
    setTimeout(() => setConsultationSuccessMsg(''), 6000);
    setFetchedRegistration(null);
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const addPrescriptionItem = (medicineId: string, medicineName: string) => {
    if (prescriptionItems.some((i) => i.medicineId === medicineId)) return;
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicineId,
        medicineName,
        dosage: '1 tab BD (twice daily)',
        durationDays: 5,
        quantity: 10,
        instructions: 'Take after meals',
      },
    ]);
  };

  const removePrescriptionItem = (medicineId: string) => {
    setPrescriptionItems(prescriptionItems.filter((i) => i.medicineId !== medicineId));
  };

  const quickSymptoms = ['Fever', 'Dry Cough', 'Sore Throat', 'Headache', 'Chest Pain', 'Nausea / Vomiting', 'Diarrhea', 'Abdominal Cramps', 'Shortness of Breath', 'Joint Stiffness'];
  const commonDiagnoses = [
    'Acute Upper Respiratory Tract Infection (ICD-10 J06.9)',
    'Acute Gastroenteritis with Mild Dehydration (ICD-10 A09)',
    'Viral Pyrexia / Suspected Dengue (ICD-10 A90)',
    'Essential Primary Hypertension (ICD-10 I10)',
    'Type 2 Diabetes Mellitus without Complications (ICD-10 E11.9)',
    'Bronchial Asthma Acute Exacerbation (ICD-10 J45.901)'
  ];

  const currentPatient =
    fetchedRegistration?.patient ||
    (activeTicket ? state.patients.find((p) => p.patientId === activeTicket.patientId) : null);

  return (
    <div className="space-y-6">
      {/* Top Clinical Header & Telemetry */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Dr. Alok Verma, MD (Internal Medicine)</h2>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active On Duty
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                District Hospital Raipur · {currentDept.name} ({currentDept.roomNumber}) · OPD Shift 08:00 - 14:00
              </p>
            </div>
          </div>

          {/* Call Next Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCallNext}
              disabled={waitingTickets.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition cursor-pointer shadow-sm shadow-blue-700/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Call Next Patient ({waitingTickets.length} waiting)</span>
            </button>
          </div>
        </div>

        {/* Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">Patients Today</span>
            <span className="text-xl font-extrabold text-slate-900">{deptTickets.length + 37}</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-amber-700 block uppercase">Waiting in Queue</span>
            <span className="text-xl font-extrabold text-amber-900">{waitingTickets.length}</span>
          </div>
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-blue-700 block uppercase">In Consultation</span>
            <span className="text-xl font-extrabold text-blue-900">{activeTicket ? 1 : 0}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-emerald-700 block uppercase">Completed</span>
            <span className="text-xl font-extrabold text-emerald-900">{completedTickets.length + 37}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">Avg Consultation</span>
            <span className="text-xl font-extrabold text-slate-900">{currentDept.avgConsultationMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {consultationSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{consultationSuccessMsg}</span>
          </div>
          <button
            onClick={() => setConsultationSuccessMsg('')}
            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Clinical Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Queue Management & Universal Patient Lookup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Universal Fast Search Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Universal Patient Lookup
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Token / Patient ID / Phone / QR</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search token e.g. GM-042, phone, or name..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Live Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1.5 space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Matching Registrations ({searchResults.length})
                </div>
                {searchResults.map((reg) => (
                  <button
                    key={reg.registrationId}
                    onClick={() => handleFetchRegistration(reg)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50/80 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-700 font-mono text-xs">{reg.tokenNumber}</span>
                        <span className="font-semibold text-slate-800 text-xs">{reg.patientName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          reg.priorityStatus === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {reg.priorityStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {reg.patientId} · {reg.departmentName} · {reg.visitReason.slice(0, 35)}...
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      Fetch <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Today's Queue Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="flex border-b border-slate-200 bg-slate-50/60 p-1">
              <button
                onClick={() => setActiveQueueTab('WAITING')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQueueTab === 'WAITING' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Waiting</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {waitingTickets.length}
                </span>
              </button>
              <button
                onClick={() => setActiveQueueTab('ACTIVE')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQueueTab === 'ACTIVE' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Active Calling</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {activeTicket ? 1 : 0}
                </span>
              </button>
              <button
                onClick={() => setActiveQueueTab('COMPLETED')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQueueTab === 'COMPLETED' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Completed</span>
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {completedTickets.length}
                </span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-3 max-h-[460px] overflow-y-auto space-y-2">
              {activeQueueTab === 'WAITING' && (
                <>
                  {waitingTickets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No patients currently waiting in General Medicine OPD.
                    </div>
                  ) : (
                    waitingTickets.map((ticket, idx) => {
                      const reg = state.registrations.find((r) => r.ticketId === ticket.ticketId);
                      const isUrgent = ticket.priority === 'URGENT' || ticket.priority === 'EMERGENCY';
                      return (
                        <div
                          key={ticket.ticketId}
                          className={`p-3 rounded-xl border transition flex items-center justify-between ${
                            isUrgent
                              ? 'bg-amber-50/60 border-amber-200/90'
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-[11px] font-bold text-slate-400 font-mono text-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold font-mono text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                                  {ticket.tokenNumber}
                                </span>
                                <span className="font-bold text-xs text-slate-900">{ticket.patientName}</span>
                                {isUrgent && (
                                  <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.2 rounded">
                                    {ticket.priority}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {reg?.visitReason || 'General checkup'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (reg) handleFetchRegistration(reg);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition border border-transparent hover:border-blue-200"
                          >
                            View
                          </button>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {activeQueueTab === 'ACTIVE' && (
                <>
                  {!activeTicket ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No patient currently called into consultation room.
                      <div className="mt-2">
                        <button
                          onClick={handleCallNext}
                          disabled={waitingTickets.length === 0}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs cursor-pointer hover:bg-blue-500 transition"
                        >
                          Call Next Waiting Patient
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Now Inside Consultation Room
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Called at {new Date(activeTicket.calledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl font-black font-mono text-blue-900">
                          {activeTicket.tokenNumber}
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {activeTicket.patientName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-4">
                        Patient ID: <span className="font-mono">{activeTicket.patientId}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const reg = state.registrations.find((r) => r.ticketId === activeTicket.ticketId);
                            if (reg) handleFetchRegistration(reg);
                          }}
                          className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-500 transition"
                        >
                          Load Clinical Pad
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeQueueTab === 'COMPLETED' && (
                <>
                  {completedTickets.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-mono font-bold text-slate-700">{ticket.tokenNumber}</span>
                        <span className="text-slate-900 font-medium">{ticket.patientName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ticket.completedAt ? new Date(ticket.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Completed'}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Quick Formulary Stock Reference */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              OPD Dispensary Drug Availability Check
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {state.inventory
                .filter((i) => i.facilityId === state.currentFacilityId)
                .slice(0, 4)
                .map((med) => (
                  <div key={med.inventoryId} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-semibold text-slate-900 truncate">{med.medicineName.replace(/\(.*\)/, '')}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-500 font-mono">{med.currentStock} in stock</span>
                      <span className={`font-bold ${
                        med.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {med.daysOfStock}d
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Active Clinical Encounter Pad & Prescription Pad */}
        <div className="lg:col-span-7 space-y-6">
          {/* Patient Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {currentPatient ? currentPatient.fullName.charAt(0) : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentPatient ? currentPatient.fullName : 'No Patient Selected'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentPatient ? `${currentPatient.patientId} · ${currentPatient.age} yrs · ${currentPatient.gender} · Blood: ${currentPatient.bloodGroup || 'O+'}` : 'Select a ticket from the queue or search'}
                  </p>
                </div>
              </div>

              {currentPatient?.knownAllergies && currentPatient.knownAllergies.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Allergy: {currentPatient.knownAllergies.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Visit Reason Banner */}
            {fetchedRegistration && (
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider mb-0.5">
                  Reported Chief Complaint (at {fetchedRegistration.registrationSource} registration):
                </span>
                <span className="text-slate-900 font-medium">
                  {fetchedRegistration.visitReason}
                </span>
              </div>
            )}

            {/* Vitals Recording Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">BP (mmHg)</span>
                <div className="flex items-center justify-center font-mono font-bold text-xs text-slate-900">
                  <input
                    type="text"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-8 text-center bg-transparent focus:outline-hidden focus:underline"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-8 text-center bg-transparent focus:outline-hidden focus:underline"
                  />
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pulse (bpm)</span>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-center font-mono font-bold text-xs text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Temp (°F)</span>
                <input
                  type="text"
                  value={tempF}
                  onChange={(e) => setTempF(e.target.value)}
                  className="w-full text-center font-mono font-bold text-xs text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight (kg)</span>
                <input
                  type="text"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full text-center font-mono font-bold text-xs text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2 (%)</span>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full text-center font-mono font-bold text-xs text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Triage</span>
                <span className="font-extrabold text-xs text-blue-700 block">Routine</span>
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider mb-1.5">
                Clinical Symptoms (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickSymptoms.map((s) => {
                  const active = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer border ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ICD-10 Diagnosis Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider mb-1">
                Clinical Diagnosis & ICD-10 Classification
              </label>
              <select
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {commonDiagnoses.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinical Observations / Notes */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider mb-1">
                Doctor's Clinical Notes & Advice
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Enter clinical examination notes, dietary guidance, warning signs..."
              />
            </div>

            {/* e-Prescription Composer */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  e-Prescription Order (Dispensary Formulary)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {prescriptionItems.length} items
                </span>
              </div>

              {/* Prescribed Items Table */}
              <div className="space-y-2 mb-3">
                {prescriptionItems.map((item, idx) => (
                  <div
                    key={item.medicineId}
                    className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                        <span className="font-medium text-blue-700">{item.dosage}</span>
                        <span>·</span>
                        <span>{item.durationDays} days</span>
                        <span>·</span>
                        <span className="font-mono font-bold text-slate-700">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removePrescriptionItem(item.medicineId)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Add Formulary Medicine */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 self-center mr-1">
                  Add:
                </span>
                <button
                  onClick={() => addPrescriptionItem('MED-AMX-500', 'Amoxicillin 500mg Capsules')}
                  className="text-[11px] px-2 py-0.8 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  + Amoxicillin 500mg
                </button>
                <button
                  onClick={() => addPrescriptionItem('MED-PCM-500', 'Paracetamol 500mg Tablets')}
                  className="text-[11px] px-2 py-0.8 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  + Paracetamol 500mg
                </button>
                <button
                  onClick={() => addPrescriptionItem('MED-MET-500', 'Metformin 500mg Tablets')}
                  className="text-[11px] px-2 py-0.8 bg-white border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  + Metformin 500mg
                </button>
              </div>
            </div>

            {/* Bottom Complete Consultation Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500">
                Advances queue · Dispatches Rx to Pharmacy Dispensary
              </span>
              <button
                onClick={handleCompleteEncounter}
                disabled={!activeTicket}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20"
              >
                <Send className="w-4 h-4" />
                <span>Complete Consultation & Dispatch Rx</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
