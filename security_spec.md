# SwasthSetu Healthcare Access & RBAC Security Specification

## 1. Data Invariants

1. **Identity & Role Partitioning**:
   - A user cannot self-assign or elevate their role (e.g., standard patient cannot set `role: "SYSTEM_ADMIN"` or `role: "DOCTOR"`).
   - Only administrators or authenticated staff can access multi-facility operational telemetries.
   - PII records in `/patients/{patientId}` are only accessible to the patient themselves or authorized medical staff (`DOCTOR`, `NURSE`, `HOSPITAL_ADMIN`, `SYSTEM_ADMIN`).

2. **Clinical Data Integrity**:
   - Consultations (`/consultations/{consultationId}`) can only be created and finalized by authenticated medical doctors (`DOCTOR`).
   - Patients can never modify consultation diagnoses, clinical notes, or prescription references.

3. **Pharmacy Dispensation Invariant**:
   - Pharmacy orders (`/pharmacyOrders/{orderId}`) can only transition to `DISPENSED` by authenticated pharmacists (`PHARMACIST` or `SYSTEM_ADMIN`).
   - Dispensing updates must atomically record `dispensedByUid` matching `request.auth.uid`.

4. **Inventory & Inter-Facility Redistribution**:
   - Inventory adjustments (`/inventory/{inventoryId}`) require authorized staff (`PHARMACIST`, `HOSPITAL_ADMIN`, `DISTRICT_ADMIN`, `SYSTEM_ADMIN`).
   - Inter-facility redistribution approvals (`/recommendations/{recId}`) require district or state health administrators (`DISTRICT_ADMIN`, `STATE_ADMIN`, `SYSTEM_ADMIN`).

5. **Temporal & Path Immutability**:
   - Document IDs must conform to alphanumeric formatting `isValidId()`.
   - Immutable fields (`createdAt`, `patientId`, `ownerUid`) cannot be tampered with on update.

---

## 2. The "Dirty Dozen" Threat Payloads (Must be Denied)

1. **Payload 1 (Privilege Escalation on User Creation)**:
   A new user registers with payload `{ "role": "SYSTEM_ADMIN", "uid": "attacker-uid" }` without admin authorization. -> REJECTED.
2. **Payload 2 (Patient Impersonation / PII Snooping)**:
   User `A` tries to read patient document `/patients/PAT-XYZ` where `ownerUid == "user-B"`. -> REJECTED.
3. **Payload 3 (Doctor Diagnosis Forgery)**:
   A user with role `PATIENT` or unauthenticated actor creates a document in `/consultations`. -> REJECTED.
4. **Payload 4 (Unauthorized Pharmacy Dispensation)**:
   A user with role `NURSE` or `PATIENT` marks a pharmacy order `/pharmacyOrders/RX-123` as `DISPENSED`. -> REJECTED.
5. **Payload 5 (Ghost Field Injection / Shadow Update)**:
   An attacker updates `/users/{uid}` injecting `__adminOverride: true` or `isSuperUser: true`. -> REJECTED.
6. **Payload 6 (Inventory Balance Tampering)**:
   An unauthenticated or patient user writes arbitrary stock values to `/inventory/FAC_MED_1`. -> REJECTED.
7. **Payload 7 (Redistribution Self-Approval)**:
   A hospital-level staff member attempts to approve an inter-facility transfer without `DISTRICT_ADMIN` or `STATE_ADMIN` role. -> REJECTED.
8. **Payload 8 (Queue Number Jumping / Token Sequence Tampering)**:
   A patient modifies their queue ticket status from `WAITING` directly to `IN_CONSULTATION` without doctor call. -> REJECTED.
9. **Payload 9 (Terminal State Bypass)**:
   Updating a consultation once status is already `COMPLETED`. -> REJECTED.
10. **Payload 10 (Path Traversal / ID Poisoning)**:
    Attempting to write with an invalid document ID containing path injection characters like `../../users`. -> REJECTED.
11. **Payload 11 (Audit Log Tampering)**:
    Attempting to edit or delete existing entries in `/auditLogs/{logId}`. -> REJECTED (Audit logs are strictly write-once, never update/delete).
12. **Payload 12 (Blanket Query Scraping)**:
    Attempting to perform unconstrained queries against `/patients` collection without appropriate medical staff credentials. -> REJECTED.
