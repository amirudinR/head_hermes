import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function DeployModal() {
  const { deployAgent, setDeployModalOpen, agents, providers, models } = useApp();
  const [name, setName] = useState('');
  const [engine, setEngine] = useState('opencode');
  const [selectedProvider, setSelectedProvider] = useState('opencode');
  const [selectedModel, setSelectedModel] = useState('deepseek-v4-flash-free');

  const workerCount = agents.filter(a => a.role === 'worker' && !a.closed).length;
  const slotsLeft = 7 - workerCount;
  const filteredModels = selectedProvider === '9router'
    ? models
    : models.filter(m => m.provider !== '9router');

  const handleDeploy = () => {
    if (!name.trim()) return;
    if (slotsLeft <= 0) return;
    deployAgent(name.trim(), engine, selectedProvider, selectedModel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6, 14, 32, 0.8)', backdropFilter: 'blur(8px)' }}
      onClick={() => setDeployModalOpen(false)}>
      <div className="w-full max-w-md mx-4 bg-surface-container border border-white/10 rounded-3xl p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-on-surface text-xl font-semibold mb-2">Deploy Worker</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          Tambah worker baru. {slotsLeft > 0 ? `${slotsLeft} slot tersisa.` : 'Semua slot penuh!'}
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block font-medium uppercase tracking-wider">Worker Name</label>
            <input
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-container/50 transition-all"
              placeholder="e.g. Hermes-04"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeploy()}
              autoFocus
              maxLength={20}
            />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block font-medium uppercase tracking-wider">Engine</label>
            <div className="flex gap-3">
              <button
                onClick={() => setEngine('opencode')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  engine === 'opencode'
                    ? 'bg-secondary-container/20 border-secondary-container/30 text-secondary-fixed-dim'
                    : 'border-white/10 text-on-surface-variant hover:bg-white/5'
                }`}
              >
                🔓 OpenCode
              </button>
              <button
                onClick={() => setEngine('hermes')}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  engine === 'hermes'
                    ? 'bg-primary-container/20 border-primary-container/30 text-primary-fixed-dim'
                    : 'border-white/10 text-on-surface-variant hover:bg-white/5'
                }`}
              >
                ⚡ Hermes
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block font-medium uppercase tracking-wider">Provider</label>
            <select
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-container/50 transition-all appearance-none"
            >
              <option value="opencode">OpenCode</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
              <option value="9router">9router</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant mb-1.5 block font-medium uppercase tracking-wider">Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary-container/50 transition-all appearance-none"
            >
              <option value="deepseek-v4-flash-free">DeepSeek V4 Flash (Free)</option>
              <option value="mimo-v2.5-free">MiMo V2.5 (Free)</option>
              {filteredModels.map(m => (
                <option key={m.id} value={m.id}>{m.label || m.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button className="flex-1 py-3 rounded-xl border border-white/10 text-on-surface-variant hover:bg-white/5 transition-all text-sm font-medium"
            onClick={() => setDeployModalOpen(false)}>
            Cancel
          </button>
          <button
            className={`flex-1 py-3 rounded-xl transition-all text-sm font-semibold ${
              !name.trim() || slotsLeft <= 0
                ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                : 'bg-primary-container/20 border border-primary-container/30 text-primary-fixed hover:bg-primary-container/30'
            }`}
            onClick={handleDeploy}
            disabled={!name.trim() || slotsLeft <= 0}
          >
            Deploy Worker
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeployModal;
