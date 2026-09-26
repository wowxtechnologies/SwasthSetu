// SwasthSetu Authoritative Reactive Operational Store
import {
  Facility,
  Department,
  Doctor,
  Patient,
  Registration,
  QueueTicket,
  Queue,
  Consultation,
  PharmacyOrder,
  InventoryItem,
  InventoryTransaction,
  StockAlert,
  ResourceRecommendation,
  FederatedTrainingNode,
  UserSession,
  UserRole,
  DepartmentDemandForecast
} from '../types';

export const STORAGE_KEY = 'swasthsetu_app_state_v1';

// Seed Initial Facilities
export const SEED_FACILITIES: Facility[] = [
  {
    facilityId: 'FAC-RAIPUR',
    name: 'District Hospital Raipur',
    type: 'DISTRICT_HOSPITAL',
    district: 'Raipur',
    state: 'Chhattisgarh',
    geoPoint: { latitude: 21.2514, longitude: 81.6296 },
    bedCapacity: { total: 350, occupied: 284 },
    contactPhone: '+91 771 2234500',
    address: 'Near Clock Tower, Jail Road, Raipur, CG - 492001',
    isActive: true,
  },
  {
    facilityId: 'FAC-ABHANPUR',
    name: 'PHC Abhanpur (Primary Health Center)',
    type: 'PHC',
    district: 'Raipur',
    state: 'Chhattisgarh',
    geoPoint: { latitude: 21.0537, longitude: 81.7583 },
    bedCapacity: { total: 6, occupied: 4 },
    contactPhone: '+91 771 2822100',
    address: 'Main Road, Abhanpur Block, Raipur, CG - 493661',
    isActive: true,
  },
  {
    facilityId: 'FAC-ARANG',
    name: 'CHC Arang (Community Health Center)',
    type: 'CHC',
    district: 'Raipur',
    state: 'Chhattisgarh',
    geoPoint: { latitude: 21.1925, longitude: 81.9689 },
    bedCapacity: { total: 30, occupied: 22 },
    contactPhone: '+91 771 2854200',
    address: 'Mahanadi Marg, Arang, Raipur, CG - 493441',
    isActive: true,
  },
  {
    facilityId: 'FAC-MANDIR',
    name: 'PHC Mandir Hasaud',
    type: 'PHC',
    district: 'Raipur',
    state: 'Chhattisgarh',
    geoPoint: { latitude: 21.2281, longitude: 81.7735 },
    bedCapacity: { total: 6, occupied: 3 },
    contactPhone: '+91 771 2879300',
    address: 'Station Road, Mandir Hasaud, Raipur, CG - 492101',
    isActive: true,
  }
];

// Seed Initial Departments
export const SEED_DEPARTMENTS: Department[] = [
  {
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    name: 'General Medicine',
    code: 'GM',
    roomNumber: 'Room 104',
    avgConsultationMinutes: 8,
    isActive: true,
  },
  {
    departmentId: 'DEP-PED',
    facilityId: 'FAC-RAIPUR',
    name: 'Pediatrics',
    code: 'PD',
    roomNumber: 'Room 108',
    avgConsultationMinutes: 7,
    isActive: true,
  },
  {
    departmentId: 'DEP-ORTHO',
    facilityId: 'FAC-RAIPUR',
    name: 'Orthopedics',
    code: 'OR',
    roomNumber: 'Room 112',
    avgConsultationMinutes: 10,
    isActive: true,
  },
  {
    departmentId: 'DEP-GYN',
    facilityId: 'FAC-RAIPUR',
    name: 'Obstetrics & Gynecology',
    code: 'GY',
    roomNumber: 'Room 201',
    avgConsultationMinutes: 12,
    isActive: true,
  },
  {
    departmentId: 'DEP-EYE',
    facilityId: 'FAC-RAIPUR',
    name: 'Ophthalmology (Eye)',
    code: 'EY',
    roomNumber: 'Room 205',
    avgConsultationMinutes: 6,
    isActive: true,
  },
  {
    departmentId: 'DEP-ENT',
    facilityId: 'FAC-RAIPUR',
    name: 'Ear, Nose & Throat (ENT)',
    code: 'ENT',
    roomNumber: 'Room 208',
    avgConsultationMinutes: 7,
    isActive: true,
  }
];

