// SwasthSetu Universal Domain Types

export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'HOSPITAL_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'STATE_ADMIN'
  | 'SYSTEM_ADMIN';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr';

export type FacilityType = 'PHC' | 'CHC' | 'SUB_DISTRICT' | 'DISTRICT_HOSPITAL';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Facility {
  facilityId: string;
  name: string;
  type: FacilityType;
  district: string;
  state: string;
  geoPoint: GeoPoint;
  bedCapacity: {
    total: number;
    occupied: number;
  };
  contactPhone: string;
  address: string;
  isActive: boolean;
}

export interface Department {
  departmentId: string;
  facilityId: string;
  name: string;
  code: string;
  roomNumber: string;
  avgConsultationMinutes: number;
  isActive: boolean;
}

export interface Doctor {
  doctorId: string;
  facilityId: string;
  departmentId: string;
  fullName: string;
  specialization: string;
  consultationRoom: string;
  isAvailable: boolean;
  activeTicketId?: string | null;
}

export interface Patient {
  patientId: string; // PAT-YYYYMMDD-XXXX
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: {
    villageOrCity: string;
    district: string;
    state: string;
    pincode: string;
  };
  preferredLanguage: LanguageCode;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  bloodGroup?: string;
  knownAllergies: string[];
  createdAt: string;
}

export type RegistrationSource = 'WEB' | 'KIOSK' | 'DESK';
export type TriagePriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type RegistrationStatus =
  | 'WAITING'
  | 'IN_CONSULTATION'
  | 'PHARMACY_PENDING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Registration {
  registrationId: string; // REG-YYYYMMDD-XXXX
  patientId: string;
  patientName: string;
  facilityId: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  visitReason: string;
  registrationSource: RegistrationSource;
  tokenNumber: string; // e.g. GM-042
  qrCodeData: string; // reg_ref_XXXXX
  priorityStatus: TriagePriority;
  status: RegistrationStatus;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus =
  | 'WAITING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface QueueTicket {
  ticketId: string; // TCK-YYYYMMDD-XXXX
  queueId: string;
  registrationId: string;
  patientId: string;
  patientName: string;
  tokenNumber: string;
  sequenceNumber: number;
  departmentId: string;
  facilityId: string;
  priority: TriagePriority;
  status: TicketStatus;
  issuedAt: string;
  calledAt?: string | null;
  completedAt?: string | null;
}

export interface Queue {
  queueId: string;
  facilityId: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  currentTokenNumber: string | null;
  activeTicketId?: string | null;
  totalIssued: number;
  totalCompleted: number;
  activeWaitingCount: number;
  avgServiceTimeMinutes: number;
  updatedAt: string;
}

export interface Consultation {
  consultationId: string; // CNS-YYYYMMDD-XXXX
  registrationId: string;
  ticketId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  facilityId: string;
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
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  completedAt?: string | null;
  prescriptionId?: string;
  labOrderId?: string;
}

export interface LabOrder {
  orderId: string;
  consultationId: string;
  patientId: string;
  facilityId: string;
  tests: Array<{
    testCode: string;
    testName: string;
    urgency: string;
  }>;
  status: 'ORDERED' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED';
  results?: string;
  orderedAt: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  durationDays: number;
  quantity: number;
  instructions: string;
}

export interface PharmacyOrder {
  orderId: string; // RX-YYYYMMDD-XXXX
  consultationId: string;
  registrationId: string;
  patientId: string;
  patientName: string;
  facilityId: string;
  doctorName: string;
  items: PrescriptionItem[];
  dispenseStatus: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED';
  dispensedBy?: string;
  dispensedAt?: string | null;
  createdAt: string;
}

export type StockRiskLevel = 'LOW' | 'MEDIUM' | 'CRITICAL' | 'SURPLUS';

export interface InventoryItem {
  inventoryId: string; // FAC_MED
  facilityId: string;
  facilityName: string;
  medicineId: string;
  medicineName: string;
  category: string;
  dosageForm: 'TABLET' | 'SYRUP' | 'INJECTION' | 'SACHET' | 'OINTMENT';
  batchNumber: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  dailyConsumptionRate: number; // rolling avg
  daysOfStock: number;
  riskLevel: StockRiskLevel;
  expiryDate: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  transactionId: string;
  facilityId: string;
  medicineId: string;
  medicineName: string;
  type: 'DISPENSED' | 'RESTOCKED' | 'REDISTRIBUTED_OUT' | 'REDISTRIBUTED_IN';
  quantityChange: number;
  balanceAfter: number;
  referenceId: string;
  performedBy: string;
  timestamp: string;
}

export interface DemandForecastPoint {
  date: string;
  predictedCount: number;
  confidenceLower: number;
  confidenceUpper: number;
  actualCount?: number;
}

export interface DepartmentDemandForecast {
  departmentId: string;
  departmentName: string;
  history: Array<{ date: string; count: number }>;
  forecast: DemandForecastPoint[];
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertCategory =
  | 'STOCK_OUT_RISK'
  | 'QUEUE_OVERFLOW'
  | 'EXPIRY_WARNING'
  | 'SURPLUS_STOCK';

export interface StockAlert {
  alertId: string;
  facilityId: string;
  facilityName: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  metadata?: {
    medicineId?: string;
    medicineName?: string;
    daysOfStock?: number;
    currentStock?: number;
    waitingPatients?: number;
  };
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface ResourceRecommendation {
  recommendationId: string; // REC-YYYYMMDD-XXXX
  sourceFacilityId: string;
  sourceFacilityName: string;
  destFacilityId: string;
  destFacilityName: string;
  medicineId: string;
  medicineName: string;
  suggestedQuantity: number;
  sourceStockBefore: number;
  destDaysOfStockBefore: number;
  distanceKm: number;
  reasoning: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface FederatedTrainingNode {
  stateId: string;
  stateName: string;
  participatingFacilities: number;
  localDatasetSize: number;
  localModelAccuracy: number; // e.g. 91.4%
  weightDeltaNorm: number;
  privacyEpsilon: number;
  lastUpdated: string;
}

export interface UserSession {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  facilityId: string;
  facilityName: string;
  departmentId?: string;
}
