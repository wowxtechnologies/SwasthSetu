import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { registrationService, RegistrationResult } from '../../services/registrationService';
import { LanguageCode, TriagePriority } from '../../types';
import {
  Globe,
  User,
  Building2,
  Stethoscope,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Printer,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Share2,
  RefreshCw,
} from 'lucide-react';

interface PatientRegistrationWizardProps {
  onComplete?: (result: RegistrationResult) => void;
  onNavigateToTrack?: () => void;
}

export const PatientRegistrationWizard: React.FC<PatientRegistrationWizardProps> = ({
  onComplete,
  onNavigateToTrack,
}) => {
  const { state, registerPatient } = useApp();
  const { userProfile } = useAuth();

  // Step state: 1 to 5, and 6 is confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  // Form Fields
  // Step 1: Language & Identity Preference
  const [preferredLang, setPreferredLang] = useState<LanguageCode>('hi');
  const [idType, setIdType] = useState<'MOBILE' | 'ABHA'>('MOBILE');
  const [abhaId, setAbhaId] = useState('91-8842-1920-5512');

  // Step 2: Demographics
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [dob, setDob] = useState('1988-06-14');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [villageOrCity, setVillageOrCity] = useState('Civil Lines');
  const [district, setDistrict] = useState('Raipur');
  const [stateName, setStateName] = useState('Chhattisgarh');
  const [pincode, setPincode] = useState('492001');
  const [emergencyContactName, setEmergencyContactName] = useState('Sunita Sharma (Spouse)');
  const [knownAllergies, setKnownAllergies] = useState<string[]>(['Penicillin (Severe)']);

  // Step 3: Hospital & Department Selection
  const [selectedFacilityId, setSelectedFacilityId] = useState('FAC-RAIPUR');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('DEP-GENMED');

  // Step 4: Visit Information & Triage
  const [visitReason, setVisitReason] = useState('High fever, shivering, and severe throat congestion for 2 days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fever / Chills', 'Sore Throat', 'Body Ache']);
  const [symptomDuration, setSymptomDuration] = useState('2-3 days');
  const [priority, setPriority] = useState<TriagePriority>('ROUTINE');

  // Step 5: Consent
  const [abdmConsent, setAbdmConsent] = useState(true);

  const selectedFacility = state.facilities.find((f) => f.facilityId === selectedFacilityId) || state.facilities[0];
  const selectedDepartment = state.departments.find((d) => d.departmentId === selectedDepartmentId) || state.departments[0];
  const queueForDept = state.queues.find((q) => q.departmentId === selectedDepartmentId && q.facilityId === selectedFacilityId);

  const languages = [
    { code: 'hi', name: 'हिंदी', englishName: 'Hindi', scriptLabel: 'भाषा चुनें' },
    { code: 'en', name: 'English', englishName: 'English', scriptLabel: 'Select Language' },
    { code: 'bn', name: 'বাংলা', englishName: 'Bengali', scriptLabel: 'ভাষা নির্বাচন' },
    { code: 'te', name: 'తెలుగు', englishName: 'Telugu', scriptLabel: 'భాష ఎంపిక' },
    { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', scriptLabel: 'மொழி தேர்வு' },
    { code: 'mr', name: 'मराठी', englishName: 'Marathi', scriptLabel: 'भाषा निवडा' },
  ];

  const commonSymptoms = [
    'Fever / Chills',
    'Cough & Cold',
    'Sore Throat',
    'Breathing Difficulty',
    'Body Ache',
    'Abdominal Pain',
    'Diarrhea / Vomiting',
    'Skin Rash',
    'Joint Pain',
    'Headache / Dizziness',
    'Trauma / Physical Injury',
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
        setPrintFeedback('Token slip sent to physical printer.');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    } catch (err) {
      console.warn('Print command sandboxed in iframe context:', err);
      setPrintFeedback('Digital slip ready: Take a screenshot or save your Token Number.');
      setTimeout(() => setPrintFeedback(null), 4000);
    }
  };

  // Submission handler connecting to Firestore & Backend API
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Submit to Backend API & Firestore via registrationService
      const result = await registrationService.submitRegistration({
        fullName,
        phone,
        dateOfBirth: dob,
        gender,
        villageOrCity,
        district,
        state: stateName,
        pincode,
        preferredLanguage: preferredLang,
        departmentId: selectedDepartmentId,
        departmentName: selectedDepartment.name,
        facilityId: selectedFacilityId,
        facilityName: selectedFacility.name,
        visitReason,
        symptoms: selectedSymptoms,
        duration: symptomDuration,
        priorityStatus: priority,
        registrationSource: 'WEB',
        bloodGroup,
        knownAllergies,
        abhaId: idType === 'ABHA' ? abhaId : undefined,
      });

      // 2. Synchronize with reactive client AppContext state
      const appResult = registerPatient({
        fullName,
        phone,
        dateOfBirth: dob,
        gender,
        villageOrCity,
        district,
        state: stateName,
        pincode,
        preferredLanguage: preferredLang,
        departmentId: selectedDepartmentId,
        facilityId: selectedFacilityId,
        visitReason,
        priorityStatus: priority,
        registrationSource: 'WEB',
        bloodGroup,
        knownAllergies,
      });

      // Merge results
      const finalResult: RegistrationResult = {
        ...result,
        patientId: appResult.patient.patientId,
        registrationId: appResult.registration.registrationId,
        ticketId: appResult.ticket.ticketId,
        tokenNumber: appResult.ticket.tokenNumber,
        patient: appResult.patient,
        registration: appResult.registration,
        ticket: appResult.ticket,
      };

      setRegistrationResult(finalResult);
      setCurrentStep(6); // Confirmation Step

      if (onComplete) {
        onComplete(finalResult);
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setSubmitError(err.message || 'Failed to submit registration. Please verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Language', icon: Globe },
    { num: 2, label: 'Demographics', icon: User },
    { num: 3, label: 'Hospital & Dept', icon: Building2 },
    { num: 4, label: 'Visit Info', icon: Stethoscope },
    { num: 5, label: 'Review', icon: FileText },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      {currentStep < 6 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  Ayushman Bharat Digital Mission (ABDM)
                </span>
                <span className="text-xs font-semibold text-slate-400">Step {currentStep} of 5</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Online Outpatient Self-Registration
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Selected Facility
              </span>
              <span className="text-xs font-bold text-blue-700">
                {selectedFacility.name.replace(/\(.*\)/, '')}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative">
            <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-slate-100">
              <div
                style={{ width: `${(currentStep / 5) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
              />
            </div>
            <div className="flex justify-between">
              {stepsList.map((s) => {
                const Icon = s.icon;
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                    disabled={s.num > currentStep}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition ${
                      isCurrent
                        ? 'text-blue-600 font-bold'
                        : isPassed
                        ? 'text-slate-800 font-medium'
                        : 'text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800 font-bold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                    </div>
                    <span className="text-[11px] hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FORM BODY */}
      {currentStep < 6 && (
        <form onSubmit={handleSubmitRegistration} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* STEP 1: LANGUAGE & IDENTITY PREFERENCE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Select Preferred Language / भाषा चुनें
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your language for SMS alerts, OPD token display, and doctor communication.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languages.map((l) => (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => setPreferredLang(l.code as any)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      preferredLang === l.code
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{l.name}</span>
                      {preferredLang === l.code && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 font-medium">{l.englishName}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                  Registration Identification Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIdType('MOBILE')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      idType === 'MOBILE'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Standard Mobile OTP / Phone</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Register directly with your 10-digit mobile number.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIdType('ABHA')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      idType === 'ABHA'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">Ayushman Bharat ABHA Health ID</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Link your 14-digit national digital health ID for longitudinal medical history.
                    </p>
                  </button>
                </div>

                {idType === 'ABHA' && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200">
                    <label className="text-xs font-bold text-teal-900 block mb-1">
                      Enter 14-Digit ABHA ID / Address
                    </label>
                    <input
                      type="text"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      placeholder="e.g. 91-8842-1920-5512 or rajesh.sharma@abdm"
                      className="w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DEMOGRAPHICS & CONTACT */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Demographics & Personal Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure the name matches the government ID or Aadhaar card for clinical records.
                </p>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name (मरीज़ का पूरा नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* DOB, Gender & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male (पुरुष)</option>
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="OTHER">Other (अन्य)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Residential Address (स्थाई पता)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Village / Locality / Street
                    </label>
                    <input
                      type="text"
                      value={villageOrCity}
                      onChange={(e) => setVillageOrCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      District (जिला)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      State (राज्य)
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Allergies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Emergency Contact Name & Relation
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. S. Sharma (Wife)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Known Drug Allergies
                  </label>
                  <input
                    type="text"
                    value={knownAllergies.join(', ')}
                    onChange={(e) => setKnownAllergies(e.target.value.split(',').map((s) => s.trim()))}
                    placeholder="e.g. Penicillin, Sulfa drugs"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HOSPITAL & DEPARTMENT SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Select Healthcare Facility & OPD Department
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the appropriate hospital and specialty department based on symptoms.
                </p>
              </div>

              {/* Facilities Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                  Choose Hospital / Healthcare Center
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.facilities.map((fac) => {
                    const isSelected = selectedFacilityId === fac.facilityId;
                    return (
                      <div
                        key={fac.facilityId}
                        onClick={() => setSelectedFacilityId(fac.facilityId)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900">{fac.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {fac.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{fac.address}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Beds: <strong className="text-slate-800">{fac.bedCapacity.occupied}/{fac.bedCapacity.total}</strong>
                          </span>
                          <span className="font-semibold text-blue-700">
                            {isSelected ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Departments Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                  Choose Clinical Department
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.departments.map((dept) => {
                    const isSelected = selectedDepartmentId === dept.departmentId;
                    const queueInfo = state.queues.find(
                      (q) => q.departmentId === dept.departmentId && q.facilityId === selectedFacilityId
                    );
                    const waitingCount = queueInfo?.activeWaitingCount ?? 4;
                    const avgWait = (waitingCount + 1) * dept.avgConsultationMinutes;

                    return (
                      <div
                        key={dept.departmentId}
                        onClick={() => setSelectedDepartmentId(dept.departmentId)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {dept.roomNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {waitingCount} waiting
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              ~{avgWait} mins wait
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Consultation: ~{dept.avgConsultationMinutes} min</span>
                          <span className="font-semibold text-blue-700">
                            {isSelected ? '✓ Assigned' : 'Choose'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VISIT INFORMATION & TRIAGE SYMPTOMS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Visit Information & Symptom Triage
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Help the clinical triage desk prioritize your consultation queue.
                </p>
              </div>

              {/* Primary Reason for Visit */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Primary Chief Complaint / Reason for Visit (बीमारी का मुख्य कारण) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="Describe your current symptoms, when they started, or any prior treatments..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Common Symptoms Checklist */}
              <div>
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                  Check Applicable Symptoms
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym);
                    return (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isChecked ? `✓ ${sym}` : `+ ${sym}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptom Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Symptom Duration
                  </label>
                  <select
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Started today">Started today (&lt; 24 hours)</option>
                    <option value="2-3 days">2 - 3 Days</option>
                    <option value="About 1 week">About 1 Week</option>
                    <option value="More than 2 weeks">Chronic (&gt; 2 Weeks)</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Self-Assessed Triage Urgency
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="ROUTINE">Routine (सामान्य) - Regular Outpatient</option>
                    <option value="URGENT">Urgent (अति आवश्यक) - Acute Fever / Pain</option>
                    <option value="EMERGENCY">Emergency (आपातकालीन) - Immediate Attention</option>
                  </select>
                </div>
              </div>

              {priority === 'EMERGENCY' && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Emergency Warning</h5>
                    <p className="mt-0.5 text-rose-800">
                      If you are experiencing severe chest pain, extreme breathlessness, or major trauma, please proceed directly to the Emergency Casualty Ward at the hospital or call <strong>108</strong> immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & VERIFICATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Review Registration & Generate Token
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Please review your information carefully before submitting to the hospital grid.
                </p>
              </div>

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Patient Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-900">+91 {phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender & Blood:</span>
                    <span className="font-medium text-slate-800">{gender} · {bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="text-slate-800 truncate max-w-[170px]">{villageOrCity}, {district}</span>
                  </div>
                </div>

                {/* Hospital & Dept Summary */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                      Destination OPD
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Facility:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{selectedFacility.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Department:</span>
                    <span className="font-bold text-slate-900">{selectedDepartment.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Room Number:</span>
                    <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                      {selectedDepartment.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Priority:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        priority === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800'
                          : priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Symptoms summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Reported Chief Complaint
                </span>
                <p className="text-slate-800 font-medium italic">"{visitReason}"</p>
                {selectedSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedSymptoms.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ABDM Consent Checkbox */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={abdmConsent}
                    onChange={(e) => setAbdmConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div className="text-xs text-teal-950">
                    <span className="font-bold block">
                      Ayushman Bharat Electronic Health Record Consent
                    </span>
                    <span className="text-teal-800 text-[11px]">
                      I hereby consent to creating an online outpatient encounter in the SwasthSetu National Health Grid, generating an electronic token slip, and enabling the attending physician to retrieve prior medical notes.
                    </span>
                  </div>
                </label>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!abdmConsent || isSubmitting}
                className={`px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer ${
                  !abdmConsent || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing with Health Grid & Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Generate Official Token</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* STEP 6: CONFIRMATION & OFFICIAL DIGITAL TOKEN SLIP */}
      {currentStep === 6 && registrationResult && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Success Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Registration Confirmed & Synced
                </span>
                <h3 className="text-lg font-black text-white">
                  OPD Registration Slip Ready
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-mono font-bold">
                Token #{registrationResult.tokenNumber}
              </span>
            </div>
          </div>

          {/* Official Printable Digital Token Slip */}
          <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
            {/* Header Strip */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {registrationResult.registration.facilityId === 'FAC-RAIPUR'
                      ? 'District Hospital Raipur'
                      : registrationResult.registration.facilityId}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Government of Chhattisgarh · Directorate of Health Services
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                  AYUSHMAN TOKEN SLIP
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Giant Token Number Block */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white rounded-2xl p-6 text-center shadow-md mb-6 relative overflow-hidden">
              <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE IN QUEUE
              </div>

              <span className="text-xs font-bold text-blue-200 uppercase tracking-widest block mb-1">
                Your Assigned Outpatient Token
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white my-1">
                {registrationResult.tokenNumber}
              </div>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-700 text-xs font-bold text-blue-200">
                <span>{selectedDepartment.name}</span>
                <span>•</span>
                <span className="text-amber-300">{selectedDepartment.roomNumber}</span>
              </div>
            </div>

            {/* Patient & Registration ID Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Patient Credentials
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900">{registrationResult.patient.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient ID (PID):</span>
                  <span className="font-mono font-bold text-blue-700">{registrationResult.patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-mono text-slate-800">+91 {registrationResult.patient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender & Age:</span>
                  <span className="text-slate-800">{registrationResult.patient.gender} · {registrationResult.patient.age} yrs</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Encounter Tracking
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-bold text-emerald-700">{registrationResult.registrationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queue Ticket ID:</span>
                  <span className="font-mono font-bold text-slate-700">{registrationResult.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Triage Priority:</span>
                  <span className="font-bold text-slate-900">{registrationResult.registration.priorityStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Wait:</span>
                  <span className="font-bold text-blue-700">~15 - 20 minutes</span>
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">
                    Quick Verification QR Code
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Scan at the Doctor's Desk or Pharmacy Dispensary to instantly retrieve this encounter without paperwork.
                  </p>
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                    Hash: {registrationResult.qrCodeData}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Firestore Synced
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    ✓ REST API Synced
                  </span>
                </div>
              </div>
            </div>

            {printFeedback && (
              <div className="mb-4 p-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                {printFeedback}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Print Token Slip
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setRegistrationResult(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Register Another Member
                </button>
              </div>

              {onNavigateToTrack && (
                <button
                  type="button"
                  onClick={onNavigateToTrack}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  Track Live in OPD Queue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
