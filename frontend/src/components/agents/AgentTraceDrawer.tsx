import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, Info, Bot } from 'lucide-react';
import { TraceItem } from '../../types';

interface AgentTraceDrawerProps {
  trace: TraceItem[];
}

export const AgentTraceDrawer: React.FC<AgentTraceDrawerProps> = ({ trace }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (trace.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-6 max-w-5xl mx-auto pointer-events-none">
      <div className="glass-card rounded-t-3xl border-b-0 border-white/20 shadow-2xl overflow-hidden pointer-events-auto">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-3.5 flex items-center justify-between bg-black/40 hover:bg-black/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                Visible Multi-Agent Execution Trace
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {trace.length} pipeline steps
                </span>
              </span>
              <p className="text-[11px] text-white/50">
                Auditable Router → Specialist → Verifier → Impact Engine trace for judges
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-xs font-mono">{isOpen ? 'Collapse' : 'Inspect Pipeline'}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Expandable Trace Timeline */}
        {isOpen && (
          <div className="p-6 max-h-72 overflow-y-auto space-y-3 bg-black/80 font-mono text-xs">
            {trace.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="mt-0.5">
                  {item.status === 'SUCCESS' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : item.status === 'WARNING' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      {item.agent_name}
                    </span>
                    <span className="text-white/40 text-[10px]">{item.timestamp}</span>
                  </div>
                  <p className="text-white/80 mt-1">{item.explanation}</p>
                  {item.details && (
                    <div className="mt-2 text-[11px] text-white/50 bg-black/40 p-2 rounded border border-white/5 overflow-x-auto">
                      {JSON.stringify(item.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
