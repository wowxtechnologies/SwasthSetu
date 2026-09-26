import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Monitor,
  QrCode,
  UserPlus,
  Phone,
  AlertOctagon,
  Printer,
  RotateCcw,
  Volume2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Activity,
  Heart,
  Eye,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { LanguageCode } from '../../types';

export const SmartKiosk: React.FC = () => {
  const { state, registerPatient } = useApp();

  type KioskStage =
    | 'LANGUAGE'
    | 'ACTION'
    | 'PHONE_KEYPAD'
    | 'SCAN_QR'
    | 'DEPT_SELECT'
    | 'SYMPTOM_SELECT'
    | 'RECEIPT'
    | 'EMERGENCY_ALARM';

  const [stage, setStage] = useState<KioskStage>('LANGUAGE');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('hi');
  const [phoneInput, setPhoneInput] = useState('');
  const [scannedPatient, setScannedPatient] = useState<any | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState('DEP-GENMED');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fever (बुखार)']);
  const [issuedTicket, setIssuedTicket] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // Automated 30-second timeout reset when on receipt
  useEffect(() => {
    let timer: any;
    if (stage === 'RECEIPT') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleReset();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  const handleReset = () => {
    setStage('LANGUAGE');
    setPhoneInput('');
    setScannedPatient(null);
    setSelectedSymptoms(['Fever (बुखार)']);
    setIssuedTicket(null);
    setCountdown(30);
  };

  const handleSimulateVoice = (text: string) => {
    setVoicePlaying(true);
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setVoicePlaying(false);
        utterance.onerror = () => setVoicePlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setVoicePlaying(false), 2000);
      }
    } catch (e) {
      console.warn('Speech synthesis restricted in this frame context:', e);
      setTimeout(() => setVoicePlaying(false), 2000);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (phoneInput.length < 10) {
      const next = phoneInput + digit;
      setPhoneInput(next);
      if (next.length === 10) {
        // Auto lookup
        const found = state.patients.find((p) => p.phone.includes(next));
        if (found) {
          setScannedPatient(found);
          handleSimulateVoice(`नमस्ते ${found.fullName}. कृपया विभाग चुनें.`);
        } else {
          setScannedPatient({
            fullName: 'Walk-in Citizen (नागरिक)',
            phone: `+91 ${next}`,
            age: 32,
            gender: 'MALE',
          });
        }
        setStage('DEPT_SELECT');
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPhoneInput((prev) => prev.slice(0, -1));
  };

  const handleSimulateQRScan = (patientId: string) => {
    const found = state.patients.find((p) => p.patientId === patientId) || state.patients[0];
    setScannedPatient(found);
    handleSimulateVoice(`क्यूआर कोड सत्यापित हुआ. मरीज़ ${found.fullName}.`);
    setStage('DEPT_SELECT');
  };

  const handleGenerateTicket = (isEmergency = false) => {
    const patientName = scannedPatient?.fullName || 'Walk-in Patient';
    const res = registerPatient({
      fullName: patientName,
      phone: scannedPatient?.phone || '+91 98765 00000',
      dateOfBirth: '1990-01-01',
      gender: scannedPatient?.gender || 'MALE',
      villageOrCity: 'Raipur Local',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
      preferredLanguage: selectedLang,
      departmentId: isEmergency ? 'DEP-GENMED' : selectedDeptId,
      facilityId: state.currentFacilityId,
      visitReason: isEmergency ? 'CRITICAL EMERGENCY CASUALTY' : selectedSymptoms.join(', '),
      priorityStatus: isEmergency ? 'EMERGENCY' : 'ROUTINE',
      registrationSource: 'KIOSK',
    });

    setIssuedTicket(res.ticket);
    setStage(isEmergency ? 'EMERGENCY_ALARM' : 'RECEIPT');
    handleSimulateVoice(
      isEmergency
        ? 'आपातकालीन टोकन जारी हुआ. कृपया सीधे स्ट्रेचर रूम 1 में जाएं.'
        : `आपका टोकन नंबर ${res.ticket.tokenNumber} है. कृपया ओपीडी प्रतीक्षा कक्ष में बैठें.`
    );
  };

  const departments = [
    { id: 'DEP-GENMED', name: 'General Medicine', nameHi: 'सामान्य चिकित्सा', room: 'Room 104', icon: Stethoscope, color: 'border-blue-300 bg-blue-50/70 text-blue-900' },
    { id: 'DEP-PED', name: 'Pediatrics (Child OPD)', nameHi: 'बाल रोग विभाग', room: 'Room 108', icon: Activity, color: 'border-amber-300 bg-amber-50/70 text-amber-900' },
    { id: 'DEP-ORTHO', name: 'Orthopedics & Fracture', nameHi: 'हड्डी एवं जोड़ रोग', room: 'Room 112', icon: Heart, color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900' },
    { id: 'DEP-EYE', name: 'Ophthalmology (Eye OPD)', nameHi: 'नेत्र रोग विभाग', room: 'Room 205', icon: Eye, color: 'border-purple-300 bg-purple-50/70 text-purple-900' },
  ];

  const symptomPills = [
    'Fever (बुखार)',
    'Cold & Cough (खांसी-जुकाम)',
    'Severe Body Pain (दर्द)',
    'Stomach Ache (पेट दर्द)',
    'High BP / Sugar (बीपी-शुगर)',
    'Routine Checkup (सामान्य जांच)',
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-slate-800 min-h-[680px] flex flex-col justify-between select-none">
      {/* Top Kiosk Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block">
              TOUCHSCREEN REGISTRATION KIOSK · TERMINAL #01
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              {state.facilities.find((f) => f.facilityId === state.currentFacilityId)?.name || 'District Hospital Raipur'}
            </h2>
          </div>
        </div>

        {/* Audio Assistance Indicator & Emergency Bypass */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulateVoice('नमस्ते. स्वस्थसेतु स्मार्ट कियोस्क में आपका स्वागत है.')}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-2 text-xs font-bold ${
              voicePlaying
                ? 'bg-teal-500 text-slate-900 border-teal-400 animate-pulse'
                : 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="hidden sm:inline">Voice Help (आवाज़ सहायता)</span>
          </button>

          <button
            onClick={() => handleGenerateTicket(true)}
            className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/40 animate-pulse border-2 border-red-400"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>Emergency (आपातकालीन)</span>
          </button>
        </div>
      </div>

      {/* STAGE 1: LANGUAGE SELECTION */}
      {stage === 'LANGUAGE' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full text-center py-6">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
            कृपया भाषा चुनें / Select Your Language
          </h3>
          <p className="text-sm text-slate-400 mb-8">
            Touch any language tile below to begin outpatient token generation
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { code: 'hi', name: 'हिंदी', sub: 'Hindi', script: 'नमस्ते' },
              { code: 'en', name: 'English', sub: 'English', script: 'Welcome' },
              { code: 'bn', name: 'বাংলা', sub: 'Bengali', script: 'স্বাগতম' },
              { code: 'te', name: 'తెలుగు', sub: 'Telugu', script: 'స్వాగతం' },
              { code: 'ta', name: 'தமிழ்', sub: 'Tamil', script: 'வரவேற்பு' },
              { code: 'mr', name: 'मराठी', sub: 'Marathi', script: 'नमस्कार' },
            ].map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setSelectedLang(item.code as any);
                  setStage('ACTION');
                  handleSimulateVoice(`Selected ${item.sub}. Please choose new or existing patient.`);
                }}
                className="h-24 sm:h-28 rounded-2xl bg-slate-800/90 hover:bg-blue-600/90 border-2 border-slate-700 hover:border-blue-400 p-4 transition-all duration-150 cursor-pointer flex flex-col justify-center items-center group shadow-md"
              >
                <span className="text-xl sm:text-2xl font-black text-white group-hover:scale-105 transition">
                  {item.name}
                </span>
                <span className="text-xs text-teal-400 group-hover:text-blue-200 mt-1">
                  {item.sub} · {item.script}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: ACTION SELECT (MOBILE LOOKUP vs QR SCAN vs NEW) */}
      {stage === 'ACTION' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              How would you like to identify? (पहचान का तरीका)
            </h3>
            <p className="text-sm text-slate-400">
              Select an option below to retrieve or generate your OPD token
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Enter Mobile Number */}
            <button
              onClick={() => setStage('PHONE_KEYPAD')}
              className="h-44 rounded-3xl bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-500/80 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-md">
                <Phone className="w-8 h-8" />
              </div>
              <span className="text-lg font-black text-white">Enter Mobile Phone</span>
              <span className="text-xs text-blue-200 mt-1">मोबाइल नंबर से खोजें</span>
            </button>

            {/* Scan ABHA QR Card */}
            <button
              onClick={() => setStage('SCAN_QR')}
              className="h-44 rounded-3xl bg-teal-900/60 hover:bg-teal-800/80 border-2 border-teal-500/80 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-md">
                <QrCode className="w-8 h-8" />
              </div>
              <span className="text-lg font-black text-white">Scan Health QR Card</span>
              <span className="text-xs text-teal-200 mt-1">क्यूआर कोड स्कैन करें</span>
            </button>

            {/* Direct New Registration */}
            <button
              onClick={() => {
                setScannedPatient({
                  fullName: 'New Walk-in Patient (नया मरीज़)',
                  phone: '+91 99999 11111',
                  age: 28,
                  gender: 'FEMALE',
                });
                setStage('DEPT_SELECT');
              }}
              className="h-44 rounded-3xl bg-slate-800 hover:bg-slate-700/80 border-2 border-slate-600 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-700 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-md">
                <UserPlus className="w-8 h-8" />
              </div>
              <span className="text-lg font-black text-white">New Registration</span>
              <span className="text-xs text-slate-300 mt-1">नया पंजीकरण (बिना कार्ड)</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setStage('LANGUAGE')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Change Language
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: TOUCH NUMERIC KEYPAD */}
      {stage === 'PHONE_KEYPAD' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-2">
          <h3 className="text-lg font-bold text-white mb-1">
            Enter 10-Digit Mobile Number
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Registered patients will be recognized immediately
          </p>

          {/* Masked Display Box */}
          <div className="w-full bg-slate-950 border-2 border-teal-500/80 rounded-2xl p-4 text-center mb-5 shadow-inner">
            <div className="font-mono text-3xl font-black tracking-widest text-teal-300">
              {phoneInput ? phoneInput.padEnd(10, '•') : '••••••••••'}
            </div>
            <span className="text-[10px] text-slate-500 uppercase mt-1 block">
              {phoneInput.length}/10 Digits
            </span>
          </div>

          {/* 12-Button Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeypadPress(digit)}
                className="h-16 rounded-2xl bg-slate-800 hover:bg-blue-600 border border-slate-700 text-2xl font-black text-white transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setPhoneInput('')}
              className="h-16 rounded-2xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-xs font-bold text-red-300 transition active:scale-95 cursor-pointer flex items-center justify-center uppercase"
            >
              Clear
            </button>
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-16 rounded-2xl bg-slate-800 hover:bg-blue-600 border border-slate-700 text-2xl font-black text-white transition active:scale-95 cursor-pointer shadow-sm flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={handleKeypadBackspace}
              className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition active:scale-95 cursor-pointer flex items-center justify-center uppercase"
            >
              Del
            </button>
          </div>

          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setStage('ACTION')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                setPhoneInput('9876543210');
                handleKeypadPress('');
              }}
              className="text-xs text-teal-400 hover:underline cursor-pointer"
            >
              Test with Demo Phone (+91 98765 43210)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: OPTICAL QR CODE SCANNER SIMULATION */}
      {stage === 'SCAN_QR' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-4 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Hold Your Ayushman Health Card Before the Scanner
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Position QR barcode inside the glowing target frame
          </p>

          {/* Scanner Viewfinder Box */}
          <div className="relative w-64 h-64 border-4 border-teal-500 rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden mb-6 shadow-2xl">
            {/* Animated Laser Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-[bounce_2s_infinite]"></div>

            <QrCode className="w-32 h-32 text-slate-800" />
            <div className="absolute bottom-3 text-[10px] text-teal-400 font-mono tracking-wider">
              CAMERA ACTIVATED · READY
            </div>
          </div>

          {/* Instant Demo QR Trigger */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 block font-medium">Or simulate instant camera scan:</span>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleSimulateQRScan('PAT-20260926-4891')}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition shadow-md"
              >
                Scan Rajesh Sharma (Card PAT-4891)
              </button>
              <button
                onClick={() => handleSimulateQRScan('PAT-20260926-1022')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition shadow-md"
              >
                Scan Sunita Devi (Card PAT-1022)
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setStage('ACTION')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Back to Identification Options
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: SELECT DEPARTMENT (GIANT TOUCH TILES) */}
      {stage === 'DEPT_SELECT' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-2">
          {/* Patient Header */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 block">Verified Patient</span>
                <span className="text-base font-bold text-white">{scannedPatient?.fullName || 'Walk-in Citizen'}</span>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {scannedPatient?.phone}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-2">
            Select Medical Department (विभाग चुनें)
          </h3>
          <p className="text-xs text-slate-400 text-center mb-6">
            Touch the OPD department you want to visit today
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDeptId === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setStage('SYMPTOM_SELECT');
                    handleSimulateVoice(`Selected ${dept.name}. Please select your primary symptom.`);
                  }}
                  className={`h-24 sm:h-28 rounded-2xl border-2 p-4 flex items-center gap-4 transition cursor-pointer text-left ${
                    isSelected ? 'bg-blue-600 border-white shadow-xl scale-[1.02]' : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-900/60 flex items-center justify-center text-teal-300 shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-black text-white">{dept.name}</div>
                    <div className="text-xs text-teal-300 font-medium">{dept.nameHi}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{dept.room} · Avg 8m wait</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStage('ACTION')}
            className="text-xs text-slate-400 hover:text-white transition mx-auto cursor-pointer"
          >
            ← Back
          </button>
        </div>
      )}

      {/* STAGE 6: ZERO-TYPING SYMPTOM SELECT & GENERATE */}
      {stage === 'SYMPTOM_SELECT' && (
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-2">
          <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-2">
            Select Symptoms (लक्षण चुनें - बिना टाइप किए)
          </h3>
          <p className="text-xs text-slate-400 text-center mb-6">
            Touch one or more symptoms that best describe your condition
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {symptomPills.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => {
                    setSelectedSymptoms((prev) =>
                      prev.includes(symptom)
                        ? prev.filter((s) => s !== symptom)
                        : [...prev, symptom]
                    );
                  }}
                  className={`h-16 rounded-2xl border-2 px-4 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center text-center ${
                    active
                      ? 'bg-teal-500 text-slate-950 border-white shadow-lg font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {active ? '✓ ' : ''}{symptom}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('DEPT_SELECT')}
              className="h-16 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => handleGenerateTicket(false)}
              className="h-16 flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30"
            >
              <span>PRINT QUEUE TOKEN NOW (टोकन पर्ची निकालें)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 7: THERMAL RECEIPT & FINISH */}
      {stage === 'RECEIPT' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">
            Token Generated Successfully!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Thermal slip printing. Please proceed to the waiting hall.
          </p>

          {/* Thermal Receipt Paper Card (80mm Look) */}
          <div className="bg-white text-slate-900 rounded-2xl p-6 w-full shadow-2xl border-2 border-slate-300 font-sans text-left relative overflow-hidden mb-5">
            {/* Top jagged edge effect */}
            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-center">
              <span className="font-extrabold text-xs uppercase tracking-wider block">
                DISTRICT HOSPITAL RAIPUR
              </span>
              <span className="text-[10px] text-slate-500">Government OPD Public Dispensary</span>
            </div>

            <div className="text-center py-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                OUTPATIENT TOKEN
              </span>
              <div className="text-5xl font-black font-mono text-slate-900 my-1">
                {issuedTicket?.tokenNumber || 'GM-043'}
              </div>
              <span className="text-xs font-bold text-blue-800">
                General Medicine · Room 104
              </span>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2.5 my-3 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{issuedTicket?.patientName || 'Rajesh Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reg ID:</span>
                <span className="font-mono font-semibold">{issuedTicket?.registrationId || 'REG-20260926-0043'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-bold text-teal-800">KIOSK #01</span>
              </div>
            </div>

            {/* Micro QR barcode */}
            <div className="text-center pt-1">
              <div className="inline-block p-2 bg-slate-100 rounded-lg border border-slate-200">
                <QrCode className="w-16 h-16 mx-auto text-slate-800" />
              </div>
              <span className="block text-[9px] text-slate-400 font-mono mt-1">
                Show this barcode to attending doctor
              </span>
            </div>
          </div>

          {/* Reset Timer & Action */}
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              Auto-reset in <span className="font-bold text-teal-400 font-mono">{countdown}s</span>
            </span>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
            >
              Done / Finish (समाप्त)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 8: EMERGENCY CASUALTY ALARM */}
      {stage === 'EMERGENCY_ALARM' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-4 text-center">
          <div className="w-20 h-20 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mb-4 animate-ping">
            <AlertOctagon className="w-12 h-12" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-500/50 mb-3">
            EMERGENCY CASUALTY PROTOCOL ACTIVATED
          </span>
          <h3 className="text-3xl font-black text-white mb-2">
            PROCEED IMMEDIATELY TO CASUALTY / ROOM 1
          </h3>
          <p className="text-xs text-red-200 mb-6">
            Emergency medical staff alerted. Triage bypass token issued:
          </p>

          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-6 w-full mb-6">
            <span className="text-xs uppercase font-bold text-red-300 block">CASUALTY TOKEN</span>
            <div className="text-6xl font-black font-mono text-white my-2">
              EM-001
            </div>
            <span className="text-xs text-red-200 font-semibold">
              Casualty Trauma Ward · Ground Floor Red Corridor
            </span>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Acknowledge & Close Alarm
          </button>
        </div>
      )}

      {/* Bottom Kiosk Footer */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Kiosk System Healthy · Thermal Printer Online · 80mm Roll 84%</span>
        </div>
        <div>
          SwasthSetu Touch Access · Designed for Inclusive Citizen Triage
        </div>
      </div>
    </div>
  );
};