// Seed Initial Patients
export const SEED_PATIENTS: Patient[] = [
  {
    patientId: 'PAT-20260926-4891',
    fullName: 'Rajesh Sharma',
    dateOfBirth: '1988-06-14',
    age: 38,
    gender: 'MALE',
    phone: '+91 98765 43210',
    address: {
      villageOrCity: 'Civil Lines, Raipur',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
    },
    preferredLanguage: 'hi',
    emergencyContact: {
      name: 'Pooja Sharma',
      phone: '+91 98765 43211',
      relation: 'Spouse',
    },
    bloodGroup: 'B+',
    knownAllergies: ['Penicillin'],
    createdAt: '2026-09-20T08:30:00Z',
  },
  {
    patientId: 'PAT-20260926-1022',
    fullName: 'Sunita Devi',
    dateOfBirth: '1976-11-20',
    age: 50,
    gender: 'FEMALE',
    phone: '+91 98271 23456',
    address: {
      villageOrCity: 'Telibandha',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492006',
    },
    preferredLanguage: 'hi',
    bloodGroup: 'O+',
    knownAllergies: [],
    createdAt: '2026-09-22T09:15:00Z',
  },
  {
    patientId: 'PAT-20260926-7731',
    fullName: 'Amit Kumar Patel',
    dateOfBirth: '1995-03-08',
    age: 31,
    gender: 'MALE',
    phone: '+91 94252 87654',
    address: {
      villageOrCity: 'Abhanpur Gram',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '493661',
    },
    preferredLanguage: 'hi',
    bloodGroup: 'A+',
    knownAllergies: ['Sulfa drugs'],
    createdAt: '2026-09-25T10:00:00Z',
  },
  {
    patientId: 'PAT-20260926-9044',
    fullName: 'Priya Verma',
    dateOfBirth: '2001-08-19',
    age: 25,
    gender: 'FEMALE',
    phone: '+91 91314 55667',
    address: {
      villageOrCity: 'Samta Colony',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
    },
    preferredLanguage: 'en',
    bloodGroup: 'AB+',
    knownAllergies: [],
    createdAt: '2026-09-26T07:45:00Z',
  },
  {
    patientId: 'PAT-20260926-3312',
    fullName: 'Rameshwar Dewangan',
    dateOfBirth: '1962-04-12',
    age: 64,
    gender: 'MALE',
    phone: '+91 98930 11223',
    address: {
      villageOrCity: 'Arang Ward 4',
      district: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '493441',
    },
    preferredLanguage: 'hi',
    bloodGroup: 'O-',
    knownAllergies: ['Aspirin'],
    createdAt: '2026-09-26T08:00:00Z',
  }
];

