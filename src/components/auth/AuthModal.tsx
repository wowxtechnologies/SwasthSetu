import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ROLE_CONFIGS, Permission } from '../../utils/rbac';
import { INSTITUTIONAL_STAFF_ACCOUNTS } from '../../services/authService';
import {
  ShieldCheck,
  X,
  LogIn,
  LogOut,
  UserCheck,
  CheckCircle2,
  Lock,
  Hospital,
  Building2,
  Stethoscope,
  Pill,
  Activity,
  KeyRound,
  FileBadge,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSelectTab }) => {
  const {
    firebaseUser,
    userProfile,
    role: activeRole,
    loginWithGoogle,
    loginWithRole,
    logout,
    isLoading,
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'google' | 'patient' | 'matrix'>('staff');
  const [googleError, setGoogleError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err);
      if (err?.code === 'auth/popup-blocked') {
        setGoogleError('Popup blocked by browser. Please allow popups for this site or use the Institutional Staff quick login below.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setGoogleError('Sign-in popup was closed before completion.');
      } else {
        setGoogleError(err?.message || 'Authentication error. You can switch to an Institutional Staff profile below.');
      }
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    await loginWithRole(role);
    if (onSelectTab) {
      onSelectTab(ROLE_CONFIGS[role].defaultTab);
    }
    onClose();
  };

  const allRoles: UserRole[] = [
    'DOCTOR',
    'NURSE',
    'PHARMACIST',
    'HOSPITAL_ADMIN',
    'DISTRICT_ADMIN',
    'STATE_ADMIN',
    'SYSTEM_ADMIN',
    'PATIENT',
  ];

  const roleIcons: Record<UserRole, any> = {
    DOCTOR: Stethoscope,
    NURSE: Activity,
    PHARMACIST: Pill,
    HOSPITAL_ADMIN: Hospital,
    DISTRICT_ADMIN: Building2,
    STATE_ADMIN: Building2,
    SYSTEM_ADMIN: KeyRound,
    PATIENT: UserCheck,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  SwasthSetu Authentication & RBAC Console
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Firebase Auth
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Institutional Staff Credentials • Citizen Health ID • Role-Based Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('staff')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'staff'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileBadge className="w-4 h-4 text-blue-600" />
            Institutional Staff Duty (8 Roles)
          </button>

          <button
            onClick={() => setActiveSubTab('google')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'google'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google Sign-In
            {firebaseUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('patient')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'patient'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Citizen / Patient Access
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-slate-700" />
            RBAC Permission Matrix
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* TAB 1: Institutional Staff Duty */}
          {activeSubTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Clinical Workstations & Institutional Staff Duty
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select an official healthcare role to emulate duty credentials across Raipur District Hospital, CHC Arang, and State Health Directorate.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Active Session
                  </span>
                  <span className="text-xs font-bold text-blue-700">
                    {userProfile.displayName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {allRoles.map((r) => {
                  const config = ROLE_CONFIGS[r];
                  const staff = INSTITUTIONAL_STAFF_ACCOUNTS[r];
                  const Icon = roleIcons[r];
                  const isActive = activeRole === r;

                  return (
                    <div
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isActive
                          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">
                                  {config.label}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
                                  {r}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {config.hindiLabel}
                              </span>
                            </div>
                          </div>

                          {isActive && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                          {config.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Default Assignee:</span>
                            <span className="font-bold text-slate-800">{staff.displayName}</span>
                          </div>
                          {staff.employeeId && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Employee / License:</span>
                              <span className="font-mono text-slate-700">{staff.employeeId}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Facility:</span>
                            <span className="text-slate-700 truncate max-w-[180px]">{staff.facilityName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {config.permissions.length} granular capabilities
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect(r);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isActive ? 'Current Active Role' : 'Authenticate as Role'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Google Authentication */}
          {activeSubTab === 'google' && (
            <div className="max-w-xl mx-auto py-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Firebase Google Authentication
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Sign in with your verified Google account. System recognizes institutional administrators and provisions role credentials securely.
                </p>
              </div>

              {googleError && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold mb-1">Notice:</p>
                  <p>{googleError}</p>
                </div>
              )}

              {firebaseUser ? (
                <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    {firebaseUser.photoURL ? (
                      <img
                        src={firebaseUser.photoURL}
                        alt={firebaseUser.displayName || 'User'}
                        className="w-14 h-14 rounded-2xl border-2 border-emerald-500 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center">
                        {firebaseUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">
                          {firebaseUser.displayName || 'Authorized User'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{firebaseUser.email}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        UID: {firebaseUser.uid}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current SwasthSetu Role:</span>
                      <span className="font-bold text-blue-700">{userProfile.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Facility:</span>
                      <span className="font-medium text-slate-800">{userProfile.facilityName}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={logout}
                      className="flex-1 py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Continue with Current Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isLoading ? 'Connecting to Firebase...' : 'Sign in with Google Account'}</span>
                  </button>

                  <p className="text-[11px] text-slate-500">
                    Signing in connects your Google profile directly to Firestore collections under project <code className="font-mono text-slate-700 font-bold">wowx-technologie-1781075170178</code>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Citizen / Patient Access */}
          {activeSubTab === 'patient' && (
            <div className="max-w-xl mx-auto py-4 space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      Citizen Health Portal Access
                    </h4>
                    <p className="text-xs text-slate-500">
                      Patients can self-register, monitor live OPD tokens, and retrieve prescriptions without doctor credentials.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-emerald-900">Sample Linked Patient:</span>
                    <span className="font-mono font-bold text-emerald-800">PAT-20260926-0042</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Patient Name:</span>
                    <span className="font-bold text-slate-900">Rajesh Sharma (Age 42, M)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active OPD Token:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold">
                      GM-042
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRoleSelect('PATIENT')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Authenticate as Citizen / Patient (Rajesh Sharma)
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RBAC Permission Matrix */}
          {activeSubTab === 'matrix' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Universal Role-Based Access Control (RBAC) Specification
                </h4>
                <p className="text-xs text-slate-500">
                  Granular permission enforcement across clinical, pharmacy, supply chain, and administrative domains.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Healthcare Role</th>
                      <th className="p-3">OPD Queue</th>
                      <th className="p-3">Consultation</th>
                      <th className="p-3">Pharmacy Dispense</th>
                      <th className="p-3">Inventory Adjust</th>
                      <th className="p-3">District AI Transfer</th>
                      <th className="p-3">State / System</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allRoles.map((r) => {
                      const cfg = ROLE_CONFIGS[r];
                      const canQueue = cfg.permissions.includes('queue:call_patient');
                      const canConsult = cfg.permissions.includes('consultation:start');
                      const canDispense = cfg.permissions.includes('pharmacy:dispense');
                      const canInventory = cfg.permissions.includes('inventory:adjust_stock');
                      const canRedistribute = cfg.permissions.includes('district:approve_redistribution');
                      const canSystem = r === 'SYSTEM_ADMIN' || r === 'STATE_ADMIN';

                      return (
                        <tr
                          key={r}
                          className={activeRole === r ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.badgeClass}`}>
                                {r}
                              </span>
                              <span className="text-slate-800">{cfg.label}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {canQueue ? (
                              <span className="text-emerald-700 font-bold">✓ Call & View</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {canConsult ? (
                              <span className="text-emerald-700 font-bold">✓ Prescribe & Rx</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {canDispense ? (
                              <span className="text-purple-700 font-bold">✓ Dispense</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {canInventory ? (
                              <span className="text-indigo-700 font-bold">✓ Modify</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {canRedistribute ? (
                              <span className="text-amber-700 font-bold">✓ Approve Transfer</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {canSystem ? (
                              <span className="text-slate-900 font-bold">✓ Full Telemetry</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Zero-Trust Attribute-Based Access Control enforced on Firestore Rules & Client Gates
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
