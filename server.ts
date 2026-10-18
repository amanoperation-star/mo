import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS & Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
import {
  initialStudents,
  initialCourses,
  initialExpenses,
  initialStaff,
  initialAuditLogs,
  initialNotifications,
} from './src/data/initialData';

// ==========================================
// PERSISTENT SERVER DATABASE STORAGE
// ==========================================
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'server_db.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Error creating data directory:', e);
  }
}

interface ServerDatabase {
  students: any[];
  courses: any[];
  expenses: any[];
  staff: any[];
  logs: any[];
  notifications: any[];
  centerSettings: any;
}

function loadInitialDatabase(): ServerDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.students)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading existing server_db.json, reinitializing:', e);
    }
  }

  // Fallback defaults with initial academic records
  const defaultDb: ServerDatabase = {
    students: initialStudents || [],
    courses: initialCourses || [],
    expenses: initialExpenses || [],
    staff: initialStaff || [],
    logs: initialAuditLogs || [],
    notifications: initialNotifications || [],
    centerSettings: {
      centerName: 'منظومة مستر أشرف السقا 2025',
      phoneNumber: '01012345678',
      platformUrl: 'https://el-saqqa-chem.online',
      academicYear: '2025 - 2026',
      teacherName: 'أ. أشرف السقا',
      managerName: 'أك. محمود عزت',
      systemDescription: 'النظام السحابي الأكاديمي لإدارة شؤون الطلاب والماليات وإيصالات الدفع',
      receiptSystemTitle: 'منظومة مستر أشرف السقا الأكاديمية للكيمياء',
      receiptFooterText: 'نتمنى لجميع الطلاب التوفيق والدرجات النهائية في الكيمياء بإذن الله 🧪✨',
    },
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  } catch (e) {}

  return defaultDb;
}

let db: ServerDatabase = loadInitialDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to server_db.json:', e);
  }
}

// ==========================================
// REAL-TIME BROADCAST ENGINE (WS + SSE)
// ==========================================
const wsClients = new Set<WebSocket>();
const sseClients = new Set<express.Response>();

export function broadcastPayload(payload: any) {
  const jsonStr = JSON.stringify(payload);

  // 1. WebSocket Broadcast to all active clients
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonStr);
      } catch (e) {
        console.error('Error sending WS message:', e);
      }
    }
  });

  // 2. Server-Sent Events (SSE) broadcast to all open streams
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${jsonStr}\n\n`);
    } catch (e) {
      console.error('Error sending SSE message:', e);
    }
  });
}

function processPayloadAndSyncDb(payload: any) {
  if (!payload || !payload.type) return;

  if (payload.type === 'STUDENT_ADDED' && payload.data?.student) {
    const student = payload.data.student;
    const exists = db.students.some((s) => s.id === student.id);
    if (!exists) {
      db.students.unshift(student);
      saveDatabase();
    }
  } else if (payload.type === 'STUDENT_DELETED' && payload.data?.studentId) {
    db.students = db.students.filter((s) => s.id !== payload.data.studentId);
    saveDatabase();
  } else if (payload.type === 'STUDENT_UPDATED' && payload.data?.student) {
    const student = payload.data.student;
    db.students = db.students.map((s) => (s.id === student.id ? student : s));
    saveDatabase();
  } else if (payload.type === 'STUDENTS_UPDATED' && Array.isArray(payload.data?.studentIds)) {
    const ids = new Set(payload.data.studentIds);
    db.students = db.students.filter((s) => !ids.has(s.id));
    saveDatabase();
  } else if (payload.type === 'STUDENTS_CLEARED') {
    db.students = [];
    saveDatabase();
  } else if (payload.type === 'EXPENSE_ADDED' && payload.data?.expense) {
    const expense = payload.data.expense;
    if (!db.expenses.some((e) => e.id === expense.id)) {
      db.expenses.unshift(expense);
      saveDatabase();
    }
  } else if (payload.type === 'EXPENSE_DELETED' && payload.data?.expenseId) {
    db.expenses = db.expenses.filter((e) => e.id !== payload.data.expenseId);
    saveDatabase();
  }

  // Handle Notifications in payload
  if (payload.notification) {
    const notif = payload.notification;
    if (!db.notifications.some((n) => n.id === notif.id)) {
      db.notifications.unshift(notif);
      if (db.notifications.length > 100) {
        db.notifications = db.notifications.slice(0, 100);
      }
      saveDatabase();
    }
  } else if (payload.actionTitle) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: payload.actionTitle,
      details: payload.actionDetails || '',
      user: payload.senderUser || 'أك. محمود عزت',
      timestamp: 'الآن',
      type: 'info',
      read: false,
      status: 'unread',
      linkScreen: payload.linkScreen,
    };
    db.notifications.unshift(newNotif);
    if (db.notifications.length > 100) {
      db.notifications = db.notifications.slice(0, 100);
    }
    payload.notification = newNotif;
    saveDatabase();
  }
}

// Setup WebSocket Server on /ws
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`📡 Realtime WebSocket connected. Active team connections: ${wsClients.size}`);

  // Send initial welcome/status
  ws.send(JSON.stringify({ type: 'WS_CONNECTED', activeClients: wsClients.size }));

  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message.toString());
      processPayloadAndSyncDb(payload);
      // Broadcast to all team members
      broadcastPayload(payload);
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`📡 Realtime WebSocket closed. Active team connections: ${wsClients.size}`);
  });

  ws.on('error', (err) => {
    console.warn('WS Client Error:', err);
    wsClients.delete(ws);
  });
});

// ==========================================
// REST API ROUTES
// ==========================================

// SSE (Server-Sent Events) Stream
app.get('/api/realtime/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'SSE_CONNECTED', time: Date.now() })}\n\n`);
  sseClients.add(res);

  const pingTimer = setInterval(() => {
    try {
      res.write(':ping\n\n');
    } catch (e) {
      clearInterval(pingTimer);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(pingTimer);
    sseClients.delete(res);
  });
});

