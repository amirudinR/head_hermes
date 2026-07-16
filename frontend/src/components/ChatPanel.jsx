import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

function ChatPanel({ agent }) {
  const { sendMessage } = useApp();
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [agent.messages, agent.thinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(agent.id, input.trim(), agent.systemPrompt);
    setInput('');
  };

  const isSpecial = ['overseer', 'distributor', 'watcher'].includes(agent.role);

  return (
    <>
      {isSpecial && agent.systemPrompt && (
        <div className="px-6 py-2 border-b border-white/5 bg-primary-container/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-fixed-dim font-light">info</span>
            <span className="text-[11px] text-on-surface-variant/70">{agent.systemPrompt}</span>
          </div>
        </div>
      )}
      <div ref={bodyRef} className="flex-1 p-6 overflow-y-auto custom-scroll font-body-sm flex flex-col gap-6">
        {(agent.messages || []).map((msg, i) => {
          if (msg.role === 'system') return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-start">
              <span className="text-[11px] text-on-surface-variant/60 ml-3">System</span>
              <div className="px-4 py-3 bg-surface-variant/30 rounded-2xl rounded-tl-sm text-on-surface-variant border border-white/5 text-[13px]">{msg.content}</div>
            </div>
          );
          if (msg.role === 'user') return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-end items-end">
              <span className="text-[11px] text-on-surface-variant/60 mr-3">You</span>
              <div className="px-4 py-3 bg-secondary-container/20 rounded-2xl rounded-tr-sm text-secondary-fixed border border-secondary-container/30 whitespace-pre-wrap">{msg.content}</div>
            </div>
          );
          return (
            <div key={i} className="flex flex-col gap-1 max-w-[85%] self-start">
              <span className="text-[11px] text-on-surface-variant/60 ml-3">{agent.name}</span>
              <div className="px-4 py-3 bg-surface-container-high/50 rounded-2xl rounded-tl-sm text-on-surface border border-white/5 whitespace-pre-wrap">{msg.content}</div>
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

      <div className="p-4 border-t border-white/5 bg-surface-container-lowest/30 shrink-0">
        <div className="flex items-center bg-surface-container/50 rounded-2xl border border-white/5 focus-within:border-primary-container/30 transition-all px-2">
          <input
            className="w-full bg-transparent border-none text-on-surface font-body-sm focus:ring-0 placeholder-on-surface-variant/40 py-3.5 px-4 outline-none"
            placeholder={`Type a command to ${agent.name}...`}
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={agent.thinking}
          />
          <button
            className="p-2 mr-1 text-on-surface-variant hover:text-primary-fixed-dim bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-40"
            onClick={handleSend}
            disabled={!input.trim() || agent.thinking}
          >
            <span className="material-symbols-outlined text-[20px] font-light">arrow_upward</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatPanel;
