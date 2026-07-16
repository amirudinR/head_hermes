import React from 'react';
import { useApp } from '../context/AppContext';

export default function TopAppBar({ mobileOnly }) {
  const { systemInfo, health, sidebarOpen, toggleSidebar } = useApp();
  const activeCount = health?.services?.filter(s => s.status === 'online').length ?? '--';

  if (mobileOnly) {
    return (
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        height: 52,
        padding: '0 12px',
        background: 'rgba(8, 14, 8, 0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }} className="flex items-center justify-between md:hidden">
        <button onClick={toggleSidebar} className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-[22px] font-light">{sidebarOpen ? 'close' : 'menu'}</span>
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Bos Terminal</div>
        <div className="w-8" />
      </header>
    );
  }

  const items = [
    { icon: 'electric_bolt', label: 'Services', value: activeCount },
    { icon: 'memory',        label: 'CPU',      value: `${systemInfo?.cpuUsage ?? '--'}%` },
    { icon: 'storage',       label: 'RAM',      value: `${systemInfo?.memPercent ?? '--'}%` },
  ];

  return (
    <div style={{
      height: 44, flexShrink: 0,
      padding: '0 20px',
      background: 'rgba(8,14,8,0.5)', borderBottom: '1px solid var(--border-subtle)',
    }} className="hidden md:flex items-center justify-between">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={toggleSidebar} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-[18px] font-light">{sidebarOpen ? 'menu_open' : 'menu'}</span>
        </button>
        <div style={{ display: 'flex', gap: 28 }}>
          {items.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--clr-primary-lo)' }}>{item.icon}</span>
              {item.label}: <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--clr-primary-lo)' }}>schedule</span>
        Uptime: <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{systemInfo?.uptime ?? '--'}</span>
      </div>
    </div>
  );
}