// Seed Initial Registrations & Tickets
export const SEED_REGISTRATIONS: Registration[] = [
  {
    registrationId: 'REG-20260926-0038',
    patientId: 'PAT-20260926-1022',
    patientName: 'Sunita Devi',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    visitReason: 'High fever, acute fatigue, and joint pain for 3 days',
    registrationSource: 'DESK',
    tokenNumber: 'GM-038',
    qrCodeData: 'reg_ref_99a8b1c7',
    priorityStatus: 'ROUTINE',
    status: 'IN_CONSULTATION',
    ticketId: 'TCK-20260926-0038',
    createdAt: '2026-09-26T08:15:00Z',
    updatedAt: '2026-09-26T08:45:00Z',
  },
  {
    registrationId: 'REG-20260926-0039',
    patientId: 'PAT-20260926-7731',
    patientName: 'Amit Kumar Patel',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    visitReason: 'Persistent dry cough and mild breathlessness',
    registrationSource: 'KIOSK',
    tokenNumber: 'GM-039',
    qrCodeData: 'reg_ref_33d4e5f6',
    priorityStatus: 'ROUTINE',
    status: 'WAITING',
    ticketId: 'TCK-20260926-0039',
    createdAt: '2026-09-26T08:20:00Z',
    updatedAt: '2026-09-26T08:20:00Z',
  },
  {
    registrationId: 'REG-20260926-0040',
    patientId: 'PAT-20260926-9044',
    patientName: 'Priya Verma',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    visitReason: 'Severe migraine headache and nausea',
    registrationSource: 'WEB',
    tokenNumber: 'GM-040',
    qrCodeData: 'reg_ref_88c7d6e5',
    priorityStatus: 'ROUTINE',
    status: 'WAITING',
    ticketId: 'TCK-20260926-0040',
    createdAt: '2026-09-26T08:25:00Z',
    updatedAt: '2026-09-26T08:25:00Z',
  },
  {
    registrationId: 'REG-20260926-0041',
    patientId: 'PAT-20260926-3312',
    patientName: 'Rameshwar Dewangan',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    visitReason: 'Chest discomfort and dizziness after morning walk',
    registrationSource: 'KIOSK',
    tokenNumber: 'GM-041',
    qrCodeData: 'reg_ref_11b2c3d4',
    priorityStatus: 'URGENT',
    status: 'WAITING',
    ticketId: 'TCK-20260926-0041',
    createdAt: '2026-09-26T08:30:00Z',
    updatedAt: '2026-09-26T08:30:00Z',
  },
  {
    registrationId: 'REG-20260926-0042',
    patientId: 'PAT-20260926-4891',
    patientName: 'Rajesh Sharma',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    visitReason: 'Viral fever, throat irritation, body chills',
    registrationSource: 'WEB',
    tokenNumber: 'GM-042',
    qrCodeData: 'reg_ref_77f8e9a0',
    priorityStatus: 'ROUTINE',
    status: 'WAITING',
    ticketId: 'TCK-20260926-0042',
    createdAt: '2026-09-26T08:35:00Z',
    updatedAt: '2026-09-26T08:35:00Z',
  }
];

export const SEED_TICKETS: QueueTicket[] = [
  {
    ticketId: 'TCK-20260926-0038',
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    registrationId: 'REG-20260926-0038',
    patientId: 'PAT-20260926-1022',
    patientName: 'Sunita Devi',
    tokenNumber: 'GM-038',
    sequenceNumber: 38,
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    priority: 'ROUTINE',
    status: 'IN_CONSULTATION',
    issuedAt: '2026-09-26T08:15:00Z',
    calledAt: '2026-09-26T08:45:00Z',
  },
  {
    ticketId: 'TCK-20260926-0039',
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    registrationId: 'REG-20260926-0039',
    patientId: 'PAT-20260926-7731',
    patientName: 'Amit Kumar Patel',
    tokenNumber: 'GM-039',
    sequenceNumber: 39,
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:20:00Z',
  },
  {
    ticketId: 'TCK-20260926-0040',
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    registrationId: 'REG-20260926-0040',
    patientId: 'PAT-20260926-9044',
    patientName: 'Priya Verma',
    tokenNumber: 'GM-040',
    sequenceNumber: 40,
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:25:00Z',
  },
  {
    ticketId: 'TCK-20260926-0041',
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    registrationId: 'REG-20260926-0041',
    patientId: 'PAT-20260926-3312',
    patientName: 'Rameshwar Dewangan',
    tokenNumber: 'GM-041',
    sequenceNumber: 41,
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    priority: 'URGENT',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:30:00Z',
  },
  {
    ticketId: 'TCK-20260926-0042',
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    registrationId: 'REG-20260926-0042',
    patientId: 'PAT-20260926-4891',
    patientName: 'Rajesh Sharma',
    tokenNumber: 'GM-042',
    sequenceNumber: 42,
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:35:00Z',
  }
];

