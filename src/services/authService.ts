import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from './firebase';
import { UserRole } from '../types';
import { ROLE_CONFIGS, Permission } from '../utils/rbac';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  facilityId: string;
  facilityName: string;
  departmentId?: string;
  departmentName?: string;
  employeeId?: string;
  licenseNumber?: string;
  patientId?: string;
  phone?: string;
  isEmailVerified: boolean;
  isInstitutionalAccount?: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export const INSTITUTIONAL_STAFF_ACCOUNTS: Record<UserRole, Partial<UserProfile>> = {
  PATIENT: {
    displayName: 'Rajesh Sharma',
    role: 'PATIENT',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    patientId: 'PAT-20260926-0042',
    phone: '+91 98261 44321',
  },
  DOCTOR: {
    displayName: 'Dr. Alok Verma, MD (Medicine)',
    role: 'DOCTOR',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    departmentId: 'DEPT-GEN-MED',
    departmentName: 'General Medicine OPD',
    employeeId: 'EMP-DOC-4091',
    licenseNumber: 'CG-MCI-2014-8832',
    phone: '+91 94252 11029',
  },
  NURSE: {
    displayName: 'Sister Sunita Rao, RN',
    role: 'NURSE',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    departmentId: 'DEPT-GEN-MED',
    departmentName: 'Triage & Vital Station',
    employeeId: 'EMP-NRS-2104',
    licenseNumber: 'CG-NNC-2018-4901',
    phone: '+91 98265 99312',
  },
  PHARMACIST: {
    displayName: 'Ramesh Patel, B.Pharm (R.Ph)',
    role: 'PHARMACIST',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    departmentId: 'DEPT-PHARM',
    departmentName: 'Central OPD Dispensary',
    employeeId: 'EMP-PHM-1092',
    licenseNumber: 'CG-PCI-2016-3021',
    phone: '+91 91114 78201',
  },
  HOSPITAL_ADMIN: {
    displayName: 'Dr. R. K. Sharma (Medical Superintendent)',
    role: 'HOSPITAL_ADMIN',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    employeeId: 'EMP-ADM-0041',
    phone: '+91 98260 01104',
  },
  DISTRICT_ADMIN: {
    displayName: 'Dr. Meena Chandrakar (CMHO Raipur)',
    role: 'DISTRICT_ADMIN',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'Raipur District Health Office',
    employeeId: 'CG-HSS-DIST-01',
    phone: '+91 94242 88190',
  },
  STATE_ADMIN: {
    displayName: 'Shri Vivek Aggarwal, IAS (Health Mission Director)',
    role: 'STATE_ADMIN',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'State Health Directorate, Chhattisgarh',
    employeeId: 'IAS-CG-2008-04',
    phone: '+91 771 2234001',
  },
  SYSTEM_ADMIN: {
    displayName: 'Super Admin (Health Grid Operations)',
    role: 'SYSTEM_ADMIN',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'National Health Grid Core Node',
    employeeId: 'SYS-ROOT-001',
    phone: '+91 90000 00001',
  },
};

const USER_SESSION_CACHE_KEY = 'swasthsetu_active_user_profile';