// Broadcast Realtime Action to all Team Members
app.post('/api/realtime/broadcast', (req, res) => {
  const payload = req.body;
  if (!payload || !payload.type) {
    return res.status(400).json({ error: 'Invalid realtime payload' });
  }

  processPayloadAndSyncDb(payload);
  broadcastPayload(payload);

  return res.json({
    success: true,
    activeWsClients: wsClients.size,
    activeSseClients: sseClients.size,
  });
});

// Fetch all shared team data
app.get('/api/sync/all', (req, res) => {
  res.json({
    students: db.students,
    courses: db.courses,
    expenses: db.expenses,
    staff: db.staff,
    logs: db.logs,
    notifications: db.notifications,
    centerSettings: db.centerSettings,
  });
});

// Bulk update / sync
app.post('/api/sync/all', (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ error: 'No data provided' });

  if (Array.isArray(data.students)) db.students = data.students;
  if (Array.isArray(data.courses)) db.courses = data.courses;
  if (Array.isArray(data.expenses)) db.expenses = data.expenses;
  if (Array.isArray(data.staff)) db.staff = data.staff;
  if (Array.isArray(data.logs)) db.logs = data.logs;
  if (Array.isArray(data.notifications)) db.notifications = data.notifications;
  if (data.centerSettings) db.centerSettings = data.centerSettings;

  saveDatabase();
  res.json({ success: true, message: 'All data updated successfully' });
});

// Single student sync
app.post('/api/sync/students', (req, res) => {
  const student = req.body;
  if (!student || !student.id) {
    return res.status(400).json({ error: 'Invalid student data' });
  }

  const idx = db.students.findIndex((s) => s.id === student.id);
  if (idx >= 0) {
    db.students[idx] = student;
  } else {
    db.students.unshift(student);
  }
  saveDatabase();

  res.json({ success: true, student });
});

// Single student delete
app.delete('/api/sync/students/:id', (req, res) => {
  const id = req.params.id;
  db.students = db.students.filter((s) => s.id !== id);
  saveDatabase();
  res.json({ success: true, deletedId: id });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    activeWsClients: wsClients.size,
    activeSseClients: sseClients.size,
    studentsCount: db.students.length,
  });
});

// Root redirect for base path '/mo/'
app.get('/', (req, res, next) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.redirect('/mo/');
  }
  next();
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Academic & Realtime Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server startup error:', err);
  process.exit(1);
});
