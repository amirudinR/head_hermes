import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const SLASH_COMMANDS = [
  { name: '/help', desc: 'Show available commands', cat: 'Info' },
  { name: '/new', desc: 'Start a new session', cat: 'Session', aliases: ['/reset'] },
  { name: '/retry', desc: 'Retry the last message', cat: 'Session' },
  { name: '/undo', desc: 'Back up N turns and re-prompt', cat: 'Session', hint: '[N]' },
  { name: '/status', desc: 'Show session, model, token info', cat: 'Session' },
  { name: '/compress', desc: 'Compress conversation context', cat: 'Session', hint: '[here [N]]' },
  { name: '/rollback', desc: 'List or restore checkpoints', cat: 'Session', hint: '[number]' },
  { name: '/branch', desc: 'Branch current session', cat: 'Session', aliases: ['/fork'] },
  { name: '/stop', desc: 'Kill all running background processes', cat: 'Session' },
  { name: '/background', desc: 'Run a prompt in the background', cat: 'Session', aliases: ['/bg'], hint: '<prompt>' },
  { name: '/queue', desc: 'Queue a prompt for next turn', cat: 'Session', aliases: ['/q'], hint: '<prompt>' },
  { name: '/sessions', desc: 'Browse and resume previous sessions', cat: 'Session' },
  { name: '/resume', desc: 'Resume a previously-named session', cat: 'Session', hint: '[name]' },
  { name: '/model', desc: 'Switch model', cat: 'Config', hint: '[model] [--provider name]' },
  { name: '/yolo', desc: 'Toggle YOLO mode (skip approvals)', cat: 'Config' },
  { name: '/reasoning', desc: 'Manage reasoning effort', cat: 'Config', hint: '[level|show|hide]' },
  { name: '/fast', desc: 'Toggle fast mode', cat: 'Config' },
  { name: '/personality', desc: 'Set a predefined personality', cat: 'Config', hint: '[name]' },
  { name: '/tools', desc: 'Manage tools', cat: 'Tools', hint: '[list|disable|enable]' },
  { name: '/skills', desc: 'Search, install, or manage skills', cat: 'Tools' },
  { name: '/memory', desc: 'Review pending memory writes', cat: 'Tools' },
  { name: '/kanban', desc: 'Multi-profile collaboration board', cat: 'Tools' },
  { name: '/reload-mcp', desc: 'Reload MCP servers from config', cat: 'Tools' },
  { name: '/learn', desc: 'Learn a reusable skill from description', cat: 'Tools', hint: '<what to learn from>' },
  { name: '/usage', desc: 'Show token usage and rate limits', cat: 'Info' },
  { name: '/credits', desc: 'Show Nous credit balance', cat: 'Info' },
  { name: '/version', desc: 'Show Hermes Agent version', cat: 'Info', aliases: ['/v'] },
  { name: '/debug', desc: 'Upload debug report', cat: 'Info' },
  { name: '/agents', desc: 'Show active agents and tasks', cat: 'Session', aliases: ['/tasks'] },
  { name: '/snapshot', desc: 'Create or restore state snapshots', cat: 'Session', hint: '[create|restore <id>|prune]' },
];

