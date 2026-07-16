#!/usr/bin/env node
const http = require('http');
const { execSync, exec, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ── .env loader ──
function loadEnv(p) {
  try {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const l of lines) {
      const m = l.match(/^\s*([\w._-]+)\s*=\s*(.*?)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (e) {}
}
loadEnv(path.join(__dirname, '.env'));

const PORT = parseInt(process.env.PORT) || 3035;
const ROUTER = {
  hostname: process.env.ROUTER_HOST || '127.0.0.1',
  port: parseInt(process.env.ROUTER_PORT) || 20128,
  key: process.env.ROUTER_KEY || '',
};
const OPENCODE = { hostname: process.env.OPENCODE_HOST || '127.0.0.1', port: parseInt(process.env.OPENCODE_PORT) || 3031 };
const HERMES_PORT = parseInt(process.env.HERMES_PORT) || 9119;
const AUTH_PATH = path.join(os.homedir(), '.local', 'share', 'opencode', 'auth.json');

// ── Utilities ──
function run(cmd, t = 5000) {
  try { return execSync(cmd, { encoding: 'utf8', timeout: t, windowsHide: true }).trim(); } catch (e) { return e.stdout ? e.stdout.trim() : ''; }
}

function getSystemInfo() {
  const cpus = os.cpus(), total = os.totalmem(), free = os.freemem(), used = total - free;
  let cpu = 0; try { const r = run('wmic cpu get loadpercentage /value'); const m = r.match(/LoadPercentage=(\d+)/); if (m) cpu = parseInt(m[1]); } catch (e) { }
  const u = os.uptime(), d = Math.floor(u / 86400), h = Math.floor(u % 86400 / 3600), m = Math.floor(u % 3600 / 60);
  return { hostname: os.hostname(), platform: `${os.type()} ${os.release()}`, arch: os.arch(), cpuModel: (cpus[0]?.model || 'Unknown').replace(/\s+/g, ' ').trim(), cpuCores: cpus.length, cpuUsage: cpu, totalMem: total, freeMem: free, usedMem: used, memPercent: Math.round(used / total * 100), uptime: `${d}d ${h}h ${m}m`, nodeVersion: process.version };
}

function getProcesses() {
  const r = run('tasklist /fo csv /nh 2>nul'), seen = {};
  for (const l of r.split('\n')) {
    if (!l.trim()) continue;
    const p = l.match(/"([^"]*)"/g); if (!p || p.length < 5) continue;
    const n = p[0].replace(/"/g, ''), pid = p[1].replace(/"/g, ''), mem = p[4].replace(/"/g, ''), k = n.toLowerCase();
    if (!seen[k]) seen[k] = { name: n, count: 0, mem: '0 K', pids: [] };
    seen[k].count++; seen[k].pids.push(pid); seen[k].mem = mem;
  }
  return Object.values(seen).sort((a, b) => b.count - a.count);
}

function getPorts() {
  const r = run('netstat -ano | findstr LISTENING'), map = {};
  for (const l of r.split('\n')) {
    const m = l.match(/:(\d+)\s+.*?(\d+)$/m);
    if (m) { const p = parseInt(m[1]), pid = m[2]; if (p > 0 && p < 65536 && !map[`${p}:${pid}`]) map[`${p}:${pid}`] = { port: p, pid }; }
  }
  return Object.values(map).sort((a, b) => a.port - b.port);
}

function getDir(p) { try { return fs.readdirSync(p, { withFileTypes: true }).filter(i => !i.name.startsWith('.') && i.name !== 'node_modules').slice(0, 40).map(i => ({ name: i.name, isDir: i.isDirectory(), path: path.join(p, i.name) })); } catch { return []; } }

function proxyToAPI(host, port, pathname, headers, auth, cb) {
  return new Promise(resolve => {
    const opts = { hostname: host, port: port, path: pathname, method: 'GET', headers: headers || {} };
    if (auth) opts.headers['Authorization'] = auth;
    const req = http.get(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(cb ? cb(d) : d));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

function proxyChat(host, port, authKey, body) {
  return new Promise(resolve => {
    const payload = JSON.stringify(Object.assign({}, body, { stream: false }));
    const opts = {
      hostname: host, port: port, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    if (authKey) opts.headers['Authorization'] = `Bearer ${authKey}`;
    const req = http.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const cl = d.replace(/\ndata:\s*\[DONE\]\s*$/, '').trim();
          const p = JSON.parse(cl);
          const content = p.choices?.[0]?.message?.content || '';
          const reasoning = p.choices?.[0]?.message?.reasoning_content || '';
          resolve({ content, reasoning, model: p.model, usage: p.usage });
        } catch (e) { resolve({ content: d, reasoning: '', model: '', usage: null }); }
      });
    });
    req.on('error', () => resolve({ error: 'API unreachable' }));
    req.setTimeout(30000, () => { req.destroy(); resolve({ error: 'API timeout' }); });
    req.write(payload); req.end();
  });
}

// ── Engine Executable Cache ──
let _hermesExe = null;
function findHermesExe() {
  if (_hermesExe) return _hermesExe;
  const candidates = [
    path.join(os.homedir(), '.local', 'bin', 'hermes.exe'),
    path.join(os.homedir(), '.local', 'bin', 'hermes'),
    'hermes',
  ];
  for (const c of candidates) {
    try { const r = execSync(`where ${c} 2>nul`, { encoding: 'utf8', timeout: 2000, windowsHide: true }).trim(); if (r) { _hermesExe = c; return c; } } catch (e) { }
  }
  _hermesExe = 'hermes';
  return 'hermes';
}

function hermesChat(msg, sessionId) {
  return new Promise(resolve => {
    const hermesExe = findHermesExe();
    const args = sessionId
      ? ['-z', msg, '-r', sessionId, '-Q']
      : ['-z', msg, '-Q'];
    const child = spawn(hermesExe, args, { shell: true, windowsHide: true, timeout: 180000 });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());
    child.stdin.end();
    const timer = setTimeout(() => { child.kill(); resolve({ content: stdout || stderr || '', sessionId }); }, 180000);
    child.on('close', (code) => {
      clearTimeout(timer);
      const sid = stdout.match(/([0-9]{8}_[0-9]{6}_[a-f0-9]+)/);
      resolve({ content: stdout || stderr || '', sessionId: sid ? sid[1] : sessionId });
    });
    child.on('error', () => { clearTimeout(timer); resolve({ content: '', sessionId, error: 'Hermes process failed' }); });
  });
}

function hermesServeStatus() {
  return new Promise(resolve => {
    const hermesExe = findHermesExe();
    const child = spawn(hermesExe, ['serve', '--status'], { shell: true, windowsHide: true, timeout: 5000 });
    let out = '';
    child.stdout.on('data', d => out += d.toString());
    child.stderr.on('data', d => out += d.toString());
    child.on('close', () => resolve({ running: out.toLowerCase().includes('running') || out.toLowerCase().includes('pid'), output: out.trim() }));
    child.on('error', () => resolve({ running: false, output: '' }));
  });
}

// ── OpenCode Engine ──
function opencodeRun(msg, sessionId) {
  return new Promise(resolve => {
    const args = sessionId
      ? ['run', msg, '--session', sessionId, '--print-logs']
      : ['run', msg, '--print-logs'];
    const child = spawn('opencode', args, { shell: true, windowsHide: true, timeout: 300000 });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());
    child.stdin.end();
    const timer = setTimeout(() => { child.kill(); resolve({ content: stdout || stderr || '' }); }, 300000);
    child.on('close', () => {
      clearTimeout(timer);
      const sid = stdout.match(/(ses_[a-zA-Z0-9]+)/);
      resolve({ content: stdout || stderr || '', sessionId: sid ? sid[1] : sessionId });
    });
    child.on('error', () => { clearTimeout(timer); resolve({ content: '', sessionId, error: 'OpenCode process failed' }); });
  });
}

