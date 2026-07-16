import React from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'command', icon: 'dashboard', label: 'Command' },
  { id: 'agents', icon: 'smart_toy', label: 'Agents' },
  { id: 'analytics', icon: 'analytics', label: 'Analytics' },
  { id: 'security', icon: 'security', label: 'Security' },
  { id: 'vault', icon: 'vpn_key', label: 'Vault' },
];

function Sidebar() {
  const { currentView, setCurrentView, setDeployModalOpen, agents, health, sidebarOpen, toggleSidebar } = useApp();
  const activeCount = agents.filter(a => !a.closed && a.status === 'online').length;
  const workerCount = agents.filter(a => a.role === 'worker' && !a.closed).length;
  const hermesOnline = health?.hermes?.running || false;

  return (
    <>
      <nav className={`fixed top-0 left-0 h-full z-40 pt-12 pb-4 flex flex-col bg-surface-container-lowest/30 backdrop-blur-2xl border-r border-white/5 w-[260px] transition-transform duration-300 ease-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'
      }`}>
        <div className="px-6 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-fixed-dim font-bold text-lg">
                H
              </div>
              <div>
                <h1 className="font-body-lg font-medium text-on-surface tracking-tight leading-tight">Bos Terminal</h1>
                <p className="font-caption text-on-surface-variant">System Admin</p>
              </div>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-white/10 transition-all">
              <span className="material-symbols-outlined text-[20px] font-light">close</span>
            </button>
          </div>
          <button
            onClick={() => setDeployModalOpen(true)}
            className="w-full bg-primary-container/10 text-primary-fixed hover:bg-primary-container/20 border border-primary-container/20 font-label-md py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Deploy Agent
          </button>
        </div>

        <div className="flex-1 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); if (window.innerWidth < 768) toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md transition-all ${
                currentView === item.id
                  ? 'text-on-surface bg-surface-container-high/40 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low/40 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined font-light">{item.icon}</span>
              {item.label}
              {item.id === 'agents' && (
                <span className="ml-auto text-[10px] bg-primary-container/20 text-primary-fixed-dim px-2 py-0.5 rounded-full font-bold">
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="px-3 mb-2">
          <div className="p-3 rounded-xl bg-surface-container-low/40 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hermesOnline ? 'bg-primary-fixed-dim' : 'bg-on-surface-variant/30'}`}></span>
              <span className="text-[11px] text-on-surface-variant/70">Hermes {hermesOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-on-surface-variant/50">
              <span>Workers</span>
              <span className={workerCount > 0 ? 'text-primary-fixed-dim' : ''}>{workerCount}/7</span>
            </div>
          </div>
        </div>

        <div className="px-3 mt-auto flex flex-col gap-1 pt-4">
          <button
            onClick={() => alert('Support: Hubungi tim Hermes di internal channel.')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container-low/40 hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined font-light">support_agent</span>
            Support
          </button>
          <button
            onClick={() => {
              if (window.confirm('Matikan semua agent dan system?')) {
                window.location.href = 'about:blank';
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-error/80 hover:bg-error-container/10 hover:text-error transition-all"
          >
            <span className="material-symbols-outlined font-light">logout</span>
            Power Off
          </button>
        </div>
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}
    </>
  );
}

export default Sidebar;
