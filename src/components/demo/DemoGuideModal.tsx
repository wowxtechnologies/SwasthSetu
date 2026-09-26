import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ArrowRight,
  X,
  User,
  Monitor,
  Clock,
  Stethoscope,
  Pill,
  Boxes,
  TrendingDown,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Chapter 1: Citizen Touchscreen Kiosk Access',
      tagline: 'Patient Arrives at Hospital Reception',
      tab: 'kiosk',
      icon: Monitor,
      desc: 'The citizen approaches the multilingual touch kiosk. With large touch controls, voice prompts, and zero typing, they select Hindi or English, tap their symptoms or scan their QR card, and receive an instant OPD Token (e.g. GM-043) with an 80mm thermal slip.',
      actionText: 'View Smart Kiosk Terminal',
    },
    {
      title: 'Chapter 2: Mobile Queue Tracking & Journey',
      tagline: 'Real-Time Telemetry on Patient Phone',
      tab: 'patient',
      icon: Clock,
      desc: 'The citizen opens their phone. The live queue tracker updates via sub-second polling: Token GM-042, 3 patients ahead, ~15 mins estimated wait time. An alert sounds when their turn arrives.',
      actionText: 'Open Patient Tracker & Digital Health Card',
    },
    {
      title: 'Chapter 3: Public Hospital OPD Corridor Display',
      tagline: 'Waiting Hall Telemetry for Crowds',
      tab: 'queue-board',
      icon: Play,
      desc: 'On the hospital waiting-room TV, the OPD Queue Board chimes an auditory announcement in Hindi and English. Flashing gold tokens guide patients to General Medicine Room 104.',
      actionText: 'View Public OPD Triage Board',
    },
    {
      title: 'Chapter 4: Doctor Workstation & Clinical Consultation',
      tagline: 'Universal Search, Fetch Registration, E-Prescribe',
      tab: 'doctor',
      icon: Stethoscope,
      desc: 'Attending physician Dr. Alok Verma clicks "Call Next Patient" or searches by Token GM-042. The registration details load instantly. The doctor records vitals, diagnoses Acute URI, composes an e-prescription, and clicks "Complete Consultation & Dispatch Rx".',
      actionText: 'Go to Doctor Workstation',
    },
    {
      title: 'Chapter 5: Pharmacy Dispensary & Inventory Deduction',
      tagline: 'Verified Dispensation & Atomic Stock Deduction',
      tab: 'pharmacy',
      icon: Pill,
      desc: 'The prescription appears instantly in the pharmacy dispensary queue. The pharmacist checks for patient drug allergies, verifies stock availability, and clicks "Verify & Dispense". Inventory balances decrease atomically.',
      actionText: 'Inspect Pharmacy Dispensary',
    },
    {
      title: 'Chapter 6: Vertex AI Demand Forecasting & Stock-Out Alert',
      tagline: 'Machine Learning Predicts Medicine Depletion',
      tab: 'inventory',
      icon: TrendingDown,
      desc: 'Satellite PHC Abhanpur has only 120 ORS sachets remaining. Due to monsoon footfall, daily consumption is 42.8/day (2.8 days of stock). The Stock-Out Risk Engine flags a CRITICAL Alert before the clinic runs out of life-saving salts.',
      actionText: 'View Drug Inventory & Stock-Out Alert',
    },
    {
      title: 'Chapter 7: Cross-Facility Resource Redistribution',
      tagline: 'AI Rebalancing & Human Administrator Approval',
      tab: 'network',
      icon: Truck,
      desc: 'SwasthSetu matches Raipur District Hospital (holding 3,800 surplus ORS sachets) with PHC Abhanpur (facing depletion in 68 hours). An AI transfer recommendation (600 units, 28.4 km) is generated. The District Administrator reviews the clinical rationale and clicks "Authorize & Dispatch"!',
      actionText: 'Open Resource Redistribution & Approve',
    },
  ];

  const activeStepObj = steps[currentStep];
  const StepIcon = activeStepObj.icon;

  const handleExecuteStep = () => {
    onNavigateTab(activeStepObj.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block">
                Continuous Hackathon Narrative Flow
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                End-to-End SwasthSetu System Walkthrough
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Stepper Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-700">
            Chapter {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-7 h-2 rounded-full transition cursor-pointer ${
                  i === currentStep
                    ? 'bg-blue-600 w-9'
                    : i < currentStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Step Detail Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-blue-700 shadow-2xs">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
                {activeStepObj.tagline}
              </span>
              <h4 className="text-base font-bold text-slate-900">
                {activeStepObj.title}
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {activeStepObj.desc}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-xl cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-xl cursor-pointer"
            >
              Next
            </button>
          </div>

          <button
            onClick={handleExecuteStep}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{activeStepObj.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
