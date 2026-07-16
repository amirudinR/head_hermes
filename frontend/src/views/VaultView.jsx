import React from 'react';
import { useApp } from '../context/AppContext';

function VaultView() {
  const { providers, models } = useApp();

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-on-surface">Vault</h2>
        <p className="text-sm text-on-surface-variant mt-1">Provider credentials dari OpenCode & Hermes</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-on-surface-variant/60 font-medium mb-3">OpenCode Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.length === 0 && (
            <div className="col-span-full p-6 bg-surface-container/40 border border-white/5 rounded-2xl text-center text-on-surface-variant/60 text-sm">
              <span className="material-symbols-outlined text-[32px] block mb-2 opacity-30">key</span>
              Tidak ada provider terdeteksi. Pastikan opencode terinstall.
            </div>
          )}
          {providers.map(p => (
            <div key={p.id} className="bg-surface-container/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                p.status === 'active' ? 'bg-primary-container/20 text-primary-fixed-dim' : 'bg-surface-container-high text-on-surface-variant/40'
              }`}>
                <span className="material-symbols-outlined text-[20px] font-light">
                  {p.type === 'oauth' ? 'oauth' : 'key'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-on-surface text-sm truncate">{p.label || p.id}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-primary-fixed-dim' : 'bg-on-surface-variant/30'}`}></span>
                  <span className="text-[11px] text-on-surface-variant/70">{p.type}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                p.status === 'active' ? 'bg-primary-container/20 text-primary-fixed-dim' : 'bg-surface-container-high text-on-surface-variant/40'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {models.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-on-surface-variant/60 font-medium mb-3">Available Models</h3>
          <div className="flex flex-wrap gap-2">
            {models.slice(0, 30).map(m => (
              <span key={m.id} className="px-2.5 py-1 rounded-lg bg-surface-container-high/60 border border-white/5 text-[11px] text-on-surface-variant font-mono">
                {m.label || m.id}
              </span>
            ))}
            {models.length > 30 && (
              <span className="px-2.5 py-1 rounded-lg bg-surface-container-high/60 border border-white/5 text-[11px] text-on-surface-variant/50">
                +{models.length - 30} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 bg-surface-container/40 border border-white/5 rounded-2xl text-center text-on-surface-variant text-sm">
        <p className="opacity-60">API keys dikelola oleh OpenCode dan Hermes secara lokal.</p>
        <p className="opacity-40 text-xs mt-1">Gunakan <code className="text-primary-fixed-dim">opencode providers</code> atau <code className="text-primary-fixed-dim">hermes auth</code> di terminal untuk manage.</p>
      </div>
    </div>
  );
}

export default VaultView;
