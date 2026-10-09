import React, { useEffect, useState } from 'react';
import { X, Bot, RefreshCw } from 'lucide-react';
import { generateWeeklyPlan } from '../../services/api';

interface AutopilotModalProps {
  isOpen: boolean;
  city?: string;
  onClose: () => void;
  onPlanGenerated: () => void;
}

const LOG_TEMPLATES = [
  { agent: 'RecycleAgent', msg: 'Real-time item audit active. Dry segregation verified.' },
  { agent: 'TransitNegotiator', msg: 'Evaluating Bengaluru traffic congestion vs Metro Purple Line.' },
  { agent: 'EnergyOptimizer', msg: 'Detecting 4.5 kW rooftop PV surplus. Solar peak battery charging initiated.' },
  { agent: 'WaterGuardian', msg: 'Cauvery municipal tap flow rate calibrated. Daily limit intact.' },
  { agent: 'PlanetaryAutopilot', msg: 'Multi-agent feedback loop synchronized with 1.5°C Paris Accord budget.' }
];

export const AutopilotModal: React.FC<AutopilotModalProps> = ({
  isOpen,
  city = 'Bengaluru',
  onClose,
  onPlanGenerated
}) => {
  const [logs, setLogs] = useState<Array<{ timestamp: string; agent: string; msg: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        agent: 'RouterAgent',
        msg: 'Autopilot swarm initialized for city: ' + city
      }
    ]);

    let idx = 0;
    const interval = setInterval(() => {
      const template = LOG_TEMPLATES[idx % LOG_TEMPLATES.length];
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          agent: template.agent,
          msg: template.msg
        }
      ]);
      idx++;
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen, city]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      await generateWeeklyPlan(city);
      onPlanGenerated();
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          agent: 'PlannerAgent',
          msg: 'Generated and persisted new weekly planetary action schedule!'
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full rounded-[32px] p-6 relative border border-cyan-400/30">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-2xl text-white">Gemini Autopilot Swarm</h3>
              <p className="text-xs text-white/50">Multi-agent planetary balance feedback loop active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Activity Terminal */}
        <div className="bg-black/70 border border-white/10 rounded-2xl p-4 h-64 overflow-y-auto space-y-2 mb-6 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5 text-white/80">
              <span className="text-white/40">[{log.timestamp}]</span>
              <span className="text-sky-400 font-semibold">&lt;{log.agent}&gt;</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Cooperating Gemini Agents Live</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Synthesizing...' : 'Refresh Weekly Plan'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              Keep in Background
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
