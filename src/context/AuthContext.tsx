import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, UserProfile, INSTITUTIONAL_STAFF_ACCOUNTS } from '../services/authService';
import { testConnection } from '../services/firebase';
import { UserRole } from '../types';
import { Permission, hasPermission as checkPermission } from '../utils/rbac';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithRole: (role: UserRole, facilityId?: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  linkPatient: (patientId: string) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'demo_doctor_01',
  email: 'alok.verma@swasthsetu.gov.in',
  displayName: 'Dr. Alok Verma, MD',
  role: 'DOCTOR',
  facilityId: 'FAC-RAIPUR',
  facilityName: 'District Hospital Raipur',
  departmentId: 'DEPT-GEN-MED',
  departmentName: 'General Medicine OPD',
  employeeId: 'EMP-DOC-4091',
  licenseNumber: 'CG-MCI-2014-8832',
  phone: '+91 94252 11029',
  isEmailVerified: true,
  isInstitutionalAccount: true,
  permissions: INSTITUTIONAL_STAFF_ACCOUNTS.DOCTOR.role
    ? []
    : [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return authService.getCachedProfile() || DEFAULT_PROFILE;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Test Firestore connection on app boot
  useEffect(() => {
    testConnection().catch((err) => console.warn('[Firebase] Connection ping notice:', err));
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthState(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await authService.syncUserProfile(user);
          setUserProfile(profile);
        } catch (e) {
          console.error('[AuthContext] Failed to sync profile with Firestore:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await authService.loginWithGoogle();
      setUserProfile(profile);
      setAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithRole = useCallback(async (role: UserRole, facilityId?: string) => {
    setIsLoading(true);
    try {
      const profile = await authService.loginWithRole(role, facilityId);
      setUserProfile(profile);
      setAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setFirebaseUser(null);
    // Revert to citizen/patient profile
    const guestPatient = await authService.loginWithRole('PATIENT');
    setUserProfile(guestPatient);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(userProfile.role, permission);
    },
    [userProfile.role]
  );

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (userProfile.role === 'SYSTEM_ADMIN') return true;
      if (Array.isArray(roles)) {
        return roles.includes(userProfile.role);
      }
      return userProfile.role === roles;
    },
    [userProfile.role]
  );

  const linkPatient = useCallback(
    async (patientId: string) => {
      if (firebaseUser) {
        await authService.linkPatientAccount(firebaseUser.uid, patientId);
      }
      setUserProfile((prev) => ({
        ...prev,
        patientId,
      }));
    },
    [firebaseUser]
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        role: userProfile.role,
        isAuthenticated: !!firebaseUser || !!userProfile.isInstitutionalAccount,
        isLoading,
        authModalOpen,
        setAuthModalOpen,
        loginWithGoogle,
        loginWithRole,
        logout,
        hasPermission,
        hasRole,
        linkPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
