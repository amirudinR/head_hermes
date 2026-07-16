import React from 'react';

const ITEMS = [
  { icon: 'shield',        title: 'Firewall Rules',  sub: 'Manage inbound/outbound rules' },
  { icon: 'lock',          title: 'Access Control',  sub: 'User permissions & roles' },
  { icon: 'security',      title: 'Threat Monitor',  sub: 'Real-time threat detection' },
  { icon: 'verified_user', title: 'Audit Logs',      sub: 'System event history' },
];

export default function SecurityView() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Security</h2>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Keamanan dan kontrol akses sistem</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {ITEMS.map(item => (
          <div
            key={item.title}
            style={{ padding: '22px', borderRadius: 14, cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'border-color .18s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 30, color: 'var(--clr-primary-lo)', marginBottom: 12, display: 'block' }}>{item.icon}</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: '14px 20px', borderRadius: 12, textAlign: 'center', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
        Security Management akan segera hadir.
      </div>
    </div>
  );
}
