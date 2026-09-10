import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistence directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory data store with file persistence
interface UserAccount {
  id: string;
  username: string;
  email: string;
  password: string; // Plain for local demo simplicity
  name: string;
  phone?: string;
  role: 'admin' | 'receptionist';
  createdAt: string;
}

interface UserWeddingData {
  eventInfo: any;
  guests: any[];
  logs: any[];
  updatedAt: string;
  revision: number;
}

interface DatabaseSchema {
  users: Record<string, UserAccount>; // keyed by username lowercase
  userData: Record<string, UserWeddingData>; // keyed by userId
}

// Default initial data for admin demo account
const DEFAULT_ADMIN_ID = 'usr_admin_default';
const initialEvent = {
  coupleTitle: 'Budi & Siti Wedding',
  fullTitle: 'BUDI & SITI — Resepsi Siang & Malam',
  groomName: 'Budi Pratama, S.T.',
  brideName: 'Siti Nurhaliza, S.E.',
  dateStr: 'Minggu, 20 September 2026',
  timeStr: '10:00 - 21:00 WIB',
  location: 'Gedung Serbaguna, Jakarta',
  hall: 'Ballroom Lantai 2',
  targetGuests: 600,
  souvenirStock: 650,
  serverSyncIntervalSeconds: 0.2,
  version: 'v.1.0.2 (Build 2026.09-release)',
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading db.json, creating new', err);
  }

  // Create default admin user
  const initialDb: DatabaseSchema = {
    users: {
      'admin@bukuajaib.id': {
        id: DEFAULT_ADMIN_ID,
        username: 'admin@bukuajaib.id',
        email: 'admin@bukuajaib.id',
        password: 'password123',
        name: 'Admin Pernikahan',
        phone: '0812-3456-7890',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      admin: {
        id: DEFAULT_ADMIN_ID,
        username: 'admin',
        email: 'admin@bukuajaib.id',
        password: 'password123',
        name: 'Admin Pernikahan',
        phone: '0812-3456-7890',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    },
    userData: {
      [DEFAULT_ADMIN_ID]: {
        eventInfo: initialEvent,
        guests: [],
        logs: [],
        updatedAt: new Date().toISOString(),
        revision: 1,
      },
    },
  };

  saveDatabase(initialDb);
  return initialDb;
}

let db = loadDatabase();

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json', err);
  }
}

// SSE Connection Management for 2+ devices per user
const sseClients: Record<string, express.Response[]> = {};

function broadcastUserUpdate(userId: string, data: any) {
  const clients = sseClients[userId];
  if (!clients || clients.length === 0) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => {
    try {
      res.write(payload);
    } catch (e) {
      // client dropped
    }
  });
}

// ================= API ROUTES =================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. User Registration
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name, phone, role, groomName, brideName, eventDate } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan kata sandi wajib diisi!' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (db.users[cleanUsername]) {
    return res.status(400).json({ success: false, message: 'Username sudah terdaftar, gunakan nama lain atau silakan Masuk!' });
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser: UserAccount = {
    id: userId,
    username: cleanUsername,
    email: email ? email.trim() : `${cleanUsername}@bukuajaib.id`,
    password: password.trim(),
    name: name ? name.trim() : username,
    phone: phone ? phone.trim() : '',
    role: role === 'receptionist' ? 'receptionist' : 'admin',
    createdAt: new Date().toISOString(),
  };

  db.users[cleanUsername] = newUser;
  if (email && email.trim()) {
    db.users[email.trim().toLowerCase()] = newUser;
  }

  // Personalize new user's wedding event
  const userGroom = groomName ? groomName.trim() : `${newUser.name} & Pasangan`;
  const userBride = brideName ? brideName.trim() : 'Mempelai Terkasih';
  const userTitle = groomName && brideName ? `${groomName} & ${brideName} Wedding` : `Pernikahan ${newUser.name}`;

  db.userData[userId] = {
    eventInfo: {
      ...initialEvent,
      coupleTitle: userTitle,
      fullTitle: `${userGroom.toUpperCase()} & ${userBride.toUpperCase()} — Resepsi Pernikahan`,
      groomName: userGroom,
      brideName: userBride,
      dateStr: eventDate || 'Minggu, 20 September 2026',
    },
    guests: [],
    logs: [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        message: `Akun pendaftar baru ${newUser.name} berhasil dibuat. Sistem siap disinkronisasi ke perangkat lain.`,
        type: 'update',
        color: 'emerald',
      },
    ],
    updatedAt: new Date().toISOString(),
    revision: 1,
  };

  saveDatabase(db);

  return res.json({
    success: true,
    message: 'Pendaftaran berhasil!',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      desk: newUser.role === 'admin' ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1',
    },
    data: db.userData[userId],
  });
});