export const SEED_QUEUES: Queue[] = [
  {
    queueId: 'FAC-RAIPUR_DEP-GENMED_2026-09-26',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 104',
    currentTokenNumber: 'GM-038',
    activeTicketId: 'TCK-20260926-0038',
    totalIssued: 42,
    totalCompleted: 37,
    activeWaitingCount: 4,
    avgServiceTimeMinutes: 8.5,
    updatedAt: new Date().toISOString(),
  },
  {
    queueId: 'FAC-RAIPUR_DEP-PED_2026-09-26',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-PED',
    departmentName: 'Pediatrics',
    roomNumber: 'Room 108',
    currentTokenNumber: 'PD-019',
    activeTicketId: null,
    totalIssued: 22,
    totalCompleted: 19,
    activeWaitingCount: 3,
    avgServiceTimeMinutes: 7.2,
    updatedAt: new Date().toISOString(),
  },
  {
    queueId: 'FAC-RAIPUR_DEP-ORTHO_2026-09-26',
    facilityId: 'FAC-RAIPUR',
    departmentId: 'DEP-ORTHO',
    departmentName: 'Orthopedics',
    roomNumber: 'Room 112',
    currentTokenNumber: 'OR-012',
    activeTicketId: null,
    totalIssued: 15,
    totalCompleted: 12,
    activeWaitingCount: 2,
    avgServiceTimeMinutes: 10.4,
    updatedAt: new Date().toISOString(),
  }
];

// Seed Consultations
export const SEED_CONSULTATIONS: Consultation[] = [
  {
    consultationId: 'CNS-20260926-0037',
    registrationId: 'REG-20260926-0037',
    ticketId: 'TCK-20260926-0037',
    patientId: 'PAT-20260926-4891',
    patientName: 'Rajesh Sharma',
    doctorId: 'DOC-RAIPUR-01',
    doctorName: 'Dr. Alok Verma, MD',
    departmentId: 'DEP-GENMED',
    facilityId: 'FAC-RAIPUR',
    chiefComplaint: 'Intermittent fever and throat pain',
    symptoms: ['Fever', 'Sore Throat', 'Myalgia'],
    vitals: {
      bpSystolic: 124,
      bpDiastolic: 82,
      pulse: 78,
      tempF: 100.8,
      weightKg: 68,
      spo2: 98,
    },
    diagnosis: 'Acute Upper Respiratory Tract Infection (ICD-10 J06.9)',
    clinicalNotes: 'Patient alert. Hydration advised. Prescribed symptomatic antipyretic & antihistaminic.',
    status: 'COMPLETED',
    startedAt: '2026-09-26T08:05:00Z',
    completedAt: '2026-09-26T08:14:00Z',
    prescriptionId: 'RX-20260926-0001',
  }
];

// Seed Pharmacy Orders
export const SEED_PHARMACY_ORDERS: PharmacyOrder[] = [
  {
    orderId: 'RX-20260926-0001',
    consultationId: 'CNS-20260926-0037',
    registrationId: 'REG-20260926-0037',
    patientId: 'PAT-20260926-4891',
    patientName: 'Rajesh Sharma',
    facilityId: 'FAC-RAIPUR',
    doctorName: 'Dr. Alok Verma, MD',
    items: [
      {
        medicineId: 'MED-PCM-500',
        medicineName: 'Paracetamol 500mg Tablets',
        dosage: '1 tab TDS (thrice daily)',
        durationDays: 3,
        quantity: 10,
        instructions: 'Take after meals with water',
      },
      {
        medicineId: 'MED-CET-10',
        medicineName: 'Cetirizine 10mg Tablets',
        dosage: '1 tab OD (once daily at bedtime)',
        durationDays: 5,
        quantity: 5,
        instructions: 'May cause mild drowsiness',
      },
      {
        medicineId: 'MED-ORS',
        medicineName: 'ORS (Oral Rehydration Salts) Sachets',
        dosage: '1 sachet in 1 liter clean water',
        durationDays: 3,
        quantity: 3,
        instructions: 'Sip throughout the day for electrolyte replenishment',
      }
    ],
    dispenseStatus: 'PENDING',
    createdAt: '2026-09-26T08:14:00Z',
  }
];

