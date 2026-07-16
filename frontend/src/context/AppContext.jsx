import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'head-hermes-state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveState(agents) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (_) {}
}

function calcNextCounter(agents) {
  const nums = agents.map(a => {
    const n = parseInt(a.id.replace('hermes-', '').replace('-', ''), 10);
    return isNaN(n) ? 0 : n;
  });
  return Math.max(...nums, 6) + 1;
}

const DEFAULT_AGENTS = [
  {
    id: 'hermes-overseer',
    name: 'Overseer',
    badge: 'OVERSEER',
    role: 'overseer',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    messages: [{ role: 'system', content: 'Kamu adalah Task Overseer. Pantau semua task di project ini. Beri status tiap task secara real-time: [pending|in_progress|done|blocked]. Selalu berikan ringkasan progress secara periodik.' }],
    systemPrompt: 'Kamu adalah Task Overseer. Pantau semua task di project ini. Beri status tiap task secara real-time.',
  },
  {
    id: 'hermes-distributor',
    name: 'Distributor',
    badge: 'DISTRIBUTOR',
    role: 'distributor',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    messages: [{ role: 'system', content: 'Kamu adalah Task Distributor. Pecah project menjadi sub-task dan assign ke worker yang tepat. Pertimbangkan kapasitas dan keahlian tiap worker.' }],
    systemPrompt: 'Kamu adalah Task Distributor. Pecah project menjadi sub-task dan assign ke worker yang tepat.',
  },
  {
    id: 'hermes-md',
    name: 'Archivist',
    badge: 'MD',
    role: 'archivist',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    messages: [{ role: 'system', content: 'Kamu adalah Agent Archivist (MD). Catat semua progres, task completion, keputusan, dan perubahan dalam format markdown. Buat ringkasan eksekutif secara periodik. Maintain dokumentasi proyek yang terstruktur: # Progress Log, ## Completed Tasks, ## Decisions, ## Blockers.' }],
    systemPrompt: 'Kamu adalah Agent Archivist (MD). Catat semua progres, task completion, dan keputusan dalam format markdown. Maintain dokumentasi proyek yang terstruktur.',
  },
  {
    id: 'hermes-watcher',
    name: 'Watcher',
    badge: 'WATCHER',
    role: 'watcher',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    messages: [{ role: 'system', content: 'Kamu adalah API Key & Health Watcher. Cek status semua agent, API key validity, dan idle workers. Beri alert jika ada agent yang mati atau idle terlalu lama.' }],
    systemPrompt: 'Kamu adalah API Key & Health Watcher. Cek status semua agent, API key validity, dan idle workers.',
  },
  {
    id: 'hermes-01',
    name: 'Hermes-01',
    badge: 'WORKER',
    role: 'worker',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    messages: [
      { role: 'system', content: 'Initializing worker protocol...' },
      { role: 'assistant', content: 'Worker Hermes-01 siap menerima tugas.\n\nstatus: ready\ntoolset: default' },
    ],
  },
  {
    id: 'hermes-02',
    name: 'Hermes-02',
    badge: 'WORKER',
    role: 'worker',
    engine: 'opencode',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'online',
    minimized: false,
    closed: false,
    progress: 0,
    messages: [{ role: 'system', content: 'Worker Hermes-02 initializing...' }],
  },
  {
    id: 'hermes-x',
    name: 'Hermes-X',
    badge: 'WORKER',
    role: 'worker',
    engine: 'hermes',
    provider: 'opencode',
    model: 'deepseek-v4-flash-free',
    status: 'offline',
    minimized: false,
    closed: false,
    messages: [{ role: 'system', content: 'Worker Hermes-X connection pending...' }],
  },
];