export const authService = {
  // Sign in with Google Popup
  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      return await this.syncUserProfile(firebaseUser);
    } catch (error: any) {
      console.error('[AuthService] Google Sign-In error:', error);
      throw error;
    }
  },

  // Switch or fast-authenticate as institutional role
  async loginWithRole(role: UserRole, facilityId?: string): Promise<UserProfile> {
    const template = INSTITUTIONAL_STAFF_ACCOUNTS[role];
    const now = new Date().toISOString();
    const fallbackUid = auth.currentUser?.uid || `usr_${role.toLowerCase()}_${Date.now().toString(36)}`;

    const profile: UserProfile = {
      uid: fallbackUid,
      email: auth.currentUser?.email || `${role.toLowerCase().replace('_', '.')}@swasthsetu.gov.in`,
      displayName: template.displayName || role,
      photoURL: auth.currentUser?.photoURL || undefined,
      role: role,
      facilityId: facilityId || template.facilityId || 'FAC-RAIPUR',
      facilityName: template.facilityName || 'District Hospital Raipur',
      departmentId: template.departmentId,
      departmentName: template.departmentName,
      employeeId: template.employeeId,
      licenseNumber: template.licenseNumber,
      patientId: template.patientId,
      phone: template.phone || '+91 98260 00000',
      isEmailVerified: auth.currentUser?.emailVerified ?? true,
      isInstitutionalAccount: true,
      permissions: ROLE_CONFIGS[role].permissions,
      createdAt: now,
      updatedAt: now,
    };

    // Save to local storage for instant hydration
    localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(profile));

    // If connected to Firestore, persist profile
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || profile.email,
          displayName: profile.displayName,
          role: profile.role,
          facilityId: profile.facilityId,
          facilityName: profile.facilityName,
          departmentId: profile.departmentId || null,
          departmentName: profile.departmentName || null,
          patientId: profile.patientId || null,
          phone: profile.phone || null,
          isEmailVerified: auth.currentUser.emailVerified,
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
      } catch (err) {
        console.warn('[AuthService] Could not sync role to Firestore (using local session):', err);
      }
    }

    return profile;
  },

  // Sync Firebase User with Firestore
  async syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const now = new Date().toISOString();

    let role: UserRole = 'PATIENT';
    // Bootstrap admin email check
    if (firebaseUser.email === 'wowxtechnologies@gmail.com') {
      role = 'SYSTEM_ADMIN';
    }

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        const userRole = (data.role as UserRole) || role;
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || data.displayName || 'Authorized User',
          photoURL: firebaseUser.photoURL || undefined,
          role: userRole,
          facilityId: data.facilityId || 'FAC-RAIPUR',
          facilityName: data.facilityName || 'District Hospital Raipur',
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          employeeId: data.employeeId,
          patientId: data.patientId,
          phone: data.phone || firebaseUser.phoneNumber || undefined,
          isEmailVerified: firebaseUser.emailVerified,
          permissions: ROLE_CONFIGS[userRole]?.permissions || ROLE_CONFIGS.PATIENT.permissions,
          createdAt: data.createdAt || now,
          updatedAt: now,
        };
        localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(profile));
        return profile;
      } else {
        // Create initial user document
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Citizen User',
          photoURL: firebaseUser.photoURL || undefined,
          role,
          facilityId: 'FAC-RAIPUR',
          facilityName: 'District Hospital Raipur',
          isEmailVerified: firebaseUser.emailVerified,
          permissions: ROLE_CONFIGS[role].permissions,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(userDocRef, {
          uid: newProfile.uid,
          email: newProfile.email,
          displayName: newProfile.displayName,
          role: newProfile.role,
          facilityId: newProfile.facilityId,
          facilityName: newProfile.facilityName,
          isEmailVerified: newProfile.isEmailVerified,
          createdAt: now,
          updatedAt: now,
        });
        localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(newProfile));
        return newProfile;
      }
    } catch (err) {
      console.warn('[AuthService] Firestore sync skipped or restricted, using memory session:', err);
      // Fallback local profile
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'SwasthSetu User',
        photoURL: firebaseUser.photoURL || undefined,
        role,
        facilityId: 'FAC-RAIPUR',
        facilityName: 'District Hospital Raipur',
        isEmailVerified: firebaseUser.emailVerified,
        permissions: ROLE_CONFIGS[role].permissions,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  },

  // Link Patient Record to authenticated user
  async linkPatientAccount(uid: string, patientId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        patientId,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Sign out
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('[AuthService] Sign out error:', e);
    } finally {
      localStorage.removeItem(USER_SESSION_CACHE_KEY);
    }
  },

  // Get cached profile if any
  getCachedProfile(): UserProfile | null {
    try {
      const cached = localStorage.getItem(USER_SESSION_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Subscribe to Firebase Auth State Changes
  onAuthState(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
