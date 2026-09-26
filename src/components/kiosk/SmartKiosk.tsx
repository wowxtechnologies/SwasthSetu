import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { registrationService } from '../../services/registrationService';
import { LanguageCode, TriagePriority } from '../../types';
import {
  Monitor,
  QrCode,
  UserPlus,
  Phone,
  AlertOctagon,
  Printer,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  Activity,
  Heart,
  Eye,
  Camera,
  Search,
  Check,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  User,
  ShieldCheck,
  FileText,
  Maximize2,
  Minimize2,
  Volume1,
  Baby,
  Bone,
  Ear,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

type KioskStage =
  | 'LANGUAGE'
  | 'IDENTIFY_MODE'
  | 'LOOKUP_PHONE'
  | 'SCAN_QR'
  | 'NEW_PATIENT'
  | 'CONFIRM_PATIENT'
  | 'DEPT_SELECT'
  | 'SYMPTOM_SELECT'
  | 'RECEIPT'
  | 'EMERGENCY_ALARM';

interface KioskTranslation {
  welcome: string;
  selectLanguage: string;
  howIdentify: string;
  phoneLookup: string;
  phoneSub: string;
  scanQr: string;
  scanSub: string;
  newReg: string;
  newRegSub: string;
  emergencyBtn: string;
  emergencySub: string;
  selectDept: string;
  selectSymptoms: string;
  printToken: string;
  doneBtn: string;
  changeLang: string;
  backBtn: string;
  verifiedPatient: string;
}

const KIOSK_TEXTS: Record<LanguageCode, KioskTranslation> = {
  hi: {
    welcome: 'स्वस्थसेतु टचस्क्रीन स्मार्ट कियोस्क',
    selectLanguage: 'कृपया अपनी भाषा चुनें / Select Language',
    howIdentify: 'पहचान का तरीका चुनें',
    phoneLookup: 'मोबाइल नंबर दर्ज करें',
    phoneSub: 'पहले से पंजीकृत मरीज़ खोजें',
    scanQr: 'आभा क्यूआर कार्ड स्कैन करें',
    scanSub: 'कैमरा स्कैनर के सामने कार्ड रखें',
    newReg: 'नया मरीज़ पंजीकरण',
    newRegSub: 'पहली बार अस्पताल आने वाले नागरिक',
    emergencyBtn: 'आपातकालीन सहायता (EMERGENCY)',
    emergencySub: 'सीधे कैजुअल्टी वार्ड 1 के लिए',
    selectDept: 'ओपीडी विभाग चुनें (Department)',
    selectSymptoms: 'मुख्य लक्षण चुनें (Symptoms)',
    printToken: 'टोकन पर्ची प्रिंट करें',
    doneBtn: 'समाप्त / Done',
    changeLang: 'भाषा बदलें',
    backBtn: 'पीछे जाएं (Back)',
    verifiedPatient: 'सत्यापित मरीज़ (Verified)',
  },
  en: {
    welcome: 'SwasthSetu Touchscreen Smart Kiosk',
    selectLanguage: 'Please Select Your Language',
    howIdentify: 'How would you like to identify?',
    phoneLookup: 'Enter Mobile Number',
    phoneSub: 'Lookup registered patient record',
    scanQr: 'Scan ABHA Health QR Card',
    scanSub: 'Hold card before camera lens',
    newReg: 'New Patient Registration',
    newRegSub: 'First-time hospital walk-in citizen',
    emergencyBtn: 'EMERGENCY CASUALTY',
    emergencySub: 'Immediate Trauma Ward 1 bypass',
    selectDept: 'Select Outpatient Department',
    selectSymptoms: 'Select Reported Symptoms',
    printToken: 'Print OPD Token Slip',
    doneBtn: 'Finish & Reset',
    changeLang: 'Change Language',
    backBtn: 'Back',
    verifiedPatient: 'Verified Patient Record',
  },
  bn: {
    welcome: 'স্বাস্থ্যসেতু টাচস্ক্রিন স্মার্ট কিয়স্ক',
    selectLanguage: 'আপনার ভাষা নির্বাচন করুন',
    howIdentify: 'পরিচয়ের পদ্ধতি নির্বাচন করুন',
    phoneLookup: 'মোবাইল নম্বর লিখুন',
    phoneSub: 'নিবন্ধিত রোগী অনুসন্ধান',
    scanQr: 'স্বাস্থ্য কার্ড স্ক্যান করুন',
    scanSub: 'ক্যামেরার সামনে কিউআর কোড রাখুন',
    newReg: 'নতুন রোগী নিবন্ধন',
    newRegSub: 'প্রথমবার আগত নাগরিক',
    emergencyBtn: 'জরুরী বিভাগ (EMERGENCY)',
    emergencySub: 'সরাসরি ট্রমা ওয়ার্ডে যান',
    selectDept: 'বিভাগ নির্বাচন করুন',
    selectSymptoms: 'লক্ষণ নির্বাচন করুন',
    printToken: 'টোকেন প্রিন্ট করুন',
    doneBtn: 'সম্পন্ন / Done',
    changeLang: 'ভাষা পরিবর্তন',
    backBtn: 'পেছনে যান',
    verifiedPatient: 'যাচাইকৃত রোগী',
  },
  te: {
    welcome: 'స్వస్థసేతు టచ్‌స్క్రీన్ స్మార్ట్ కియోస్క్',
    selectLanguage: 'దయచేసి మీ భాషను ఎంచుకోండి',
    howIdentify: 'గుర్తింపు పద్ధతిని ఎంచుకోండి',
    phoneLookup: 'మొబైల్ నంబర్ నమోదు చేయండి',
    phoneSub: 'నమోదైన రోగిని కనుగొనండి',
    scanQr: 'ఆరోగ్య కార్డ్ స్కాన్ చేయండి',
    scanSub: 'కార్డును కెమెరా ముందు ఉంచండి',
    newReg: 'కొత్త రోగి నమోదు',
    newRegSub: 'మొదటిసారి వచ్చిన పౌరుడు',
    emergencyBtn: 'అత్యవసర విభాగం (EMERGENCY)',
    emergencySub: 'నేరుగా వార్డుకు వెళ్ళండి',
    selectDept: 'విభాగాన్ని ఎంచుకోండి',
    selectSymptoms: 'లక్షణాలను ఎంచుకోండి',
    printToken: 'టోకెన్ ప్రింట్ చేయండి',
    doneBtn: 'పూర్తయింది',
    changeLang: 'భాష మార్చండి',
    backBtn: 'వెనుకకు',
    verifiedPatient: 'ధృవీకరించబడిన రోగి',
  },
  ta: {
    welcome: 'ஸ்வஸ்த்சேது தொடுதிரை ஸ்மார்ட் கியோஸ்க்',
    selectLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    howIdentify: 'அடையாள முறையைத் தேர்ந்தெடுக்கவும்',
    phoneLookup: 'மொபைல் எண்ணை உள்ளிடவும்',
    phoneSub: 'பதிவுசெய்யப்பட்ட நோயாளியைத் தேடுங்கள்',
    scanQr: 'கார்டை ஸ்கேன் செய்யவும்',
    scanSub: 'கேமராவின் முன் கார்டைக் காட்டவும்',
    newReg: 'புதிய நோயாளி பதிவு',
    newRegSub: 'முதல் முறை வரும் குடிமகன்',
    emergencyBtn: 'அவசர சிகிச்சை (EMERGENCY)',
    emergencySub: 'நேரடியாக அறை 1 க்கு செல்லவும்',
    selectDept: 'துறையைத் தேர்ந்தெடுக்கவும்',
    selectSymptoms: 'அறிகுறிகளைத் தேர்ந்தெடுக்கவும்',
    printToken: 'டோக்கனை அச்சிடுக',
    doneBtn: 'முடிந்தது',
    changeLang: 'மொழியை மாற்றவும்',
    backBtn: 'பின்செல்',
    verifiedPatient: 'சரிபார்க்கப்பட்ட நோயாளி',
  },
  mr: {
    welcome: 'स्वस्थसेतु टचस्क्रीन स्मार्ट किऑस्क',
    selectLanguage: 'कृपया आपली भाषा निवडा',
    howIdentify: 'ओळख पद्धत निवडा',
    phoneLookup: 'मोबाईल नंबर टाका',
    phoneSub: 'नोंदणीकृत रुग्ण शोधा',
    scanQr: 'आरोग्य कार्ड स्कॅन करा',
    scanSub: 'कॅमेरा समोर कार्ड धरा',
    newReg: 'नवीन रुग्ण नोंदणी',
    newRegSub: 'पहिल्यांदा येणारे नागरिक',
    emergencyBtn: 'तातडीची मदत (EMERGENCY)',
    emergencySub: 'थेट कॅज्युअल्टी वॉर्ड 1 साठी',
    selectDept: 'ओपीडी विभाग निवडा',
    selectSymptoms: 'लक्षणे निवडा',
    printToken: 'टोकन पावती काढा',
    doneBtn: 'पूर्ण झाले',
    changeLang: 'भाषा बदला',
    backBtn: 'मागे जा',
    verifiedPatient: 'तपासलेले रुग्ण',
  },
};

export const SmartKiosk: React.FC = () => {
  const { state, registerPatient } = useApp();

  const [stage, setStage] = useState<KioskStage>('LANGUAGE');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('hi');
  const [phoneInput, setPhoneInput] = useState('');
  const [scannedPatient, setScannedPatient] = useState<any | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState('DEP-GENMED');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fever (बुखार)']);
  const [issuedTicket, setIssuedTicket] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // New Patient Form fields (Touch-keyboard enabled)
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientGender, setNewPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newPatientAge, setNewPatientAge] = useState(32);
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientVillage, setNewPatientVillage] = useState('Raipur');

  // Video scanner ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const text = KIOSK_TEXTS[selectedLang] || KIOSK_TEXTS.hi;

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
    setNewPatientName('');
    setNewPatientPhone('');
    setPrintFeedback(null);
  };

  const handleSimulateVoice = (phrase: string) => {
    if (!voiceEnabled) return;
    setVoicePlaying(true);
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        utterance.onend = () => setVoicePlaying(false);
        utterance.onerror = () => setVoicePlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setVoicePlaying(false), 2000);
      }
    } catch {
      setTimeout(() => setVoicePlaying(false), 1500);
    }
  };

  // Numpad handler for phone lookup
  const handleKeypadPress = (digit: string) => {
    if (phoneInput.length < 10) {
      const next = phoneInput + digit;
      setPhoneInput(next);
      if (next.length === 10) {
        handleLookupPhone(next);
      }
    }
  };

  const handleLookupPhone = (num: string) => {
    const found = state.patients.find((p) => p.phone.replace(/[^0-9]/g, '').includes(num));
    if (found) {
      setScannedPatient(found);
      handleSimulateVoice(`नमस्ते ${found.fullName}. कृपया ओपीडी विभाग चुनें.`);
      setStage('CONFIRM_PATIENT');
    } else {
      // Not found, open prefilled quick new registration
      setNewPatientPhone(num);
      setNewPatientName('Citizen Patient');
      setStage('NEW_PATIENT');
    }
  };

  const handleKeypadBackspace = () => {
    setPhoneInput((prev) => prev.slice(0, -1));
  };

  // Virtual on-screen touch keyboard for name typing
  const handleVirtualKey = (char: string) => {
    if (char === 'BACKSPACE') {
      setNewPatientName((prev) => prev.slice(0, -1));
    } else if (char === 'SPACE') {
      setNewPatientName((prev) => prev + ' ');
    } else if (char === 'CLEAR') {
      setNewPatientName('');
    } else {
      if (newPatientName.length < 32) {
        setNewPatientName((prev) => prev + char);
      }
    }
  };

  // Optical / QR Code scanning simulation
  const handleSimulateQRScan = (patientId: string) => {
    const found = state.patients.find((p) => p.patientId === patientId) || state.patients[0];
    setScannedPatient(found);
    handleSimulateVoice(`आभा स्वास्थ्य कार्ड सत्यापित हुआ. स्वागत है ${found.fullName}.`);
    setStage('CONFIRM_PATIENT');
  };

  // Ticket Generation (Dual Firestore & AppContext Sync)
  const handleGenerateTicket = async (isEmergency = false) => {
    const patientName = scannedPatient?.fullName || newPatientName || 'Walk-in Citizen';
    const patientPhone = scannedPatient?.phone || newPatientPhone || phoneInput || '+91 98260 00000';
    const deptId = isEmergency ? 'DEP-GENMED' : selectedDeptId;
    const deptObj = state.departments.find((d) => d.departmentId === deptId) || state.departments[0];
    const urgency: TriagePriority = isEmergency ? 'EMERGENCY' : 'ROUTINE';

    // 1. Reactive App State Sync
    const res = registerPatient({
      fullName: patientName,
      phone: patientPhone,
      dateOfBirth: scannedPatient?.dateOfBirth || '1992-05-10',
      gender: scannedPatient?.gender || newPatientGender,
      villageOrCity: scannedPatient?.address?.villageOrCity || newPatientVillage || 'Raipur',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
      preferredLanguage: selectedLang,
      departmentId: deptId,
      facilityId: state.currentFacilityId,
      visitReason: isEmergency ? 'CRITICAL EMERGENCY CASUALTY TRIAGE' : selectedSymptoms.join(', '),
      priorityStatus: urgency,
      registrationSource: 'KIOSK',
    });

    // 2. Direct Firestore & API Sync in background
    registrationService
      .submitRegistration({
        fullName: patientName,
        phone: patientPhone,
        dateOfBirth: scannedPatient?.dateOfBirth || '1992-05-10',
        gender: scannedPatient?.gender || newPatientGender,
        villageOrCity: scannedPatient?.address?.villageOrCity || newPatientVillage || 'Raipur',
        district: 'Raipur',
        state: 'Chhattisgarh',
        pincode: '492001',
        preferredLanguage: selectedLang,
        departmentId: deptId,
        departmentName: deptObj.name,
        facilityId: state.currentFacilityId,
        facilityName: 'District Hospital Raipur',
        visitReason: isEmergency ? 'CRITICAL EMERGENCY' : selectedSymptoms.join(', '),
        symptoms: selectedSymptoms,
        priorityStatus: urgency,
        registrationSource: 'KIOSK',
      })
      .catch((err) => console.warn('[Kiosk] Cloud background sync noticed:', err));

    setIssuedTicket(res.ticket);
    setStage(isEmergency ? 'EMERGENCY_ALARM' : 'RECEIPT');

    handleSimulateVoice(
      isEmergency
        ? 'आपातकालीन कैजुअल्टी टोकन जारी हुआ. कृपया सीधे स्ट्रेचर वार्ड 1 में जाएं.'
        : `आपका टोकन नंबर ${res.ticket.tokenNumber} है. कृपया ओपीडी कक्ष ${deptObj.roomNumber} के बाहर प्रतीक्षा करें.`
    );
  };

  const handlePrintSlip = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
        setPrintFeedback('Thermal token slip printing on 80mm roll...');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    } catch {
      setPrintFeedback('Digital slip confirmed: Screenshot or note your Token Number.');
      setTimeout(() => setPrintFeedback(null), 4000);
    }
  };

  const departments = [
    {
      id: 'DEP-GENMED',
      name: 'General Medicine',
      nameHi: 'सामान्य चिकित्सा',
      room: 'Room 102',
      icon: Stethoscope,
      bg: 'bg-blue-600/30 border-blue-400 text-blue-200',
      activeColor: 'bg-blue-600 border-white',
    },
    {
      id: 'DEP-PED',
      name: 'Pediatrics (Child OPD)',
      nameHi: 'बाल रोग विभाग',
      room: 'Room 108',
      icon: Baby,
      bg: 'bg-amber-600/30 border-amber-400 text-amber-200',
      activeColor: 'bg-amber-600 border-white',
    },
    {
      id: 'DEP-ORTHO',
      name: 'Orthopedics & Fracture',
      nameHi: 'हड्डी एवं जोड़ रोग',
      room: 'Room 114',
      icon: Bone,
      bg: 'bg-emerald-600/30 border-emerald-400 text-emerald-200',
      activeColor: 'bg-emerald-600 border-white',
    },
    {
      id: 'DEP-EYE',
      name: 'Ophthalmology (Eye OPD)',
      nameHi: 'नेत्र रोग विभाग',
      room: 'Room 204',
      icon: Eye,
      bg: 'bg-purple-600/30 border-purple-400 text-purple-200',
      activeColor: 'bg-purple-600 border-white',
    },
    {
      id: 'DEP-ENT',
      name: 'ENT (Ear, Nose, Throat)',
      nameHi: 'नाक, कान, गला विभाग',
      room: 'Room 210',
      icon: Ear,
      bg: 'bg-teal-600/30 border-teal-400 text-teal-200',
      activeColor: 'bg-teal-600 border-white',
    },
    {
      id: 'DEP-GYN',
      name: 'Obstetrics & Gynae',
      nameHi: 'स्त्री एवं प्रसूति रोग',
      room: 'Room 208',
      icon: Heart,
      bg: 'bg-rose-600/30 border-rose-400 text-rose-200',
      activeColor: 'bg-rose-600 border-white',
    },
  ];

  const symptomPills = [
    'Fever (बुखार)',
    'Cold & Cough (खांसी-जुकाम)',
    'Throat Congestion (गला दर्द)',
    'Severe Body Pain (बदन दर्द)',
    'Stomach Ache (पेट दर्द)',
    'Breathing Issue (सांस लेने में कष्ट)',
    'High BP / Diabetes (बीपी-शुगर)',
    'Skin Rash (त्वचा रोग)',
    'Joint Pain (जोड़ों का दर्द)',
    'Eye Redness (आंखों में लाली)',
    'Accident / Trauma (चोट / दुर्घटना)',
    'Routine Checkup (सामान्य जांच)',
  ];

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const currentFacility = state.facilities.find((f) => f.facilityId === state.currentFacilityId) || state.facilities[0];

  return (
    <div
      className={`bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-slate-800 flex flex-col justify-between select-none transition-all ${
        fullscreenMode ? 'fixed inset-0 z-50 rounded-none border-0 overflow-y-auto' : 'min-h-[720px]'
      }`}
    >
      {/* Top Terminal Command Deck */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border-2 border-teal-400/40 text-teal-300 flex items-center justify-center font-bold shadow-lg shadow-teal-500/10">
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-teal-400 uppercase tracking-widest">
                TOUCHSCREEN SELF-SERVICE KIOSK · TERMINAL #01
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentFacility.name}
            </h2>
            <p className="text-xs text-slate-400">
              {currentFacility.district}, Chhattisgarh · Raipur Health Grid Node
            </p>
          </div>
        </div>

        {/* Action Controls & Emergency Button */}
        <div className="flex items-center gap-3">
          {/* Voice Prompt Toggle */}
          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (!voiceEnabled) handleSimulateVoice(text.welcome);
            }}
            className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center gap-2 text-xs font-bold ${
              voicePlaying
                ? 'bg-teal-500 text-slate-950 border-teal-300 animate-pulse'
                : voiceEnabled
                ? 'bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Audio voice guidance"
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden md:inline">{voiceEnabled ? 'Voice ON' : 'Voice Mute'}</span>
          </button>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => setFullscreenMode(!fullscreenMode)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-slate-700 transition cursor-pointer"
            title="Toggle Fullscreen Terminal Mode"
          >
            {fullscreenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* EMERGENCY RED CASUALTY BYPASS BUTTON */}
          <button
            onClick={() => handleGenerateTicket(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition cursor-pointer shadow-xl shadow-red-600/40 border-2 border-red-400 active:scale-95"
          >
            <AlertOctagon className="w-6 h-6 animate-spin" />
            <div className="text-left">
              <span className="block leading-none">{text.emergencyBtn}</span>
              <span className="text-[10px] text-red-200 font-semibold lowercase">room 1 bypass</span>
            </div>
          </button>
        </div>
      </div>

      {/* STAGE 1: MULTILINGUAL SELECTION (LARGE TOUCH TILES) */}
      {stage === 'LANGUAGE' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full text-center py-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border-2 border-blue-400 text-blue-300 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">
            कृपया भाषा चुनें / Select Language
          </h3>
          <p className="text-sm text-slate-400 mb-8">
            Touch any large tile below for complete audio and visual navigation in your native tongue
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {[
              { code: 'hi', name: 'हिंदी', sub: 'Hindi', script: 'नमस्ते · स्वागत है' },
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
                  setStage('IDENTIFY_MODE');
                  handleSimulateVoice(`Selected ${item.sub}. Please choose how you want to identify.`);
                }}
                className="h-28 sm:h-32 rounded-3xl bg-slate-800/90 hover:bg-blue-600/90 border-2 border-slate-700 hover:border-blue-300 p-5 transition-all duration-150 cursor-pointer flex flex-col justify-center items-center group shadow-xl active:scale-95"
              >
                <span className="text-2xl sm:text-3xl font-black text-white group-hover:scale-105 transition">
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-teal-400 group-hover:text-blue-100 mt-1.5">
                  {item.sub} · {item.script}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: IDENTIFICATION MODE (PHONE LOOKUP vs QR SCAN vs NEW REGISTRATION) */}
      {stage === 'IDENTIFY_MODE' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {text.howIdentify}
            </h3>
            <p className="text-sm text-slate-400">
              Touch one of the three options below to retrieve or register your OPD record
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 1. Mobile Phone Keypad */}
            <button
              onClick={() => {
                setStage('LOOKUP_PHONE');
                handleSimulateVoice('कृपया अपना दस अंकों का मोबाइल नंबर दर्ज करें.');
              }}
              className="h-52 rounded-3xl bg-gradient-to-b from-blue-950/80 to-slate-900 border-2 border-blue-500/80 hover:border-blue-400 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xl active:scale-95"
            >
              <div className="w-18 h-18 rounded-3xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg">
                <Phone className="w-9 h-9" />
              </div>
              <span className="text-lg font-black text-white">{text.phoneLookup}</span>
              <span className="text-xs text-blue-200 mt-1">{text.phoneSub}</span>
            </button>

            {/* 2. ABHA QR Card Scanner */}
            <button
              onClick={() => {
                setStage('SCAN_QR');
                handleSimulateVoice('अपना स्वास्थ्य कार्ड स्कैनर के सामने रखें.');
              }}
              className="h-52 rounded-3xl bg-gradient-to-b from-teal-950/80 to-slate-900 border-2 border-teal-500/80 hover:border-teal-400 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xl active:scale-95"
            >
              <div className="w-18 h-18 rounded-3xl bg-teal-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg">
                <QrCode className="w-9 h-9" />
              </div>
              <span className="text-lg font-black text-white">{text.scanQr}</span>
              <span className="text-xs text-teal-200 mt-1">{text.scanSub}</span>
            </button>

            {/* 3. New Patient Registration */}
            <button
              onClick={() => {
                setStage('NEW_PATIENT');
                handleSimulateVoice('नया पंजीकरण. कृपया मरीज़ का नाम दर्ज करें.');
              }}
              className="h-52 rounded-3xl bg-gradient-to-b from-purple-950/80 to-slate-900 border-2 border-purple-500/80 hover:border-purple-400 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group shadow-xl active:scale-95"
            >
              <div className="w-18 h-18 rounded-3xl bg-purple-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg">
                <UserPlus className="w-9 h-9" />
              </div>
              <span className="text-lg font-black text-white">{text.newReg}</span>
              <span className="text-xs text-purple-200 mt-1">{text.newRegSub}</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setStage('LANGUAGE')}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {text.changeLang}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: TOUCH NUMERIC KEYPAD FOR MOBILE LOOKUP */}
      {stage === 'LOOKUP_PHONE' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {text.phoneLookup}
          </h3>
          <p className="text-xs text-slate-400 mb-4 text-center">
            Type your 10-digit mobile number to automatically recognize your registration
          </p>

          {/* Masked Display Box */}
          <div className="w-full bg-slate-950 border-2 border-blue-500 rounded-2xl p-4 text-center mb-4 shadow-inner">
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-teal-300">
              {phoneInput ? phoneInput.padEnd(10, '•') : '••••••••••'}
            </div>
            <span className="text-[11px] text-slate-400 uppercase mt-1 block font-mono">
              {phoneInput.length} / 10 Digits
            </span>
          </div>

          {/* 12-Button Numeric Keypad with Large Touch Targets */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeypadPress(digit)}
                className="h-16 rounded-2xl bg-slate-800 hover:bg-blue-600 active:scale-95 border-2 border-slate-700 text-2xl font-black text-white transition cursor-pointer shadow-md flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setPhoneInput('')}
              className="h-16 rounded-2xl bg-red-950/80 hover:bg-red-900 border-2 border-red-700 text-xs font-bold text-red-200 transition active:scale-95 cursor-pointer flex items-center justify-center uppercase"
            >
              Clear
            </button>
            <button
              onClick={() => handleKeypadPress('0')}
              className="h-16 rounded-2xl bg-slate-800 hover:bg-blue-600 active:scale-95 border-2 border-slate-700 text-2xl font-black text-white transition cursor-pointer shadow-md flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={handleKeypadBackspace}
              className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center uppercase"
            >
              Del
            </button>
          </div>

          {/* Preset Demo Buttons for Instant Evaluation */}
          <div className="w-full flex items-center justify-between text-xs pt-2">
            <button
              onClick={() => setStage('IDENTIFY_MODE')}
              className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => {
                setPhoneInput('9876543210');
                handleLookupPhone('9876543210');
              }}
              className="text-teal-400 font-bold hover:underline cursor-pointer"
            >
              Fast Test: 9876543210 (Rajesh Sharma)
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: OPTICAL QR CODE CAMERA SCANNER */}
      {stage === 'SCAN_QR' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold text-white mb-2">
            Hold Your Ayushman ABHA QR Card Before the Lens
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Position the digital or physical QR barcode within the optical target
          </p>

          {/* Scanner Viewfinder Box */}
          <div className="relative w-72 h-72 border-4 border-teal-500 rounded-3xl bg-slate-950 flex items-center justify-center overflow-hidden mb-6 shadow-2xl">
            {/* Animated Laser Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_#2dd4bf] animate-[bounce_2s_infinite]" />

            <QrCode className="w-36 h-36 text-slate-800" />
            <div className="absolute bottom-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-teal-500/50 text-[10px] text-teal-400 font-mono tracking-wider">
              <Camera className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              OPTICAL LENS ACTIVE
            </div>
          </div>

          {/* Fast-Scan Simulation Buttons */}
          <div className="space-y-2.5 w-full">
            <span className="text-xs text-slate-400 block font-medium">Or simulate instant contactless scan:</span>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => handleSimulateQRScan('PAT-20260926-0042')}
                className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Scan Rajesh Sharma (PAT-0042)
              </button>
              <button
                onClick={() => handleSimulateQRScan('PAT-20260926-1022')}
                className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Scan Sunita Devi (PAT-1022)
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setStage('IDENTIFY_MODE')}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Identification
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: NEW PATIENT ON-SCREEN TOUCH KEYBOARD REGISTRATION */}
      {stage === 'NEW_PATIENT' && (
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Walk-in Citizen Registration
            </h3>
            <p className="text-xs text-slate-400">
              Type patient name using the large touch keys below
            </p>
          </div>

          {/* Name Display & Gender Row */}
          <div className="space-y-3 mb-4">
            <div className="bg-slate-900 border-2 border-teal-500 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-teal-400 font-bold uppercase block">Patient Full Name:</span>
                <span className="text-lg font-black text-white font-mono">
                  {newPatientName || 'TAP KEYS BELOW TO ENTER NAME'}
                </span>
              </div>
              {newPatientName && (
                <button
                  onClick={() => setNewPatientName('')}
                  className="px-3 py-1 bg-red-950 text-red-300 text-xs font-bold rounded-lg border border-red-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setNewPatientGender(g)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    newPatientGender === g
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {g === 'MALE' ? 'Male (पुरुष)' : g === 'FEMALE' ? 'Female (महिला)' : 'Other'}
                </button>
              ))}
            </div>
          </div>

          {/* QWERTY Virtual Keyboard */}
          <div className="space-y-1.5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl mb-4">
            {keyboardRows.map((row, idx) => (
              <div key={idx} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((char) => (
                  <button
                    key={char}
                    onClick={() => handleVirtualKey(char)}
                    className="w-8 sm:w-11 h-12 rounded-xl bg-slate-800 hover:bg-blue-600 active:scale-95 text-white font-bold text-sm sm:text-base border border-slate-700 transition cursor-pointer flex items-center justify-center shadow-xs"
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => handleVirtualKey('SPACE')}
                className="flex-1 max-w-xs h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition cursor-pointer uppercase"
              >
                Space
              </button>
              <button
                onClick={() => handleVirtualKey('BACKSPACE')}
                className="px-5 h-12 rounded-xl bg-red-950/80 hover:bg-red-900 text-xs font-bold text-red-200 border border-red-800 transition cursor-pointer uppercase"
              >
                Backspace
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStage('IDENTIFY_MODE')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              onClick={() => {
                if (!newPatientName.trim()) {
                  setNewPatientName('Sohan Lal');
                }
                setStage('DEPT_SELECT');
                handleSimulateVoice(`विभाग चुनें.`);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
            >
              <span>Continue to Department</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6: CONFIRM PATIENT IDENTIFICATION */}
      {stage === 'CONFIRM_PATIENT' && scannedPatient && (
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full py-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-10 h-10" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
            {text.verifiedPatient}
          </span>
          <h3 className="text-2xl font-black text-white mb-4">
            {scannedPatient.fullName}
          </h3>

          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Patient ID (ABHA):</span>
              <span className="font-mono font-bold text-teal-300">{scannedPatient.patientId || 'PAT-20260926-0042'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mobile Phone:</span>
              <span className="font-mono text-white">{scannedPatient.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age & Gender:</span>
              <span className="text-white">{scannedPatient.age || 38} yrs · {scannedPatient.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registered District:</span>
              <span className="text-white">{scannedPatient.address?.district || 'Raipur'}, Chhattisgarh</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStage('IDENTIFY_MODE')}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Not You? Change
            </button>
            <button
              onClick={() => {
                setStage('DEPT_SELECT');
                handleSimulateVoice(`विभाग चुनें.`);
              }}
              className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
            >
              <span>Confirm & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 7: SELECT DEPARTMENT (GIANT TOUCH TILES) */}
      {stage === 'DEPT_SELECT' && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-3xl font-black text-white mb-1">
              {text.selectDept}
            </h3>
            <p className="text-xs text-slate-400">
              Touch the clinic you wish to consult today · Real-time queue telemetry displayed
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDeptId === dept.id;
              const queueInfo = state.queues.find((q) => q.departmentId === dept.id);
              const waiting = queueInfo?.activeWaitingCount ?? 3;
              const avgWait = (waiting + 1) * 8;

              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDeptId(dept.id);
                    setStage('SYMPTOM_SELECT');
                    handleSimulateVoice(`Selected ${dept.name}. Please choose your symptoms.`);
                  }}
                  className={`h-28 rounded-3xl border-2 p-4 flex items-center gap-4 transition cursor-pointer text-left ${
                    isSelected
                      ? dept.activeColor + ' shadow-xl scale-[1.02]'
                      : dept.bg + ' hover:border-white'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/60 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-black text-white">{dept.name}</div>
                    <div className="text-xs text-teal-300 font-medium">{dept.nameHi}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1 font-mono">
                      <span>{dept.room}</span>
                      <span>•</span>
                      <span>{waiting} waiting (~{avgWait}m)</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStage('IDENTIFY_MODE')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Patient: <strong className="text-white">{scannedPatient?.fullName || newPatientName || 'Walk-in'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* STAGE 8: ZERO-TYPING SYMPTOM SELECT */}
      {stage === 'SYMPTOM_SELECT' && (
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-3xl font-black text-white mb-1">
              {text.selectSymptoms}
            </h3>
            <p className="text-xs text-slate-400">
              Touch one or more symptoms to help the doctor prepare prior to consultation
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {symptomPills.map((symptom) => {
              const active = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => {
                    setSelectedSymptoms((prev) =>
                      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
                    );
                  }}
                  className={`h-16 rounded-2xl border-2 px-3 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center text-center ${
                    active
                      ? 'bg-teal-500 text-slate-950 border-white shadow-lg font-black scale-102'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
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
              className="h-16 flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30 active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>{text.printToken}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 9: THERMAL RECEIPT SLIP & CONFIRMATION */}
      {stage === 'RECEIPT' && issuedTicket && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-2 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-1">
            Outpatient Token Generated!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Thermal slip ready. Take your printed ticket and wait for your token call.
          </p>

          {/* 80mm Thermal Receipt Simulation Card */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 w-full shadow-2xl border-4 border-slate-300 font-sans text-left relative overflow-hidden mb-5">
            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-center">
              <span className="font-black text-xs uppercase tracking-wider block text-slate-900">
                DISTRICT HOSPITAL RAIPUR
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                National Public Health Grid · Ayushman Bharat Digital Mission
              </span>
            </div>

            {/* Giant Token Block */}
            <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-200 my-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                YOUR OPD TOKEN NUMBER
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono text-slate-900 my-1">
                {issuedTicket.tokenNumber}
              </div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-lg">
                {state.departments.find((d) => d.departmentId === issuedTicket.departmentId)?.name || 'General Medicine'} · {state.departments.find((d) => d.departmentId === issuedTicket.departmentId)?.roomNumber || 'Room 102'}
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="border-t border-b border-dashed border-slate-300 py-3 my-3 text-[11px] space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{issuedTicket.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient ID (PID):</span>
                <span className="font-mono font-bold text-blue-700">{issuedTicket.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration ID:</span>
                <span className="font-mono text-slate-800">{issuedTicket.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Queue Ticket ID:</span>
                <span className="font-mono text-slate-800">{issuedTicket.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuing Terminal:</span>
                <span className="font-bold text-teal-800">KIOSK TERMINAL #01 (ONLINE)</span>
              </div>
            </div>

            {/* Dynamic Scannable QR Code */}
            <div className="text-center pt-1">
              <div className="inline-block p-2 bg-slate-50 rounded-xl border border-slate-200">
                <QrCode className="w-16 h-16 mx-auto text-slate-900" />
              </div>
              <span className="block text-[9px] text-slate-400 font-mono mt-1">
                Scan this code at Doctor Consultation Desk
              </span>
            </div>
          </div>

          {printFeedback && (
            <div className="mb-3 p-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold">
              {printFeedback}
            </div>
          )}

          {/* Reset Countdown & Action Buttons */}
          <div className="flex items-center justify-between w-full gap-2">
            <button
              onClick={handlePrintSlip}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              Print Slip
            </button>

            <span className="text-[11px] text-slate-400">
              Reset in <strong className="text-teal-400 font-mono">{countdown}s</strong>
            </span>

            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
            >
              {text.doneBtn}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 10: EMERGENCY CASUALTY ALARM PROTOCOL */}
      {stage === 'EMERGENCY_ALARM' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mb-4 animate-ping">
            <AlertOctagon className="w-14 h-14" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-red-300 bg-red-950 px-4 py-1 rounded-full border border-red-500 mb-3">
            EMERGENCY CASUALTY PROTOCOL ACTIVATED
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">
            PROCEED IMMEDIATELY TO CASUALTY / ROOM 1
          </h3>
          <p className="text-xs text-red-200 mb-6">
            Casualty triage bypass priority ticket generated. Attending medical officer notified:
          </p>

          <div className="bg-red-950/90 border-4 border-red-500 rounded-3xl p-6 w-full mb-6 shadow-2xl">
            <span className="text-xs uppercase font-bold text-red-300 block tracking-widest">EMERGENCY CASUALTY TOKEN</span>
            <div className="text-6xl font-black font-mono text-white my-2">
              EM-001
            </div>
            <span className="text-xs text-red-200 font-semibold block">
              Ground Floor Red Corridor · Immediate Stretcher Access
            </span>
          </div>

          <button
            onClick={handleReset}
            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl cursor-pointer border border-slate-700"
          >
            Acknowledge & Return to Welcome Screen
          </button>
        </div>
      )}

      {/* Bottom Kiosk Status Strip */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Thermal Printer Online · 80mm Roll 84% · Optical QR Camera Ready · Firestore Synced</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="hover:text-slate-300 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Terminal
          </button>
          <span>SwasthSetu Touchscreen Terminal v2.4</span>
        </div>
      </div>
    </div>
  );
};