function SlashMenu({ query, onSelect, onClose }) {
  const [selected, setSelected] = useState(0);
  const menuRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter(cmd =>
      cmd.name.includes(q) || cmd.desc.toLowerCase().includes(q) || cmd.cat.toLowerCase().includes(q)
        || (cmd.aliases && cmd.aliases.some(a => a.includes(q)))
    );
  }, [query]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selected]) onSelect(filtered[selected]); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [filtered, selected, onSelect, onClose]);

  useEffect(() => {
    const el = menuRef.current;
    if (el) {
      const selectedEl = el.querySelector(`[data-idx="${selected}"]`);
      if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  if (filtered.length === 0) return null;

  const categories = [...new Set(filtered.map(c => c.cat))];

  return (
    <div ref={menuRef} className="absolute bottom-full left-0 right-0 mb-2 max-h-[280px] overflow-y-auto custom-scroll bg-surface-container border border-white/10 rounded-2xl shadow-2xl z-50 py-2">
      {categories.map(cat => (
        <div key={cat}>
          <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold">{cat}</div>
          {filtered.filter(c => c.cat === cat).map(cmd => {
            const idx = filtered.indexOf(cmd);
            return (
              <button
                key={cmd.name}
                data-idx={idx}
                onClick={() => onSelect(cmd)}
                onMouseEnter={() => setSelected(idx)}
                className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-all text-[13px] ${idx === selected ? 'bg-primary-container/15 text-on-surface' : 'text-on-surface-variant hover:bg-white/5'}`}
              >
                <span className={`font-mono font-medium min-w-[110px] ${idx === selected ? 'text-primary-fixed-dim' : 'text-on-surface-variant/80'}`}>{cmd.name}</span>
                <span className="text-on-surface-variant/60 text-[12px] truncate">{cmd.desc}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ChatPanel({ agent }) {
  const { sendMessage } = useApp();
  const [input, setInput] = useState('');
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('/');
  const bodyRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      const el = bodyRef.current;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }
  }, [agent.messages, agent.thinking]);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, []);

  useEffect(() => { autoResize(); }, [input, autoResize]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(agent.id, input.trim(), agent.systemPrompt);
    setInput('');
    setSlashOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val === '/' || (val.startsWith('/') && !val.includes(' '))) {
      setSlashOpen(true);
      setSlashQuery(val);
    } else {
      setSlashOpen(false);
    }
  };

  const handleSlashSelect = useCallback((cmd) => {
    if (cmd.hint) {
      setInput(cmd.name + ' ');
      setSlashQuery(cmd.name + ' ');
    } else {
      setInput(cmd.name);
      setSlashOpen(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, []);

  const handleSlashClose = useCallback(() => {
    setSlashOpen(false);
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div ref={bodyRef} className="flex-1 p-4 overflow-y-auto min-h-0 custom-scroll font-body-sm flex flex-col gap-4">
        {(agent.messages || []).map((msg, i) => {
          if (msg.role === 'system') return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-start">
              <span className="text-[11px] text-on-surface-variant/60 ml-3">System</span>
              <div className="px-4 py-3 bg-surface-variant/30 rounded-2xl rounded-tl-sm text-on-surface-variant border border-white/5 text-[13px] whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
          );
          if (msg.role === 'user') return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-end items-end">
              <span className="text-[11px] text-on-surface-variant/60 mr-3">You</span>
              <div className="px-4 py-3 bg-secondary-container/20 rounded-2xl rounded-tr-sm text-secondary-fixed border border-secondary-container/30 whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
          );
          return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-start">
              <span className="text-[11px] text-on-surface-variant/60 ml-3">{agent.name}</span>
              <div className="px-4 py-3 bg-surface-container-high/50 rounded-2xl rounded-tl-sm text-on-surface border border-white/5 whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
          );
        })}
        {agent.thinking && (
          <div className="flex flex-col gap-1 max-w-[85%] self-start">
            <span className="text-[11px] text-on-surface-variant/60 ml-3">{agent.name}</span>
            <div className="px-4 py-3 bg-surface-container-high/50 rounded-2xl rounded-tl-sm text-on-surface-variant border border-white/5 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-t border-white/5 bg-surface-container-lowest/30 shrink-0">
        <div className="relative">
          {slashOpen && <SlashMenu query={slashQuery} onSelect={handleSlashSelect} onClose={handleSlashClose} />}
          <div className="flex items-end bg-surface-container/50 rounded-2xl border border-white/5 focus-within:border-primary-container/30 transition-all">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none text-on-surface font-body-sm focus:ring-0 placeholder-on-surface-variant/40 py-3 px-4 outline-none resize-none overflow-y-auto custom-scroll"
              placeholder={`Type / for commands or message ${agent.name}...`}
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (slashOpen) return;
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              disabled={agent.thinking}
              rows={1}
            />
            <button
              className="p-2 mb-1.5 mr-1 text-on-surface-variant hover:text-primary-fixed-dim bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-40"
              onClick={handleSend}
              disabled={!input.trim() || agent.thinking}
            >
              <span className="material-symbols-outlined text-[20px] font-light">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