// Seed Medicine Inventory
export const SEED_INVENTORY: InventoryItem[] = [
  // District Hospital Raipur
  {
    inventoryId: 'FAC-RAIPUR_MED-ORS',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    medicineId: 'MED-ORS',
    medicineName: 'ORS (Oral Rehydration Salts) Sachets',
    category: 'Rehydration & Electrolytes',
    dosageForm: 'SACHET',
    batchNumber: 'ORS-2026-B81',
    currentStock: 3800,
    minimumStock: 800,
    maximumStock: 5000,
    dailyConsumptionRate: 90,
    daysOfStock: 42.2,
    riskLevel: 'SURPLUS',
    expiryDate: '2027-08-31',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-RAIPUR_MED-PCM-500',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    medicineId: 'MED-PCM-500',
    medicineName: 'Paracetamol 500mg Tablets',
    category: 'Antipyretic & Analgesic',
    dosageForm: 'TABLET',
    batchNumber: 'PCM-2026-X12',
    currentStock: 4500,
    minimumStock: 1200,
    maximumStock: 8000,
    dailyConsumptionRate: 150,
    daysOfStock: 30.0,
    riskLevel: 'LOW',
    expiryDate: '2027-12-31',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-RAIPUR_MED-AMX-500',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    medicineId: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg Capsules',
    category: 'Broad Spectrum Antibiotic',
    dosageForm: 'TABLET',
    batchNumber: 'AMX-2026-C44',
    currentStock: 1850,
    minimumStock: 600,
    maximumStock: 3000,
    dailyConsumptionRate: 65,
    daysOfStock: 28.5,
    riskLevel: 'LOW',
    expiryDate: '2027-04-30',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-RAIPUR_MED-MET-500',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    medicineId: 'MED-MET-500',
    medicineName: 'Metformin 500mg Tablets',
    category: 'Antidiabetic (NCD)',
    dosageForm: 'TABLET',
    batchNumber: 'MET-2026-M09',
    currentStock: 2200,
    minimumStock: 700,
    maximumStock: 4000,
    dailyConsumptionRate: 85,
    daysOfStock: 25.8,
    riskLevel: 'LOW',
    expiryDate: '2027-10-15',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-RAIPUR_MED-CET-10',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    medicineId: 'MED-CET-10',
    medicineName: 'Cetirizine 10mg Tablets',
    category: 'Antihistaminic',
    dosageForm: 'TABLET',
    batchNumber: 'CET-2026-A10',
    currentStock: 1600,
    minimumStock: 400,
    maximumStock: 3000,
    dailyConsumptionRate: 50,
    daysOfStock: 32.0,
    riskLevel: 'SURPLUS',
    expiryDate: '2027-06-30',
    updatedAt: new Date().toISOString(),
  },

  // PHC Abhanpur (Primary Health Center - Under Stock-Out Strain!)
  {
    inventoryId: 'FAC-ABHANPUR_MED-ORS',
    facilityId: 'FAC-ABHANPUR',
    facilityName: 'PHC Abhanpur (Primary Health Center)',
    medicineId: 'MED-ORS',
    medicineName: 'ORS (Oral Rehydration Salts) Sachets',
    category: 'Rehydration & Electrolytes',
    dosageForm: 'SACHET',
    batchNumber: 'ORS-2025-V02',
    currentStock: 120, // Only 2.8 days left!
    minimumStock: 450,
    maximumStock: 1200,
    dailyConsumptionRate: 42.8,
    daysOfStock: 2.8,
    riskLevel: 'CRITICAL',
    expiryDate: '2026-11-30',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-ABHANPUR_MED-PCM-500',
    facilityId: 'FAC-ABHANPUR',
    facilityName: 'PHC Abhanpur (Primary Health Center)',
    medicineId: 'MED-PCM-500',
    medicineName: 'Paracetamol 500mg Tablets',
    category: 'Antipyretic & Analgesic',
    dosageForm: 'TABLET',
    batchNumber: 'PCM-2026-P01',
    currentStock: 420,
    minimumStock: 300,
    maximumStock: 1000,
    dailyConsumptionRate: 35,
    daysOfStock: 12.0,
    riskLevel: 'MEDIUM',
    expiryDate: '2027-05-31',
    updatedAt: new Date().toISOString(),
  },

  // CHC Arang (Community Health Center)
  {
    inventoryId: 'FAC-ARANG_MED-AMX-500',
    facilityId: 'FAC-ARANG',
    facilityName: 'CHC Arang (Community Health Center)',
    medicineId: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg Capsules',
    category: 'Broad Spectrum Antibiotic',
    dosageForm: 'TABLET',
    batchNumber: 'AMX-2025-T78',
    currentStock: 210, // Only 4.1 days left!
    minimumStock: 500,
    maximumStock: 1500,
    dailyConsumptionRate: 51,
    daysOfStock: 4.1,
    riskLevel: 'CRITICAL',
    expiryDate: '2026-12-15',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryId: 'FAC-ARANG_MED-ORS',
    facilityId: 'FAC-ARANG',
    facilityName: 'CHC Arang (Community Health Center)',
    medicineId: 'MED-ORS',
    medicineName: 'ORS (Oral Rehydration Salts) Sachets',
    category: 'Rehydration & Electrolytes',
    dosageForm: 'SACHET',
    batchNumber: 'ORS-2026-A12',
    currentStock: 820,
    minimumStock: 400,
    maximumStock: 1500,
    dailyConsumptionRate: 48,
    daysOfStock: 17.1,
    riskLevel: 'LOW',
    expiryDate: '2027-07-20',
    updatedAt: new Date().toISOString(),
  }
];

