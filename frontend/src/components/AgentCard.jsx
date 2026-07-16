import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatPanel from './ChatPanel';

const ENGINE_META = {
  hermes: { label: 'HERMES', color: 'text-primary-fixed-dim', bg: 'bg-primary-container/20 border-primary-container/30' },
  opencode: { label: 'OPENCODE', color: 'text-secondary-fixed-dim', bg: 'bg-secondary-container/20 border-secondary-container/30' },
};

function ContextMenu({ agentId, onClose }) {
  const { closeAgent, minimizeAgent, agents } = useApp();
  const ref = useRef(null);
  const agent = agents.find(a => a.id === agentId);
  const isSpecial = ['overseer', 'distributor', 'watcher'].includes(agent?.role);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-4 top-12 z-50 bg-surface-container border border-white/10 rounded-xl shadow-2xl py-1.5 w-44">
      <button onClick={() => { minimizeAgent(agentId); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">minimize</span> Minimize
      </button>
      {!isSpecial && (
        <button onClick={() => { closeAgent(agentId); onClose(); }} className="w-full text-left px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">close</span> Close Agent
        </button>
      )}
    </div>
  );
}

function AgentCard({ agent }) {
  const { updateAgent, agents } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  if (agent.closed) return null;

  const isError = agent.status === 'offline' || agent.type === 'error';
  const dotColor = isError ? 'bg-error'
    : agent.status === 'online' ? 'bg-primary-fixed-dim'
    : agent.status === 'connecting' ? 'bg-tertiary-fixed-dim animate-pulse'
    : 'bg-on-surface-variant/40';
  const isLarge = agent.maximized || agent.role === 'overseer';
  const engineMeta = ENGINE_META[agent.engine] || ENGINE_META.opencode;
  const engineOptions = ['hermes', 'opencode'];
  const workerCount = agents.filter(a => a.role === 'worker' && !a.closed).length;

  const handleEngineChange = (e) => {
    updateAgent(agent.id, { engine: e.target.value });
  };

  const containerClass = isLarge
    ? `bg-surface-container/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${agent.minimized ? 'h-14' : 'min-h-[400px]'}`
    : `bg-surface-container/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${agent.minimized ? 'h-14' : 'min-h-[320px]'}`;

  return (
    <div className={containerClass} style={{ position: 'relative', resize: 'both', overflow: 'hidden', minWidth: isLarge ? '500px' : '300px', width: isLarge ? '640px' : '360px' }}>
      <div className={`h-14 border-b border-white/5 flex items-center justify-between px-5 drag-handle bg-transparent group shrink-0`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`}></span>
          <h2 className={`font-body-lg font-medium text-on-surface truncate`}>{agent.name}</h2>
          {agent.badge && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${isError ? 'bg-error/10 text-error' : 'bg-surface-variant text-on-surface-variant'}`}>
              {agent.badge}
            </span>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${engineMeta.bg} ${engineMeta.color} shrink-0`}>
            {engineMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={agent.engine}
            onChange={handleEngineChange}
            className="bg-surface-container-high/60 border border-white/10 text-on-surface text-[10px] rounded-lg px-2 py-1 outline-none focus:border-primary-container/50"
          >
            {engineOptions.map(e => (
              <option key={e} value={e}>{ENGINE_META[e]?.label || e}</option>
            ))}
          </select>

          <button onClick={() => setMenuOpen(o => !o)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 hover:bg-white/10 rounded-lg">
            <span className="material-symbols-outlined text-[18px] font-light">more_horiz</span>
          </button>
          {menuOpen && <ContextMenu agentId={agent.id} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      {!agent.minimized && (
        <>
          {agent.role === 'overseer' && agent.messages?.length <= 1 && (
            <div className="px-5 py-3 bg-surface-container-high/30 border-b border-white/5">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary-fixed-dim font-light">visibility</span>
                <span>Memantau task — Workers aktif: {workerCount}/7</span>
              </div>
            </div>
          )}
          {agent.role === 'distributor' && agent.messages?.length <= 1 && (
            <div className="px-5 py-3 bg-surface-container-high/30 border-b border-white/5">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim font-light">call_split</span>
                <span>Siap membagi tugas — Kirim deskripsi project</span>
              </div>
            </div>
          )}
          {agent.role === 'watcher' && agent.messages?.length <= 1 && (
            <div className="px-5 py-3 bg-surface-container-high/30 border-b border-white/5">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-error/70 font-light">shield</span>
                <span>Memantau kesehatan agent & API keys — Kirim "status" untuk cek</span>
              </div>
            </div>
          )}
          <ChatPanel agent={agent} />
        </>
      )}
    </div>
  );
}

export default AgentCard;