// ── OpenCode Auth Reader ──
function readOpenCodeProviders() {
  try {
    const raw = fs.readFileSync(AUTH_PATH, 'utf8');
    const auth = JSON.parse(raw);
    return Object.entries(auth).map(([id, cfg]) => ({
      id,
      type: cfg.type,
      status: cfg.key || cfg.access ? 'active' : 'inactive',
      label: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
  } catch (e) {
    return [{ id: 'opencode', type: 'builtin', status: 'active', label: 'OpenCode Free' }];
  }
}

// ── Server ──
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  res.setHeader('Access-Control-Allow-Origin', '*');
  const send = d => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)); };

  const distPath = path.join(__dirname, 'frontend', 'dist');

  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    try { res.end(fs.readFileSync(path.join(distPath, 'index.html'), 'utf8')); } catch (e) { res.end('<h1>React app not built. Run "npm run build" in frontend folder.</h1>'); }
    return;
  }

  if (url.startsWith('/assets/') || url.startsWith('/vite.svg')) {
    const ext = path.extname(url);
    const mimes = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml' };
    try { const data = fs.readFileSync(path.join(distPath, url)); res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain' }); res.end(data); } catch (e) { res.writeHead(404); res.end('404'); }
    return;
  }

  if (url === '/api/system') return send(getSystemInfo());
  if (url === '/api/processes') return send(getProcesses());
  if (url === '/api/ports') return send(getPorts());
  if (url === '/api/dir') { const p = new URL(req.url, 'http://x').searchParams.get('path') || 'D:/tuyul'; return send({ path: p, items: getDir(p) }); }

  // ── Health ──
  if (url === '/api/health') {
    const r = ROUTER.key ? await proxyToAPI(ROUTER.host, ROUTER.port, '/v1/models', {}, `Bearer ${ROUTER.key}`) : null;
    const o = await proxyToAPI(OPENCODE.host, OPENCODE.port, '/v1/models', {}, null);
    let rModels = [], oModels = [];
    try { if (r) { const j = JSON.parse(r.replace(/\ndata:\s*\[DONE\]/, '').trim()); rModels = (j.data || []).map(m => m.id || m.name); } } catch (e) { }
    try { if (o) { const j = JSON.parse(o); oModels = (j.data || []).map(m => m.id || m.name); } } catch (e) { }
    const ports = await Promise.all([3030, 3031, 3035, 9119, 4567, 5050, 20128].map(p => new Promise(_ => { const rq = http.get(`http://127.0.0.1:${p}`, { timeout: 1500 }, r => { r.resume(); _({ port: p, status: 'online', code: r.statusCode }); }); rq.on('error', () => _({ port: p, status: 'offline' })); rq.on('timeout', () => { rq.destroy(); _({ port: p, status: 'timeout' }); }); })));
    const hs = await hermesServeStatus();
    return send({ "9router": { status: r ? 'online' : 'offline', models: rModels }, opencode: { status: o ? 'online' : 'offline', models: oModels }, hermes: hs, services: ports });
  }

  // ── Providers ──
  if (url === '/api/providers') {
    const oc = readOpenCodeProviders();
    const rModels = ROUTER.key ? await proxyToAPI(ROUTER.host, ROUTER.port, '/v1/models', {}, `Bearer ${ROUTER.key}`) : null;
    let routerModels = [];
    try { if (rModels) { const j = JSON.parse(rModels.replace(/\ndata:\s*\[DONE\]/, '').trim()); routerModels = (j.data || []).map(m => ({ id: m.id || m.name, provider: '9router', label: (m.id || m.name).replace(/^[^/]+\//, '').replace(/[_-]/g, ' ') })); } } catch (e) { }
    return send({ providers: oc, models: routerModels });
  }

  // ── Chat ──
  if (url === '/api/chat' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c); req.on('end', async () => {
      try {
        const { engine, model, messages, systemPrompt } = JSON.parse(b);

        if (engine === 'hermes') {
          const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
          const msg = systemPrompt
            ? `${systemPrompt}\n\n${lastUserMsg?.content || ''}`
            : (lastUserMsg?.content || '');
          const r = await hermesChat(msg);
          return send({ content: r.content, engine: 'hermes', sessionId: r.sessionId });
        }

        if (engine === 'opencode') {
          const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
          const msg = systemPrompt
            ? `${systemPrompt}\n\n${lastUserMsg?.content || ''}`
            : (lastUserMsg?.content || '');
          const r = await opencodeRun(msg);
          return send({ content: r.content, engine: 'opencode', sessionId: r.sessionId });
        }

        // Default: 9router
        const r = await proxyChat(ROUTER.host, ROUTER.port, ROUTER.key, { model, messages });
        return send({ ...r, engine: '9router' });
      } catch (e) { send({ error: e.message }); }
    }); return;
  }

  // ── Hermes Status ──
  if (url === '/api/hermes/status') {
    const hs = await hermesServeStatus();
    return send(hs);
  }

  // ── Hermes Chat ──
  if (url === '/api/hermes/chat' && req.method === 'POST') {
    let b = ''; req.on('data', c => b += c); req.on('end', async () => {
      try {
        const { message, sessionId, systemPrompt } = JSON.parse(b);
        const msg = systemPrompt ? `${systemPrompt}\n\n${message}` : message;
        const r = await hermesChat(msg, sessionId);
        send(r);
      } catch (e) { send({ error: e.message }); }
    }); return;
  }

  // ── Exec ──
  if (url === '/api/exec' && req.method === 'GET') {
    const cmd = new URL(req.url, 'http://x').searchParams.get('cmd');
    if (!cmd) { res.writeHead(400); return res.end('{"error":"no cmd"}'); }
    const blocked = ['rm -rf', 'format', 'del /s', 'shutdown', 'rd /s', 'rmdir /s', 'del /f', 'format c:', 'del /q /f', 'net user', 'net localgroup', 'powercfg', 'vol c:'];
    if (blocked.some(b => cmd.toLowerCase().includes(b))) { res.writeHead(403); return res.end('{"error":"blocked"}'); }
    return exec(cmd, { encoding: 'utf8', timeout: 15000, windowsHide: true }, (err, stdout, stderr) => send({ output: stdout || stderr || '', error: err?.message || null, exitCode: err?.code || 0 }));
  }

  res.writeHead(404); res.end('404');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🧠 Head Hermes Dashboard v3.0`);
  console.log(`  ➜ http://127.0.0.1:${PORT}\n`);
});
