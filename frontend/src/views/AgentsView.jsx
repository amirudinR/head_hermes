import React from 'react';
import { useApp } from '../context/AppContext';

const ROLE_META = {
  overseer: { icon: 'visibility', label: 'Overseer', color: 'text-primary-fixed-dim' },
  distributor: { icon: 'call_split', label: 'Distributor', color: 'text-tertiary-fixed-dim' },
  archivist: { icon: 'description', label: 'Archivist', color: 'text-secondary-fixed-dim' },
  watcher: { icon: 'shield', label: 'Watcher', color: 'text-inverse-surface' },
  worker: { icon: 'smart_toy', label: 'Worker', color: 'text-on-surface-variant' },
};

function AgentsView() {
  const { agents, restoreAgent, closeAgent, restartAgent, setDeployModalOpen } = useApp();

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">All Agents</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola semua instance agent — {agents.filter(a => !a.closed).length} aktif</p>
        </div>
        <button onClick={() => setDeployModalOpen(true)}
          className="bg-primary-container/10 text-primary-fixed hover:bg-primary-container/20 border border-primary-container/20 font-label-md py-2.5 px-5 rounded-xl transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Deploy Agent
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {agents.map(agent => {
          const rm = ROLE_META[agent.role] || ROLE_META.worker;
          const isSpecial = ['overseer', 'distributor', 'archivist', 'watcher'].includes(agent.role);

          return (
            <div key={agent.id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl transition-all ${
              agent.status === 'offline' ? 'bg-error-container/5 border-error/10'
              : isSpecial ? 'bg-primary-container/5 border-primary-container/10'
              : 'bg-surface-container/40 border-white/5'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                agent.closed ? 'bg-on-surface-variant/20'
                : agent.status === 'online' ? 'bg-primary-fixed-dim'
                : agent.status === 'connecting' ? 'bg-tertiary-fixed-dim animate-pulse'
                : 'bg-error'
              }`}></span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] font-light ${rm.color}`}>{rm.icon}</span>
                  <span className="font-medium text-on-surface">{agent.name}</span>
                  {agent.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-variant text-on-surface-variant font-medium">{agent.badge}</span>
                  )}
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-surface-container-high text-on-surface-variant">{agent.engine.toUpperCase()}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {rm.label} — {agent.closed ? 'Closed' : agent.minimized ? 'Minimized' : agent.status === 'connecting' ? 'Reconnecting...' : agent.status}
                  {agent.model && ` — ${agent.model}`}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                {agent.closed && (
                  <button onClick={() => restoreAgent(agent.id)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-container/10 text-primary-fixed hover:bg-primary-container/20 transition-all border border-primary-container/20">
                    Restore
                  </button>
                )}
                {!agent.closed && agent.minimized && (
                  <button onClick={() => restoreAgent(agent.id)} className="text-xs px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all border border-white/5">
                    Show
                  </button>
                )}
                {agent.status === 'offline' && !agent.closed && (
                  <button onClick={() => restartAgent(agent.id)} disabled={agent.status === 'connecting'}
                    className="text-xs px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-all border border-error/20 disabled:opacity-40">
                    Restart
                  </button>
                )}
                {!agent.closed && !isSpecial && (
                  <button onClick={() => closeAgent(agent.id)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-error/10 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[48px] block mb-4 opacity-30">smart_toy</span>
          <p>Belum ada agent. Deploy worker untuk memulai.</p>
        </div>
      )}
    </div>
  );
}

export default AgentsView;
