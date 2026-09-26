import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppState,
  getInitialState,
  saveState,
  STORAGE_KEY,
  SEED_FACILITIES,
  SEED_DEPARTMENTS,
  SEED_PATIENTS,
  SEED_REGISTRATIONS,
  SEED_TICKETS,
  SEED_QUEUES,
  SEED_CONSULTATIONS,
  SEED_PHARMACY_ORDERS,
  SEED_INVENTORY,
  SEED_ALERTS,
  SEED_RECOMMENDATIONS,
  SEED_FEDERATED_NODES,
} from '../services/store';
import {
  UserRole,
  Patient,
  Registration,
  QueueTicket,
  Consultation,
  PharmacyOrder,
  PrescriptionItem,
  TriagePriority,
  RegistrationSource,
  StockRiskLevel,
} from '../types';

interface RegisterParams {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
  preferredLanguage: 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr';
  departmentId: string;
  facilityId: string;
  visitReason: string;
  priorityStatus: TriagePriority;
  registrationSource: RegistrationSource;
  bloodGroup?: string;
  knownAllergies?: string[];
}

interface AppContextValue {
  state: AppState;
  setRole: (role: UserRole) => void;
  setFacility: (facilityId: string) => void;
  registerPatient: (params: RegisterParams) => {
    patient: Patient;
    registration: Registration;
    ticket: QueueTicket;
  };
  callNextTicket: (departmentId: string) => QueueTicket | null;
  completeConsultation: (params: {
    ticketId: string;
    chiefComplaint: string;
    symptoms: string[];
    vitals: {
      bpSystolic?: number;
      bpDiastolic?: number;
      pulse?: number;
      tempF?: number;
      weightKg?: number;
      spo2?: number;
    };
    diagnosis: string;
    clinicalNotes: string;
    prescriptionItems: PrescriptionItem[];
    labTests?: string[];
  }) => void;
  dispensePrescription: (orderId: string) => { success: boolean; message: string };
  updateInventoryStock: (facilityId: string, medicineId: string, delta: number) => void;
  acknowledgeAlert: (alertId: string) => void;
  approveRecommendation: (recId: string) => void;
  rejectRecommendation: (recId: string, reason: string) => void;
  stepFederatedRound: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function calculateRisk(daysOfStock: number): StockRiskLevel {
  if (daysOfStock > 30) return 'SURPLUS';
  if (daysOfStock >= 14) return 'LOW';
  if (daysOfStock >= 7) return 'MEDIUM';
  return 'CRITICAL';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);

