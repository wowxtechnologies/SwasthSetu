import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Patient, Registration, QueueTicket, TriagePriority, LanguageCode, RegistrationSource } from '../types';

export interface SubmitRegistrationParams {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
  preferredLanguage: LanguageCode;
  departmentId: string;
  departmentName?: string;
  facilityId: string;
  facilityName?: string;
  visitReason: string;
  symptoms?: string[];
  duration?: string;
  priorityStatus: TriagePriority;
  registrationSource: RegistrationSource;
  bloodGroup?: string;
  knownAllergies?: string[];
  abhaId?: string;
}

export interface RegistrationResult {
  patientId: string;
  registrationId: string;
  ticketId: string;
  tokenNumber: string;
  sequenceNumber: number;
  qrCodeData: string;
  patient: Patient;
  registration: Registration;
  ticket: QueueTicket;
  backendSynced: boolean;
  firestoreSynced: boolean;
}

export const registrationService = {
  async submitRegistration(params: SubmitRegistrationParams): Promise<RegistrationResult> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();

    const patientId = `PAT-${dateStr}-${randomHex}`;
    const registrationId = `REG-${dateStr}-${randomHex}`;
    const ticketId = `TCK-${dateStr}-${randomHex}`;
    const qrNonce = `reg_ref_${Math.random().toString(36).substring(2, 10)}`;

    const birthYear = new Date(params.dateOfBirth).getFullYear();
    const age = today.getFullYear() - birthYear;

    // Generate token number prefix
    const deptPrefix = (params.departmentName || 'OPD').substring(0, 2).toUpperCase();
    const tokenNumber = `${deptPrefix}-${String(Math.floor(Math.random() * 50) + 40).padStart(3, '0')}`;

    const patient: Patient = {
      patientId,
      fullName: params.fullName.trim(),
      dateOfBirth: params.dateOfBirth,
      age: age > 0 ? age : 28,
      gender: params.gender,
      phone: params.phone.trim(),
      address: {
        villageOrCity: params.villageOrCity.trim(),
        district: params.district.trim(),
        state: params.state.trim(),
        pincode: params.pincode.trim(),
      },
      preferredLanguage: params.preferredLanguage,
      bloodGroup: params.bloodGroup || 'B+',
      knownAllergies: params.knownAllergies || [],
      createdAt: today.toISOString(),
    };

    const registration: Registration = {
      registrationId,
      patientId,
      patientName: patient.fullName,
      facilityId: params.facilityId,
      departmentId: params.departmentId,
      departmentName: params.departmentName || 'General Medicine OPD',
      roomNumber: 'Room 102',
      visitReason: params.visitReason.trim(),
      registrationSource: params.registrationSource,
      tokenNumber,
      qrCodeData: qrNonce,
      priorityStatus: params.priorityStatus,
      status: 'WAITING',
      ticketId,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    };

    const ticket: QueueTicket = {
      ticketId,
      queueId: `${params.facilityId}_${params.departmentId}_${today.toISOString().slice(0, 10)}`,
      registrationId,
      patientId,
      patientName: patient.fullName,
      tokenNumber,
      sequenceNumber: 42,
      departmentId: params.departmentId,
      facilityId: params.facilityId,
      priority: params.priorityStatus,
      status: 'WAITING',
      issuedAt: today.toISOString(),
    };

    let backendSynced = false;
    let firestoreSynced = false;

    // 1. Submit to Backend Express REST API (/api/registrations)
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          patientId,
          registrationId,
          ticketId,
          tokenNumber,
        }),
      });
      if (response.ok) {
        backendSynced = true;
      }
    } catch (apiErr) {
      console.warn('[RegistrationService] Backend API proxy unreachable or offline:', apiErr);
    }

    // 2. Direct Firestore Sync (if signed in or client connected)
    try {
      const currentUid = auth.currentUser?.uid || 'patient_online_guest';

      // Write Patient Document
      await setDoc(doc(db, 'patients', patientId), {
        patientId,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        preferredLanguage: patient.preferredLanguage,
        bloodGroup: patient.bloodGroup,
        ownerUid: currentUid,
        createdAt: patient.createdAt,
      });

      // Write Registration Document
      await setDoc(doc(db, 'registrations', registrationId), {
        registrationId,
        patientId,
        patientName: registration.patientName,
        facilityId: registration.facilityId,
        departmentId: registration.departmentId,
        tokenNumber: registration.tokenNumber,
        visitReason: registration.visitReason,
        status: registration.status,
        priorityStatus: registration.priorityStatus,
        ticketId: registration.ticketId,
        registeredByUid: currentUid,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      });

      // Write QueueTicket Document
      await setDoc(doc(db, 'queueTickets', ticketId), {
        ticketId,
        queueId: ticket.queueId,
        registrationId,
        patientId,
        patientName: ticket.patientName,
        tokenNumber: ticket.tokenNumber,
        sequenceNumber: ticket.sequenceNumber,
        departmentId: ticket.departmentId,
        facilityId: ticket.facilityId,
        priority: ticket.priority,
        status: ticket.status,
        issuedAt: ticket.issuedAt,
      });

      // Record Audit Log (write-once)
      const logId = `AUD-${dateStr}-${randomHex}`;
      await setDoc(doc(db, 'auditLogs', logId), {
        logId,
        actorUid: currentUid,
        actorRole: 'PATIENT',
        action: 'PATIENT_ONLINE_REGISTRATION',
        resourceType: 'REGISTRATION',
        resourceId: registrationId,
        details: `Online registration for ${patient.fullName} (${tokenNumber}) in ${params.departmentName || 'OPD'}`,
        timestamp: today.toISOString(),
      });

      firestoreSynced = true;
      console.log('[RegistrationService] Successfully synced to Firestore project:', db.app.options.projectId);
    } catch (fsErr) {
      console.warn('[RegistrationService] Direct Firestore write bypassed or guest access:', fsErr);
    }

    return {
      patientId,
      registrationId,
      ticketId,
      tokenNumber,
      sequenceNumber: 42,
      qrCodeData: qrNonce,
      patient,
      registration,
      ticket,
      backendSynced,
      firestoreSynced,
    };
  },
};
