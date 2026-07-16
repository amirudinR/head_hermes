import React from 'react';
import { useApp } from '../context/AppContext';

function StatCard({ label, value, sub, icon, pct }) {
  const pctColor = pct > 85 ? 'var(--clr-error)' : pct > 60 ? 'var(--clr-warning)' : 'var(--clr-online)';
  return (
    <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>{label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--clr-primary-lo)' }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>}
      {pct !== undefined && (
        <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: pctColor, transition: 'width .7s' }}></div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsView() {
  const { systemInfo, health } = useApp();
  const services = health?.services ?? [];
  const onlineCount = services.filter(s => s.status === 'online').length;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Analytics</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Statistik sistem real-time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="CPU" value={`${systemInfo?.cpuUsage ?? '--'}%`} sub={systemInfo ? `${systemInfo.cpuCores} cores` : '--'} icon="memory" pct={systemInfo?.cpuUsage} />
        <StatCard label="Memory" value={`${systemInfo?.memPercent ?? '--'}%`} sub={systemInfo ? `${(systemInfo.usedMem/1073741824).toFixed(1)}/${(systemInfo.totalMem/1073741824).toFixed(1)} GB` : '--'} icon="storage" pct={systemInfo?.memPercent} />
        <StatCard label="Uptime" value={systemInfo?.uptime ?? '--'} sub={systemInfo?.nodeVersion} icon="schedule" />
        <StatCard label="Services" value={`${onlineCount}/${services.length}`} sub="online" icon="cloud" />
      </div>

      <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Services Status</h3>
        </div>
        {services.map((s, i) => (
          <div key={s.port} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: i < services.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-muted)' }}>:{s.port}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: s.status === 'online' ? 'var(--clr-primary-bg)' : 'rgba(200,80,80,0.12)', color: s.status === 'online' ? 'var(--clr-online)' : 'var(--clr-error)' }}>
              {s.status.toUpperCase()}
            </span>
          </div>
        ))}
        {services.length === 0 && <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>Tidak ada data. Periksa koneksi ke backend.</div>}
      </div>
    </div>
  );
}