export function AppProvider({ children }) {
  const saved = loadState();
  const initialAgents = saved || DEFAULT_AGENTS;
  const [agents, setAgents] = useState(initialAgents);
  const [currentView, setCurrentView] = useState('command');
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [health, setHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [agentCounter, setAgentCounter] = useState(() => calcNextCounter(initialAgents));
  const [contextMenu, setContextMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => { saveState(agents); }, [agents]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data.providers || []);
      setModels(data.models || []);
    } catch (_) {}
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (_) {}
  }, []);

  const fetchSystem = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      setSystemInfo(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchProviders();
    fetchHealth();
    fetchSystem();
    const hp = setInterval(fetchProviders, 30000);
    const h = setInterval(fetchHealth, 10000);
    const s = setInterval(fetchSystem, 5000);
    return () => { clearInterval(hp); clearInterval(h); clearInterval(s); };
  }, [fetchProviders, fetchHealth, fetchSystem]);

  const updateAgent = (id, patch) => setAgents(a => a.map(ag => ag.id === id ? { ...ag, ...patch } : ag));

  const minimizeAgent = (id) => updateAgent(id, { minimized: true });
  const maximizeAgent = (id) => updateAgent(id, { maximized: !agents.find(a => a.id === id)?.maximized });
  const closeAgent = (id) => updateAgent(id, { closed: true });
  const restoreAgent = (id) => updateAgent(id, { minimized: false, closed: false });

  const restartAgent = async (id) => {
    updateAgent(id, { status: 'connecting' });
    // Try to ping the opencode port as a health check
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      const opencodeLive = data.opencode?.status === 'online';
      await new Promise(r => setTimeout(r, 1200));
      updateAgent(id, { status: opencodeLive ? 'online' : 'offline' });
    } catch {
      await new Promise(r => setTimeout(r, 1200));
      updateAgent(id, { status: 'offline' });
    }
  };

  const deployAgent = (name, engine, provider, model) => {
    const count = agents.filter(a => a.role === 'worker' && !a.closed).length;
    if (count >= 7) return;
    const id = `hermes-${String(agentCounter).padStart(2, '0')}`;
    setAgentCounter(c => c + 1);
    setAgents(a => [...a, {
      id, name: name || `Hermes-${String(agentCounter).padStart(2, '0')}`,
      badge: 'WORKER', role: 'worker',
      engine: engine || 'opencode', provider: provider || 'opencode',
      model: model || 'deepseek-v4-flash-free',
      status: 'online', minimized: false, closed: false,
      messages: [{ role: 'system', content: `Worker ${name || `Hermes-${String(agentCounter).padStart(2, '0')}`} deployed.` }],
    }]);
    setDeployModalOpen(false);
  };

  const sendMessage = async (agentId, userMsg, systemPrompt) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const newMsg = { role: 'user', content: userMsg };
    const updatedMessages = [...(agent.messages || []), newMsg];
    updateAgent(agentId, { messages: updatedMessages, thinking: true });

    try {
      const msgs = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      if (systemPrompt || agent.systemPrompt) {
        msgs.unshift({ role: 'system', content: systemPrompt || agent.systemPrompt });
      }
      const body = {
        engine: agent.engine,
        model: agent.model,
        messages: msgs,
      };
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const reply = { role: 'assistant', content: data.content || data.error || 'No response' };
      updateAgent(agentId, { messages: [...updatedMessages, reply], thinking: false });
    } catch (e) {
      const errMsg = { role: 'assistant', content: `Error: ${e.message}` };
      updateAgent(agentId, { messages: [...updatedMessages, errMsg], thinking: false });
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      agents, setAgents, updateAgent,
      providers, models,
      health, systemInfo,
      deployModalOpen, setDeployModalOpen,
      contextMenu, setContextMenu,
      sidebarOpen, setSidebarOpen, toggleSidebar: () => setSidebarOpen(s => !s),
      minimizeAgent, maximizeAgent, closeAgent, restoreAgent,
      restartAgent, deployAgent, sendMessage,
      fetchProviders, fetchHealth, fetchSystem,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
