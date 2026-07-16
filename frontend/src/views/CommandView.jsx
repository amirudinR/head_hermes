import React from 'react';
import { useApp } from '../context/AppContext';
import AgentCard from '../components/AgentCard';

const SPECIAL_ORDER = ['hermes-overseer', 'hermes-distributor', 'hermes-md', 'hermes-watcher'];

function CommandView() {
  const { agents, setDeployModalOpen } = useApp();

  const specialAgents = SPECIAL_ORDER.map(id => agents.find(a => a.id === id)).filter(Boolean);
  const workers = agents.filter(a => a.role === 'worker' && !a.closed);
  const workerCount = workers.length;

  return (
    <div className="relative w-full h-full overflow-auto custom-scroll">
      {agents.filter(a => !a.closed).length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
          <div className="text-center">
            <span className="material-symbols-outlined text-[64px] mb-4 block opacity-30">smart_toy</span>
            <p className="text-lg font-medium opacity-50">Tidak ada agent aktif</p>
            <p className="text-sm opacity-30 mt-1">Klik "Deploy Agent" di sidebar untuk menambahkan agent baru.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6 flex flex-col gap-6 min-h-full">
          {/* Special Agents Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
            {specialAgents.map(agent => (
              <div key={agent.id}>
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>

          {/* Workers Section */}
          {workers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Workers</span>
                  <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">{workerCount}/7</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {workers.map(agent => (
                  <div key={agent.id}>
                    <AgentCard agent={agent} />
                  </div>
                ))}
                {workerCount < 7 && (
                  <button
                    onClick={() => setDeployModalOpen(true)}
                    className="h-[420px] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary-container/30 bg-surface-container/20 hover:bg-surface-container/40 transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant/50 hover:text-primary-fixed-dim group"
                  >
                    <span className="material-symbols-outlined text-[36px] font-light group-hover:scale-110 transition-transform">add</span>
                    <span className="text-sm font-medium">Deploy Worker</span>
                    <span className="text-[10px] opacity-60">{7 - workerCount} slot tersisa</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty state when no workers */}
          {workers.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <button
                onClick={() => setDeployModalOpen(true)}
                className="flex flex-col items-center gap-3 text-on-surface-variant/50 hover:text-primary-fixed-dim transition-all group py-16"
              >
                <span className="material-symbols-outlined text-[64px] font-light group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-lg font-medium">Deploy Worker Pertama</span>
                <span className="text-sm opacity-60">Tambahkan agent worker untuk memulai kolaborasi</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommandView;
