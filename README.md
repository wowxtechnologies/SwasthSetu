# SwasthSetu (स्वस्थसेतु) — Healthcare Access & Resource Intelligence

> **Tagline**: *"Register. Connect. Treat. Predict."*  
> **Mission**: A smart public health grid connecting outpatient registration, touchscreen kiosks, clinical doctor workstations, pharmacy fulfillment, medicine inventory, cross-facility resource redistribution, and AI-driven surge forecasting for Indian public hospitals under the Ayushman Bharat Digital Mission (ABDM).

---

## Table of Contents
1. [Overview & Problem Statement](#overview--problem-statement)
2. [Key Modules & Platform Capabilities](#key-modules--platform-capabilities)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Backend REST API Reference](#backend-rest-api-reference)
6. [Firestore Database Schema & Security](#firestore-database-schema--security)
7. [Prerequisites & System Requirements](#prerequisites--system-requirements)
8. [Installation & Setup](#installation--setup)
9. [How to Run](#how-to-run)
10. [Environment Variables](#environment-variables)
11. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
12. [Interactive Demo & Test Scenarios](#interactive-demo--test-scenarios)

---

## Overview & Problem Statement

Public healthcare institutions across India (District Hospitals, Community Health Centres [CHCs], and Primary Health Centres [PHCs]) manage thousands of daily walk-ins, leading to:
- **Long OPD Queues**: 2–4 hour physical waiting times with zero visibility into queue progression.
- **Fragmented Patient Records**: Lack of continuous electronic records across triage, consultation, and pharmacy counters.
- **Critical Drug Stockouts**: Essential medicines running out unexpectedly without early warning alerts.
- **Resource Imbalance**: Urban tertiary hospitals operating at 120% bed occupancy while nearby rural facilities have available capacity.

**SwasthSetu** resolves these challenges by uniting patients, clinicians, pharmacists, and health administrators into a unified, responsive health network.

---

## Key Modules & Platform Capabilities

### 1. Patient Portal & Online Self-Registration
- **5-Step Registration Wizard**:
  - **Language & Identity**: Multi-lingual selection (Hindi, English, Bengali, Telugu, Tamil, Marathi) + ABHA ID linking or mobile verification.
  - **Patient Demographics**: Full name, 10-digit mobile, age, gender, address, blood group, emergency contact, known drug allergies.
  - **Hospital & Department Selection**: Choose facility with live bed status, room numbers, and estimated wait times.
  - **Symptom Triage**: Chief complaint description, checklist of symptoms, and self-assessed urgency (`ROUTINE`, `URGENT`, `EMERGENCY`).
  - **Review & ABDM Consent**: Confirmation card and consent checkbox for electronic health record generation.
- **Official Digital Token Slip**: Displays assigned Token Number (e.g. `GM-043`), Patient ID (`PAT-...`), Registration ID (`REG-...`), dynamic QR code, and safe iframe-compliant print functionality.

### 2. Dedicated Touchscreen Smart Kiosk (`/kiosk`)
- **Accessible Touch UI**: Extra-large touch targets ($\ge 64\text{px}$–$112\text{px}$) with tactile feedback for elderly citizens.
- **Multilingual Voice Synthesis**: Web Speech API audio assistance reading out instructions, verification greetings, and token call-outs in 6 Indian languages.
- **Multiple Identification Modes**:
  - **12-Key Virtual Numpad**: On-screen numeric keypad for 10-digit mobile patient lookup.
  - **Optical ABHA QR Scanner**: Live camera lens and fast-scan sample card decryption.
  - **On-Screen Touch QWERTY Keyboard**: Allows walk-in citizens to register their name without a physical keyboard.
- **Emergency Casualty Bypass**: Glowing red emergency button for immediate triage bypass issuing token `EM-001` directing directly to Casualty Trauma Ward 1.
- **Perforated 80mm Thermal Slip**: Realistic receipt presentation with automated 30-second security reset countdown.

### 3. Real-Time Patient Queue Tracking (`/patient`)
- **Authoritative Backend Data**: 100% of queue values (serving token, position, wait times, doctor, journey) are fetched from `/api/queue/track`.
- **Live Metrics**:
  - **Current Token**: Patient's assigned outpatient token (e.g. `GM-042`).
  - **Now Serving Inside Room**: Current token being consulted (e.g. `GM-039`).
  - **Patients Ahead**: Exact calculated count of earlier sequence/priority tickets waiting.
  - **Estimated Wait Time**: Calculated dynamically from `(patientsAhead + 1) * avgConsultationMinutes`.
- **Audio Chime Call Alerts**: Automatically announces token calls in Hindi and English when status transitions to `CALLED`.
- **5-Stage Progressive Patient Journey**: Real-time milestone tracker spanning Registration, Triage Vitals, Queue Calling, Doctor Consultation, and Pharmacy Fulfillment.
- **Advance Queue Simulator**: Interactive button allowing doctors or testers to simulate queue progression and watch telemetry update in real time.

### 4. Doctor Consultation Workstation
- **Active OPD Queue**: View waiting, called, and completed patients for the assigned department.
- **Clinical Encounter Workspace**: Past medical history, allergies, triage vitals (BP, SpO2, Pulse, Temp).
- **Diagnosis & e-Prescription**: ICD-10 diagnosis tagging, dosage frequency, duration, special instructions, and one-click direct dispatch to the central dispensary.

### 5. Hospital Pharmacy & Dispensary
- **Live Prescription Queue**: Incoming digital prescriptions from all OPD consultation rooms.
- **Verification & Dispensing**: Barcode scanning, medicine batch tracking, stock depletion, and patient counseling notes.

### 6. Medicine Inventory & Stockout Forecasting
- **Real-Time Stock Depletion**: Tracks essential medicines (ORS Sachets, Paracetamol, Amoxicillin, Metformin, etc.).
- **Smart Reorder Triggers**: Automatic status tagging (`IN_STOCK`, `LOW_STOCK`, `CRITICAL_SHORTAGE`).

### 7. Network Resource Grid & Cross-Facility Redistribution
- **Multi-Facility Telemetry**: Live bed occupancy, ICU beds, oxygen supply, and staff on duty across Raipur District Hospital, CHC Arang, PHC Abhanpur, and Mandir Hasaud Urban PHC.
- **Inter-Facility Resource Transfer**: Request and authorize movement of medicines, equipment, and ambulances across nodes.

### 8. SwasthSetu Operations AI Assistant
- **Gemini 3.8 Flash Powered**: Uses `@google/genai` to analyze queue load, triage priorities, bed availability, and stockout risks.
- **Strict Clinical Safety Boundaries**: Governed by medical safety instructions forbidding unverified automated diagnoses or unauthorized stock movements.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATION (SPA)                      │
│                                                                        │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│   │  Patient Portal  │  │   Touch Kiosk    │  │ Doctor Station   │     │
│   │  & Queue Tracker │  │  (Multi-lingual) │  │   & Pharmacy     │     │
│   └─────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│             │                    │                     │               │
│             ▼                    ▼                     ▼               │
│     React 19 / TypeScript / Tailwind CSS v4 / AppContext & Auth        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           │ HTTP REST Requests                              │ Direct SDK Calls
           ▼                                                 ▼
┌────────────────────────────────────┐             ┌─────────────────────┐
│       NODE.JS EXPRESS BACKEND      │             │  FIREBASE FIRESTORE │
│             (server.ts)            │             │  & AUTHENTICATION   │
├────────────────────────────────────┤             ├─────────────────────┤
│ • /api/queue/track                 │             │ • /patients         │
│ • /api/queue/status                │             │ • /registrations    │
│ • /api/queue/call-next             │             │ • /queues           │
│ • /api/registrations               │             │ • /queueTickets     │
│ • /api/gemini/chat                 │             │ • /prescriptions    │
│ • /api/health                      │             │ • /inventory        │
└──────────────────┬─────────────────┘             │ • /auditLogs        │
                   │                               └─────────────────────┘
                   ▼
┌────────────────────────────────────┐
│      GOOGLE GEMINI 3.8 FLASH       │
│        (@google/genai SDK)         │
│  Predictive Operations Intelligence│
└────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | **React 19.0.1**, **TypeScript 7.0**, **Vite 8.3** |
| **Styling & Design** | **Tailwind CSS v4.3** (CSS-first `@import "tailwindcss";`), Motion 12.2 |
| **Icons & Media** | **Lucide React 0.546**, SVG Barcodes, HTML5 Canvas |
| **Hardware & Browser APIs** | **Web Speech API** (SpeechSynthesis), MediaDevices (Camera), Print API |
| **Backend Server** | **Node.js**, **Express 4.21**, **TSX 4.21** (TypeScript execution) |
| **AI / Large Language Model** | **@google/genai 2.4.0** (`gemini-3.8-flash`) |
| **Database & Cloud Storage** | **Google Cloud Firestore** (NoSQL Document Store) |
| **Authentication & RBAC** | **Firebase Authentication 12.19** with custom claims & role simulation |
| **Security & Auditing** | **Firestore Security Rules** (`firestore.rules`) with write-once immutable audit logs |

---

## Backend REST API Reference

All backend API endpoints are exposed on port `3000` (or `PORT` environment variable).

### 1. Patient Queue Tracking
#### `GET /api/queue/track`
Retrieves live queue telemetry, current room token, position ahead, wait time, and 5-stage journey.

- **Query Parameters**:
  - `tokenNumber` *(optional)*: Outpatient token (e.g. `GM-042`).
  - `ticketId` *(optional)*: Ticket ID (e.g. `TCK-20260926-0042`).
  - `phone` *(optional)*: Registered mobile number.
- **Example Request**:
  ```bash
  curl -s "http://localhost:3000/api/queue/track?tokenNumber=GM-042"
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "data": {
      "tokenNumber": "GM-042",
      "ticketId": "TCK-20260926-0042",
      "registrationId": "REG-20260926-0042",
      "patientId": "PAT-20260926-0042",
      "patientName": "Rajesh Sharma",
      "facilityId": "FAC-RAIPUR",
      "facilityName": "District Hospital Raipur",
      "departmentId": "DEP-GENMED",
      "departmentName": "General Medicine",
      "roomNumber": "Room 102",
      "doctorName": "Dr. Alok Verma, MD (Internal Medicine)",
      "currentTokenNumber": "GM-039",
      "queueStatus": "WAITING",
      "priority": "ROUTINE",
      "sequenceNumber": 42,
      "currentServingSequence": 39,
      "patientsAhead": 3,
      "avgServiceTimeMinutes": 5,
      "estimatedWaitMinutes": 20,
      "totalWaitingInDept": 4,
      "vitals": {
        "bp": "122/82 mmHg",
        "pulse": 76,
        "spo2": 98,
        "tempF": 99.2
      },
      "journey": [
        {
          "stage": "REGISTRATION",
          "title": "OPD Self-Registration & Token Allocation",
          "timestamp": "Today · 08:35 AM",
          "status": "COMPLETED",
          "detail": "Token GM-042 allocated via SwasthSetu Digital Grid"
        },
        {
          "stage": "TRIAGE",
          "title": "Nurse Station Vitals Assessment",
          "timestamp": "Today · 08:40 AM",
          "status": "COMPLETED",
          "detail": "Vitals recorded: BP 122/82 mmHg, SpO2 98%, Pulse 76 bpm"
        },
        {
          "stage": "QUEUE",
          "title": "OPD Waiting Queue & Corridor Calling",
          "timestamp": "Currently Waiting",
          "status": "IN_PROGRESS",
          "detail": "Waiting outside Room 102. 3 patients ahead (~20 mins wait)"
        },
        {
          "stage": "CONSULTATION",
          "title": "Doctor Medical Consultation",
          "timestamp": "Upcoming",
          "status": "UPCOMING",
          "detail": "Dr. Alok Verma, MD (Internal Medicine)"
        },
        {
          "stage": "PHARMACY",
          "title": "Hospital Pharmacy Dispensation",
          "timestamp": "Pending Consultation",
          "status": "UPCOMING",
          "detail": "Collect medications at Central Hospital Pharmacy Counter 2"
        }
      ],
      "lastUpdated": "2026-09-26T11:37:21.328Z"
    }
  }
  ```

---

#### `GET /api/queue/status`
Returns queue telemetry across all medical departments.

- **Example Request**:
  ```bash
  curl -s "http://localhost:3000/api/queue/status"
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "facilityId": "FAC-RAIPUR",
    "facilityName": "District Hospital Raipur",
    "departments": [
      {
        "departmentId": "DEP-GENMED",
        "departmentName": "General Medicine",
        "roomNumber": "Room 102",
        "currentTokenNumber": "GM-039",
        "activeWaitingCount": 4,
        "totalCompleted": 1,
        "avgConsultationMinutes": 5,
        "estimatedWaitMinutes": 25
      }
    ]
  }
  ```

---

#### `POST /api/queue/call-next`
Called by doctors or triage staff to advance the queue, mark the active patient completed, and call the next ticket.

- **Request Body**:
  ```json
  {
    "departmentId": "DEP-GENMED"
  }
  ```
- **Example Request**:
  ```bash
  curl -s -X POST http://localhost:3000/api/queue/call-next \
    -H "Content-Type: application/json" \
    -d '{"departmentId":"DEP-GENMED"}'
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Now calling Token GM-040",
    "calledTicket": {
      "ticketId": "TCK-20260926-0040",
      "patientName": "Mohammad Farooq",
      "tokenNumber": "GM-040",
      "status": "CALLED",
      "calledAt": "2026-09-26T11:35:13.128Z"
    },
    "currentTokenNumber": "GM-040"
  }
  ```

---

### 2. Patient Registration
#### `POST /api/registrations`
Creates a validated outpatient encounter, generates sequential token and IDs, and logs audit record.

- **Request Body**:
  ```json
  {
    "fullName": "Anita Verma",
    "phone": "9826112345",
    "dateOfBirth": "1992-04-10",
    "gender": "FEMALE",
    "facilityId": "FAC-RAIPUR",
    "departmentId": "DEP-GENMED",
    "visitReason": "High grade fever and cough",
    "priorityStatus": "URGENT",
    "preferredLanguage": "hi"
  }
  ```
- **Example Request**:
  ```bash
  curl -s -X POST http://localhost:3000/api/registrations \
    -H "Content-Type: application/json" \
    -d '{"fullName":"Anita Verma","phone":"9826112345","dateOfBirth":"1992-04-10","gender":"FEMALE","facilityId":"FAC-RAIPUR","departmentId":"DEP-GENMED","visitReason":"High grade fever and cough","priorityStatus":"URGENT"}'
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Online patient registration successfully processed",
    "data": {
      "registrationId": "REG-20260926-B981",
      "patientId": "PAT-20260926-B981",
      "ticketId": "TCK-20260926-B981",
      "tokenNumber": "GM-041",
      "sequenceNumber": 41,
      "status": "WAITING",
      "qrCodeData": "reg_ref_m0zpg3ze"
    }
  }
  ```

---

### 3. AI Operations Assistant
#### `POST /api/gemini/chat`
Server-side Gemini 3.8 Flash operational guidance.

- **Request Body**:
  ```json
  {
    "message": "What is the current queue state in General Medicine?",
    "role": "DOCTOR",
    "context": {
      "facilityId": "FAC-RAIPUR",
      "waitingPatients": 4
    }
  }
  ```
- **Example Request**:
  ```bash
  curl -s -X POST http://localhost:3000/api/gemini/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"What is the current queue state in General Medicine?","role":"DOCTOR"}'
  ```

---

### 4. Health Check
#### `GET /api/health`
Returns service uptime and AI configuration status.

- **Example Request**:
  ```bash
  curl -s http://localhost:3000/api/health
  ```
- **Example Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-26T11:31:54.924Z",
    "service": "SwasthSetu Health Grid",
    "aiConfigured": true
  }
  ```

---

## Firestore Database Schema & Security

The platform connects to Firestore DB (`ai-studio-swasthsetuhealth-e50cd4d8-950a-4910-81ab-b251abb1f38e`) with the following collections:

```
├── /patients/{patientId}
│   └── Fields: fullName, phone, dateOfBirth, age, gender, bloodGroup, address, ownerUid, createdAt
├── /registrations/{registrationId}
│   └── Fields: patientId, patientName, facilityId, departmentId, tokenNumber, visitReason, status, priorityStatus, ticketId
├── /queues/{queueId}
│   └── Fields: facilityId, departmentId, date, currentSequence, activeWaitingCount, avgServiceTimeMinutes
├── /queueTickets/{ticketId}
│   └── Fields: queueId, registrationId, patientId, tokenNumber, sequenceNumber, priority, status, issuedAt, calledAt
├── /prescriptions/{prescriptionId}
│   └── Fields: registrationId, patientId, doctorId, items: [{ medicineId, name, dosage, frequency, days }], status
├── /inventory/{inventoryId}
│   └── Fields: facilityId, medicineId, medicineName, currentStock, reorderLevel, unit, batchNumber
├── /facilities/{facilityId}
│   └── Fields: name, type, district, bedCapacity: { total, occupied }, contactNumber
└── /auditLogs/{logId}
    └── Fields: actorUid, actorRole, action, resourceType, resourceId, details, timestamp (Write-once immutable)
```

### Security Rules Highlights (`firestore.rules`)
- **Strict Role-Based Access Control**: Validates roles (`SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `PHARMACIST`, `PATIENT`).
- **Owner-Scoped Patient Privacy**: Patients can only read/write their own profiles; healthcare staff can access records within their assigned hospital facility.
- **Write-Once Audit Logs**: Security rules prohibit updates or deletions to `/auditLogs/{logId}`, ensuring tamper-proof compliance logs.

---

## Prerequisites & System Requirements

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `bun`
- **Modern Browser**: Chrome, Edge, Firefox, or Safari with Web Speech & MediaDevices support.

---

## Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd swasthsetu
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for server-side operations intelligence (`gemini-3.8-flash`). |
| `PORT` | Optional | Port for the Express server (defaults to `3000`). |
| `APP_URL` | Optional | Public URL of the deployed application. |
| `NODE_ENV` | Optional | `development` or `production`. |

---

## How to Run

### Development Mode (with Live Hot-Reloading)
Runs the unified full-stack server with Vite middleware on port 3000:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Type-Checking & Linting
Validates TypeScript typings across client and server:
```bash
npm run lint
```

### Production Build & Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

---

## Role-Based Access Control (RBAC)

The top navigation bar includes an **Instant Role Switcher** to test all workflows:

| Role | Interface | Primary Responsibilities |
| :--- | :--- | :--- |
| **PATIENT** | `/patient` | Online registration, live queue tracking, digital health card, personal timeline. |
| **KIOSK** | `/kiosk` | Walk-in touchscreen terminal, multilingual voice, numpad lookup, optical QR scan. |
| **DOCTOR** | `/doctor` | Call next token, examine vitals, diagnose ICD-10, generate digital prescriptions. |
| **PHARMACIST**| `/pharmacy` | Review incoming e-prescriptions, verify dosages, dispense medications. |
| **HOSPITAL_ADMIN** | `/network` | Bed occupancy tracking, stock reorders, inter-facility resource redistribution. |

---

## Interactive Demo & Test Scenarios

### Scenario A: Track an Outpatient Token (Live Backend Data)
1. Navigate to **Patient Portal** (`/patient`) ➔ Click **Live Queue Tracker**.
2. Tap on any sample token button:
   - `GM-042` (Rajesh Sharma — 3 patients ahead, ~20 mins wait).
   - `GM-039` (Kavita Nishad — Currently inside room with the doctor).
   - `GM-040` (Mohammad Farooq — 1 patient ahead, ~10 mins wait).
3. Click the purple **Advance Queue** button. Notice:
   - Token advances on the backend server (`server.ts`).
   - Patients ahead counter decrements.
   - Estimated wait time updates dynamically.
   - Speech synthesis chimes when a token is called.

### Scenario B: Walk-in Kiosk Registration
1. Navigate to **Smart Kiosk** (`/kiosk`).
2. Select preferred language (e.g. **हिंदी** or **English**).
3. Tap **Enter Mobile Phone** ➔ Enter `9876543210` on the touch numpad.
4. Patient *Rajesh Sharma* is recognized. Confirm identity ➔ Select **General Medicine (Room 102)**.
5. Tap symptoms (e.g., *Fever*, *Cold & Cough*) ➔ Tap **PRINT QUEUE TOKEN NOW**.
6. View the realistic 80mm thermal receipt with Token Number and scannable QR code.

### Scenario C: Doctor Calling & Pharmacy Dispensing
1. Switch role to **DOCTOR** ➔ View the General Medicine queue.
2. Click **Call Patient** on Token `GM-042`.
3. Add diagnosis (*Acute Upper Respiratory Infection*) and prescribe *Paracetamol 500mg* + *Cetirizine 10mg*.
4. Click **Complete & Send to Pharmacy**.
5. Switch role to **PHARMACIST** ➔ View the new prescription in the queue ➔ Click **Dispense**.

---

## License

Developed under the **Ayushman Bharat Digital Mission (ABDM)** digital health guidelines for Indian public healthcare facilities.