// 3. User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password, desk } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan kata sandi wajib diisi!' });
  }

  const cleanUser = username.trim().toLowerCase();
  const user = db.users[cleanUser];

  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ success: false, message: 'Username atau kata sandi tidak cocok!' });
  }

  // Ensure user data exists
  if (!db.userData[user.id]) {
    db.userData[user.id] = {
      eventInfo: {
        ...initialEvent,
        coupleTitle: `Pernikahan ${user.name}`,
        groomName: `${user.name}`,
        brideName: 'Pasangan',
      },
      guests: [],
      logs: [],
      updatedAt: new Date().toISOString(),
      revision: 1,
    };
    saveDatabase(db);
  }

  return res.json({
    success: true,
    message: 'Berhasil masuk ke Buku Ajaib!',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      desk: desk || (user.role === 'admin' ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1'),
    },
    data: db.userData[user.id],
  });
});

// 4. Get User Wedding Data
app.get('/api/user/data/:userId', (req, res) => {
  const { userId } = req.params;
  const data = db.userData[userId];

  if (!data) {
    return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
  }

  res.json({ success: true, data });
});

// 5. Update User Wedding Data (Guests, Logs, Event)
app.post('/api/user/data/:userId', (req, res) => {
  const { userId } = req.params;
  const { guests, logs, eventInfo, clientRevision } = req.body;

  let userRecord = db.userData[userId];
  if (!userRecord) {
    userRecord = {
      eventInfo: eventInfo || initialEvent,
      guests: guests || [],
      logs: logs || [],
      updatedAt: new Date().toISOString(),
      revision: 1,
    };
    db.userData[userId] = userRecord;
  } else {
    if (guests !== undefined) userRecord.guests = guests;
    if (logs !== undefined) userRecord.logs = logs;
    if (eventInfo !== undefined) userRecord.eventInfo = eventInfo;
    userRecord.revision = (userRecord.revision || 0) + 1;
    userRecord.updatedAt = new Date().toISOString();
  }

  saveDatabase(db);

  // Broadcast to all other devices connected for this user account!
  broadcastUserUpdate(userId, {
    type: 'SYNC_UPDATE',
    data: userRecord,
  });

  res.json({ success: true, revision: userRecord.revision });
});

// 6. Update Wedding Event Info Only
app.post('/api/user/event-settings/:userId', (req, res) => {
  const { userId } = req.params;
  const { eventInfo } = req.body;

  if (!db.userData[userId]) {
    return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
  }

  db.userData[userId].eventInfo = {
    ...db.userData[userId].eventInfo,
    ...eventInfo,
  };
  db.userData[userId].revision = (db.userData[userId].revision || 0) + 1;
  db.userData[userId].updatedAt = new Date().toISOString();

  // Add a log for event setting change
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  db.userData[userId].logs.unshift({
    id: `log-${Date.now()}`,
    time: currentTime,
    message: `Pengaturan acara diperbarui: ${eventInfo.coupleTitle || eventInfo.fullTitle}`,
    type: 'update',
    color: 'emerald',
  });

  saveDatabase(db);

  broadcastUserUpdate(userId, {
    type: 'SYNC_UPDATE',
    data: db.userData[userId],
  });

  res.json({ success: true, data: db.userData[userId] });
});

// 7. Server-Sent Events (SSE) for Real-Time 2-Device Synchronization
app.get('/api/sync/stream/:userId', (req, res) => {
  const { userId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!sseClients[userId]) {
    sseClients[userId] = [];
  }
  sseClients[userId].push(res);

  // Initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', userId, time: new Date().toISOString() })}\n\n`);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    if (sseClients[userId]) {
      sseClients[userId] = sseClients[userId].filter((client) => client !== res);
    }
  });
});

// ================= VITE INTEGRATION =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    // Intercept /@vite/client in dev to cleanly neutralize HMR connection attempts
    // since HMR is intentionally disabled in AI Studio container environment.
    app.use((req, res, next) => {
      const url = req.originalUrl || req.url;
      if (url === '/@vite/client' || url.startsWith('/@vite/client?')) {
        const originalEnd = res.end;
        const chunks: Buffer[] = [];

        res.write = function (chunk: any) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        };

        res.end = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          let body = Buffer.concat(chunks).toString('utf-8');

          body = body.replace(
            /async connect\(handlers\) \{[\s\S]*?async disconnect/,
            'async connect(handlers) { return; }, async disconnect'
          );
          body = body.replace(/error:\s*\(err\)\s*=>\s*console\.error\("[^"]*",\s*err\)/g, 'error: () => {}');
          body = body.replace(/debug:\s*\(\.\.\.msg\)\s*=>\s*console\.debug\("[^"]*",\s*\.\.\.msg\)/g, 'debug: () => {}');
          body = body.replace(/console\.debug\([^\)]*\[vite\][^\)]*\);?/g, '');
          body = body.replace(/console\.info\([^\)]*\[vite\][^\)]*\);?/g, '');
          body = body.replace(/console\.log\([^\)]*\[vite\][^\)]*\);?/g, '');
          body = body.replace(/console\.error\([^\)]*\[vite\][^\)]*\);?/g, '');

          res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          res.setHeader('Content-Length', Buffer.byteLength(body));
          return originalEnd.call(this, body, ...args);
        };
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Buku Ajaib Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
