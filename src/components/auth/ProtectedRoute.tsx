import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Permission, ROLE_CONFIGS } from '../../utils/rbac';
import { ShieldAlert, LogIn, Lock, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  moduleName?: string;
  fallbackTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  moduleName = 'This Healthcare Module',
  fallbackTab = 'patient',
  onNavigateTab,
}) => {
  const { userProfile, role, isAuthenticated, hasRole, hasPermission, setAuthModalOpen, loginWithRole } = useAuth();

  // If System Admin, bypass
  if (role === 'SYSTEM_ADMIN') {
    return <>{children}</>;
  }

  // Check role authorization
  const isRoleAuthorized = allowedRoles ? hasRole(allowedRoles) : true;
  // Check permission authorization
  const isPermissionAuthorized = requiredPermission ? hasPermission(requiredPermission) : true;

  if (isRoleAuthorized && isPermissionAuthorized) {
    return <>{children}</>;
  }

  // Access Denied / Guard Screen
  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-rose-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/40 text-[11px] font-bold text-rose-200 uppercase tracking-widest mb-1.5">
                <Lock className="w-3 h-3" /> Security Access Restricted
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Insufficient Role Privileges
              </h2>
              <p className="text-rose-200 text-sm mt-1">
                Access to <span className="font-semibold text-white">{moduleName}</span> is protected by National Health Grid Role-Based Access Control (RBAC).
              </p>
            </div>
          </div>
        </div>

        {/* Details & Actions */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Your Current Session
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center">
                  {userProfile.displayName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{userProfile.displayName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                      {ROLE_CONFIGS[role]?.label || role}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {userProfile.facilityName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Required Authorization
              </p>
              <div className="space-y-1">
                {allowedRoles && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allowedRoles.map((r) => (
                      <span
                        key={r}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${ROLE_CONFIGS[r].badgeClass}`}
                      >
                        {ROLE_CONFIGS[r].label}
                      </span>
                    ))}
                  </div>
                )}
                {requiredPermission && (
                  <p className="text-xs text-amber-700 font-mono mt-2">
                    Required capability: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-bold">{requiredPermission}</code>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Staff Switch for Evaluation & Emergency */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Switch to an Authorized Clinical Identity
            </h4>
            <p className="text-xs text-blue-700 mb-3">
              Hospital workstations allow authenticated clinical officers to switch into their verified duty profile:
            </p>
            <div className="flex flex-wrap gap-2">
              {allowedRoles?.map((r) => (
                <button
                  key={r}
                  onClick={() => loginWithRole(r)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-900 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Authenticate as {ROLE_CONFIGS[r].label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              Open Security & Staff Login Console
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab(fallbackTab)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Return to {ROLE_CONFIGS[role]?.label || 'Patient'} Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
