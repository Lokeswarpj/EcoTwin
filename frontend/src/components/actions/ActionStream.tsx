import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Train, Bus, Zap, Leaf, Layers } from 'lucide-react';
import { ActionCard } from '../../types';
import { LanguageCode, getTranslation } from '../../i18n/translations';

interface ActionStreamProps {
  actions: ActionCard[];
  language?: LanguageCode;
  city?: string;
  onToggleStep: (actionId: string, stepIndex: number, currentStatus: boolean) => void;
  onOpenHistory: () => void;
}

export const ActionStream: React.FC<ActionStreamProps> = ({
  actions,
  language = 'en',
  city = 'Bengaluru',
  onToggleStep,
  onOpenHistory
}) => {
  const title = getTranslation('action.stream_title', language, city);
  const subtitle = getTranslation('action.stream_sub', language, city);
  const historyText = getTranslation('action.history_btn', language, city);

  // Helper to format category labels cleanly
  const formatCategory = (cat: string) => {
    return cat
      .replace(/Recycle & Reuse \((.*?)\)/i, 'Recycle • $1')
      .replace(/RECYCLE & REUSE \((.*?)\)/i, 'Recycle • $1')
      .replace(/Recycle & Reuse/i, 'Recycle • Dry Waste');
  };

  return (
    <section id="action-stream-section" className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl lg:text-4xl font-display text-white">{title}</h2>
          <p className="text-sm text-white/60 mt-1">
            {subtitle}
          </p>
        </div>
        <button
          onClick={onOpenHistory}
          className="text-sm text-cyan-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md"
        >
          <span>{historyText}</span>
          <ArrowRight className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((task) => {
          const isGreen = task.color === 'green';
          const isAmber = task.color === 'amber';
          const isBlue = task.color === 'blue';

          const badgeStyles = isGreen
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.12)]'
            : isAmber
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.12)]'
            : 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.12)]';

          const CategoryIcon = isGreen ? Leaf : isAmber ? Train : Zap;

          return (
            <div
              key={task.id}
              className="p-6 lg:p-7 rounded-[32px] hover:translate-y-[-6px] transition-all duration-300 group flex flex-col justify-between border border-white/15 bg-gradient-to-b from-[#0c162e]/94 via-[#081022]/96 to-[#050b18]/98 shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden"
            >
              {/* Subtle Ambient Card Glow */}
              <div
                className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
                  isGreen ? 'bg-emerald-400' : isAmber ? 'bg-amber-400' : 'bg-sky-400'
                }`}
              />

              <div>
                {/* Header: Category Badge & Agent Name */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${badgeStyles}`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                    <span>{formatCategory(task.category)}</span>
                  </div>

                  <span className="text-[11px] text-white/70 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 font-mono shrink-0">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    {task.agent_name}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-lg lg:text-xl font-semibold text-white tracking-tight mb-3">
                  {task.title}
                </h4>

                {/* Description Quote Box */}
                <div className="bg-[#040915]/85 p-3.5 rounded-2xl border border-white/10 mb-5 text-sm text-slate-200 leading-relaxed font-normal">
                  {task.description}
                </div>

                {/* Custom Trade-off Card (Negotiator AI) */}
                {task.trade_off && (
                  <div className="bg-[#030712]/90 p-4 rounded-2xl space-y-2.5 mb-5 border border-amber-400/25">
                    <div className="flex justify-between text-[11px] font-mono text-white/50 uppercase tracking-wider">
                      <span>Transport Option</span>
                      <span>Est. Fare</span>
                    </div>
                    <div className="flex justify-between font-medium items-center text-sm">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Train className="w-4 h-4" /> {task.trade_off.option_a}
                      </span>
                      <span className="font-mono text-white font-semibold">{task.trade_off.fare_a}</span>
                    </div>
                    <div className="flex justify-between font-medium items-center text-sm text-white/70">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Bus className="w-4 h-4" /> {task.trade_off.option_b}
                      </span>
                      <span className="font-mono text-white/70">{task.trade_off.fare_b}</span>
                    </div>
                  </div>
                )}

                {/* Checklist Steps */}
                <div className="space-y-2 mb-6">
                  {task.steps.map((step, idx) => (
                    <div
                      key={idx}
                      onClick={() => onToggleStep(task.id, idx, step.done)}
                      className={`flex items-start gap-3 text-xs lg:text-sm cursor-pointer select-none p-2.5 rounded-xl border transition-all ${
                        step.done
                          ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-200'
                          : 'bg-[#060c1a]/85 border-white/10 text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/40 shrink-0 mt-0.5 group-hover:text-cyan-300" />
                      )}
                      <span className={step.done ? 'line-through opacity-85' : 'font-medium'}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Metrics Pill */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 px-3 py-1.5 rounded-full font-mono font-medium flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400" />
                  -{task.co2_saving_kg.toFixed(2)} kg CO2e
                </span>
                <span className="bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 px-3 py-1.5 rounded-full font-mono font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  +{task.points} Eco Points
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
