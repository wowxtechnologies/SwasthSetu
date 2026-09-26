import { UserRole } from '../types';

export type Permission =
  | 'patient:register'
  | 'patient:view_self'
  | 'patient:track_queue'
  | 'patient:view_prescriptions'
  | 'queue:view_department'
  | 'queue:call_patient'
  | 'queue:mark_noshow'
  | 'queue:reorder'
  | 'queue:tv_display'
  | 'consultation:start'
  | 'consultation:record_vitals'
  | 'consultation:record_diagnosis'
  | 'consultation:prescribe'
  | 'consultation:order_lab'
  | 'triage:vitals_entry'
  | 'triage:priority_escalation'
  | 'pharmacy:view_queue'
  | 'pharmacy:dispense'
  | 'pharmacy:allergies_check'
  | 'inventory:view'
  | 'inventory:adjust_stock'
  | 'inventory:receive_consignment'
  | 'alerts:view'
  | 'alerts:acknowledge'
  | 'hospital_ops:view_dashboard'
  | 'hospital_ops:manage_capacity'
  | 'hospital_ops:assign_staff'
  | 'district:view_all_facilities'
  | 'district:approve_redistribution'
  | 'district:reject_redistribution'
  | 'state:view_analytics'
  | 'state:federated_ai'
  | 'system:manage_users'
  | 'system:configure_rbac'
  | 'system:view_audit_logs'
  | 'system:emergency_override';