  // Sync to local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, currentRole: role }));
  };

  const setFacility = (facilityId: string) => {
    setState((prev) => ({ ...prev, currentFacilityId: facilityId }));
  };

  const registerPatient = (params: RegisterParams) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();

    // Check existing patient
    let patient = state.patients.find((p) => p.phone === params.phone);
    let patientId = patient?.patientId;

    if (!patient) {
      patientId = `PAT-${dateStr}-${randomHex}`;
      const birthYear = new Date(params.dateOfBirth).getFullYear();
      const age = today.getFullYear() - birthYear;
      patient = {
        patientId,
        fullName: params.fullName,
        dateOfBirth: params.dateOfBirth,
        age: age > 0 ? age : 25,
        gender: params.gender,
        phone: params.phone,
        address: {
          villageOrCity: params.villageOrCity,
          district: params.district,
          state: params.state,
          pincode: params.pincode,
        },
        preferredLanguage: params.preferredLanguage,
        bloodGroup: params.bloodGroup || 'B+',
        knownAllergies: params.knownAllergies || [],
        createdAt: new Date().toISOString(),
      };
    }

    const regId = `REG-${dateStr}-${randomHex}`;
    const ticketId = `TCK-${dateStr}-${randomHex}`;
    const qrNonce = `reg_ref_${Math.random().toString(36).substring(2, 10)}`;

    const department =
      state.departments.find((d) => d.departmentId === params.departmentId) ||
      state.departments[0];

    // Compute sequence & token
    const deptTickets = state.tickets.filter((t) => t.departmentId === department.departmentId);
    const sequenceNumber = deptTickets.length + 1;
    const tokenNumber = `${department.code}-${String(sequenceNumber).padStart(3, '0')}`;

    const newTicket: QueueTicket = {
      ticketId,
      queueId: `${params.facilityId}_${department.departmentId}_${today.toISOString().slice(0, 10)}`,
      registrationId: regId,
      patientId: patient.patientId,
      patientName: patient.fullName,
      tokenNumber,
      sequenceNumber,
      departmentId: department.departmentId,
      facilityId: params.facilityId,
      priority: params.priorityStatus,
      status: 'WAITING',
      issuedAt: new Date().toISOString(),
    };

    const newRegistration: Registration = {
      registrationId: regId,
      patientId: patient.patientId,
      patientName: patient.fullName,
      facilityId: params.facilityId,
      departmentId: department.departmentId,
      departmentName: department.name,
      roomNumber: department.roomNumber,
      visitReason: params.visitReason,
      registrationSource: params.registrationSource,
      tokenNumber,
      qrCodeData: qrNonce,
      priorityStatus: params.priorityStatus,
      status: 'WAITING',
      ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => {
      const existingPatientIdx = prev.patients.findIndex((p) => p.patientId === patient!.patientId);
      const updatedPatients =
        existingPatientIdx >= 0
          ? prev.patients
          : [patient!, ...prev.patients];

      // Update queue active count
      const updatedQueues = prev.queues.map((q) => {
        if (q.departmentId === department.departmentId && q.facilityId === params.facilityId) {
          return {
            ...q,
            totalIssued: q.totalIssued + 1,
            activeWaitingCount: q.activeWaitingCount + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      });

      return {
        ...prev,
        patients: updatedPatients,
        registrations: [newRegistration, ...prev.registrations],
        tickets: [...prev.tickets, newTicket],
        queues: updatedQueues,
      };
    });

    return { patient, registration: newRegistration, ticket: newTicket };
  };

  const callNextTicket = (departmentId: string): QueueTicket | null => {
    // Find waiting tickets for this department sorted by priority: EMERGENCY -> URGENT -> ROUTINE
    const priorityOrder: Record<TriagePriority, number> = {
      EMERGENCY: 0,
      URGENT: 1,
      ROUTINE: 2,
    };

    const waiting = state.tickets
      .filter((t) => t.departmentId === departmentId && t.status === 'WAITING')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.sequenceNumber - b.sequenceNumber);

    if (waiting.length === 0) return null;

    const nextTicket = waiting[0];
    const now = new Date().toISOString();

    setState((prev) => {
      // Mark any previously active in consultation as completed
      const updatedTickets = prev.tickets.map((t) => {
        if (t.departmentId === departmentId && (t.status === 'IN_CONSULTATION' || t.status === 'CALLED')) {
          return { ...t, status: 'COMPLETED' as const, completedAt: now };
        }
        if (t.ticketId === nextTicket.ticketId) {
          return { ...t, status: 'CALLED' as const, calledAt: now };
        }
        return t;
      });

      const updatedRegistrations = prev.registrations.map((r) => {
        if (r.ticketId === nextTicket.ticketId) {
          return { ...r, status: 'IN_CONSULTATION' as const, updatedAt: now };
        }
        return r;
      });

      const updatedQueues = prev.queues.map((q) => {
        if (q.departmentId === departmentId) {
          return {
            ...q,
            currentTokenNumber: nextTicket.tokenNumber,
            activeTicketId: nextTicket.ticketId,
            activeWaitingCount: Math.max(0, q.activeWaitingCount - 1),
            updatedAt: now,
          };
        }
        return q;
      });

      return {
        ...prev,
        tickets: updatedTickets,
        registrations: updatedRegistrations,
        queues: updatedQueues,
      };
    });

    return nextTicket;
  };

  const completeConsultation = (params: {
    ticketId: string;
    chiefComplaint: string;
    symptoms: string[];
    vitals: any;
    diagnosis: string;
    clinicalNotes: string;
    prescriptionItems: PrescriptionItem[];
    labTests?: string[];
  }) => {
    const ticket = state.tickets.find((t) => t.ticketId === params.ticketId);
    if (!ticket) return;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();

    const consultationId = `CNS-${dateStr}-${randomHex}`;
    const rxId = `RX-${dateStr}-${randomHex}`;
    const now = today.toISOString();

    const newConsultation: Consultation = {
      consultationId,
      registrationId: ticket.registrationId,
      ticketId: ticket.ticketId,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      doctorId: 'DOC-RAIPUR-01',
      doctorName: 'Dr. Alok Verma, MD',
      departmentId: ticket.departmentId,
      facilityId: ticket.facilityId,
      chiefComplaint: params.chiefComplaint,
      symptoms: params.symptoms,
      vitals: params.vitals,
      diagnosis: params.diagnosis,
      clinicalNotes: params.clinicalNotes,
      status: 'COMPLETED',
      startedAt: ticket.calledAt || now,
      completedAt: now,
      prescriptionId: params.prescriptionItems.length > 0 ? rxId : undefined,
    };

    let newPharmacyOrder: PharmacyOrder | null = null;
    if (params.prescriptionItems.length > 0) {
      newPharmacyOrder = {
        orderId: rxId,
        consultationId,
        registrationId: ticket.registrationId,
        patientId: ticket.patientId,
        patientName: ticket.patientName,
        facilityId: ticket.facilityId,
        doctorName: 'Dr. Alok Verma, MD',
        items: params.prescriptionItems,
        dispenseStatus: 'PENDING',
        createdAt: now,
      };
    }

    setState((prev) => {
      const updatedTickets = prev.tickets.map((t) =>
        t.ticketId === params.ticketId
          ? { ...t, status: 'COMPLETED' as const, completedAt: now }
          : t
      );

      const updatedRegistrations = prev.registrations.map((r) =>
        r.ticketId === params.ticketId
          ? {
              ...r,
              status: (params.prescriptionItems.length > 0
                ? 'PHARMACY_PENDING'
                : 'COMPLETED') as any,
              updatedAt: now,
            }
          : r
      );

      const updatedQueues = prev.queues.map((q) => {
        if (q.departmentId === ticket.departmentId) {
          return {
            ...q,
            totalCompleted: q.totalCompleted + 1,
            activeTicketId: null,
            updatedAt: now,
          };
        }
        return q;
      });

      return {
        ...prev,
        consultations: [newConsultation, ...prev.consultations],
        pharmacyOrders: newPharmacyOrder
          ? [newPharmacyOrder, ...prev.pharmacyOrders]
          : prev.pharmacyOrders,
        tickets: updatedTickets,
        registrations: updatedRegistrations,
        queues: updatedQueues,
      };
    });
  };

  const dispensePrescription = (orderId: string) => {
    const order = state.pharmacyOrders.find((o) => o.orderId === orderId);
    if (!order) return { success: false, message: 'Prescription order not found' };
    if (order.dispenseStatus === 'DISPENSED') {
      return { success: false, message: 'Prescription has already been dispensed' };
    }

    // Verify medicine availability in current facility
    const facilityInventory = state.inventory.filter((i) => i.facilityId === order.facilityId);
    for (const item of order.items) {
      const stock = facilityInventory.find((i) => i.medicineId === item.medicineId);
      if (stock && stock.currentStock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.medicineName}. Available: ${stock.currentStock}, Prescribed: ${item.quantity}`,
        };
      }
    }

    const now = new Date().toISOString();

    setState((prev) => {
      // Deduct inventory
      const updatedInventory = prev.inventory.map((inv) => {
        if (inv.facilityId === order.facilityId) {
          const matchItem = order.items.find((i) => i.medicineId === inv.medicineId);
          if (matchItem) {
            const newStock = Math.max(0, inv.currentStock - matchItem.quantity);
            const days = Number((newStock / inv.dailyConsumptionRate).toFixed(1));
            return {
              ...inv,
              currentStock: newStock,
              daysOfStock: days,
              riskLevel: calculateRisk(days),
              updatedAt: now,
            };
          }
        }
        return inv;
      });

      // Update order status
      const updatedOrders = prev.pharmacyOrders.map((o) =>
        o.orderId === orderId
          ? { ...o, dispenseStatus: 'DISPENSED' as const, dispensedAt: now, dispensedBy: 'Ramesh Patel, R.Ph' }
          : o
      );

      // Update registration status to COMPLETED
      const updatedRegistrations = prev.registrations.map((r) =>
        r.registrationId === order.registrationId
          ? { ...r, status: 'COMPLETED' as const, updatedAt: now }
          : r
      );

      return {
        ...prev,
        inventory: updatedInventory,
        pharmacyOrders: updatedOrders,
        registrations: updatedRegistrations,
      };
    });

    return { success: true, message: `Prescription ${orderId} successfully dispensed. Inventory balances updated.` };
  };

  const updateInventoryStock = (facilityId: string, medicineId: string, delta: number) => {
    setState((prev) => {
      const updated = prev.inventory.map((inv) => {
        if (inv.facilityId === facilityId && inv.medicineId === medicineId) {
          const newStock = Math.max(0, inv.currentStock + delta);
          const days = Number((newStock / inv.dailyConsumptionRate).toFixed(1));
          return {
            ...inv,
            currentStock: newStock,
            daysOfStock: days,
            riskLevel: calculateRisk(days),
            updatedAt: new Date().toISOString(),
          };
        }
        return inv;
      });
      return { ...prev, inventory: updated };
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.alertId === alertId
          ? { ...a, isAcknowledged: true, acknowledgedBy: 'Authorized Medical Officer' }
          : a
      ),
    }));
  };

  const approveRecommendation = (recId: string) => {
    const rec = state.recommendations.find((r) => r.recommendationId === recId);
    if (!rec) return;

    const now = new Date().toISOString();

    setState((prev) => {
      // Deduct from source facility, add to destination facility
      const updatedInventory = prev.inventory.map((inv) => {
        if (inv.facilityId === rec.sourceFacilityId && inv.medicineId === rec.medicineId) {
          const newStock = Math.max(0, inv.currentStock - rec.suggestedQuantity);
          const days = Number((newStock / inv.dailyConsumptionRate).toFixed(1));
          return {
            ...inv,
            currentStock: newStock,
            daysOfStock: days,
            riskLevel: calculateRisk(days),
            updatedAt: now,
          };
        }
        if (inv.facilityId === rec.destFacilityId && inv.medicineId === rec.medicineId) {
          const newStock = inv.currentStock + rec.suggestedQuantity;
          const days = Number((newStock / inv.dailyConsumptionRate).toFixed(1));
          return {
            ...inv,
            currentStock: newStock,
            daysOfStock: days,
            riskLevel: calculateRisk(days),
            updatedAt: now,
          };
        }
        return inv;
      });

      const updatedRecs = prev.recommendations.map((r) =>
        r.recommendationId === recId
          ? { ...r, status: 'APPROVED' as const, reviewedBy: 'Dr. R. K. Sharma (CMHO Raipur)', reviewedAt: now }
          : r
      );

      // Auto-resolve or acknowledge related alert for destination
      const updatedAlerts = prev.alerts.map((a) => {
        if (a.facilityId === rec.destFacilityId && a.metadata?.medicineId === rec.medicineId) {
          return { ...a, isAcknowledged: true, acknowledgedBy: 'System (Inter-Facility Transfer Approved)' };
        }
        return a;
      });

      return {
        ...prev,
        inventory: updatedInventory,
        recommendations: updatedRecs,
        alerts: updatedAlerts,
      };
    });
  };

  const rejectRecommendation = (recId: string, reason: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((r) =>
        r.recommendationId === recId
          ? {
              ...r,
              status: 'REJECTED' as const,
              reasoning: `${r.reasoning} [REJECTED: ${reason}]`,
              reviewedBy: 'Authorized Administrator',
              reviewedAt: now,
            }
          : r
      ),
    }));
  };

  const stepFederatedRound = () => {
    setState((prev) => {
      const nextRound = prev.federatedRound + 1;
      const updatedNodes = prev.federatedNodes.map((node) => {
        const accuracyGain = (Math.random() * 0.4 + 0.1);
        const newAccuracy = Math.min(96.5, Number((node.localModelAccuracy + accuracyGain).toFixed(2)));
        const newLoss = Math.max(0.015, Number((node.weightDeltaNorm * 0.92).toFixed(4)));
        return {
          ...node,
          localModelAccuracy: newAccuracy,
          weightDeltaNorm: newLoss,
          lastUpdated: new Date().toISOString(),
        };
      });

      return {
        ...prev,
        federatedRound: nextRound,
        federatedNodes: updatedNodes,
      };
    });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentRole: 'DOCTOR',
      currentFacilityId: 'FAC-RAIPUR',
      facilities: SEED_FACILITIES,
      departments: SEED_DEPARTMENTS,
      patients: SEED_PATIENTS,
      registrations: SEED_REGISTRATIONS,
      tickets: SEED_TICKETS,
      queues: SEED_QUEUES,
      consultations: SEED_CONSULTATIONS,
      pharmacyOrders: SEED_PHARMACY_ORDERS,
      inventory: SEED_INVENTORY,
      transactions: [],
      alerts: SEED_ALERTS,
      recommendations: SEED_RECOMMENDATIONS,
      federatedNodes: SEED_FEDERATED_NODES,
      federatedRound: 14,
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setRole,
        setFacility,
        registerPatient,
        callNextTicket,
        completeConsultation,
        dispensePrescription,
        updateInventoryStock,
        acknowledgeAlert,
        approveRecommendation,
        rejectRecommendation,
        stepFederatedRound,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
