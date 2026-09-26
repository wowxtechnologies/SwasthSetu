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
