import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatPanel from './ChatPanel';

const ENGINE_META = {
  hermes: { label: 'HERMES', color: 'text-primary-fixed-dim', bg: 'bg-primary-container/20 border-primary-container/30' },
  opencode: { label: 'OPENCODE', color: 'text-secondary-fixed-dim', bg: 'bg-secondary-container/20 border-secondary-container/30' },
};

function ContextMenu({ agentId, onClose }) {
  const { closeAgent, minimizeAgent, updateAgent, agents } = useApp();
  const ref = useRef(null);
  const agent = agents.find(a => a.id === agentId);
  const isSpecial = ['overseer', 'distributor', 'archivist', 'watcher'].includes(agent?.role);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-4 top-12 z-50 bg-surface-container border border-white/10 rounded-xl shadow-2xl py-1.5 w-44">
      <div className="px-4 py-2 border-b border-white/5 mb-1">
        <label className="text-[10px] text-on-surface-variant font-medium block mb-1">Engine</label>
        <select
          value={agent.engine}
          onChange={(e) => updateAgent(agentId, { engine: e.target.value })}
          className="w-full bg-surface-container-high border border-white/10 text-on-surface text-[11px] rounded-lg px-2 py-1 outline-none focus:border-primary-container/50"
        >
          <option value="hermes">HERMES</option>
          <option value="opencode">OPENCODE</option>
        </select>
      </div>
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
  const { updateAgent, agents, minimizeAgent, closeAgent } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  if (agent.closed) return null;

  const isError = agent.status === 'offline' || agent.type === 'error';
  const dotColor = isError ? 'bg-error'
    : agent.status === 'online' ? 'bg-primary-fixed-dim'
    : agent.status === 'connecting' ? 'bg-tertiary-fixed-dim animate-pulse'
    : 'bg-on-surface-variant/40';
  const isSpecial = ['overseer', 'distributor', 'archivist', 'watcher'].includes(agent.role);
  const engineMeta = ENGINE_META[agent.engine] || ENGINE_META.opencode;
  const engineOptions = ['hermes', 'opencode'];
  const workerCount = agents.filter(a => a.role === 'worker' && !a.closed).length;

  const containerClass = `bg-surface-container/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex flex-col shadow-2xl transition-all duration-300 ${agent.minimized ? 'h-14' : `${isSpecial ? 'min-h-[260px] max-h-[80vh]' : 'min-h-[260px] max-h-[65vh]'}`}`;

  const ROLE_INFO = {
    overseer:    { icon: 'visibility',   color: 'text-primary-fixed-dim',   text: () => `Memantau task — Workers aktif: ${workerCount}/7` },
    distributor: { icon: 'call_split',   color: 'text-tertiary-fixed-dim',  text: () => 'Siap membagi tugas — Kirim deskripsi project' },
    archivist:   { icon: 'description',  color: 'text-secondary-fixed-dim', text: () => 'Mencatat semua progres & dokumentasi — Kirim update untuk dicatat' },
    watcher:     { icon: 'shield',       color: 'text-error/70',            text: () => 'Memantau kesehatan agent & API keys — Kirim "status" untuk cek' },
  };

  return (
    <div className={`${containerClass} w-full min-h-0 min-w-0`} style={{ position: 'relative' }}>
      <div data-draggable-target className={`h-12 border-b border-white/5 flex items-center justify-between px-4 drag-handle bg-transparent group shrink-0 gap-2`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`}></span>
          <h2 className={`font-body-md font-medium text-on-surface truncate`}>{agent.name}</h2>
          {agent.badge && agent.name?.toLowerCase() !== agent.badge?.toLowerCase() && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 ${engineMeta.bg} ${engineMeta.color}`}>
              {agent.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => minimizeAgent(agent.id)} className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[12px] font-bold">remove</span>
          </button>
          <button onClick={() => closeAgent(agent.id)} className="w-5 h-5 rounded-full bg-error/10 hover:bg-error/30 flex items-center justify-center text-error transition-all">
            <span className="material-symbols-outlined text-[12px] font-bold">close</span>
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 hover:bg-white/10 rounded-lg ml-1">
            <span className="material-symbols-outlined text-[18px] font-light">more_horiz</span>
          </button>
          {menuOpen && <ContextMenu agentId={agent.id} onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      {!agent.minimized && (
        <>
          {(() => {
            const info = ROLE_INFO[agent.role];
            if (!info || (agent.messages?.length ?? 0) > 1) return null;
            return (
              <div className="px-4 py-3 bg-surface-container-high/30 border-b border-white/5">
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  <span className={`material-symbols-outlined text-[16px] ${info.color} font-light`}>{info.icon}</span>
                  <span>{info.text()}</span>
                </div>
              </div>
            );
          })()}
          <ChatPanel agent={agent} />
        </>
      )}
    </div>
  );
}

export default AgentCard;
