import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// ===== SERVE STATIC FRONTEND =====
const DIST_DIR = path.join(__dirname, '../client/dist');
app.use(express.static(DIST_DIR));

// ===== API KEY PROTECTION =====
const API_KEY = process.env.TIMMYOS_API_KEY || 'timmy-dev-key-change-in-production';

function requireApiKey(req, res, next) {
  const providedKey = req.headers['x-api-key'];
  if (!providedKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  if (providedKey !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
}

// Apply API key protection to all API routes
app.use('/api', requireApiKey);

const CLAWD_DIR = '/home/treyti/clawd';
const MEMORY_DIR = path.join(CLAWD_DIR, 'memory');
const KANBAN_FILE = path.join(CLAWD_DIR, 'kanban', 'tasks.json');

// ===== SYSTEM HEALTH =====
async function getSystemHealth() {
  try {
    // RAM
    const memInfo = await fs.readFile('/proc/meminfo', 'utf8');
    const memTotal = parseInt(memInfo.match(/MemTotal:\s+(\d+)/)[1]) * 1024;
    const memAvailable = parseInt(memInfo.match(/MemAvailable:\s+(\d+)/)[1]) * 1024;
    const memUsed = memTotal - memAvailable;
    const memPercent = Math.round((memUsed / memTotal) * 100);

    // CPU Temp
    const tempRaw = await fs.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    const cpuTemp = parseInt(tempRaw) / 1000;

    // Disk
    const { stdout: dfOutput } = await execAsync('df -h / | tail -1');
    const diskParts = dfOutput.trim().split(/\s+/);
    const diskUsed = diskParts[2];
    const diskTotal = diskParts[1];
    const diskPercent = parseInt(diskParts[4].replace('%', ''));

    // Uptime
    const { stdout: uptimeOutput } = await execAsync('uptime -p');
    const uptime = uptimeOutput.trim().replace('up ', '');

    return {
      ram: {
        used: formatBytes(memUsed),
        total: formatBytes(memTotal),
        percent: memPercent,
        status: memPercent > 85 ? 'danger' : memPercent > 70 ? 'warning' : 'good'
      },
      cpu: {
        temp: cpuTemp.toFixed(1),
        status: cpuTemp > 70 ? 'danger' : cpuTemp > 55 ? 'warning' : 'good'
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percent: diskPercent,
        status: diskPercent > 90 ? 'danger' : diskPercent > 75 ? 'warning' : 'good'
      },
      uptime,
      timestamp: Date.now()
    };
  } catch (error) {
    return { error: error.message };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ===== MEMORY FILES =====
async function getMemoryFiles() {
  try {
    const files = await fs.readdir(MEMORY_DIR);
    const fileData = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async (filename) => {
          const filepath = path.join(MEMORY_DIR, filename);
          const stats = await fs.stat(filepath);
          const content = await fs.readFile(filepath, 'utf8');
          return {
            name: filename,
            size: formatBytes(stats.size),
            modified: stats.mtime,
            preview: content.substring(0, 200).replace(/#/g, '').trim()
          };
        })
    );
    return fileData.sort((a, b) => b.modified - a.modified);
  } catch (error) {
    return [];
  }
}

// ===== TASKS =====
async function getTasks() {
  try {
    const data = await fs.readFile(KANBAN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function updateTaskStatus(taskId, newStatus) {
  try {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      task.updatedAt = new Date().toISOString();
      await fs.writeFile(KANBAN_FILE, JSON.stringify(tasks, null, 2));
    }
    return tasks;
  } catch (error) {
    throw error;
  }
}

async function addTask(title, description, priority = 'medium') {
  try {
    const tasks = await getTasks();
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await fs.writeFile(KANBAN_FILE, JSON.stringify(tasks, null, 2));
    return tasks;
  } catch (error) {
    throw error;
  }
}

// ===== SKILLS =====
async function getSkills() {
  try {
    const skillsDir = path.join(CLAWD_DIR, 'skills');
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const skills = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(skillsDir, entry.name);
        const skillFile = path.join(skillPath, 'SKILL.md');
        let description = 'No description';
        
        try {
          const content = await fs.readFile(skillFile, 'utf8');
          const descMatch = content.match(/description:\s*(.+)/);
          if (descMatch) description = descMatch[1];
        } catch (e) {}
        
        skills.push({
          name: entry.name,
          description,
          status: 'ready',
          path: skillPath
        });
      }
    }
    return skills;
  } catch (error) {
    return [];
  }
}

// ===== CRON JOBS =====
async function getCronJobs() {
  try {
    const { stdout } = await execAsync('crontab -l 2>/dev/null || echo ""');
    const lines = stdout.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    return lines.map((line, i) => ({
      id: i,
      command: line,
      description: parseCronLine(line)
    }));
  } catch (error) {
    return [];
  }
}

function parseCronLine(line) {
  if (line.includes('linkedin')) return 'LinkedIn automation startup';
  if (line.includes('heartbeat')) return 'Health check heartbeat';
  return 'Scheduled task';
}

// ===== KNOWCORE STATUS =====
async function getKnowcoreStatus() {
  try {
    const response = await fetch('https://www.knowcore.ai/api/v1/retrieve', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer kc_live_b256a82e71cfe32c4daaf5be2012ed77',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'test',
        options: { top_k: 1, min_score: 0.1 }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        kcName: data.kc?.name || 'TIMMYS BRAIN',
        kcId: data.kc?.id || '48650977-4344-46ab-859d-894dc876b65e',
        totalChunks: data.metadata?.totalChunks || 0,
        latency: data.metadata?.latencyMs || 0
      };
    }
    return { connected: false, error: 'API error' };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// ===== API ROUTES =====
app.get('/api/health', async (req, res) => {
  res.json(await getSystemHealth());
});

app.get('/api/memory', async (req, res) => {
  res.json(await getMemoryFiles());
});

app.get('/api/tasks', async (req, res) => {
  res.json(await getTasks());
});

app.post('/api/tasks/:id/status', async (req, res) => {
  const tasks = await updateTaskStatus(req.params.id, req.body.status);
  res.json(tasks);
  broadcast('tasks', tasks);
});

app.post('/api/tasks', async (req, res) => {
  const tasks = await addTask(req.body.title, req.body.description, req.body.priority);
  res.json(tasks);
  broadcast('tasks', tasks);
});

app.get('/api/skills', async (req, res) => {
  res.json(await getSkills());
});

app.get('/api/cron', async (req, res) => {
  res.json(await getCronJobs());
});

app.get('/api/knowcore', async (req, res) => {
  res.json(await getKnowcoreStatus());
});

app.post('/api/actions/:action', async (req, res) => {
  const { action } = req.params;
  
  switch (action) {
    case 'health-check':
      res.json({ success: true, result: await getSystemHealth() });
      break;
    case 'clear-logs':
      try {
        await execAsync('echo "" > /tmp/clawdbot/clawdbot-2026-02-04.log');
        res.json({ success: true, message: 'Logs cleared' });
      } catch (e) {
        res.json({ success: false, error: e.message });
      }
      break;
    default:
      res.json({ success: false, error: 'Unknown action' });
  }
});

// ===== WEBSOCKET =====
const clients = new Set();

wss.on('connection', (ws, req) => {
  // Validate API key from query string
  const url = new URL(req.url, `http://${req.headers.host}`);
  const providedKey = url.searchParams.get('key');
  
  if (!providedKey || providedKey !== API_KEY) {
    console.log('WebSocket connection rejected: invalid API key');
    ws.close(1008, 'Invalid API key');
    return;
  }
  
  clients.add(ws);
  console.log('Client connected (authenticated)');
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcast(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// ===== FILE WATCHERS =====
chokidar.watch(KANBAN_FILE).on('change', async () => {
  broadcast('tasks', await getTasks());
});

chokidar.watch(MEMORY_DIR).on('all', async () => {
  broadcast('memory', await getMemoryFiles());
});

// ===== PERIODIC UPDATES =====
setInterval(async () => {
  broadcast('health', await getSystemHealth());
}, 5000);

// ===== SPA CATCH-ALL =====
// Serve index.html for any non-API routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3333;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🧠 TimmyOS Server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://10.0.0.204:${PORT}`);
  console.log('WebSocket enabled for real-time updates');
});
