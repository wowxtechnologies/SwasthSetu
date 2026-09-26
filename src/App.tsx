/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { DoctorWorkstation } from './components/doctor/DoctorWorkstation';
import { PatientPortal } from './components/patient/PatientPortal';
import { SmartKiosk } from './components/kiosk/SmartKiosk';
import { OPDQueueBoard } from './components/queue/OPDQueueBoard';
import { PharmacyDispensary } from './components/pharmacy/PharmacyDispensary';
import { InventoryDashboard } from './components/inventory/InventoryDashboard';
import { HospitalOpsDashboard } from './components/analytics/HospitalOpsDashboard';
import { ResourceNetworkMap } from './components/network/ResourceNetworkMap';
import { GeminiAssistantModal } from './components/assistant/GeminiAssistantModal';
import { DemoGuideModal } from './components/demo/DemoGuideModal';
import {
  HeartPulse,
  ShieldCheck,
  Phone,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('doctor');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header Deck */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenDemo={() => setDemoOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {activeTab === 'doctor' && <DoctorWorkstation />}
        {activeTab === 'patient' && <PatientPortal />}
        {activeTab === 'kiosk' && <SmartKiosk />}
        {activeTab === 'queue-board' && <OPDQueueBoard />}
        {activeTab === 'pharmacy' && <PharmacyDispensary />}
        {activeTab === 'inventory' && <InventoryDashboard />}
        {activeTab === 'hospital-ops' && <HospitalOpsDashboard />}
        {activeTab === 'network' && <ResourceNetworkMap />}
      </main>

      {/* Compliance & Emergency Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">
                SWASTHSETU (स्वस्थसेतु)
              </div>
              <p className="text-[11px] text-slate-500">
                National Healthcare Access, Operations & Predictive Resource Intelligence Platform
              </p>
            </div>
          </div>

          {/* Emergency helpline strip */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-red-600">
              <Phone className="w-3.5 h-3.5" />
              Emergency: <strong className="font-mono">112</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              National Health: <strong className="font-mono">1075</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              Ambulance: <strong className="font-mono">108</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center md:text-right">
            Ayushman Digital Architecture · Firestore & Vertex AI Powered
          </div>
        </div>
      </footer>

      {/* Floating Gemini AI Quick Launcher */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
        <button
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full font-bold text-xs shadow-xl shadow-blue-700/30 transition hover:scale-105 cursor-pointer border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-blue-200 animate-spin" />
          <span>Ask Gemini AI Assistant</span>
        </button>
      </div>

      {/* Modals */}
      <GeminiAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
      <DemoGuideModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