export interface RoleConfig {
  role: UserRole;
  label: string;
  hindiLabel: string;
  badgeClass: string;
  borderClass: string;
  bgLightClass: string;
  description: string;
  allowedTabs: string[];
  defaultTab: string;
  permissions: Permission[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  PATIENT: {
    role: 'PATIENT',
    label: 'Citizen / Patient',
    hindiLabel: 'नागरिक / रोगी',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderClass: 'border-emerald-500',
    bgLightClass: 'bg-emerald-50',
    description: 'Patient self-registration, queue tracking, digital health records, and prescription status.',
    allowedTabs: ['patient', 'kiosk'],
    defaultTab: 'patient',
    permissions: [
      'patient:register',
      'patient:view_self',
      'patient:track_queue',
      'patient:view_prescriptions',
    ],
  },
  DOCTOR: {
    role: 'DOCTOR',
    label: 'Medical Officer (OPD)',
    hindiLabel: 'चिकित्सा अधिकारी',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    borderClass: 'border-blue-500',
    bgLightClass: 'bg-blue-50',
    description: 'Clinical consultations, electronic health records, diagnosis coding, e-prescriptions, and department OPD queue management.',
    allowedTabs: ['doctor', 'queue', 'inventory'],
    defaultTab: 'doctor',
    permissions: [
      'queue:view_department',
      'queue:call_patient',
      'queue:mark_noshow',
      'consultation:start',
      'consultation:record_vitals',
      'consultation:record_diagnosis',
      'consultation:prescribe',
      'consultation:order_lab',
      'inventory:view',
    ],
  },
  NURSE: {
    role: 'NURSE',
    label: 'Nursing Staff (Triage)',
    hindiLabel: 'नर्सिंग अधिकारी',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    borderClass: 'border-teal-500',
    bgLightClass: 'bg-teal-50',
    description: 'Triage prioritization, vital signs recording (BP, SpO2, Temp), queue assistance, and doctor consultation support.',
    allowedTabs: ['doctor', 'queue', 'patient'],
    defaultTab: 'doctor',
    permissions: [
      'queue:view_department',
      'queue:call_patient',
      'triage:vitals_entry',
      'triage:priority_escalation',
      'consultation:record_vitals',
      'patient:view_self',
    ],
  },
  PHARMACIST: {
    role: 'PHARMACIST',
    label: 'Hospital Pharmacist',
    hindiLabel: 'फार्मासिस्ट',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    borderClass: 'border-purple-500',
    bgLightClass: 'bg-purple-50',
    description: 'Prescription dispensing, drug interaction & allergy safety checks, facility stock verification, and dispensing ledger.',
    allowedTabs: ['pharmacy', 'inventory'],
    defaultTab: 'pharmacy',
    permissions: [
      'pharmacy:view_queue',
      'pharmacy:dispense',
      'pharmacy:allergies_check',
      'inventory:view',
      'inventory:adjust_stock',
      'inventory:receive_consignment',
      'alerts:view',
      'alerts:acknowledge',
    ],
  },
  HOSPITAL_ADMIN: {
    role: 'HOSPITAL_ADMIN',
    label: 'Hospital Administrator',
    hindiLabel: 'अस्पताल प्रशासक',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    borderClass: 'border-indigo-500',
    bgLightClass: 'bg-indigo-50',
    description: 'Facility operations dashboard, bed occupancy, department workload, OPD throughput, queue analytics, and local inventory thresholds.',
    allowedTabs: ['hospital_ops', 'inventory', 'queue', 'pharmacy', 'doctor'],
    defaultTab: 'hospital_ops',
    permissions: [
      'hospital_ops:view_dashboard',
      'hospital_ops:manage_capacity',
      'hospital_ops:assign_staff',
      'queue:view_department',
      'queue:tv_display',
      'inventory:view',
      'inventory:adjust_stock',
      'alerts:view',
      'alerts:acknowledge',
    ],
  },
  DISTRICT_ADMIN: {
    role: 'DISTRICT_ADMIN',
    label: 'District Medical Officer (CMHO)',
    hindiLabel: 'मुख्य चिकित्सा एवं स्वास्थ्य अधिकारी',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    borderClass: 'border-amber-500',
    bgLightClass: 'bg-amber-50',
    description: 'District-wide healthcare facility grid monitoring (DH, CHC, PHCs), stock-out risks, and AI inter-facility resource redistribution approval.',
    allowedTabs: ['network', 'hospital_ops', 'inventory', 'queue'],
    defaultTab: 'network',
    permissions: [
      'district:view_all_facilities',
      'district:approve_redistribution',
      'district:reject_redistribution',
      'hospital_ops:view_dashboard',
      'inventory:view',
      'alerts:view',
      'alerts:acknowledge',
    ],
  },
  STATE_ADMIN: {
    role: 'STATE_ADMIN',
    label: 'State Health Mission Director',
    hindiLabel: 'राज्य स्वास्थ्य मिशन निदेशक',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    borderClass: 'border-rose-500',
    bgLightClass: 'bg-rose-50',
    description: 'State-wide health grid telemetry, BigQuery analytics, decentralized Federated AI model training coordination, and macro supply policy.',
    allowedTabs: ['network', 'hospital_ops', 'inventory'],
    defaultTab: 'network',
    permissions: [
      'state:view_analytics',
      'state:federated_ai',
      'district:view_all_facilities',
      'district:approve_redistribution',
      'hospital_ops:view_dashboard',
      'inventory:view',
      'alerts:view',
    ],
  },
  SYSTEM_ADMIN: {
    role: 'SYSTEM_ADMIN',
    label: 'Super Admin / IT Architect',
    hindiLabel: 'प्रणाली प्रशासक',
    badgeClass: 'bg-slate-900 text-amber-300 border-slate-700 shadow-sm',
    borderClass: 'border-slate-800',
    bgLightClass: 'bg-slate-100',
    description: 'Full unconstrained platform control, RBAC policy administration, Firebase Auth orchestration, security auditing, and emergency bypass.',
    allowedTabs: ['doctor', 'patient', 'kiosk', 'queue', 'pharmacy', 'inventory', 'hospital_ops', 'network'],
    defaultTab: 'hospital_ops',
    permissions: [
      'patient:register',
      'patient:view_self',
      'patient:track_queue',
      'patient:view_prescriptions',
      'queue:view_department',
      'queue:call_patient',
      'queue:mark_noshow',
      'queue:reorder',
      'queue:tv_display',
      'consultation:start',
      'consultation:record_vitals',
      'consultation:record_diagnosis',
      'consultation:prescribe',
      'consultation:order_lab',
      'triage:vitals_entry',
      'triage:priority_escalation',
      'pharmacy:view_queue',
      'pharmacy:dispense',
      'pharmacy:allergies_check',
      'inventory:view',
      'inventory:adjust_stock',
      'inventory:receive_consignment',
      'alerts:view',
      'alerts:acknowledge',
      'hospital_ops:view_dashboard',
      'hospital_ops:manage_capacity',
      'hospital_ops:assign_staff',
      'district:view_all_facilities',
      'district:approve_redistribution',
      'district:reject_redistribution',
      'state:view_analytics',
      'state:federated_ai',
      'system:manage_users',
      'system:configure_rbac',
      'system:view_audit_logs',
      'system:emergency_override',
    ],
  },
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_CONFIGS[role]?.permissions.includes(permission) ?? false;
}

export function isTabAllowed(role: UserRole, tab: string): boolean {
  if (role === 'SYSTEM_ADMIN') return true;
  return ROLE_CONFIGS[role]?.allowedTabs.includes(tab) ?? false;
}