// Seed Alerts
export const SEED_ALERTS: StockAlert[] = [
  {
    alertId: 'ALT-20260926-001',
    facilityId: 'FAC-ABHANPUR',
    facilityName: 'PHC Abhanpur',
    severity: 'CRITICAL',
    category: 'STOCK_OUT_RISK',
    title: 'Imminent Stock-Out: ORS Sachets (2.8 Days Remaining)',
    message: 'Current stock is 120 sachets against high monsoon diarrheal consumption of 42.8/day. Predicted complete depletion within 68 hours unless replenished.',
    metadata: {
      medicineId: 'MED-ORS',
      medicineName: 'ORS (Oral Rehydration Salts)',
      daysOfStock: 2.8,
      currentStock: 120,
    },
    isAcknowledged: false,
    createdAt: '2026-09-26T06:00:00Z',
  },
  {
    alertId: 'ALT-20260926-002',
    facilityId: 'FAC-ARANG',
    facilityName: 'CHC Arang',
    severity: 'CRITICAL',
    category: 'STOCK_OUT_RISK',
    title: 'High Risk: Amoxicillin 500mg (4.1 Days Remaining)',
    message: 'Antibiotic inventory buffer depleted to 210 capsules due to pediatric respiratory infection surge. Reorder threshold breached.',
    metadata: {
      medicineId: 'MED-AMX-500',
      medicineName: 'Amoxicillin 500mg',
      daysOfStock: 4.1,
      currentStock: 210,
    },
    isAcknowledged: false,
    createdAt: '2026-09-26T06:30:00Z',
  },
  {
    alertId: 'ALT-20260926-003',
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    severity: 'WARNING',
    category: 'QUEUE_OVERFLOW',
    title: 'OPD Congestion: General Medicine Queue Exceeded 40 Patients',
    message: 'Active arrival rate at Kiosks is 1.4x baseline. Average wait time trending above 25 minutes.',
    metadata: {
      waitingPatients: 42,
    },
    isAcknowledged: true,
    acknowledgedBy: 'Dr. Manoj Tiwari (Medical Superintendent)',
    createdAt: '2026-09-26T08:00:00Z',
  }
];

