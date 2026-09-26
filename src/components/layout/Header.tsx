import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Stethoscope,
  User,
  HeartPulse,
  Pill,
  Building2,
  MapPin,
  Bot,
  Play,
  RotateCcw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  LayoutDashboard,
  Boxes,
  Activity,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAssistant: () => void;
  onOpenDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAssistant,
  onOpenDemo,
}) => {
  const { state, setRole, setFacility, resetAllData } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [facilityMenuOpen, setFacilityMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const activeAlerts = state.alerts.filter((a) => !a.isAcknowledged);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;

  const currentFacility =
    state.facilities.find((f) => f.facilityId === state.currentFacilityId) ||
    state.facilities[0];

  const roles: Array<{ role: UserRole; label: string; icon: any; color: string }> = [
    { role: 'DOCTOR', label: 'Doctor (OPD Physician)', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { role: 'PATIENT', label: 'Citizen / Patient', icon: User, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { role: 'PHARMACIST', label: 'Pharmacist (Dispensary)', icon: Pill, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { role: 'NURSE', label: 'Triage Nurse / Ward', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { role: 'HOSPITAL_ADMIN', label: 'Hospital Administrator', icon: Building2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { role: 'DISTRICT_ADMIN', label: 'District Health Officer', icon: MapPin, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { role: 'STATE_ADMIN', label: 'State Health Mission', icon: Layers, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { role: 'SYSTEM_ADMIN', label: 'System Super Admin', icon: Activity, color: 'text-slate-800 bg-slate-100 border-slate-300' },
  ];

  const currentRoleObj = roles.find((r) => r.role === state.currentRole) || roles[0];

  const navItems = [
    { id: 'doctor', label: 'Doctor Workstation', icon: Stethoscope, badge: state.tickets.filter(t => t.status === 'WAITING').length },
    { id: 'patient', label: 'Patient Access', icon: User },
    { id: 'kiosk', label: 'Touch Kiosk', icon: Monitor },
    { id: 'queue-board', label: 'OPD Queue Board', icon: LayoutDashboard },
    { id: 'pharmacy', label: 'Dispensary', icon: Pill, badge: state.pharmacyOrders.filter(o => o.dispenseStatus === 'PENDING').length },
    { id: 'inventory', label: 'Drug Inventory', icon: Boxes },
    { id: 'hospital-ops', label: 'Hospital Ops & AI', icon: Activity },
    { id: 'network', label: 'Facility Network & Maps', icon: MapPin, badge: state.recommendations.filter(r => r.status === 'PENDING_REVIEW').length },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wider text-teal-400 uppercase flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            National Public Health Grid · Ayushman Digital Architecture
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300 font-mono text-[11px]">
            Server Latency: 18ms · Firestore Synced
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Guide Launcher */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-medium transition cursor-pointer border border-teal-500/40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Interactive Demo Flow</span>
          </button>

          {/* Gemini AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Gemini AI Assistant</span>
          </button>

          {/* Reset Demo State */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            title="Reset to initial test seed data"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset State</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                SWASTHSETU
              </h1>
              <span className="text-xs font-semibold text-teal-700 font-sans tracking-wide bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                स्वस्थसेतु
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight">
              Register. Connect. Treat. Predict.
            </p>
          </div>
        </div>

        {/* Global Selectors: Facility & Role Persona */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Facility Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setFacilityMenuOpen(!facilityMenuOpen);
                setRoleMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-800 transition cursor-pointer shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-none">
                  Facility
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px] block">
                  {currentFacility.name.replace(/\(.*\)/, '')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {facilityMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Healthcare Facility
                </div>
                {state.facilities.map((fac) => (
                  <button
                    key={fac.facilityId}
                    onClick={() => {
                      setFacility(fac.facilityId);
                      setFacilityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 transition hover:bg-slate-50 cursor-pointer ${
                      fac.facilityId === state.currentFacilityId
                        ? 'bg-blue-50/70 text-blue-900 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">{fac.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {fac.district} · {fac.type.replace('_', ' ')} · {fac.bedCapacity.occupied}/{fac.bedCapacity.total} Beds
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Persona Switcher (RBAC Controller) */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setFacilityMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs ${currentRoleObj.color}`}
            >
              <currentRoleObj.icon className="w-3.5 h-3.5 shrink-0" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block leading-none">
                  Acting Role
                </span>
                <span className="font-semibold block truncate max-w-[130px]">
                  {state.currentRole.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch RBAC Persona
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    8 Roles
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setRole(item.role);
                        setRoleMenuOpen(false);
                        // Auto navigate to natural tab
                        if (item.role === 'DOCTOR') setActiveTab('doctor');
                        if (item.role === 'PATIENT') setActiveTab('patient');
                        if (item.role === 'PHARMACIST') setActiveTab('pharmacy');
                        if (item.role === 'HOSPITAL_ADMIN') setActiveTab('hospital-ops');
                        if (item.role === 'DISTRICT_ADMIN' || item.role === 'STATE_ADMIN') setActiveTab('network');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition hover:bg-slate-50 cursor-pointer ${
                        item.role === state.currentRole ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-slate-600 shrink-0" />
                      <div className="flex-1">
                        <div className="text-slate-900">{item.label}</div>
                      </div>
                      {item.role === state.currentRole && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Deck */}
      <div className="border-t border-slate-200/80 bg-slate-50/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset State Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reset Application State?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will restore all synthetic patient queues, prescriptions, inventory levels, and recommendations back to pristine hackathon seed defaults.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setResetConfirmOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition shadow-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