// Seed Resource Recommendations
export const SEED_RECOMMENDATIONS: ResourceRecommendation[] = [
  {
    recommendationId: 'REC-20260926-001',
    sourceFacilityId: 'FAC-RAIPUR',
    sourceFacilityName: 'District Hospital Raipur (Surplus Warehouse)',
    destFacilityId: 'FAC-ABHANPUR',
    destFacilityName: 'PHC Abhanpur (Primary Health Center)',
    medicineId: 'MED-ORS',
    medicineName: 'ORS (Oral Rehydration Salts) Sachets',
    suggestedQuantity: 600,
    sourceStockBefore: 3800,
    destDaysOfStockBefore: 2.8,
    distanceKm: 28.4,
    reasoning: 'District Hospital holds 3,800 units (42 days of stock, surplus status). Transfer of 600 units reduces Raipur stock to 3,200 (still 35.5 days buffer) while extending PHC Abhanpur stock-out horizon from 2.8 days to 16.8 days. Highway distance: 28.4 km (ETA: 45 mins).',
    status: 'PENDING_REVIEW',
    createdAt: '2026-09-26T06:45:00Z',
  },
  {
    recommendationId: 'REC-20260926-002',
    sourceFacilityId: 'FAC-RAIPUR',
    sourceFacilityName: 'District Hospital Raipur',
    destFacilityId: 'FAC-ARANG',
    destFacilityName: 'CHC Arang',
    medicineId: 'MED-AMX-500',
    medicineName: 'Amoxicillin 500mg Capsules',
    suggestedQuantity: 300,
    sourceStockBefore: 1850,
    destDaysOfStockBefore: 4.1,
    distanceKm: 36.2,
    reasoning: 'CHC Arang has only 210 units remaining during monsoon surge. Raipur Hospital has 1,850 units. Transfer of 300 units stabilizes Arang supply to 10.0 days without impacting Raipur emergency buffer.',
    status: 'PENDING_REVIEW',
    createdAt: '2026-09-26T07:15:00Z',
  }
];

// Seed Federated AI Nodes
export const SEED_FEDERATED_NODES: FederatedTrainingNode[] = [
  {
    stateId: 'STATE-CG',
    stateName: 'Chhattisgarh (State A)',
    participatingFacilities: 48,
    localDatasetSize: 142500,
    localModelAccuracy: 92.4,
    weightDeltaNorm: 0.0412,
    privacyEpsilon: 0.85,
    lastUpdated: new Date().toISOString(),
  },
  {
    stateId: 'STATE-OD',
    stateName: 'Odisha (State B)',
    participatingFacilities: 72,
    localDatasetSize: 228000,
    localModelAccuracy: 91.1,
    weightDeltaNorm: 0.0389,
    privacyEpsilon: 0.82,
    lastUpdated: new Date().toISOString(),
  },
  {
    stateId: 'STATE-MP',
    stateName: 'Madhya Pradesh (State C)',
    participatingFacilities: 94,
    localDatasetSize: 315400,
    localModelAccuracy: 92.8,
    weightDeltaNorm: 0.0435,
    privacyEpsilon: 0.88,
    lastUpdated: new Date().toISOString(),
  }
];

export interface AppState {
  currentRole: UserRole;
  currentFacilityId: string;
  facilities: Facility[];
  departments: Department[];
  patients: Patient[];
  registrations: Registration[];
  tickets: QueueTicket[];
  queues: Queue[];
  consultations: Consultation[];
  pharmacyOrders: PharmacyOrder[];
  inventory: InventoryItem[];
  transactions: InventoryTransaction[];
  alerts: StockAlert[];
  recommendations: ResourceRecommendation[];
  federatedNodes: FederatedTrainingNode[];
  federatedRound: number;
}

export function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse saved state, loading seed defaults');
      }
    }
  }

  return {
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
  };
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
